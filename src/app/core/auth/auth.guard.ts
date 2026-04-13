// Importa inject para obter servicos no guard.
import { inject } from '@angular/core';
// Importa tipos de guard e Router para redirecionar.
import { CanActivateFn, Router } from '@angular/router';
// Importa o servico de autenticacao.
import { AuthService } from './auth.service';

// Guard funcional que protege rotas autenticadas.
export const authGuard: CanActivateFn = () => {
  // Injeta o AuthService.
  const auth = inject(AuthService);
  // Se estiver autenticado, libera a rota.
  if (auth.isAuthenticated()) return true;
  // Caso contrario, redireciona para /login.
  return inject(Router).createUrlTree(['/login']);
};
