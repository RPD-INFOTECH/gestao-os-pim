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

// Define o formato esperado da resposta do backend ao autenticar/renovar.
interface LoginResponse {
  // Token de acesso (curta duracao).
  accessToken: string;
  // Token de refresh (maior duracao).
  refreshToken: string;
  // Dados do usuario autenticado.
  usuario: Usuario;
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
    // Faz POST para o endpoint de login da API.
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        // Executa efeitos colaterais quando a resposta chegar.
        tap((res) => {
          // Mostra a resposta no console para depuracao.
          console.log(res);
          // Salva o refresh token no localStorage.
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
          // Atualiza o estado com o usuario e o access token.
          this.state.set({ usuario: res.usuario, accessToken: res.accessToken });
        }),
      );
  }

  // Renova o access token usando o refresh token salvo.
  refresh(): Observable<LoginResponse> {
    // Le o refresh token do localStorage (ou string vazia se nao existir).
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY) ?? '';

    // Faz POST para o endpoint de refresh da API enviando o token no body.
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        // Atualiza o refresh token salvo se o backend devolver um novo.
        tap((res) => {
          // Salva o novo refresh token.
          localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        }),
      );
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
