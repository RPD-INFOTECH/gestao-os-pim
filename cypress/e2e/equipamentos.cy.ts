import dadosTeste from '../fixtures/dados-teste.json';

const eq = dadosTeste.equipamento;
const solicitante = dadosTeste.usuario_solicitante;

describe('Equipamentos', () => {
  beforeEach(() => {
    cy.loginAsSupervisor();
  });

  it('lista equipamentos', () => {
    cy.intercept('GET', '/api/equipamentos*').as('getEquipamentos');
    cy.visit('/equipamentos');
    cy.url().should('include', '/equipamentos');
    cy.wait('@getEquipamentos').its('response.statusCode').should('eq', 200);
    cy.contains('Equipamentos').should('be.visible');
  });

  it('exige os campos obrigatórios no formulário', () => {
    cy.visit('/equipamentos/novo');
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('[data-cy="eq-nome"]').type('Equipamento Obrigatório');
    cy.get('[data-cy="eq-tipo"]').type('Compressor');
    cy.get('[data-cy="eq-localizacao"]').type('Linha de Teste');
    cy.get('[data-cy="eq-setor"]').type('Produção');

    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('cria um equipamento', () => {
    const nomeUnico = `${eq.nome} Novo ${Date.now()}`;

    cy.intercept('POST', '/api/equipamentos').as('createEquipamento');
    cy.visit('/equipamentos/novo');

    cy.get('[data-cy="eq-nome"]').type(nomeUnico);
    cy.get('[data-cy="eq-tipo"]').type(eq.tipo);
    cy.get('[data-cy="eq-localizacao"]').type(eq.localizacao);
    cy.get('[data-cy="eq-setor"]').clear().type(eq.setor);
    cy.get('button[type="submit"]').click();

    cy.wait('@createEquipamento').its('response.statusCode').should('eq', 201);
    cy.url().should('include', '/equipamentos');
    cy.contains(nomeUnico, { timeout: 15000 }).should('be.visible');
    cy.contains('[data-cy="equipamento-item"]', nomeUnico)
      .contains(/EQP-\d{6}/)
      .should('be.visible');
  });

  it('exibe detalhes e permite editar um equipamento', () => {
    const nomeEditado = `${eq.nome} Editado ${Date.now()}`;

    cy.visit('/equipamentos');
    cy.contains(eq.nome).click();
    cy.url().should('match', /\/equipamentos\/\d+/);
    cy.contains(eq.codigo).should('be.visible');

    cy.get('[data-cy="btn-editar-equipamento"]').click();
    cy.get('[data-cy="eq-nome"]').clear().type(nomeEditado);
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/equipamentos');
    cy.contains(nomeEditado, { timeout: 15000 }).should('be.visible');
  });

  it('desativa um equipamento existente', () => {
    cy.visit('/equipamentos');
    cy.contains('[data-cy="equipamento-item"]', eq.nome, { timeout: 15000 })
      .find('[data-cy="btn-deletar"]')
      .click({ force: true });

    cy.contains('button', /Desativar|Confirmar/i).click();
    cy.contains('[data-cy="equipamento-item"]', eq.nome)
      .contains('Inativo', { matchCase: false })
      .should('be.visible');
  });

  it('bloqueia solicitante na área de equipamentos', () => {
    cy.login(solicitante.email, solicitante.senha);
    cy.visit('/equipamentos');
    cy.url({ timeout: 15000 }).should('include', '/403');
    cy.contains('Acesso Negado').should('be.visible');
  });
});
