declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, senha?: string): Chainable<void>;
      loginAsSupervisor(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email?: string, senha?: string) => {
  const userEmail = email ?? Cypress.env('supervisor_email');
  const userSenha = senha ?? Cypress.env('supervisor_senha');

  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email: userEmail, senha: userSenha },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status, `Login falhou para ${userEmail}: ${JSON.stringify(response.body)}`).to.eq(200);
    const { refreshToken } = response.body;
    cy.window().then((win) => {
      win.localStorage.setItem('refreshToken', refreshToken);
    });
    cy.visit('/dashboard');
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });
});

Cypress.Commands.add('loginAsSupervisor', () => {
  cy.login(Cypress.env('supervisor_email'), Cypress.env('supervisor_senha'));
});

export {};
