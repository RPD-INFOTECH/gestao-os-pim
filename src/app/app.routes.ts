import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { MainLayout } from '@shared/layouts/main-layout/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('@features/auth/feature.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/feature.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'ordens-de-servico',
        loadChildren: () =>
          import('@features/ordens-servico/feature.routes').then(
            (m) => m.ORDENS_SERVICO_ROUTES,
          ),
      },
      {
        path: 'equipamentos',
        loadChildren: () =>
          import('@features/equipamentos/feature.routes').then((m) => m.EQUIPAMENTOS_ROUTES),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('@features/usuarios/feature.routes').then((m) => m.USUARIOS_ROUTES),
      },
      {
        path: 'historico',
        loadChildren: () =>
          import('@features/historico/feature.routes').then((m) => m.HISTORICO_ROUTES),
      },
      {
        path: 'relatorios',
        loadChildren: () =>
          import('@features/relatorios/feature.routes').then((m) => m.RELATORIOS_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('@features/errors/feature.routes').then((m) => m.ERROR_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: '404' },
];
