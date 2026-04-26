import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { EquipamentoDetails } from './pages/equipamento-details/equipamento-details';
import { EquipamentoForm } from './pages/equipamento-form/equipamento-form';
import { Equipamentos } from './pages/equipamentos-list/equipamentos';

export const EQUIPAMENTOS_ROUTES: Routes = [
  {
    path: '',
    component: Equipamentos,
    canActivate: [roleGuard(Perfil.TECNICO, Perfil.SUPERVISOR)],
  },
  {
    path: 'novo',
    component: EquipamentoForm,
    canActivate: [roleGuard(Perfil.SUPERVISOR)],
  },
  {
    path: ':id/editar',
    component: EquipamentoForm,
    canActivate: [roleGuard(Perfil.SUPERVISOR)],
  },
  {
    path: ':id',
    component: EquipamentoDetails,
    canActivate: [roleGuard(Perfil.TECNICO, Perfil.SUPERVISOR)],
  },
];
