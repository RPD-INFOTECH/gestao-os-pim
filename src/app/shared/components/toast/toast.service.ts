import { Injectable, signal } from '@angular/core';

type ToastKind = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  kind: ToastKind;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 1;

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    this.messages.update((messages) => messages.filter((message) => message.id !== id));
  }

  private push(kind: ToastKind, text: string): void {
    const id = this.nextId++;
    this.messages.update((messages) => [...messages, { id, kind, text }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
