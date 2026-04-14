import { Perfil } from './perfil.enum';

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

export interface CreateUsuarioDto {
  nome: string;
  email: string;
  matricula: string;
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
