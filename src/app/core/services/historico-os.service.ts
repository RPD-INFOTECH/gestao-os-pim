import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoricoOS } from '../models/historico-os.model';

@Injectable({ providedIn: 'root' })
export class HistoricoOsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/historico-os`;

  list(): Observable<HistoricoOS[]> {
    return this.http.get<HistoricoOS[]>(this.base);
  }

  byOs(osId: string): Observable<HistoricoOS[]> {
    return this.http.get<HistoricoOS[]>(`${this.base}/ordem-servico/${osId}`);
  }

  byUsuario(usuarioId: string): Observable<HistoricoOS[]> {
    return this.http.get<HistoricoOS[]>(`${this.base}/usuario/${usuarioId}`);
  }
}
