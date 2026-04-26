import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HistoricoOsService } from '@features/historico/services/historico-os.service';
import { HistoricoOS } from '@shared/models/historico-os.model';
import { Prioridade, StatusOs } from '@shared/models/ordem-servico.model';
import { StatusLabelPipe } from '@shared/ui/status-label.pipe';

@Component({
  selector: 'app-historico',
  imports: [CommonModule, FormsModule, RouterLink, StatusLabelPipe],
  templateUrl: './historico.html',
})
export class Historico implements OnInit {
  private service = inject(HistoricoOsService);

  itens = signal<HistoricoOS[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  busca = signal('');
  statusNovo = signal('');
  prioridade = signal<Prioridade | ''>('');
  dataInicio = signal('');
  dataFim = signal('');
  statusOptions = Object.values(StatusOs);
  prioridadeOptions = Object.values(Prioridade);
  total = computed(() => this.itens().length);
  hoje = computed(() => {
    const today = new Date().toDateString();
    return this.itens().filter((item) => new Date(item.registradoEm).toDateString() === today).length;
  });
  comObservacao = computed(() => this.itens().filter((item) => !!item.observacao?.trim()).length);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list({
      busca: this.busca() || undefined,
      statusNovo: this.statusNovo() || undefined,
      prioridade: this.prioridade() || undefined,
      dataInicio: this.dataInicio() || undefined,
      dataFim: this.dataFim() || undefined,
    }).subscribe({
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

  clearFilters(): void {
    this.busca.set('');
    this.statusNovo.set('');
    this.prioridade.set('');
    this.dataInicio.set('');
    this.dataFim.set('');
    this.load();
  }

  prioridadeClass(prioridade?: string | null): string {
    switch (prioridade) {
      case Prioridade.CRITICA:
        return 'bg-red-950/70 text-red-300 border border-red-900/70';
      case Prioridade.ALTA:
        return 'bg-amber-950/70 text-amber-300 border border-amber-900/70';
      case Prioridade.MEDIA:
        return 'bg-blue-950/70 text-blue-300 border border-blue-900/70';
      case Prioridade.BAIXA:
        return 'bg-emerald-950/70 text-emerald-300 border border-emerald-900/70';
      default:
        return 'bg-slate-900 text-slate-300 border border-slate-700';
    }
  }
}
