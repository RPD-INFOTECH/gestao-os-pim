import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEquipamentoDto, Equipamento, UpdateEquipamentoDto } from '../models/equipamento.model';

@Injectable({ providedIn: 'root' })
export class EquipamentoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/equipamentos`;

  list(): Observable<Equipamento[]> {
    return this.http.get<Equipamento[]>(this.base);
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
