import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://manuos.izitecnologia.com.br',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    video: false,
    screenshotOnRunFailure: true,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
  },
  env: {
    supervisor_email: 'admin@pim.com',
    supervisor_senha: 'Admin@123',
  },
});
