import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;

describe('Dashboard', () => {
  it('carrega o dashboard do supervisor sem erros de API', () => {
    cy.loginAsSupervisor();
    cy.intercept('GET', '/api/dashboard').as('getDashboard');
    cy.visit('/dashboard');
    cy.wait('@getDashboard').its('response.statusCode').should('eq', 200);

    cy.contains('OS abertas', { matchCase: false }).should('be.visible');
    cy.contains('Críticas abertas', { matchCase: false }).should('be.visible');
    cy.contains('Sem técnico', { matchCase: false }).should('be.visible');
    cy.contains('Tempo médio até conclusão', { matchCase: false }).should('be.visible');
  });

  it('exibe os indicadores operacionais esperados para técnico', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/dashboard');

    cy.contains('Minhas atribuídas', { matchCase: false }).should('be.visible');
    cy.contains('Disponíveis para assumir', { matchCase: false }).should('be.visible');
    cy.contains('Apontamento aberto', { matchCase: false }).should('be.visible');
    cy.contains('Críticas abertas', { matchCase: false }).should('not.exist');
    cy.contains('Usuários').should('not.exist');
    cy.contains('Relatórios').should('not.exist');
  });

  it('exibe a visão resumida esperada para solicitante', () => {
    cy.login(solicitante.email, solicitante.senha);
    cy.visit('/dashboard');

    cy.contains('Minhas abertas', { matchCase: false }).should('be.visible');
    cy.contains('Em andamento', { matchCase: false }).should('be.visible');
    cy.contains('Tempo médio até conclusão', { matchCase: false }).should('be.visible');
    cy.contains('Equipamentos').should('not.exist');
    cy.contains('Histórico').should('not.exist');
  });
});
