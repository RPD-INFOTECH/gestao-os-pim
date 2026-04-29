import { Perfil } from '@core/models/perfil.enum';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  perfil: Perfil;
  setor: string | null;
  ativo: boolean;
  created_at: string;
}

export interface UsuarioDetails extends Usuario {
  total_os_solicitadas: number;
  total_os_atribuidas: number;
  total_os_concluidas: number;
  total_apontamentos: number;
  total_horas_trabalhadas: number;
}

export interface CreateUsuarioDto {
  nome: string;
  email: string;
  matricula?: string;
  senha: string;
  perfil: Perfil;
  setor?: string | null;
  ativo?: boolean;
}

export interface UpdateUsuarioDto {
  nome?: string;
  email?: string;
  matricula?: string;
  senha?: string;
  perfil?: Perfil;
  setor?: string | null;
  ativo?: boolean;
}
