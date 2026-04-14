import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoricoOsService } from '../../core/services/historico-os.service';
import { HistoricoOS } from '../../core/models/historico-os.model';

@Component({
  selector: 'app-historico',
  imports: [CommonModule],
  templateUrl: './historico.html',
})
export class Historico implements OnInit {
  private service = inject(HistoricoOsService);

  itens = signal<HistoricoOS[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.itens.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o histórico.');
        this.loading.set(false);
      },
    });
  }
}
