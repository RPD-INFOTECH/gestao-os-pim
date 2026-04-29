import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const gestor = dadosTeste.usuario_gestor;

describe('Usuários', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista usuários', () => {
    cy.intercept('GET', '/api/usuarios*').as('getUsuarios');
    cy.visit('/usuarios');
    cy.wait('@getUsuarios').its('response.statusCode').should('eq', 200);
    cy.contains('Usuários').should('be.visible');
  });

  it('exige os campos obrigatórios no cadastro', () => {
    cy.visit('/usuarios/novo');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('[data-cy="user-nome"]').type('Usuário Obrigatório');
    cy.get('[data-cy="user-email"]').type('obrigatorio@cypress.local');
    cy.get('[data-cy="user-senha"]').type('Cypress@123');

    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('restringe perfis disponíveis para supervisor', () => {
    cy.visit('/usuarios/novo');

    cy.get('[data-cy="user-perfil"] option').then((options) => {
      const values = options.toArray().map((option) => option.getAttribute('value'));
      expect(values).to.deep.eq(['TÉCNICO', 'SOLICITANTE']);
    });
  });

  it('permite gestor selecionar perfis funcionais exceto gestor', () => {
    cy.login(gestor.email, gestor.senha);
    cy.visit('/usuarios/novo');

    cy.get('[data-cy="user-perfil"] option').then((options) => {
      const values = options.toArray().map((option) => option.getAttribute('value'));
      expect(values).to.deep.eq(['SUPERVISOR', 'TÉCNICO', 'SOLICITANTE']);
    });
  });

  it('cria um técnico', () => {
    const timestamp = Date.now();
    const nome = `Técnico Extra ${timestamp}`;

    cy.visit('/usuarios/novo');
    cy.get('[data-cy="user-nome"]').type(nome);
    cy.get('[data-cy="user-email"]').type(`tecnico.${timestamp}@cypress.local`);
    cy.get('[data-cy="user-senha"]').type('Cypress@123');
    cy.get('[data-cy="user-perfil"]').select('TÉCNICO');
    cy.get('[data-cy="user-setor"]').type('Manutenção');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/usuarios');
    cy.contains(nome, { timeout: 15000 }).should('be.visible');
    cy.contains('tr', nome).contains(/USR-\d{6}/).should('be.visible');
  });

  it('cria um solicitante', () => {
    const timestamp = Date.now();
    const nome = `Solicitante Extra ${timestamp}`;

    cy.visit('/usuarios/novo');
    cy.get('[data-cy="user-nome"]').type(nome);
    cy.get('[data-cy="user-email"]').type(`solic.${timestamp}@cypress.local`);
    cy.get('[data-cy="user-senha"]').type('Cypress@123');
    cy.get('[data-cy="user-perfil"]').select('SOLICITANTE');
    cy.get('[data-cy="user-setor"]').type('Operação');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/usuarios');
    cy.contains(nome, { timeout: 15000 }).should('be.visible');
    cy.contains('tr', nome).contains(/USR-\d{6}/).should('be.visible');
  });

  it('exibe os detalhes de um usuário existente', () => {
    cy.visit('/usuarios');
    cy.contains(tecnico.nome)
      .parents('tr')
      .find('a[href*="/detalhes"]')
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.be.a('string');
        cy.visit(href as string);
      });
    cy.url().should('include', '/detalhes');
    cy.contains(tecnico.nome).should('be.visible');
    cy.contains(tecnico.email).should('be.visible');
  });

  it('edita um usuário', () => {
    cy.visit('/usuarios');
    cy.contains(tecnico.nome).click();
    cy.get('[data-cy="user-setor"]').clear().type('Manutenção Industrial');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuarios');
    cy.contains('Manutenção Industrial').should('be.visible');
  });

  it('bloqueia acesso à lista de usuários para não supervisor', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/usuarios');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });
});
