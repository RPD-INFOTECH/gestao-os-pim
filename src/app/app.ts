import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutlet } from '@shared/components/toast/toast-outlet';
import { ConfirmOutlet } from '@shared/components/confirm/confirm-outlet';
import { NavigationHistoryService } from '@shared/utils/navigation-history.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutlet, ConfirmOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private _navigationHistory = inject(NavigationHistoryService);
  protected readonly title = signal('servPim');
}
