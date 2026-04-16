import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { OsList } from './pages/os/os-list/os-list';
import { OsDetails } from './pages/os/os-details/os-details';
import { NovaOs } from './pages/os/nova-os/nova-os';
import { Equipamentos } from './pages/equipamentos/equipamentos';
import { EquipamentoForm } from './pages/equipamentos/equipamento-form/equipamento-form';
import { EquipamentoDetails } from './pages/equipamentos/equipamento-details/equipamento-details';
import { UsuariosList } from './pages/usuarios/usuarios-list/usuarios-list';
import { UsuarioForm } from './pages/usuarios/usuario-form/usuario-form';
import { Historico } from './pages/historico/historico';
import { Relatorios } from './pages/relatorios/relatorios';
import { Forbidden } from './pages/errors/forbidden/forbidden';
import { NotFound } from './pages/errors/not-found/not-found';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { Perfil } from './core/models/perfil.enum';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },

      {
        path: 'ordens-de-servico',
        component: OsList,
      },
      {
        path: 'ordens-de-servico/nova',
        component: NovaOs,
        canActivate: [roleGuard(Perfil.SOLICITANTE, Perfil.SUPERVISOR)],
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'ordens-de-servico/:id',
        component: OsDetails,
      },

      { path: 'equipamentos', component: Equipamentos },
      {
        path: 'equipamentos/novo',
        component: EquipamentoForm,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },
      {
        path: 'equipamentos/:id/editar',
        component: EquipamentoForm,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },
      {
        path: 'equipamentos/:id',
        component: EquipamentoDetails,
      },

      {
        path: 'usuarios',
        component: UsuariosList,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },
      {
        path: 'usuarios/novo',
        component: UsuarioForm,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },
      {
        path: 'usuarios/:id',
        component: UsuarioForm,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },

      {
        path: 'historico',
        component: Historico,
        canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.TECNICO)],
      },

      {
        path: 'relatorios',
        component: Relatorios,
        canActivate: [roleGuard(Perfil.SUPERVISOR)],
      },

      { path: '403', component: Forbidden },
      { path: '404', component: NotFound },
    ],
  },
  { path: '**', redirectTo: '404' },
];
