import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@shared/components/toast/toast.service';

@Component({
  selector: 'app-toast-outlet',
  imports: [CommonModule],
  templateUrl: './toast-outlet.html',
})
export class ToastOutlet {
  protected toast = inject(ToastService);

  protected kindClass(kind: 'success' | 'error' | 'info'): string {
    switch (kind) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100';
      case 'error':
        return 'border-red-500/40 bg-red-500/10 text-red-100';
      case 'info':
        return 'border-sky-500/40 bg-sky-500/10 text-sky-100';
    }
  }
}
