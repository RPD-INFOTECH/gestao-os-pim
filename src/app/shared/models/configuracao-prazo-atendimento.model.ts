import { Usuario } from '@shared/models/usuario.model';
import { Prioridade } from '@shared/models/ordem-servico.model';

export interface ConfiguracaoPrazoAtendimento {
  id: string;
  prioridade: Prioridade;
  horas_limite: number;
  ativo: boolean;
  atualizado_em: string;
  atualizadoPor?: Usuario | null;
}

export interface UpdateConfiguracaoPrazoAtendimentoDto {
  horas_limite: number;
  ativo?: boolean;
}
