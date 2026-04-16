# ServiçoPIM Frontend

Frontend do sistema de gestão de ordens de serviço do projeto ServiçoPIM.

## Visão Geral

A aplicação foi construída com `Angular`, `TypeScript` e `Tailwind CSS` e consome a API do projeto `servicoPim-API`.

Hoje o frontend cobre:

- login e renovação de sessão
- dashboard por perfil
- listagem e detalhe de ordens de serviço
- criação de nova O.S.
- apontamentos de trabalho no detalhe da O.S.
- gestão de equipamentos
- gestão de usuários
- histórico
- relatórios
- navegação protegida por autenticação e perfil

## Stack

- Angular 21
- TypeScript
- Tailwind CSS
- Vitest para testes do frontend

## Requisitos

- Node.js `22.12+`
- npm
- backend rodando em `http://localhost:9090`

## Como executar

```bash
npm install
npm start
```

Aplicação disponível em:

```text
http://localhost:4200
```

## Scripts

- `npm start`
  Sobe o servidor de desenvolvimento

- `npm run build`
  Gera o build do projeto

- `npm run watch`
  Build em modo watch

- `npm test`
  Executa a suíte de testes do frontend

## Integração com o backend

O frontend usa proxy no ambiente local para encaminhar chamadas da interface para a API.

Arquivo responsável:

- [`proxy.conf.json`](./proxy.conf.json)

As chamadas da API usam prefixo `/api`, por exemplo:

- `/api/auth/login`
- `/api/dashboard`
- `/api/ordens-servico`
- `/api/equipamentos`
- `/api/usuarios`
- `/api/historico-os`

Isso evita conflito entre:

- rotas da SPA, como `/equipamentos`
- rotas da API, como `/api/equipamentos`

## O que a interface entrega hoje

### Autenticação

- login com `email` e `senha`
- recuperação automática de sessão via `refreshToken`
- logout pelo menu lateral
- rotas protegidas por `authGuard`
- rotas protegidas por papel com `roleGuard`

### Dashboard

O dashboard muda conforme o perfil:

- `SUPERVISOR`
  - visão global da operação
  - O.S. abertas, em andamento, aguardando peça, críticas, sem técnico e tempos médios

- `TÉCNICO`
  - visão da fila pessoal
  - O.S. atribuídas, disponíveis para assumir, em andamento, apontamento aberto e tempos médios

- `SOLICITANTE`
  - visão das próprias solicitações
  - O.S. abertas, em andamento, aguardando peça e tempo médio até conclusão

### Ordens de Serviço

- listagem com:
  - busca por número ou descrição
  - filtro por status
  - filtro por prioridade
  - filtro por técnico
  - filtro por setor
  - indicador visual de SLA

- detalhe da O.S. com:
  - dados completos
  - timeline de histórico
  - apontamentos de trabalho
  - ações por perfil

- criação de nova O.S. com:
  - equipamento
  - tipo de manutenção
  - prioridade
  - descrição da falha
  - proteção `canDeactivate` ao sair sem salvar

### Equipamentos

- listagem
- cadastro e edição
- detalhe do equipamento
- visualização de O.S. relacionadas

### Usuários

- listagem
- cadastro e edição
- desativação

### Histórico e relatórios

- tela de histórico com auditoria das mudanças de status
- tela de relatórios com visão operacional resumida

## Estrutura do projeto

```text
src/
  app/
    app.ts
    app.routes.ts
    app.config.ts
    core/
      auth/
      guards/
      models/
      services/
    layouts/
      main-layout/
    pages/
      dashboard/
      equipamentos/
      errors/
      historico/
      login/
      os/
      relatorios/
      usuarios/
    shared/
      navbar/
      toast/
      status-label.pipe.ts
  environments/
  main.ts
  styles.css
```

## Como a aplicação se organiza

- `app.ts`
  Componente raiz da aplicação

- `app.routes.ts`
  Define as rotas públicas e privadas

- `app.config.ts`
  Registra router, `HttpClient`, interceptor e bootstrap da autenticação

- `core/auth`
  Login, sessão, guards e interceptor

- `core/models`
  Tipos, enums e contratos da aplicação

- `core/services`
  Comunicação com o backend

- `layouts`
  Estrutura das áreas autenticadas

- `pages`
  Telas da aplicação

- `shared`
  Componentes e utilitários reutilizáveis, como navbar, toast e pipe de rótulo visual de status

## Padrões visuais e UX já aplicados

- navegação lateral compartilhada
- feedback por `toast` para ações pontuais
- mensagens inline para falhas de carregamento de página
- status visuais padronizados sem `_`, por exemplo:
  - `EM ANDAMENTO`
  - `AGUARDANDO PEÇA`
  - `CONCLUÍDA`

## Testes

Os testes atuais do frontend usam a estrutura padrão por proximidade do Angular:

- `src/app/app.spec.ts`
- `src/app/pages/login/login.spec.ts`
- `src/app/core/services/dashboard.service.spec.ts`
- `src/app/core/services/ordem-servico.service.spec.ts`
- `src/app/pages/os/os-details/os-details.spec.ts`

Rodando os testes:

```bash
npm test -- --watch=false
```

Hoje eles cobrem principalmente:

- componente raiz
- fluxo de login
- contrato do dashboard
- service de ordens de serviço
- regras visuais do detalhe da O.S.

## Rotas principais

- `/login`
- `/dashboard`
- `/ordens-de-servico`
- `/ordens-de-servico/nova`
- `/ordens-de-servico/:id`
- `/equipamentos`
- `/equipamentos/novo`
- `/equipamentos/:id`
- `/usuarios`
- `/usuarios/novo`
- `/usuarios/:id`
- `/historico`
- `/relatorios`

## Observação sobre organização de testes

No frontend Angular, é comum deixar os arquivos `.spec.ts` próximos dos componentes e services que eles testam. Isso facilita manutenção local e navegação.

Também é possível centralizar tudo em uma pasta única, como no backend, mas para aplicações Angular a abordagem por proximidade costuma ser mais natural e mais fácil de manter quando a base cresce.
