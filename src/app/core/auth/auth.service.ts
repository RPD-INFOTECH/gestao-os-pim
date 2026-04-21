import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Perfil } from '../models/perfil.enum';
import { environment } from '../../../environments/environment';

interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
}

interface LoginResponse {
  accessToken: string;
  usuario: Usuario;
}

interface RefreshResponse {
  accessToken: string;
}

interface AccessTokenPayload {
  sub: string;
  email: string;
  perfil: Perfil;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<AuthState>({ usuario: null, accessToken: null });

  isAuthenticated = computed(() => !!this.state().accessToken);
  currentUser = computed(() => this.state().usuario);
  currentPerfil = computed(() => this.state().usuario?.perfil ?? null);
  accessToken = computed(() => this.state().accessToken);

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, senha }, { withCredentials: true })
      .pipe(
        tap((res) => {
          this.state.set({ usuario: res.usuario, accessToken: res.accessToken });
        }),
      );
  }

  refresh(): Observable<RefreshResponse> {
    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          const payload = this.decodeJwt(res.accessToken);
          const usuario: Usuario | null = payload
            ? {
                id: payload.sub,
                nome: '',
                email: payload.email,
                matricula: '',
                perfil: payload.perfil,
                setor: null,
                ativo: true,
                created_at: '',
              }
            : this.state().usuario;
          this.state.set({ usuario, accessToken: res.accessToken });
        }),
      );
  }

  private decodeJwt(token: string): AccessTokenPayload | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(json) as AccessTokenPayload;
    } catch {
      return null;
    }
  }

  logout(): void {
    this.http
      .post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({ complete: () => this.clearSession() });
  }

  clearSession(): void {
    this.state.set({ usuario: null, accessToken: null });
    this.router.navigate(['/login']);
  }

  hasRole(perfil: Perfil): boolean {
    return this.currentPerfil() === perfil;
  }
}
