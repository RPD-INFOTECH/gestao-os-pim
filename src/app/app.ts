import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutlet } from './shared/toast/toast-outlet';
import { ConfirmOutlet } from './shared/confirm/confirm-outlet';
import { NavigationHistoryService } from './core/navigation/navigation-history.service';

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
