// Importa utilitarios do Angular para injecao e sinais reativos.
import { Injectable, computed, inject, signal } from '@angular/core';
// Importa HttpClient para fazer chamadas HTTP.
import { HttpClient } from '@angular/common/http';
// Importa Router para navegacao programatica.
import { Router } from '@angular/router';
// Importa tipos e operadores do RxJS.
import { Observable, tap } from 'rxjs';
// Importa o modelo de usuario da aplicacao.
import { Usuario } from '../models/usuario.model';
// Importa o enum de perfis de usuario.
import { Perfil } from '../models/perfil.enum';
// Importa as variaveis de ambiente (ex.: URL da API).
import { environment } from '../../../environments/environment';

// Define o formato do estado de autenticacao no frontend.
interface AuthState {
  // Usuario logado ou null quando nao autenticado.
  usuario: Usuario | null;
  // Access token atual ou null quando nao autenticado.
  accessToken: string | null;
}

// Define o formato esperado da resposta do backend ao autenticar.
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: Usuario;
}

// Refresh devolve apenas tokens (sem dados do usuario).
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Formato do payload do JWT de acesso emitido pelo backend.
interface AccessTokenPayload {
  sub: string;
  email: string;
  perfil: Perfil;
}

// Chave usada para salvar o refresh token no localStorage.
const REFRESH_TOKEN_KEY = 'refreshToken';

// Registra este servico como injetavel e singleton no app inteiro.
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Obtem uma instancia do HttpClient via injecao.
  private http = inject(HttpClient);
  // Obtem uma instancia do Router via injecao.
  private router = inject(Router);

  // Mantem o estado de autenticacao em memoria usando signals.
  private state = signal<AuthState>({ usuario: null, accessToken: null });

  // Indica se existe access token (usuario autenticado).
  isAuthenticated = computed(() => !!this.state().accessToken);

  // Exposicao reativa do usuario atual.
  currentUser = computed(() => this.state().usuario);
  // Exposicao reativa do perfil atual (ou null se nao existir).
  currentPerfil = computed(() => this.state().usuario?.perfil ?? null);
  // Exposicao reativa do access token.
  accessToken = computed(() => this.state().accessToken);

  // Faz login enviando email e senha e devolve o Observable da resposta.
  // O backend espera o campo 'senha' (nao 'password').
  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap((res) => {
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
          this.state.set({ usuario: res.usuario, accessToken: res.accessToken });
        }),
      );
  }

  // Renova o access token usando o refresh token salvo.
  // O backend devolve apenas tokens, por isso reconstruimos os dados do
  // usuario a partir do payload do proprio access token (sub/email/perfil).
  refresh(): Observable<RefreshResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) ?? '';

    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
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

  // Decodifica o payload de um JWT sem validar assinatura (apenas leitura).
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

  // Limpa o estado local e redireciona para login (logout local).
  // O backend nao possui rota de logout, por isso apenas limpamos o estado.
  logout(): void {
    // Remove o refresh token local.
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Reseta o estado local de autenticacao.
    this.state.set({ usuario: null, accessToken: null });
    // Navega para a tela de login.
    this.router.navigate(['/login']);
  }

  // Limpa apenas o estado local (util quando o token expira).
  clearSession(): void {
    // Remove o refresh token local.
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Limpa usuario e access token em memoria.
    this.state.set({ usuario: null, accessToken: null });
  }

  // Verifica se existe refresh token salvo.
  hasSavedRefreshToken(): boolean {
    // Retorna true se a chave existir no localStorage.
    return !!localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  // Verifica se o usuario atual tem o perfil informado.
  hasRole(perfil: Perfil): boolean {
    // Compara o perfil atual com o perfil exigido.
    return this.currentPerfil() === perfil;
  }
}
