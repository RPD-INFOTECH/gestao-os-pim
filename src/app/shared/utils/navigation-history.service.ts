import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NavigationHistoryService {
  private router = inject(Router);
  private historyStack: string[] = [];
  private readonly maxEntries = 50;

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        const currentUrl = event.urlAfterRedirects;
        if (this.historyStack.at(-1) === currentUrl) {
          return;
        }

        this.historyStack.push(currentUrl);

        if (this.historyStack.length > this.maxEntries) {
          this.historyStack.shift();
        }
      });
  }

  popPreviousUrl(): string | null {
    if (this.historyStack.length < 2) {
      return null;
    }

    this.historyStack.pop();
    return this.historyStack.at(-1) ?? null;
  }
}
