# ServicoPIM Frontend

Frontend Angular do sistema ServicoPIM, uma aplicacao para gestao de ordens de servico, equipamentos, usuarios, prazos de atendimento, historico operacional e relatorios.

## Visao geral

O frontend entrega:

- autenticacao com `accessToken` em memoria
- renovacao de sessao por `refreshToken` em cookie `HttpOnly`
- navegacao protegida por autenticacao e perfil
- dashboard por perfil
- fluxo completo de ordens de servico
- apontamentos de trabalho
- gestao de equipamentos
- gestao de usuarios
- historico de O.S.
- relatorios gerenciais com filtros
- configuracao de prazo de atendimento para gestor

## Tecnologias

- `Angular 21`
- `TypeScript`
- `Tailwind CSS`
- `Angular Router`
- `Signals` e `computed`
- `Vitest` via `ng test`
- `Cypress` para E2E
- `Docker` e `Nginx` para imagem/container

## Perfis

- `SOLICITANTE`
  - abre O.S.
  - acompanha as proprias ordens

- `TECNICO`
  - assume O.S. abertas
  - inicia execucao
  - atualiza status
  - registra apontamentos
  - conclui O.S. sob sua responsabilidade

- `SUPERVISOR`
  - administra usuarios funcionais conforme hierarquia
  - administra equipamentos
  - atribui tecnicos
  - acompanha historico e indicadores operacionais

- `GESTOR`
  - visualiza indicadores gerais
  - acessa configuracoes de prazo de atendimento
  - possui acesso de gestao acima do supervisor

## Estrutura

```text
src/
  app/
    core/
      auth/
      guards/
      interceptors/
      models/
    features/
      auth/
      configuracoes/
      dashboard/
      equipamentos/
      errors/
      historico/
      ordens-servico/
      relatorios/
      usuarios/
    shared/
      components/
      layouts/
      models/
      ui/
      utils/
  environments/
cypress/
  e2e/
  fixtures/
  seeds/
  support/
```

## Seguranca no frontend

- o `accessToken` fica apenas em memoria
- o `refreshToken` nao e acessado pelo JavaScript, pois fica em cookie `HttpOnly`
- o interceptor adiciona `Authorization: Bearer <token>`
- em `401`, o interceptor tenta renovar a sessao via `/auth/refresh`
- guards protegem rotas autenticadas e rotas por perfil
- o Nginx do container faz proxy de `/api` para a API

## Requisitos

- Node.js `22+`
- npm
- backend local em `http://localhost:9090` para desenvolvimento

## Desenvolvimento

```bash
npm install
npm start
```

Aplicacao local:

```text
http://localhost:4200
```

O arquivo [`proxy.conf.json`](./proxy.conf.json) encaminha chamadas `/api/*` para a API local.

## Docker

Build da imagem:

```bash
docker build -t gestao-os-pim .
```

Ambiente com frontend, API, Postgres e PgAdmin:

```bash
docker compose up -d
```

Aplicacao via compose:

```text
http://localhost:3000
```

## Scripts

- `npm start`: sobe o Angular em desenvolvimento
- `npm run build`: gera build de producao
- `npm run watch`: build em modo watch
- `npm test`: executa testes unitarios
- `npm run cypress:open`: abre Cypress interativo
- `npm run cypress:run`: executa Cypress headless
- `npm run e2e`: alias para Cypress headless

## Testes

### Build

```bash
npm run build
```

### Unitarios

```bash
npm test -- --watch=false
```

Cobertura atual relevante:

- `AuthService`
- guards de autenticacao e perfil
- interceptor de autenticacao e refresh
- services de usuarios, equipamentos, historico, ordens, dashboard e prazo de atendimento
- pipes de status e tempo trabalhado
- toast e confirmacao
- componentes base ja existentes

Ultima validacao local: `58` testes unitarios passando.

### E2E com ambiente Docker

Fluxo recomendado:

```bash
bash src/scripts/test-e2e.sh
```

Esse script:

1. sobe o ambiente E2E com Docker Compose
2. carrega variaveis `.env.e2e`
3. aplica seed de dados
4. roda Cypress
5. derruba o ambiente ao final

Ultima validacao local: `46` testes E2E passando.

## E2E cobre

- autenticacao
- dashboard por perfil
- navegacao e guards
- equipamentos
- usuarios e hierarquia de perfis
- ordens de servico
- relatorios
- configuracao de prazo de atendimento
- seguranca de API e sessao

## Observacoes

- O ambiente E2E e separado do desenvolvimento local.
- `cypress/screenshots`, `cypress/videos`, `dist`, `.angular` e arquivos de ambiente estao ignorados.
- O arquivo `.dockerignore` reduz o contexto de build e evita enviar `node_modules`, artefatos de teste e arquivos sensiveis para a imagem Docker.
