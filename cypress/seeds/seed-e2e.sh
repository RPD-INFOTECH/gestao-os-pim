#!/bin/bash
set -e

echo "Aguardando banco de dados..."
until docker compose -f docker-compose.e2e.yml exec -T postgres pg_isready -U postgres -d servicopim_e2e; do
  sleep 2
done

echo "Aguardando API (via proxy nginx do frontend)..."
until curl -sf http://localhost:3000/api/health > /dev/null 2>&1; do
  sleep 3
done

echo "Criando usuários e equipamento de teste..."
docker compose -f docker-compose.e2e.yml exec -T postgres psql -U postgres -d servicopim_e2e -c "
INSERT INTO usuario (id, nome, email, matricula, senha_hash, perfil, setor, ativo, created_at)
VALUES
  (gen_random_uuid(), 'Admin E2E', 'admin@pim.com', 'ADM001',
   '\$2b\$08\$YZ2o/wwmJveMVH0jDFE2T.FmG4PS50oE3ubIFtsxjHaNVv3dXSbly',
   'SUPERVISOR', 'TI', true, NOW()),
  (gen_random_uuid(), 'Técnico Cypress', 'tecnico.cypress@pim.com', 'TEC-CY-001',
   '\$2b\$08\$hVCm58BPtnrDGTBTidwy4eMh8ovA/6GbhKUkzwbYXosS8/QP/0uHC',
   'TÉCNICO', 'Manutenção', true, NOW()),
  (gen_random_uuid(), 'Solicitante Cypress', 'solicitante.cypress@pim.com', 'SOL-CY-001',
   '\$2b\$08\$hVCm58BPtnrDGTBTidwy4eMh8ovA/6GbhKUkzwbYXosS8/QP/0uHC',
   'SOLICITANTE', 'Operação', true, NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO equipamento (codigo, nome, tipo, localizacao, setor, ativo, data_cadastro)
VALUES ('EQ-TESTE-001', 'Equipamento de Teste Cypress', 'Compressor', 'Sala de Testes', 'Operação', true, NOW())
ON CONFLICT (codigo) DO NOTHING;
"

echo "Seed concluído!"
