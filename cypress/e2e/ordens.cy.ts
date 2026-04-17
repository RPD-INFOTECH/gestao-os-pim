import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;
const equipamento = dadosTeste.equipamento;

describe('Ordens de Serviço', () => {
  describe('Fluxo completo de OS', () => {
    let osId: string;

    it('solicitante abre uma OS', () => {
      cy.login(solicitante.email, solicitante.senha);
      cy.visit('/ordens-de-servico/nova');
      cy.get('[data-cy="os-equipamento"] option')
        .contains(equipamento.codigo)
        .then(($opt) => {
          cy.get('[data-cy="os-equipamento"]').select($opt.text());
        });
      cy.get('[data-cy="os-tipo"]').select('CORRETIVA');
      cy.get('[data-cy="os-prioridade"]').select('ALTA');
      cy.get('[data-cy="os-descricao"]').type('Falha detectada pelo teste automatizado Cypress');
      cy.get('button[type="submit"]').click();
      cy.url().should('match', /\/ordens-de-servico\/[0-9a-f-]{10,}/i);
      cy.url().then((url) => {
        osId = url.split('/').pop() || '';
        expect(osId).to.have.length.greaterThan(10);
      });
      cy.contains('Falha detectada pelo teste automatizado Cypress').should('be.visible');
    });

    it('supervisor atribui técnico à OS', () => {
      expect(osId, 'osId do teste anterior').to.be.a('string').and.have.length.greaterThan(10);
      cy.loginAsSupervisor();
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.contains('Atribuir Técnico').should('be.visible');
      cy.get('[data-cy="select-tecnico"]').select(tecnico.nome);
      cy.get('[data-cy="btn-atribuir"]').click();
      cy.contains(tecnico.nome).should('be.visible');
    });

    it('técnico inicia a OS', () => {
      expect(osId, 'osId do teste anterior').to.be.a('string').and.have.length.greaterThan(10);
      cy.login(tecnico.email, tecnico.senha);
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.get('[data-cy="btn-iniciar"]').click();
      cy.contains('EM ANDAMENTO').should('be.visible');
    });

    it('técnico conclui a OS', () => {
      expect(osId, 'osId do teste anterior').to.be.a('string').and.have.length.greaterThan(10);
      cy.login(tecnico.email, tecnico.senha);
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.get('[data-cy="os-descricao-servico"]').type('Serviço concluído pelo teste automatizado');
      cy.get('[data-cy="btn-concluir"]').click();
      cy.contains('CONCLUÍDA').should('be.visible');
    });

    it('verifica histórico da OS', () => {
      expect(osId, 'osId do teste anterior').to.be.a('string').and.have.length.greaterThan(10);
      cy.loginAsSupervisor();
      cy.visit(`/ordens-de-servico/${osId}`);
      cy.contains('Histórico').should('be.visible');
      cy.contains('ABERTA').should('be.visible');
      cy.contains('CONCLUÍDA').should('be.visible');
    });
  });

  describe('Listagem e filtros', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
    });

    it('lista ordens de serviço', () => {
      cy.intercept('GET', '/api/ordens-servico*').as('getOrdens');
      cy.visit('/ordens-de-servico');
      cy.wait('@getOrdens').its('response.statusCode').should('eq', 200);
    });

    it('filtra por status', () => {
      cy.visit('/ordens-de-servico');
      cy.get('[data-cy="filtro-status"]').select('CONCLUIDA');
      cy.get('[data-cy="os-row"]').each(($row) => {
        cy.wrap($row).contains('CONCLUÍDA').should('be.visible');
      });
    });

    it('busca por número', () => {
      cy.visit('/ordens-de-servico');
      cy.get('[data-cy="os-numero-link"]').first().invoke('text').then((numero) => {
        const texto = numero.trim();
        cy.get('[data-cy="input-busca"]').type(`${texto}{enter}`);
        cy.get('[data-cy="os-row"]').should('have.length.at.least', 1);
        cy.contains('[data-cy="os-numero-link"]', texto).should('be.visible');
      });
    });
  });
});
