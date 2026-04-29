import dadosTeste from '../fixtures/dados-teste.json';

const gestor = dadosTeste.usuario_gestor;
const tecnico = dadosTeste.usuario_tecnico;

describe('Configuração de Prazo de Atendimento', () => {
  it('permite gestor visualizar e atualizar limites de prazo de atendimento', () => {
    cy.login(gestor.email, gestor.senha);
    cy.intercept('GET', '/api/configuracoes/prazo-atendimento').as('getPrazo');
    cy.visit('/configuracoes/prazo-atendimento');
    cy.wait('@getPrazo').its('response.statusCode').should('eq', 200);

    cy.contains('Prazo de Atendimento por prioridade').should('be.visible');
    cy.contains('ALTA').parents('article').within(() => {
      cy.get('[data-cy="prazo-horas"]').clear().type('9');
      cy.get('[data-cy="btn-salvar-prazo"]').click();
    });

    cy.contains('Configuração de prazo de atendimento atualizada.').should('be.visible');
  });

  it('bloqueia técnico na configuração de prazo de atendimento', () => {
    cy.login(tecnico.email, tecnico.senha);
    cy.visit('/configuracoes/prazo-atendimento');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });
});
