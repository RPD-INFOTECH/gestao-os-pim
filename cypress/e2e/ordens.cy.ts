import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;

describe('Ordens de Serviço', () => {
  describe('Fluxo completo de OS', () => {
    it('solicitante abre uma OS', () => {
      cy.login(solicitante.email, solicitante.senha);
      cy.visit('/ordens-de-servico/nova');
      cy.get('[formControlName="equipamentoId"]').select(1);
      cy.get('[formControlName="tipo_manutencao"]').select('CORRETIVA');
      cy.get('[formControlName="prioridade"]').select('ALTA');
      cy.get('[formControlName="descricao_falha"]').type('Falha detectada pelo teste automatizado Cypress');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/ordens-de-servico');
      cy.contains('Falha detectada pelo teste automatizado Cypress').should('be.visible');
    });

    it('supervisor atribui técnico à OS', () => {
      cy.loginAsSupervisor();
      cy.visit('/ordens-de-servico');
      cy.contains('Falha detectada pelo teste automatizado Cypress').click();
      cy.contains('Atribuir Técnico').click();
      cy.get('[data-cy="select-tecnico"]').select(tecnico.nome);
      cy.contains('Confirmar').click();
      cy.contains(tecnico.nome).should('be.visible');
    });

    it('técnico inicia a OS', () => {
      cy.login(tecnico.email, tecnico.senha);
      cy.visit('/ordens-de-servico');
      cy.contains('Falha detectada pelo teste automatizado Cypress').click();
      cy.contains('Iniciar').click();
      cy.contains('EM ANDAMENTO').should('be.visible');
    });

    it('técnico conclui a OS', () => {
      cy.login(tecnico.email, tecnico.senha);
      cy.visit('/ordens-de-servico');
      cy.contains('Falha detectada pelo teste automatizado Cypress').click();
      cy.contains('Concluir').click();
      cy.get('[formControlName="descricao_servico"]').type('Serviço concluído pelo teste automatizado');
      cy.contains('Confirmar').click();
      cy.contains('CONCLUÍDA').should('be.visible');
    });

    it('verifica histórico da OS', () => {
      cy.loginAsSupervisor();
      cy.visit('/ordens-de-servico');
      cy.contains('Falha detectada pelo teste automatizado Cypress').click();
      cy.contains('Histórico').click();
      cy.contains('Ordem de serviço criada').should('be.visible');
      cy.contains('Execução da ordem de serviço iniciada').should('be.visible');
    });
  });

  describe('Listagem e filtros', () => {
    beforeEach(() => {
      cy.loginAsSupervisor();
      cy.visit('/ordens-de-servico');
    });

    it('lista ordens de serviço', () => {
      cy.intercept('GET', '/api/ordens-servico*').as('getOrdens');
      cy.wait('@getOrdens').its('response.statusCode').should('eq', 200);
    });

    it('filtra por status', () => {
      cy.get('[data-cy="filtro-status"]').select('CONCLUIDA');
      cy.contains('CONCLUÍDA').should('be.visible');
    });

    it('busca por texto', () => {
      cy.get('[data-cy="input-busca"]').type('Cypress');
      cy.contains('Falha detectada pelo teste automatizado Cypress').should('be.visible');
    });
  });
});
