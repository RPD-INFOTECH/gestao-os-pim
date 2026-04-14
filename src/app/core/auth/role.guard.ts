import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Perfil } from '../models/perfil.enum';

// Guard funcional por perfil: recebe os perfis aceitos.
export const roleGuard = (...roles: Perfil[]): CanActivateFn =>
  () => {

    const auth = inject(AuthService);  
    const perfil = auth.currentPerfil();   
    
    if (perfil !== null && roles.includes(perfil)) return true;  

    return inject(Router).createUrlTree(['/403']);
  };
