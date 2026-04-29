import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '@features/ordens-servico/services/ordem-servico.service';
import { DashboardService } from '@features/dashboard/services/dashboard.service';
import { DashboardIndicadores, OrdemServico, Prioridade, StatusOs, StatusPrazoOs } from '@shared/models/ordem-servico.model';
import { AuthService } from '@core/auth/auth.service';
import { Perfil } from '@core/models/perfil.enum';
import { StatusLabelPipe } from '@shared/ui/status-label.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, StatusLabelPipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private service = inject(OrdemServicoService);
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);

  ordens = signal<OrdemServico[]>([]);
  indicadores = signal<DashboardIndicadores | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  perfil = this.auth.currentPerfil;
  user = this.auth.currentUser;
  perfilEnum = Perfil;

  abertas = computed(() => this.indicadores()?.abertas ?? 0);
  emAndamento = computed(() => this.indicadores()?.em_andamento ?? 0);
  aguardandoPeca = computed(() => this.indicadores()?.aguardando_peca ?? 0);
  concluidasMes = computed(() => this.indicadores()?.concluidas_mes ?? 0);
  criticas = computed(() => this.indicadores()?.criticas_abertas ?? 0);
  semTecnico = computed(() => this.indicadores()?.sem_tecnico ?? 0);
  disponiveisParaAssumir = computed(() => this.indicadores()?.disponiveis_para_assumir ?? 0);
  minhasAtribuidas = computed(() => this.indicadores()?.minhas_atribuidas ?? 0);
  apontamentoAberto = computed(() => this.indicadores()?.apontamento_aberto ?? false);
  prazoHoras = computed(() => this.indicadores()?.prazo_horas ?? null);

  tempoMedioConclusaoHoras = computed(() => this.indicadores()?.tempo_medio_execucao_horas ?? 0);
  tempoMedioAteInicioHoras = computed(() => this.indicadores()?.tempo_medio_ate_inicio_horas ?? 0);
  tempoMedioAteConclusaoHoras = computed(() => this.indicadores()?.tempo_medio_ate_conclusao_horas ?? 0);
  tempoMedioTrabalhoHoras = computed(() => this.indicadores()?.tempo_medio_trabalho_horas ?? 0);

  recentes = computed(() => this.ordens().slice(0, 5));
  isSupervisor = computed(() => this.perfil() === Perfil.SUPERVISOR);
  isGestor = computed(() => this.perfil() === Perfil.GESTOR);
  isVisaoGeral = computed(() => this.isSupervisor() || this.isGestor());
  isTecnico = computed(() => this.perfil() === Perfil.TECNICO);
  isSolicitante = computed(() => this.perfil() === Perfil.SOLICITANTE);
  canCreateOs = computed(() => this.isSupervisor() || this.isSolicitante());
  prazoConfigurado = computed(() =>
    Object.values(Prioridade).map((prioridade) => ({
      prioridade,
      horas: this.prazoLimiteHoras(prioridade),
    })),
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.dashboardService.getIndicadores().subscribe({
      next: (data) => this.indicadores.set(data),
      error: () => {
        this.error.set('Não foi possível carregar o dashboard.');
        this.loading.set(false);
      },
    });

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

  prazoBadge(o: OrdemServico): string {
    if (
      o.status_prazo === StatusPrazoOs.CONCLUIDA_COM_PRAZO_ESTOURADO ||
      o.status_prazo === StatusPrazoOs.ESTOURADO
    ) {
      return 'bg-red-900/40 text-red-400';
    }

    if (o.status_prazo === StatusPrazoOs.CONCLUIDA_NO_PRAZO) {
      return 'bg-green-900/40 text-green-400';
    }

    const limiteHoras = this.prazoLimiteHoras(o.prioridade);
    const base = new Date(o.abertura_em).getTime();
    const fim = new Date(o.conclusao_em ?? new Date()).getTime();
    const horas = (fim - base) / (1000 * 60 * 60);

    if (o.status === StatusOs.CONCLUIDA && horas <= limiteHoras) {
      return 'bg-green-900/40 text-green-400';
    }

    if (horas > limiteHoras) {
      return 'bg-red-900/40 text-red-400';
    }

    return 'bg-blue-900/40 text-blue-400';
  }

  prazoLabel(o: OrdemServico): string {
    if (o.status_prazo === StatusPrazoOs.CONCLUIDA_COM_PRAZO_ESTOURADO) {
      return 'CONCLUÍDA FORA DO PRAZO';
    }

    if (o.status_prazo === StatusPrazoOs.CONCLUIDA_NO_PRAZO) {
      return 'CONCLUÍDA NO PRAZO';
    }

    if (o.status_prazo === StatusPrazoOs.ESTOURADO) {
      return 'ESTOURADO';
    }

    const limiteHoras = this.prazoLimiteHoras(o.prioridade);
    const base = new Date(o.abertura_em).getTime();
    const fim = new Date(o.conclusao_em ?? new Date()).getTime();
    const horas = (fim - base) / (1000 * 60 * 60);

    if (o.status === StatusOs.CONCLUIDA && horas <= limiteHoras) {
      return 'NO PRAZO';
    }

    if (horas > limiteHoras) {
      return 'ESTOURADO';
    }

    return 'NO PRAZO';
  }

  private prazoLimiteHoras(prioridade: Prioridade): number {
    const configurado = this.prazoHoras()?.[prioridade];
    if (configurado) return configurado;

    switch (prioridade) {
      case Prioridade.CRITICA:
        return 4;
      case Prioridade.ALTA:
        return 8;
      case Prioridade.MEDIA:
        return 24;
      case Prioridade.BAIXA:
        return 72;
    }
  }
}
