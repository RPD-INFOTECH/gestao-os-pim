describe('Autenticação', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
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
    cy.contains('button', 'ACESSAR PLATAFORMA').click();
    cy.contains('Email ou senha inválidos').should('be.visible');
  });

  it('redireciona para /login ao acessar rota protegida sem autenticação', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('faz login com sucesso e vai para o dashboard', () => {
    cy.get('#email').type(Cypress.env('supervisor_email'));
    cy.get('#password').type(Cypress.env('supervisor_senha'), { log: false });
    cy.contains('button', 'ACESSAR PLATAFORMA').click();
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('mantém a sessão ao recarregar a página e preserva o nome exibido no topo', () => {
    cy.loginAsSupervisor();
    cy.visit('/dashboard');

    cy.contains(/Bom dia|Boa tarde|Boa noite/)
      .siblings('h1')
      .invoke('text')
      .then((initialName) => {
        const normalizedName = initialName.trim();

        expect(normalizedName).to.not.equal('');
        expect(normalizedName).to.not.equal('Usuário');

        cy.reload();
        cy.url({ timeout: 15000 }).should('include', '/dashboard');
        cy.contains(/Bom dia|Boa tarde|Boa noite/)
          .siblings('h1')
          .should(($name) => {
            expect($name.text().trim()).to.equal(normalizedName);
          });
      });
  });

  it('faz logout e bloqueia novamente o acesso às rotas protegidas', () => {
    cy.loginAsSupervisor();
    cy.visit('/dashboard');
    cy.get('[data-cy="btn-logout"]').click();
    cy.url({ timeout: 15000 }).should('include', '/login');

    cy.visit('/dashboard');
    cy.url({ timeout: 15000 }).should('include', '/login');
  });
});
