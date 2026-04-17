import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;

describe('Usuários', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista usuários', () => {
    cy.intercept('GET', '/api/usuarios').as('getUsuarios');
    cy.visit('/usuarios');
    cy.wait('@getUsuarios').its('response.statusCode').should('eq', 200);
  });

  it('cria um técnico', () => {
    cy.visit('/usuarios/novo');
    cy.get('[data-cy="user-nome"]').type('Técnico Extra E2E');
    cy.get('[data-cy="user-email"]').type('tecnico.extra@pim.com');
    cy.get('[data-cy="user-matricula"]').type('TEC-EXTRA-01');
    cy.get('[data-cy="user-senha"]').type('Cypress@123');
    cy.get('[data-cy="user-perfil"]').select('TÉCNICO');
    cy.get('[data-cy="user-setor"]').type('Manutenção');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
    cy.contains('Técnico Extra E2E').should('be.visible');
  });

  it('cria um solicitante', () => {
    cy.visit('/usuarios/novo');
    cy.get('[data-cy="user-nome"]').type('Solicitante Extra E2E');
    cy.get('[data-cy="user-email"]').type('solicitante.extra@pim.com');
    cy.get('[data-cy="user-matricula"]').type('SOL-EXTRA-01');
    cy.get('[data-cy="user-senha"]').type('Cypress@123');
    cy.get('[data-cy="user-perfil"]').select('SOLICITANTE');
    cy.get('[data-cy="user-setor"]').type('Operação');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
    cy.contains('Solicitante Extra E2E').should('be.visible');
  });

  it('edita um usuário', () => {
    cy.visit('/usuarios');
    cy.contains('Técnico Cypress').click();
    cy.get('[data-cy="user-setor"]').clear().type('Manutenção Industrial');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
  });

  it('bloqueia acesso à lista de usuários para não supervisor', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/usuarios', { failOnStatusCode: false });
    cy.url().should('satisfy', (url: string) => url.includes('/403') || url.includes('/login'));
  });
});
