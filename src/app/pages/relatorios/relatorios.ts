import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { OrdemServico, StatusOs, Prioridade } from '../../core/models/ordem-servico.model';

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule],
  templateUrl: './relatorios.html',
})
export class Relatorios implements OnInit {
  private service = inject(OrdemServicoService);

  ordens = signal<OrdemServico[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  total = computed(() => this.ordens().length);
  abertas = computed(() => this.ordens().filter((o) => o.status === StatusOs.ABERTA).length);
  emAndamento = computed(() => this.ordens().filter((o) => o.status === StatusOs.EM_ANDAMENTO).length);
  aguardandoPeca = computed(() => this.ordens().filter((o) => o.status === StatusOs.AGUARDANDO_PECA).length);
  concluidas = computed(() => this.ordens().filter((o) => o.status === StatusOs.CONCLUIDA).length);
  canceladas = computed(() => this.ordens().filter((o) => o.status === StatusOs.CANCELADA).length);
  criticas = computed(() => this.ordens().filter((o) => o.prioridade === Prioridade.CRITICA).length);

  totalHoras = computed(() =>
    this.ordens().reduce((acc, o) => acc + (Number(o.horas_trabalhadas) || 0), 0)
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.ordens.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os dados de relatórios.');
        this.loading.set(false);
      },
    });
  }
}
