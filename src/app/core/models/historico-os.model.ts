export interface HistoricoOS {
  id: string;
  osId: string;
  usuarioId: string;
  statusAnterior: string | null;
  statusNovo: string;
  observacao: string | null;
  registradoEm: string;
  ordemServico?: { id: string; numero: string };
  usuario?: { id: string; nome: string };
}
