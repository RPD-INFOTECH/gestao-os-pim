import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationHistoryService } from '@shared/utils/navigation-history.service';

@Component({
  selector: 'app-back-button',
  imports: [CommonModule],
  templateUrl: './back-button.html',
})
export class BackButton {
  private router = inject(Router);
  private navigationHistory = inject(NavigationHistoryService);

  fallback = input<string>('/dashboard');
  label = input('Voltar');

  goBack(): void {
    const previousUrl = this.navigationHistory.popPreviousUrl();

    if (previousUrl) {
      this.router.navigateByUrl(previousUrl);
      return;
    }

    this.router.navigateByUrl(this.fallback());
  }
}
