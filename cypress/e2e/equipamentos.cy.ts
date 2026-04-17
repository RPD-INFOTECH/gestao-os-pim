import dadosTeste from '../fixtures/dados-teste.json';

const eq = dadosTeste.equipamento;

describe('Equipamentos', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista equipamentos', () => {
    cy.intercept('GET', '/api/equipamentos*').as('getEquipamentos');
    cy.visit('/equipamentos');
    cy.url().should('include', '/equipamentos');
    cy.wait('@getEquipamentos').its('response.statusCode').should('eq', 200);
  });

  it('cria um equipamento', () => {
    cy.visit('/equipamentos/novo');
    cy.get('[data-cy="eq-codigo"]').type(eq.codigo + '-NEW');
    cy.get('[data-cy="eq-nome"]').type(eq.nome + ' Novo');
    cy.get('[data-cy="eq-tipo"]').type(eq.tipo);
    cy.get('[data-cy="eq-localizacao"]').type(eq.localizacao);
    cy.get('[data-cy="eq-setor"]').clear().type(eq.setor);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/equipamentos');
    cy.contains(eq.nome + ' Novo').should('be.visible');
  });

  it('exibe detalhes de um equipamento', () => {
    cy.visit('/equipamentos');
    cy.contains(eq.nome).click();
    cy.url().should('match', /\/equipamentos\/\d+/);
    cy.contains(eq.codigo).should('be.visible');
  });

  it('edita um equipamento', () => {
    cy.visit('/equipamentos');
    cy.contains(eq.nome).click();
    cy.get('[data-cy="btn-editar-equipamento"]').click();
    cy.get('[data-cy="eq-nome"]').clear().type(`${eq.nome} Editado`);
    cy.get('button[type="submit"]').click();
    cy.contains(`${eq.nome} Editado`).should('be.visible');
  });

  it('desativa um equipamento', () => {
    cy.visit('/equipamentos');
    cy.on('window:confirm', () => true);
    cy.get('[data-cy="equipamento-item"]').contains(`${eq.nome} Editado`)
      .parents('[data-cy="equipamento-item"]')
      .find('[data-cy="btn-deletar"]').click();
    cy.get('[data-cy="equipamento-item"]').contains(`${eq.nome} Editado`)
      .parents('[data-cy="equipamento-item"]')
      .contains('Inativo', { matchCase: false })
      .should('be.visible');
  });
});
