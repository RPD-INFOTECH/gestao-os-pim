# ServicoPIM Frontend

Frontend do sistema de gestao de ordens de servico do projeto ServicoPIM.

## Visao geral

A aplicacao foi construida com:

- `Angular 21`
- `TypeScript`
- `Tailwind CSS`
- `Cypress` para E2E

O frontend consome a API do projeto `servicoPim-API` e hoje entrega:

- autenticacao por `accessToken` em memoria
- renovacao de sessao por `refreshToken` em cookie `HttpOnly`
- dashboard por perfil
- fluxo completo de ordens de servico
- apontamentos de trabalho
- gestao de equipamentos
- gestao de usuarios
- historico de O.S.
- relatorios
- navegacao protegida por autenticacao e perfil

## Perfis do sistema

- `SOLICITANTE`
  - abre O.S.
  - acompanha apenas as proprias ordens

- `TECNICO`
  - assume O.S. abertas
  - inicia execucao
  - atualiza status
  - registra apontamentos
  - conclui O.S. sob sua responsabilidade

- `SUPERVISOR`
  - administra usuarios e equipamentos
  - atribui tecnicos
  - acompanha historico global
  - visualiza indicadores consolidados

## Arquitetura do frontend

Estrutura principal:

```text
src/
  app/
    app.config.ts
    app.routes.ts
    core/
      auth/
      guards/
      interceptors/
      models/
    features/
      auth/
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
      ui/
      utils/
  environments/
```

Pontos principais:

- `core/auth/auth.service.ts`
  gerencia sessao, login, refresh e logout

- `core/interceptors/auth.interceptor.ts`
  envia `Authorization: Bearer ...` e tenta renovar sessao em `401`

- `core/guards/auth.guard.ts`
  protege rotas autenticadas

- `core/guards/role.guard.ts`
  protege rotas por perfil

- `features/*`
  encapsulam telas, servicos e modelos por dominio funcional

- `shared/*`
  concentra layout, navbar, toast, botao voltar e utilitarios visuais

## Sessao e seguranca

- `accessToken` nao e salvo em `localStorage` nem `sessionStorage`
- o token de acesso fica apenas em memoria
- o `refreshToken` fica em cookie `HttpOnly`, controlado pelo backend
- o frontend usa `withCredentials` para login, refresh e logout
- o Nginx do ambiente containerizado adiciona headers de seguranca basicos

## Requisitos

- Node.js `22+`
- npm
- backend local em `http://localhost:9090` para desenvolvimento com `ng serve`

## Como executar em desenvolvimento

Instale as dependencias:

```bash
npm install
```

Suba o frontend:

```bash
npm start
```

Aplicacao:

```text
http://localhost:4200
```

No modo de desenvolvimento, o Angular usa [`proxy.conf.json`](./proxy.conf.json) para encaminhar chamadas `/api/*` para a API local.

## Como executar em container

Para o ambiente E2E, o frontend sobe junto com a API e um Postgres dedicado:

```bash
docker compose -f docker-compose.e2e.yml up -d --build
```

Aplicacao:

```text
http://localhost:3000
```

## Scripts

- `npm start`
  sobe o servidor de desenvolvimento Angular

- `npm run build`
  gera o build de producao

- `npm run watch`
  build em modo watch

- `npm test`
  executa os testes configurados pelo Angular CLI

- `npm run cypress:open`
  abre a interface interativa do Cypress

- `npm run cypress:run`
  roda a suite E2E em modo headless

## Testes do frontend

### 1. Build

Valida compilacao da SPA:

```bash
npm run build
```

### 2. Testes E2E

O E2E depende de:

- frontend em container
- API em container
- banco `servicopim_e2e`
- seed de usuarios e equipamento base

Passo a passo:

```bash
docker compose -f docker-compose.e2e.yml up -d --build
bash cypress/seeds/seed-e2e.sh
npm run cypress:run
```

O seed cria ou atualiza estes dados base:

- `supervisor@seed.local`
- `tecnico.norte@seed.local`
- `solicitante.linha1@seed.local`
- equipamento `SEED-EQP-001`

Senha padrao usada nos testes:

```text
seed123
```

### 3. Rodar uma spec isolada

Exemplo:

```bash
npx cypress run --spec cypress/e2e/auth.cy.ts
```

## O que a suite E2E cobre hoje

- autenticacao
- dashboard por perfil
- navegacao e guardas
- equipamentos
- usuarios
- ordens de servico

## Fluxo funcional principal

- `Solicitante` cria a O.S.
- `Supervisor` atribui tecnico
- `Tecnico` inicia execucao
- `Tecnico` abre e fecha apontamentos
- `Tecnico` conclui a O.S.
- `Historico` registra as mudancas relevantes

## Observacoes

- os testes E2E usam `cy.session`, com validacao real via `/api/auth/refresh`
- como o backend agora revoga refresh token no logout, a sessao cacheada do Cypress e revalidada antes de ser reutilizada
- o ambiente E2E e separado do ambiente de desenvolvimento
