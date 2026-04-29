import dadosTeste from '../fixtures/dados-teste.json';

const solicitante = dadosTeste.usuario_solicitante;

describe('Relatórios gerenciais', () => {
  it('carrega indicadores e agrupamentos para supervisor', () => {
    cy.loginAsSupervisor();
    cy.visit('/relatorios');

    cy.contains('Relatórios').should('be.visible');
    cy.contains('Total de O.S.').should('be.visible');
    cy.contains('O.S. por status').should('be.visible');
    cy.contains('O.S. por prioridade').should('be.visible');
    cy.contains('Horas por técnico').should('be.visible');
    cy.contains('O.S. recentes').should('be.visible');
  });

  it('permite filtrar relatórios por status, técnico e setor', () => {
    cy.loginAsSupervisor();
    cy.visit('/relatorios');

    cy.contains('label', 'Status').find('select').select('CONCLUIDA');
    cy.contains('button', 'Mais filtros').click();
    cy.contains('label', 'Técnico').find('select option').not('[value=""]').first().then(($option) => {
      cy.contains('label', 'Técnico').find('select').select($option.text());
    });
    cy.contains('label', 'Setor').find('select option').not('[value=""]').first().then(($option) => {
      cy.contains('label', 'Setor').find('select').select($option.text());
    });

    cy.contains('O.S. filtradas').should('be.visible');
    cy.contains('O.S. recentes').should('be.visible');
  });

  it('permite filtrar por período de abertura automaticamente', () => {
    cy.loginAsSupervisor();
    cy.intercept('GET', '/api/ordens-servico*').as('getOrdensRelatorio');
    cy.visit('/relatorios');
    cy.wait('@getOrdensRelatorio');

    cy.get('[data-cy="relatorio-periodo-60"]').click().should('have.class', 'bg-blue-600');

    cy.wait('@getOrdensRelatorio').then(({ request, response }) => {
      expect(request.query.dataInicio).to.match(/^\d{4}-\d{2}-\d{2}$/);
      expect(request.query.dataFim).to.match(/^\d{4}-\d{2}-\d{2}$/);
      expect(response?.statusCode).to.eq(200);
    });
    cy.contains('O.S. filtradas').should('be.visible');
  });

  it('bloqueia solicitante no módulo de relatórios', () => {
    cy.login(solicitante.email, solicitante.senha);
    cy.visit('/relatorios');

    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });
});
