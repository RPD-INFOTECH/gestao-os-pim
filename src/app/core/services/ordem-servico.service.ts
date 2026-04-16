import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApontamentoOs,
  AtualizarStatusDto,
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

  list(params?: {
    status?: StatusOs;
    prioridade?: Prioridade;
    busca?: string;
    tecnicoId?: string;
    setor?: string;
  }): Observable<OrdemServico[]> {
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

  assumir(id: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/assumir`, {});
  }

  iniciar(id: string): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/iniciar`, {});
  }

  atualizarStatus(id: string, dto: AtualizarStatusDto): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/status`, dto);
  }

  concluir(id: string, dto: ConcluirOrdemServicoDto): Observable<OrdemServico> {
    return this.http.patch<OrdemServico>(`${this.base}/${id}/concluir`, dto);
  }

  listarApontamentos(id: string): Observable<ApontamentoOs[]> {
    return this.http.get<ApontamentoOs[]>(`${this.base}/${id}/apontamentos`);
  }

  iniciarApontamento(id: string, observacao?: string | null): Observable<ApontamentoOs[]> {
    return this.http.post<ApontamentoOs[]>(`${this.base}/${id}/apontamentos/iniciar`, {
      observacao: observacao || null,
    });
  }

  finalizarApontamento(id: string, observacao?: string | null): Observable<ApontamentoOs[]> {
    return this.http.patch<ApontamentoOs[]>(`${this.base}/${id}/apontamentos/finalizar`, {
      observacao: observacao || null,
    });
  }
}
