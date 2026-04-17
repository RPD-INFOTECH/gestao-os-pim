describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('exibe a tela de login', () => {
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('ACESSAR PLATAFORMA').should('be.visible');
  });

  it('exibe erro com credenciais inválidas', () => {
    cy.get('#email').type('invalido@pim.com');
    cy.get('#password').type('senhaerrada');
    cy.contains('ACESSAR PLATAFORMA').click();
    cy.contains('Email ou senha inválidos').should('be.visible');
  });

  it('redireciona para /login ao acessar rota protegida sem autenticação', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('faz login com sucesso e vai para dashboard', () => {
    cy.get('#email').type(Cypress.env('supervisor_email'));
    cy.get('#password').type(Cypress.env('supervisor_senha'));
    cy.contains('ACESSAR PLATAFORMA').click();
    cy.url().should('include', '/dashboard');
  });

  it('faz logout e redireciona para login', () => {
    cy.loginAsSupervisor();
    cy.get('[data-cy="btn-logout"]').click();
    cy.url().should('include', '/login');
    cy.get('localStorage').then(() => {
      expect(localStorage.getItem('refreshToken')).to.be.null;
    });
  });
});
