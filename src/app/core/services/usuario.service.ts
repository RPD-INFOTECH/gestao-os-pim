import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateUsuarioDto, UpdateUsuarioDto, Usuario } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  list(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.base);
  }

  getById(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.base}/${id}`);
  }

  create(dto: CreateUsuarioDto): Observable<Usuario> {
    return this.http.post<Usuario>(this.base, dto);
  }

  update(id: string, dto: UpdateUsuarioDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.base}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
