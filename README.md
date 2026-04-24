# ServiçoPIM Frontend

Frontend do sistema de gestão de ordens de serviço do projeto ServiçoPIM.

## Visão Geral

A aplicação foi construída com:

- `Angular`
- `TypeScript`
- `Tailwind CSS`

Ela consome a API do projeto `servicoPim-API` e hoje entrega:

- login e renovação de sessão
- dashboard por perfil
- listagem e detalhe de ordens de serviço
- criação de nova O.S.
- apontamentos de trabalho no detalhe da O.S.
- gestão de equipamentos
- gestão de usuários
- histórico
- relatórios gerenciais
- navegação protegida por autenticação e perfil

## Stack

- Angular 21
- TypeScript
- Tailwind CSS
- Vitest no setup de testes do frontend

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
  sobe o servidor de desenvolvimento

- `npm run build`
  gera o build do projeto

- `npm run watch`
  build em modo watch

- `npm test`
  executa a suíte de testes do frontend

## Integração com o backend

O frontend usa proxy local para encaminhar chamadas da SPA para a API.

Arquivo:

- [`proxy.conf.json`](./proxy.conf.json)

As chamadas usam prefixo `/api`, por exemplo:

- `/api/auth/login`
- `/api/dashboard`
- `/api/ordens-servico`
- `/api/equipamentos`
- `/api/usuarios`
- `/api/historico-os`

Isso evita conflito entre:

- rotas da SPA, como `/equipamentos`
- rotas da API, como `/api/equipamentos`

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
      navigation/
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
      back-button/
      navbar/
      toast/
      status-label.pipe.ts
  environments/
  main.ts
  styles.css
```

## Organização das camadas

- `app.ts`
  componente raiz da aplicação

- `app.routes.ts`
  define as rotas públicas e privadas

- `app.config.ts`
  registra router, `HttpClient`, interceptor e bootstrap da autenticação

- `core/auth`
  login, sessão, guards e interceptor

- `core/models`
  contratos, enums e tipos da aplicação

- `core/services`
  comunicação HTTP com o backend

- `core/navigation`
  pilha de navegação usada pelo botão voltar

- `layouts`
  estrutura das áreas autenticadas

- `pages`
  telas da aplicação

- `shared`
  componentes e utilitários reutilizáveis

## Fluxo principal da aplicação

```text
AppComponent
└── router-outlet principal
    ├── /login
    │   └── Login
    └── área autenticada
        └── MainLayout
            ├── Navbar
            └── router-outlet interno
                ├── Dashboard
                ├── Ordens de Serviço
                ├── Equipamentos
                ├── Usuários
                ├── Histórico
                └── Relatórios
```

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
  - O.S. atribuídas, disponíveis para assumir, apontamento aberto e tempos médios

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
  - histórico
  - apontamentos
  - ações por perfil
  - bloqueios visuais coerentes com as regras do backend

- criação de nova O.S. com:
  - equipamento
  - tipo de manutenção
  - prioridade
  - descrição da falha
  - proteção `canDeactivate`

### Equipamentos

- listagem com filtros e resumo
- cadastro e edição
- detalhe do equipamento
- visualização de O.S. relacionadas

### Usuários

- listagem com filtros
- cadastro e edição
- desativação
- tela de detalhe com métricas do usuário

### Histórico

- timeline visual de auditoria
- filtros por status, prioridade, busca e período
- link direto para a O.S. relacionada
- rolagem interna controlada

### Relatórios

- cards de resumo
- distribuição por status
- distribuição por prioridade
- horas por técnico
- O.S. por setor
- desempenho por técnico
- tabela analítica de O.S. recentes

## Regras visuais e UX aplicadas

- navbar e sidebar compartilhadas
- feedback de ações com `toast`
- mensagens inline para falhas de carregamento
- botão voltar com pilha real de navegação
- rótulos de status padronizados para leitura humana:
  - `EM ANDAMENTO`
  - `AGUARDANDO PEÇA`
  - `CONCLUÍDA`

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
- `/usuarios/:id/detalhes`
- `/historico`
- `/relatorios`

## Permissões por perfil

- `SOLICITANTE`
  - cria O.S.
  - vê apenas as próprias
  - não acessa listagem geral de equipamentos
  - não acessa histórico global

- `TÉCNICO`
  - vê O.S. atribuídas e abertas disponíveis
  - inicia execução
  - registra apontamentos
  - vê histórico apenas do que é dele ou onde já trabalhou

- `SUPERVISOR`
  - acesso total às áreas administrativas
  - usuários
  - equipamentos
  - histórico global
  - relatórios

## Testes

Os testes atuais do frontend estão próximos do código:

- `src/app/app.spec.ts`
- `src/app/pages/login/login.spec.ts`
- `src/app/core/services/dashboard.service.spec.ts`
- `src/app/core/services/ordem-servico.service.spec.ts`
- `src/app/pages/os/os-details/os-details.spec.ts`

Para rodar:

```bash
npm test -- --watch=false
```

Hoje eles cobrem principalmente:

- componente raiz
- fluxo de login
- contrato do dashboard
- service de ordens de serviço
- regras do detalhe da O.S.

## Observações de arquitetura

- o frontend confia no backend para escopo de dados por perfil
- a API é consumida via `/api`
- as telas principais foram separadas por domínio
- a navegação autenticada é centralizada em `MainLayout` + `Navbar`


