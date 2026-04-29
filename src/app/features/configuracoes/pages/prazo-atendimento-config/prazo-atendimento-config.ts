import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfiguracaoPrazoAtendimentoService } from '@features/configuracoes/services/configuracao-prazo-atendimento.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { ConfiguracaoPrazoAtendimento } from '@shared/models/configuracao-prazo-atendimento.model';
import { Prioridade } from '@shared/models/ordem-servico.model';

@Component({
  selector: 'app-prazo-atendimento-config',
  imports: [CommonModule, FormsModule],
  templateUrl: './prazo-atendimento-config.html',
})
export class PrazoAtendimentoConfig implements OnInit {
  private service = inject(ConfiguracaoPrazoAtendimentoService);
  private toast = inject(ToastService);

  configuracoes = signal<ConfiguracaoPrazoAtendimento[]>([]);
  loading = signal(false);
  saving = signal<Prioridade | null>(null);
  error = signal<string | null>(null);

  valores: Partial<Record<Prioridade, number>> = {};
  ativos: Partial<Record<Prioridade, boolean>> = {};

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.service.list().subscribe({
      next: (data) => {
        this.configuracoes.set(data);
        for (const item of data) {
          this.valores[item.prioridade] = item.horas_limite;
          this.ativos[item.prioridade] = item.ativo;
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as configurações de prazo de atendimento.');
        this.loading.set(false);
      },
    });
  }

  salvar(item: ConfiguracaoPrazoAtendimento): void {
    const horasLimite = Number(this.valores[item.prioridade]);
    const ativo = this.ativos[item.prioridade] ?? true;

    if (!Number.isInteger(horasLimite) || horasLimite < 1 || horasLimite > 720) {
      this.toast.error('Informe um limite entre 1 e 720 horas.');
      return;
    }

    this.saving.set(item.prioridade);
    this.service.update(item.prioridade, { horas_limite: horasLimite, ativo }).subscribe({
      next: (updated) => {
        this.configuracoes.update((items) =>
          items.map((current) => current.prioridade === updated.prioridade ? updated : current),
        );
        this.valores[updated.prioridade] = updated.horas_limite;
        this.ativos[updated.prioridade] = updated.ativo;
        this.toast.success('Configuração de prazo de atendimento atualizada.');
        this.saving.set(null);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Falha ao atualizar prazo de atendimento.');
        this.saving.set(null);
      },
    });
  }

  prioridadeClass(prioridade: Prioridade): string {
    switch (prioridade) {
      case Prioridade.CRITICA:
        return 'border-red-500/30 bg-red-500/10 text-red-300';
      case Prioridade.ALTA:
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300';
      case Prioridade.MEDIA:
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300';
      case Prioridade.BAIXA:
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
    }
  }
}
