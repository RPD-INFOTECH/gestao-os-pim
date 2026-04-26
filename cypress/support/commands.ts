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

  cy.session(
    ['auth', userEmail],
    () => {
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: userEmail,
          senha: userSenha,
        },
      })
        .its('status')
        .should('eq', 200);
    },
    {
      cacheAcrossSpecs: true,
      validate: () => {
        cy.request({
          method: 'POST',
          url: '/api/auth/refresh',
          failOnStatusCode: false,
        })
          .its('status')
          .should('eq', 200);
      },
    },
  );
});

Cypress.Commands.add('loginAsSupervisor', () => {
  cy.login(Cypress.env('supervisor_email'), Cypress.env('supervisor_senha'));
});

export {};
