import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { Historico } from './pages/historico/historico';

export const HISTORICO_ROUTES: Routes = [
  {
    path: '',
    component: Historico,
    canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.TECNICO, Perfil.GESTOR)],
  },
];
