import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'app-confirm-outlet',
  imports: [CommonModule],
  templateUrl: './confirm-outlet.html',
})
export class ConfirmOutlet {
  protected confirm = inject(ConfirmationService);

  protected toneClass(tone?: 'danger' | 'warning' | 'info'): string {
    switch (tone) {
      case 'danger':
        return 'border-red-500/30 bg-red-950/70';
      case 'warning':
        return 'border-amber-500/30 bg-amber-950/70';
      default:
        return 'border-sky-500/30 bg-slate-950/90';
    }
  }

  protected confirmButtonClass(tone?: 'danger' | 'warning' | 'info'): string {
    switch (tone) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500';
      default:
        return 'bg-blue-600 hover:bg-blue-500';
    }
  }
}
