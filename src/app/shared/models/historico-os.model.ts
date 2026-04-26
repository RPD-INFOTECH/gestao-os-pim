export interface HistoricoOS {
  id: string;
  osId: string;
  usuarioId: string;
  statusAnterior: string | null;
  statusNovo: string;
  observacao: string | null;
  registradoEm: string;
  ordemServico?: { id: string; numero: string; prioridade?: string };
  usuario?: { id: string; nome: string };
}

export interface HistoricoListFilters {
  busca?: string;
  statusNovo?: string;
  prioridade?: string;
  usuarioId?: string;
  osId?: string;
  dataInicio?: string;
  dataFim?: string;
}
