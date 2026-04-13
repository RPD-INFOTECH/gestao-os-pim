import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Login } from './pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';
import { OsList } from './pages/os/os-list/os-list';
import { OsDetails } from './pages/os/os-details/os-details';
import { NovaOs } from './pages/os/nova-os/nova-os';
import { Equipamentos } from './pages/equipamentos/equipamentos';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '', // Base path for protected layout
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'ordens-de-servico', component: OsList },
      { path: 'ordens-de-servico/nova', component: NovaOs },
      { path: 'ordens-de-servico/:id', component: OsDetails },
      { path: 'equipamentos', component: Equipamentos },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
