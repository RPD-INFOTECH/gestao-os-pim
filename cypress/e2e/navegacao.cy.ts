import dadosTeste from '../fixtures/dados-teste.json';

const tecnico = dadosTeste.usuario_tecnico;
const solicitante = dadosTeste.usuario_solicitante;

describe('Navegação e guardas', () => {
  it('exibe o menu administrativo completo para supervisor', () => {
    cy.loginAsSupervisor();
    cy.visit('/dashboard');

    cy.contains('Dashboard').should('be.visible');
    cy.contains('Ordens de Serviço').should('be.visible');
    cy.contains('Equipamentos').should('be.visible');
    cy.contains('Usuários').should('be.visible');
    cy.contains('Histórico').should('be.visible');
    cy.contains('Relatórios').should('be.visible');
  });

  it('bloqueia técnico em rotas exclusivas de supervisor', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/usuarios');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');

    cy.visit('/relatorios');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });

  it('bloqueia solicitante em páginas operacionais restritas', () => {
    cy.login(solicitante.email, solicitante.senha);
    cy.visit('/equipamentos');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');

    cy.visit('/historico');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });

  it('redireciona rotas inexistentes para a tela 404', () => {
    cy.loginAsSupervisor();
    cy.visit('/rota-que-nao-existe');
    cy.url().should('include', '/404');
    cy.contains('Página não encontrada').should('be.visible');
  });
});
