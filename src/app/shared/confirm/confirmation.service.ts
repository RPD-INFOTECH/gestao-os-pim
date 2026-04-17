import { Injectable, signal } from '@angular/core';

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'info';
}

type ActiveConfirmation = ConfirmationRequest & {
  resolve: (value: boolean) => void;
};

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly active = signal<ActiveConfirmation | null>(null);

  confirm(request: ConfirmationRequest): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.active.set({
        ...request,
        resolve,
      });
    });
  }

  accept(): void {
    const current = this.active();
    if (!current) return;
    current.resolve(true);
    this.active.set(null);
  }

  cancel(): void {
    const current = this.active();
    if (!current) return;
    current.resolve(false);
    this.active.set(null);
  }
}
