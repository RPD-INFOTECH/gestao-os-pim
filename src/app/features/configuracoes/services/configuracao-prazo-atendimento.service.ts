import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ConfiguracaoPrazoAtendimento,
  UpdateConfiguracaoPrazoAtendimentoDto,
} from '@shared/models/configuracao-prazo-atendimento.model';
import { Prioridade } from '@shared/models/ordem-servico.model';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoPrazoAtendimentoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/configuracoes/prazo-atendimento`;

  list(): Observable<ConfiguracaoPrazoAtendimento[]> {
    return this.http.get<ConfiguracaoPrazoAtendimento[]>(this.base);
  }

  update(
    prioridade: Prioridade,
    dto: UpdateConfiguracaoPrazoAtendimentoDto,
  ): Observable<ConfiguracaoPrazoAtendimento> {
    return this.http.put<ConfiguracaoPrazoAtendimento>(
      `${this.base}/${encodeURIComponent(prioridade)}`,
      dto,
    );
  }
}
