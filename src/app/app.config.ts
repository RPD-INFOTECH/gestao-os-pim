// Importa tipos e funcoes para configurar a aplicacao.
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
// Importa o provedor de rotas.
import { provideRouter } from '@angular/router';
// Importa o provedor de HTTP e suporte a interceptors.
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Importa utilitarios RxJS para tratar erros no initializer.
import { catchError, of } from 'rxjs';
// Importa as rotas da aplicacao.
import { routes } from './app.routes';
// Importa o interceptor de autenticacao.
import { authInterceptor } from './core/auth/auth.interceptor';
// Importa o AuthService para validar refresh token ao iniciar.
import { AuthService } from './core/auth/auth.service';

// Define a configuracao principal da aplicacao Angular.
export const appConfig: ApplicationConfig = {
  // Lista de providers globais.
  providers: [
    // Habilita listeners globais de erro no browser.
    provideBrowserGlobalErrorListeners(),
    // Registra as rotas.
    provideRouter(routes),
    // Registra HttpClient e o interceptor de autenticacao.
    provideHttpClient(withInterceptors([authInterceptor])),
    // Executa uma funcao ao iniciar o app (antes de renderizar).
    provideAppInitializer(() => {
      // Injeta o AuthService.
      const auth = inject(AuthService);
      // Se nao houver refresh token salvo, nao faz nada.
      if (!auth.hasSavedRefreshToken()) return of(null);
      // Se houver, tenta renovar e ignora erros.
      return auth.refresh().pipe(catchError(() => of(null)));
    }),
  ],
};
