import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;
const equipamento = dadosTeste.equipamento;

function criarOsAbertaPeloSolicitante(descricaoFalha: string) {
  cy.login(solicitante.email, solicitante.senha);
  cy.visit('/ordens-de-servico/nova');
  cy.get('[data-cy="os-equipamento"] option')
    .contains(equipamento.codigo)
    .then(($opt) => {
      cy.get('[data-cy="os-equipamento"]').select($opt.text());
    });
  cy.get('[data-cy="os-tipo"]').select('CORRETIVA');
  cy.get('[data-cy="os-prioridade"]').select('ALTA');
  cy.get('[data-cy="os-descricao"]').type(descricaoFalha);
  cy.get('button[type="submit"]').click();
  cy.url({ timeout: 15000 }).should('match', /\/ordens-de-servico\/[0-9a-f-]{10,}/i);
}

describe('Ordens de Serviço', () => {
  it('executa o fluxo completo de uma O.S. da abertura à conclusão', () => {
    const descricaoFalha = `Falha Cypress ${Date.now()}`;
    const descricaoServico = `Serviço concluído pelo Cypress ${Date.now()}`;

    criarOsAbertaPeloSolicitante(descricaoFalha);

    cy.url({ timeout: 15000 }).should('match', /\/ordens-de-servico\/[0-9a-f-]{10,}/i);
    cy.url()
      .then((url) => {
        const osId = url.split('/').pop() || '';
        expect(osId).to.have.length.greaterThan(10);
        return osId;
      })
      .as('osId');
    cy.contains(descricaoFalha).should('be.visible');

    cy.get<string>('@osId').then((osId) => {
      cy.loginAsSupervisor();
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.get('[data-cy="select-tecnico"] option')
        .contains(tecnico.nome)
        .invoke('val')
        .then((tecnicoId) => {
          cy.get('[data-cy="select-tecnico"]').select(String(tecnicoId));
        });
      cy.get('[data-cy="btn-atribuir"]').click();
      cy.contains(tecnico.nome).should('be.visible');

      cy.login(tecnico.email, tecnico.senha);
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.get('[data-cy="btn-iniciar"]').click();
      cy.contains('EM ANDAMENTO').should('be.visible');

      cy.contains('button', 'Iniciar trabalho').click();
      cy.contains('Em aberto').should('be.visible');

      cy.contains('button', 'Finalizar trabalho').click();
      cy.contains('Finalizado').should('be.visible');

      cy.get('[data-cy="os-descricao-servico"]').type(descricaoServico);
      cy.get('[data-cy="os-pecas-utilizadas"]').type('Rolamento, correia');
      cy.get('[data-cy="btn-concluir"]').click();
      cy.contains('CONCLUÍDA').should('be.visible');

      cy.loginAsSupervisor();
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.contains('Histórico').should('be.visible');
      cy.contains('ABERTA').should('be.visible');
      cy.contains('EM ANDAMENTO').should('be.visible');
      cy.contains('CONCLUÍDA').should('be.visible');
      cy.contains('Apontamentos de Trabalho').should('be.visible');
      cy.contains('Finalizado').should('be.visible');
      cy.contains(descricaoServico).should('be.visible');
    });
  });

  it('protege a criação de O.S. com confirmação de alterações não salvas', () => {
    cy.login(solicitante.email, solicitante.senha);
    cy.visit('/ordens-de-servico/nova');
    cy.get('[data-cy="os-descricao"]').type('Mudança não salva do Cypress');

    cy.contains('Cancelar').click();
    cy.contains('Descartar alterações').should('be.visible');
    cy.contains('button', 'Continuar editando').click();
    cy.url().should('include', '/ordens-de-servico/nova');

    cy.contains('Cancelar').click();
    cy.contains('button', 'Sair').click();
    cy.url().should('include', '/ordens-de-servico');
  });

  describe('Listagem e filtros', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('lista ordens de serviço', () => {
      cy.intercept('GET', '/api/ordens-servico*').as('getOrdens');
      cy.visit('/ordens-de-servico');
      cy.wait('@getOrdens').its('response.statusCode').should('eq', 200);
      cy.get('[data-cy="os-row"]').should('exist');
    });

    it('filtra por status', () => {
      const descricaoFalha = `OS aberta filtro ${Date.now()}`;

      criarOsAbertaPeloSolicitante(descricaoFalha);
      cy.loginAsSupervisor();
      cy.intercept('GET', '/api/ordens-servico*', (req) => {
        if (req.query.status === 'ABERTA') {
          req.alias = 'getOrdensFiltradas';
        }
      });
      cy.visit('/ordens-de-servico');
      cy.get('[data-cy="filtro-status"]').select('ABERTA');
      cy.wait('@getOrdensFiltradas').then(({ request, response }) => {
        expect(request.query.status).to.eq('ABERTA');
        expect(response?.statusCode).to.eq(200);
      });
      cy.get('[data-cy="os-row"]', { timeout: 10000 }).should('exist');
      cy.get('[data-cy="os-row"]').should('contain', 'ABERTA');
    });

    it('busca por número', () => {
      cy.visit('/ordens-de-servico');
      cy.get('[data-cy="os-numero-link"]')
        .first()
        .invoke('text')
        .then((numero) => {
          const texto = numero.trim();
          cy.get('[data-cy="input-busca"]').type(`${texto}{enter}`);
          cy.get('[data-cy="os-row"]').should('have.length.at.least', 1);
          cy.contains('[data-cy="os-numero-link"]', texto).should('be.visible');
        });
    });
  });
});
