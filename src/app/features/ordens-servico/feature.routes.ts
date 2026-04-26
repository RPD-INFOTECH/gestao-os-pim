import { Routes } from '@angular/router';
import { pendingChangesGuard } from '@core/guards/pending-changes.guard';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { NovaOs } from './pages/nova-os/nova-os';
import { OsDetails } from './pages/os-details/os-details';
import { OsList } from './pages/os-list/os-list';

export const ORDENS_SERVICO_ROUTES: Routes = [
  { path: '', component: OsList },
  {
    path: 'nova',
    component: NovaOs,
    canActivate: [roleGuard(Perfil.SOLICITANTE, Perfil.SUPERVISOR)],
    canDeactivate: [pendingChangesGuard],
  },
  { path: ':id', component: OsDetails },
];
