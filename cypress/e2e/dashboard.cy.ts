describe('Dashboard', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
    cy.visit('/dashboard');
  });

  it('exibe os indicadores principais', () => {
    cy.url().should('include', '/dashboard');
    cy.contains('abertas', { matchCase: false }).should('be.visible');
    cy.contains('em andamento', { matchCase: false }).should('be.visible');
    cy.contains('concluídas', { matchCase: false }).should('be.visible');
  });

  it('carrega sem erros de API', () => {
    cy.intercept('GET', '/api/dashboard').as('getDashboard');
    cy.visit('/dashboard');
    cy.wait('@getDashboard').its('response.statusCode').should('eq', 200);
  });
});
