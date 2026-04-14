import { Equipamento } from './equipamento.model';
import { Usuario } from './usuario.model';

export enum StatusOs {
  ABERTA = 'ABERTA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO_PECA = 'AGUARDANDO_PECA',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

export enum Prioridade {
  BAIXA = 'BAIXA',
  MEDIA = 'MÉDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRÍTICA',
}

export enum TipoManutencao {
  CORRETIVA = 'CORRETIVA',
  PREVENTIVA = 'PREVENTIVA',
  PREDITIVA = 'PREDITIVA',
}

export interface OrdemServico {
  id: string;
  numero: string;
  equipamento: Equipamento;
  solicitante: Usuario;
  tecnico: Usuario | null;
  tipo_manutencao: TipoManutencao;
  prioridade: Prioridade;
  status: StatusOs;
  descricao_falha: string;
  abertura_em: string;
  inicio_em: string | null;
  conclusao_em: string | null;
  descricao_servico: string | null;
  pecas_utilizadas: string | null;
  horas_trabalhadas: number | null;
}

export interface CreateOrdemServicoDto {
  equipamentoId: number;
  tipo_manutencao: TipoManutencao;
  prioridade: Prioridade;
  descricao_falha: string;
}

export interface ConcluirOrdemServicoDto {
  descricao_servico: string;
  pecas_utilizadas?: string | null;
  horas_trabalhadas: number;
}
