import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { HistoricoListFilters, HistoricoOS } from '@shared/models/historico-os.model';

@Injectable({ providedIn: 'root' })
export class HistoricoOsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/historico-os`;

  list(filters: HistoricoListFilters = {}): Observable<HistoricoOS[]> {
    const params = new URLSearchParams();

    if (filters.busca?.trim()) params.set('busca', filters.busca.trim());
    if (filters.statusNovo?.trim()) params.set('statusNovo', filters.statusNovo.trim());
    if (filters.prioridade?.trim()) params.set('prioridade', filters.prioridade.trim());
    if (filters.usuarioId?.trim()) params.set('usuarioId', filters.usuarioId.trim());
    if (filters.osId?.trim()) params.set('osId', filters.osId.trim());
    if (filters.dataInicio?.trim()) params.set('dataInicio', filters.dataInicio.trim());
    if (filters.dataFim?.trim()) params.set('dataFim', filters.dataFim.trim());

    const query = params.toString();
    return this.http.get<HistoricoOS[]>(query ? `${this.base}?${query}` : this.base);
  }

  byOs(osId: string): Observable<HistoricoOS[]> {
    return this.http.get<HistoricoOS[]>(`${this.base}/ordem-servico/${osId}`);
  }

  byUsuario(usuarioId: string): Observable<HistoricoOS[]> {
    return this.http.get<HistoricoOS[]>(`${this.base}/usuario/${usuarioId}`);
  }
}
