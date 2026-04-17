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

  cy.visit('/login');
  cy.get('#email').type(userEmail);
  cy.get('#password').type(userSenha);
  cy.contains('ACESSAR PLATAFORMA').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsSupervisor', () => {
  cy.login(Cypress.env('supervisor_email'), Cypress.env('supervisor_senha'));
});

export {};
