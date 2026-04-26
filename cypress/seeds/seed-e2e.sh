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
WITH seed_password AS (
  SELECT '\$2b\$08\$XaHmuWOdt2JiPiKtp244neWkEr/V.WN6B3R.QuT71WAg3p1SxZMK.'::varchar AS senha_hash
)
INSERT INTO usuario (id, nome, email, matricula, senha_hash, perfil, setor, ativo, created_at)
VALUES
  (gen_random_uuid(), 'Supervisor Seed', 'supervisor@seed.local', 'SEED-SUP-001',
   (SELECT senha_hash FROM seed_password),
   'SUPERVISOR', 'Supervisão', true, NOW()),
  (gen_random_uuid(), 'Tecnico Demo Norte', 'tecnico.norte@seed.local', 'SEED-TEC-001',
   (SELECT senha_hash FROM seed_password),
   'TÉCNICO', 'Manutenção', true, NOW()),
  (gen_random_uuid(), 'Solicitante Demo Linha 1', 'solicitante.linha1@seed.local', 'SEED-SOL-001',
   (SELECT senha_hash FROM seed_password),
   'SOLICITANTE', 'Produção', true, NOW())
ON CONFLICT (email) DO UPDATE SET
  nome = EXCLUDED.nome,
  matricula = EXCLUDED.matricula,
  senha_hash = EXCLUDED.senha_hash,
  perfil = EXCLUDED.perfil,
  setor = EXCLUDED.setor,
  ativo = EXCLUDED.ativo;

INSERT INTO equipamento (codigo, nome, tipo, localizacao, setor, ativo, data_cadastro)
VALUES ('SEED-EQP-001', 'Prensa Hidraulica 01', 'Prensa', 'Linha A', 'Producao', true, NOW())
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  tipo = EXCLUDED.tipo,
  localizacao = EXCLUDED.localizacao,
  setor = EXCLUDED.setor,
  ativo = EXCLUDED.ativo;
"

echo "Seed concluído!"
