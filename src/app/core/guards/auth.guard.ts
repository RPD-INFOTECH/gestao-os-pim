import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';

// Guard funcional que protege rotas autenticadas.
export const authGuard: CanActivateFn = () => { 
  const auth = inject(AuthService);

  if (auth.isAuthenticated()) return true;  
  return inject(Router).createUrlTree(['/login']);
};
