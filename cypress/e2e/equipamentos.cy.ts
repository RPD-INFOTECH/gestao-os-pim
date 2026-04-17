import dadosTeste from '../fixtures/dados-teste.json';

const eq = dadosTeste.equipamento;

describe('Equipamentos', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista equipamentos', () => {
    cy.visit('/equipamentos');
    cy.url().should('include', '/equipamentos');
    cy.intercept('GET', '/api/equipamentos').as('getEquipamentos');
    cy.wait('@getEquipamentos').its('response.statusCode').should('eq', 200);
  });

  it('cria um equipamento', () => {
    cy.visit('/equipamentos/novo');
    cy.get('[formControlName="codigo"]').type(eq.codigo);
    cy.get('[formControlName="nome"]').type(eq.nome);
    cy.get('[formControlName="tipo"]').type(eq.tipo);
    cy.get('[formControlName="localizacao"]').type(eq.localizacao);
    cy.get('[formControlName="setor"]').clear().type(eq.setor);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/equipamentos');
    cy.contains(eq.nome).should('be.visible');
  });

  it('edita um equipamento', () => {
    cy.visit('/equipamentos');
    cy.contains(eq.nome).click();
    cy.contains('Editar').click();
    cy.get('[formControlName="nome"]').clear().type(`${eq.nome} Editado`);
    cy.get('button[type="submit"]').click();
    cy.contains(`${eq.nome} Editado`).should('be.visible');
  });

  it('exibe detalhes de um equipamento', () => {
    cy.visit('/equipamentos');
    cy.contains(eq.nome).click();
    cy.url().should('match', /\/equipamentos\/\d+/);
    cy.contains(eq.codigo).should('be.visible');
  });

  it('deleta um equipamento', () => {
    cy.visit('/equipamentos');
    cy.contains(`${eq.nome} Editado`).parents('[data-cy="equipamento-item"]')
      .find('[data-cy="btn-deletar"]').click();
    cy.contains('Confirmar').click();
    cy.contains(`${eq.nome} Editado`).should('not.exist');
  });
});
