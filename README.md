# ServiçoPIM Frontend

Frontend do sistema de gestão de ordens de serviço do projeto ServiçoPIM.

Stack principal:
- Angular 21
- TypeScript
- Tailwind CSS

Este projeto consome a API do backend em `servicoPim-API` e cobre o fluxo principal de autenticação, dashboard, ordens de serviço, equipamentos, usuários, histórico e relatórios.

## Requisitos

- Node.js 22
- npm
- Backend do projeto rodando em `http://localhost:9090`

## Como executar

Na raiz do projeto:

```bash
npm install
npm start
```

O frontend sobe em:

```text
http://localhost:4200
```

## Integração com o backend

Durante o desenvolvimento, o Angular usa proxy para encaminhar chamadas da interface para a API.

O arquivo responsável por isso é:

- [`proxy.conf.json`](./proxy.conf.json)

Rotas proxied atualmente:
- `/auth`
- `/usuarios`
- `/equipamentos`
- `/ordens-servico`
- `/historico-os`

Isso permite chamar a API com caminhos relativos no frontend sem lidar com CORS manualmente no ambiente local.

## Scripts

- `npm start`: inicia o servidor de desenvolvimento
- `npm run build`: gera o build de produção
- `npm run watch`: build em modo watch
- `npm test`: executa os testes configurados no projeto

## Estrutura

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
  environments/
  main.ts
  styles.css
```

### Organização das pastas

- `core/auth`: autenticação, guards e interceptor
- `core/guards`: guards auxiliares, como proteção de formulário com alterações pendentes
- `core/models`: interfaces, DTOs e enums usados pela aplicação
- `core/services`: comunicação HTTP com o backend
- `layouts`: moldura das áreas autenticadas
- `pages`: telas da aplicação
- `shared`: componentes reutilizáveis

## Fluxo da aplicação

1. `main.ts` inicializa a aplicação Angular
2. `app.config.ts` registra router, `HttpClient` e interceptor
3. `app.ts` renderiza o `router-outlet` raiz
4. `app.routes.ts` decide se entra em `/login` ou no layout autenticado
5. `MainLayout` renderiza o `Navbar` e um `router-outlet` interno
6. A página atual chama os services de `core/services`
7. O interceptor adiciona o token JWT nas requisições protegidas

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

## Regras já refletidas no frontend

- login com email e senha
- logout pela navegação compartilhada
- rotas protegidas por autenticação
- rotas protegidas por perfil
- formulário de nova OS com proteção contra saída sem salvar
- filtro de OS por status e prioridade
- busca de OS por número ou descrição
- dashboard com métricas baseadas nos dados da API
- gestão de equipamentos restrita ao perfil de supervisor
