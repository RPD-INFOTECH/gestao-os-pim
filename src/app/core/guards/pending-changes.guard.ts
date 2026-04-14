import { CanDeactivateFn } from '@angular/router';

export interface PendingChangesComponent {
  hasUnsavedChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  return window.confirm('Há dados não salvos neste formulário. Deseja sair mesmo assim?');
};
