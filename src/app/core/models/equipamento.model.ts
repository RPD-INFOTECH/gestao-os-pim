export interface Equipamento {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  localizacao: string;
  setor: string;
  numero_patrimonio: string | null;
  fabricante: string | null;
  modelo: string | null;
  ativo: boolean;
  data_cadastro: string;
  ultima_revisao: string | null;
  ordensServico?: {
    id: string;
    numero: string;
    status: string;
    prioridade: string;
    abertura_em: string;
    conclusao_em: string | null;
    descricao_falha: string;
    solicitante: { id: string; nome: string };
    tecnico: { id: string; nome: string } | null;
  }[];
}

export interface CreateEquipamentoDto {
  codigo: string;
  nome: string;
  tipo: string;
  localizacao: string;
  setor?: string;
  numero_patrimonio?: string | null;
  fabricante?: string | null;
  modelo?: string | null;
  ultima_revisao?: string | null;
  ativo?: boolean;
}

export type UpdateEquipamentoDto = Partial<CreateEquipamentoDto>;
