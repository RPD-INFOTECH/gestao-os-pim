// Importa o enum de perfis.
import { Perfil } from './perfil.enum';

// Define a estrutura do usuario retornado pela API.
export interface Usuario {
  // Identificador unico do usuario.
  id: string;
  // Nome completo do usuario.
  nome: string;
  // Email do usuario.
  email: string;
  // Perfil de acesso do usuario.
  perfil: Perfil;
  // Setor do usuario (opcional).
  setor: string | null;
  // Indica se o usuario esta ativo.
  ativo: boolean;
  // Data de criacao em string.
  created_at: string;
}

// Define os campos para criar um usuario.
export interface CreateUsuarioDto {
  // Nome do usuario.
  nome: string;
  // Email do usuario.
  email: string;
  // Senha inicial do usuario.
  senha_hash: string;
  // Perfil do usuario.
  perfil: Perfil;
  // Setor do usuario (opcional).
  setor?: string | null;
  // Indica se esta ativo (opcional).
  ativo?: boolean;
}

// Define os campos para atualizar um usuario.
export interface UpdateUsuarioDto {
  // Nome pode ser atualizado.
  nome?: string;
  // Email pode ser atualizado.
  email?: string;
  // Perfil pode ser atualizado.
  perfil?: Perfil;
  // Setor pode ser atualizado.
  setor?: string | null;
  // Status ativo pode ser atualizado.
  ativo?: boolean;
}
