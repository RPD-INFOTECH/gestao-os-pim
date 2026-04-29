import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { Perfil } from '@core/models/perfil.enum';
import { PrazoAtendimentoConfig } from './pages/prazo-atendimento-config/prazo-atendimento-config';

export const CONFIGURACOES_ROUTES: Routes = [
  {
    path: 'prazo-atendimento',
    component: PrazoAtendimentoConfig,
    canActivate: [roleGuard(Perfil.GESTOR)],
  },
];
