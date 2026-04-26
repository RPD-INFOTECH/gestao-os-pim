import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { Relatorios } from './pages/relatorios/relatorios';

export const RELATORIOS_ROUTES: Routes = [
  {
    path: '',
    component: Relatorios,
    canActivate: [roleGuard(Perfil.SUPERVISOR)],
  },
];
