import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConcluirOrdemServicoDto,
  CreateOrdemServicoDto,
  OrdemServico,
  Prioridade,
  StatusOs,
} from '../models/ordem-servico.model';

@Injectable({ providedIn: 'root' })
export class OrdemServicoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ordens-servico`;

  list(params?: { status?: StatusOs; prioridade?: Prioridade; busca?: string }): Observable<OrdemServico[]> {
    const sanitized = Object.fromEntries(
      Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    return this.http.get<OrdemServico[]>(this.base, { params: sanitized as any });
  }

  getById(id: string): Observable<OrdemServico> {
    return this.http.get<OrdemServico>(`${this.base}/${id}`);
  }

  create(dto: CreateOrdemServicoDto): Observable<OrdemServico> {
    return this.http.post<OrdemServico>(this.base, dto);
  }

  atribuirTecnico(id: string, tecnicoId: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/atribuir-tecnico`, { tecnicoId });
  }

  atualizarStatus(id: string, status: StatusOs): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/status`, { status });
  }

  concluir(id: string, dto: ConcluirOrdemServicoDto): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/concluir`, dto);
  }
}
