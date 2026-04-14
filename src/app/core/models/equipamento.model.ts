export interface Equipamento {
  id: number;
  codigo: string;
  nome: string;
  tipo: string;
  localizacao: string;
  fabricante: string | null;
  modelo: string | null;
  ativo: boolean;
}

export interface CreateEquipamentoDto {
  codigo: string;
  nome: string;
  tipo: string;
  localizacao: string;
  fabricante?: string | null;
  modelo?: string | null;
  ativo?: boolean;
}

export type UpdateEquipamentoDto = Partial<CreateEquipamentoDto>;
