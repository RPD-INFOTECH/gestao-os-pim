import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { OrdemServico, Prioridade, StatusOs } from '../../core/models/ordem-servico.model';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private service = inject(OrdemServicoService);
  private auth = inject(AuthService);

  ordens = signal<OrdemServico[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  perfil = this.auth.currentPerfil;
  user = this.auth.currentUser;

  scoped = computed<OrdemServico[]>(() => {
    const p = this.perfil();
    const userId = this.user()?.id;
    const list = this.ordens();
    if (p === Perfil.SOLICITANTE && userId) return list.filter((o) => o.solicitante?.id === userId);
    if (p === Perfil.TECNICO && userId) return list.filter((o) => o.tecnico?.id === userId);
    return list;
  });

  abertas = computed(() => this.scoped().filter((o) => o.status === StatusOs.ABERTA).length);
  abertasHoje = computed(() => {
    const hoje = new Date();
    return this.scoped().filter((o) => {
      if (o.status !== StatusOs.ABERTA) {
        return false;
      }

      const abertura = new Date(o.abertura_em);
      return (
        abertura.getFullYear() === hoje.getFullYear() &&
        abertura.getMonth() === hoje.getMonth() &&
        abertura.getDate() === hoje.getDate()
      );
    }).length;
  });
  emAndamento = computed(() => this.scoped().filter((o) => o.status === StatusOs.EM_ANDAMENTO).length);
  aguardandoPeca = computed(() => this.scoped().filter((o) => o.status === StatusOs.AGUARDANDO_PECA).length);
  concluidas = computed(() => this.scoped().filter((o) => o.status === StatusOs.CONCLUIDA).length);
  criticas = computed(() =>
    this.scoped().filter(
      (o) => o.prioridade === Prioridade.CRITICA && o.status !== StatusOs.CONCLUIDA && o.status !== StatusOs.CANCELADA,
    ).length,
  );

  tempoMedioConclusaoHoras = computed(() => {
    const agora = new Date();
    const ha30Dias = new Date(agora);
    ha30Dias.setDate(agora.getDate() - 30);

    const concluidasRecentes = this.scoped().filter((o) => {
      if (!o.conclusao_em) {
        return false;
      }

      const conclusao = new Date(o.conclusao_em);
      return conclusao >= ha30Dias;
    });

    if (!concluidasRecentes.length) {
      return null;
    }

    const totalHoras = concluidasRecentes.reduce((acc, ordem) => {
      const abertura = new Date(ordem.abertura_em);
      const conclusao = new Date(ordem.conclusao_em!);
      return acc + (conclusao.getTime() - abertura.getTime()) / (1000 * 60 * 60);
    }, 0);

    return totalHoras / concluidasRecentes.length;
  });

  recentes = computed(() => this.scoped().slice(0, 5));

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.ordens.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o dashboard.');
        this.loading.set(false);
      },
    });
  }

  statusClass(status: StatusOs): string {
    switch (status) {
      case StatusOs.ABERTA:
        return 'bg-blue-900/40 text-blue-400';
      case StatusOs.EM_ANDAMENTO:
        return 'bg-yellow-900/40 text-yellow-400';
      case StatusOs.AGUARDANDO_PECA:
        return 'bg-orange-900/40 text-orange-400';
      case StatusOs.CONCLUIDA:
        return 'bg-green-900/40 text-green-400';
      case StatusOs.CANCELADA:
        return 'bg-slate-800 text-slate-500';
    }
  }

  prioridadeClass(prioridade: Prioridade): string {
    switch (prioridade) {
      case Prioridade.CRITICA:
        return 'text-red-400';
      case Prioridade.ALTA:
        return 'text-orange-400';
      case Prioridade.MEDIA:
        return 'text-yellow-400';
      case Prioridade.BAIXA:
        return 'text-slate-400';
    }
  }
}
