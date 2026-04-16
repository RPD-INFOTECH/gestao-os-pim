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
  duracao_execucao_minutos?: number | null;
  duracao_execucao_formatada?: string | null;
  total_trabalhado_minutos?: number;
  total_trabalhado_formatado?: string;
  apontamento_aberto?: boolean;
  apontamentos?: ApontamentoOs[];
}

export interface ApontamentoOs {
  id: string;
  osId: string;
  tecnicoId: string;
  inicioEm: string;
  fimEm: string | null;
  observacao: string | null;
  criadoEm: string;
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
}

export interface AtualizarStatusDto {
  status: StatusOs;
  observacao?: string | null;
}

export interface DashboardIndicadores {
  abertas: number;
  em_andamento: number;
  aguardando_peca: number;
  concluidas_mes: number;
  criticas_abertas: number;
  sem_tecnico: number;
  disponiveis_para_assumir: number;
  minhas_atribuidas: number;
  apontamento_aberto: boolean;
  tempo_medio_execucao_horas: number;
  tempo_medio_ate_inicio_horas: number;
  tempo_medio_ate_conclusao_horas: number;
  tempo_medio_trabalho_horas: number;
}
