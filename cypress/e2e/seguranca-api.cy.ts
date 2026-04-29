import dadosTeste from '../fixtures/dados-teste.json';

const supervisorEmail = Cypress.env('supervisor_email');
const supervisorSenha = Cypress.env('supervisor_senha');
const solicitante = dadosTeste.usuario_solicitante;

describe('Segurança da API e sessão', () => {
  it('bloqueia rota protegida sem autenticação', () => {
    cy.request({
      method: 'GET',
      url: '/api/usuarios',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.match(/token|autenticação|ausente/i);
    });
  });

  it('não expõe refresh token no corpo e usa cookie HttpOnly', () => {
    cy.request('POST', '/api/auth/login', {
      email: supervisorEmail,
      senha: supervisorSenha,
    }).then((response) => {
      const cookies = response.headers['set-cookie'] ?? [];
      const refreshCookie = cookies.find((cookie) => cookie.startsWith('refreshToken='));

      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('accessToken');
      expect(response.body).not.to.have.property('refreshToken');
      expect(refreshCookie).to.match(/HttpOnly/i);
    });
  });

  it('documenta comportamento atual: o mesmo usuário consegue abrir duas sessões', () => {
    cy.request('POST', '/api/auth/login', {
      email: supervisorEmail,
      senha: supervisorSenha,
    }).its('status').should('eq', 200);

    cy.request('POST', '/api/auth/login', {
      email: supervisorEmail,
      senha: supervisorSenha,
    }).its('status').should('eq', 200);
  });

  it('bloqueia ação administrativa feita por solicitante diretamente na API', () => {
    cy.request('POST', '/api/auth/login', {
      email: solicitante.email,
      senha: solicitante.senha,
    }).then((loginResponse) => {
      cy.request({
        method: 'POST',
        url: '/api/equipamentos',
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${loginResponse.body.accessToken}`,
        },
        body: {
          nome: `Equipamento Bloqueado ${Date.now()}`,
          tipo: 'Compressor',
          localizacao: 'Linha Restrita',
          setor: 'Produção',
        },
      }).then((response) => {
        expect(response.status).to.eq(403);
      });
    });
  });
});
