import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { CreateEquipamentoDto, Equipamento, EquipamentoListFilters, UpdateEquipamentoDto } from '@shared/models/equipamento.model';

@Injectable({ providedIn: 'root' })
export class EquipamentoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/equipamentos`;

  list(filters: EquipamentoListFilters = {}): Observable<Equipamento[]> {
    const params = new URLSearchParams();

    if (filters.busca?.trim()) params.set('busca', filters.busca.trim());
    if (filters.setor?.trim()) params.set('setor', filters.setor.trim());
    if (typeof filters.ativo === 'boolean') params.set('ativo', String(filters.ativo));
    if (typeof filters.comOsAbertas === 'boolean') params.set('comOsAbertas', String(filters.comOsAbertas));

    const query = params.toString();
    return this.http.get<Equipamento[]>(query ? `${this.base}?${query}` : this.base);
  }

  getById(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.base}/${id}`);
  }

  getDetails(id: number): Observable<Equipamento> {
    return this.http.get<Equipamento>(`${this.base}/${id}/detalhes`);
  }

  create(dto: CreateEquipamentoDto): Observable<Equipamento> {
    return this.http.post<Equipamento>(this.base, dto);
  }

  update(id: number, dto: UpdateEquipamentoDto): Observable<Equipamento> {
    return this.http.put<Equipamento>(`${this.base}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
