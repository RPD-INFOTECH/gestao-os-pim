#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

cleanup() {
  echo "Limpando ambiente E2E..."
  docker compose -f docker-compose.e2e.yml down -v >/dev/null 2>&1 || true
}

trap cleanup EXIT

if ! docker info >/dev/null 2>&1; then
  echo "Docker indisponivel para os testes E2E. Verifique acesso ao daemon Docker."
  exit 1
fi

echo "Carregando variáveis de ambiente..."
if [ ! -f .env.e2e ]; then
  echo "Arquivo .env.e2e nao encontrado na raiz do projeto."
  exit 1
fi

set -a
source .env.e2e
set +a

echo "Subindo ambiente E2E..."
docker compose -f docker-compose.e2e.yml up -d --wait

echo "Carregando seed E2E..."
bash cypress/seeds/seed-e2e.sh

echo "Rodando testes Cypress..."
npm run e2e

echo "Testes E2E finalizados."
