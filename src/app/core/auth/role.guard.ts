// Importa inject para obter servicos no guard.
import { inject } from '@angular/core';
// Importa tipos de guard e Router para redirecionar.
import { CanActivateFn, Router } from '@angular/router';
// Importa o servico de autenticacao.
import { AuthService } from './auth.service';
// Importa o enum de perfis.
import { Perfil } from '../models/perfil.enum';

// Guard funcional por perfil: recebe os perfis aceitos.
export const roleGuard = (...roles: Perfil[]): CanActivateFn =>
  () => {
    // Injeta o AuthService.
    const auth = inject(AuthService);
    // Le o perfil atual do usuario.
    const perfil = auth.currentPerfil();
    // Se o perfil atual estiver entre os perfis permitidos, libera.
    if (perfil !== null && roles.includes(perfil)) return true;
    // Caso contrario, redireciona para pagina 403.
    return inject(Router).createUrlTree(['/403']);
  };
