import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ConfirmationService } from '@shared/components/confirm/confirmation.service';

export interface PendingChangesComponent {
  hasUnsavedChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<PendingChangesComponent> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const confirmation = inject(ConfirmationService);

  return confirmation.confirm({
    title: 'Descartar alterações',
    message: 'Há dados não salvos neste formulário. Deseja sair sem salvar?',
    confirmLabel: 'Sair',
    cancelLabel: 'Continuar editando',
    tone: 'warning',
  });
};
