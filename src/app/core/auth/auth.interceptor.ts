// Importa tipos para criar interceptor funcional e tratar erros HTTP.
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// Importa inject para obter dependencias dentro da funcao.
import { inject } from '@angular/core';
// Importa Router para redirecionamentos.
import { Router } from '@angular/router';
// Importa operadores para tratamento de erros e troca de fluxo.
import { catchError, switchMap, throwError } from 'rxjs';
// Importa o servico de autenticacao.
import { AuthService } from './auth.service';

// Flag global para evitar multiplos refresh simultaneos.
let isRefreshing = false;

// Define o interceptor que adiciona token e trata 401.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injeta o AuthService.
  const auth = inject(AuthService);

  // Injeta o Router.
  const router = inject(Router);

  // Le o access token atual do estado reativo.
  const token = auth.accessToken();

  // Clona a requisicao adicionando Authorization quando ha token.
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Envia a requisicao (original ou clonada) e intercepta erros.
  return next(authReq).pipe(
    // Captura erros HTTP para decidir o que fazer.
    catchError((err: HttpErrorResponse) => {
      // Evita tentar refresh em rotas de autenticacao.
      const isAuthRoute = req.url.includes('/auth/');

      // Se for 401, nao for rota de auth e nao estiver refrescando, tenta refresh.
      if (err.status === 401 && !isAuthRoute && !isRefreshing) {
        // Marca que esta em processo de refresh.
        isRefreshing = true;

        // Chama o refresh e, quando sucesso, refaz a requisicao original.
        return auth.refresh().pipe(
          // Troca para uma nova requisicao com o novo token.
          switchMap((res) => {
            // Libera a flag de refresh.
            isRefreshing = false;
            // Clona a requisicao original com o novo access token.
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` },
            });
            // Reenvia a requisicao com token atualizado.
            return next(retried);
          }),

          // Se o refresh falhar, limpa sessao e manda para login.
          catchError((refreshErr) => {
            // Libera a flag de refresh.
            isRefreshing = false;
            // Limpa sessao local.
            auth.clearSession();
            // Redireciona para login.
            router.navigate(['/login']);
            // Propaga o erro de refresh.
            return throwError(() => refreshErr);
          }),
        );
      }

      // Para outros erros, apenas propaga.
      return throwError(() => err);
    }),
  );
};
