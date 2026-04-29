import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { UsuarioDetailsPage } from './pages/usuario-details/usuario-details';
import { UsuarioForm } from './pages/usuario-form/usuario-form';
import { UsuariosList } from './pages/usuarios-list/usuarios-list';

export const USUARIOS_ROUTES: Routes = [
  {
    path: '',
    component: UsuariosList,
    canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.GESTOR)],
  },
  {
    path: 'novo',
    component: UsuarioForm,
    canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.GESTOR)],
  },
  {
    path: ':id/detalhes',
    component: UsuarioDetailsPage,
    canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.GESTOR)],
  },
  {
    path: ':id',
    component: UsuarioForm,
    canActivate: [roleGuard(Perfil.SUPERVISOR, Perfil.GESTOR)],
  },
];
