import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;

describe('Usuários', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista usuários', () => {
    cy.visit('/usuarios');
    cy.intercept('GET', '/api/usuarios').as('getUsuarios');
    cy.wait('@getUsuarios').its('response.statusCode').should('eq', 200);
  });

  it('cria um técnico', () => {
    cy.visit('/usuarios/novo');
    cy.get('[formControlName="nome"]').type(tecnico.nome);
    cy.get('[formControlName="email"]').type(tecnico.email);
    cy.get('[formControlName="matricula"]').type(tecnico.matricula);
    cy.get('[formControlName="senha"]').type(tecnico.senha);
    cy.get('[formControlName="perfil"]').select(tecnico.perfil);
    cy.get('[formControlName="setor"]').type(tecnico.setor);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
    cy.contains(tecnico.nome).should('be.visible');
  });

  it('cria um solicitante', () => {
    cy.visit('/usuarios/novo');
    cy.get('[formControlName="nome"]').type(solicitante.nome);
    cy.get('[formControlName="email"]').type(solicitante.email);
    cy.get('[formControlName="matricula"]').type(solicitante.matricula);
    cy.get('[formControlName="senha"]').type(solicitante.senha);
    cy.get('[formControlName="perfil"]').select(solicitante.perfil);
    cy.get('[formControlName="setor"]').type(solicitante.setor);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
    cy.contains(solicitante.nome).should('be.visible');
  });

  it('edita um usuário', () => {
    cy.visit('/usuarios');
    cy.contains(tecnico.nome).click();
    cy.get('[formControlName="setor"]').clear().type('Manutenção Industrial');
    cy.get('button[type="submit"]').click();
    cy.contains(tecnico.nome).should('be.visible');
  });

  it('bloqueia acesso à lista de usuários para não supervisor', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/usuarios');
    cy.url().should('include', '/403');
  });
});
