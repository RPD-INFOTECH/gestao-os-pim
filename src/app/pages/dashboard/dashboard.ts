import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardIndicadores, OrdemServico, Prioridade, StatusOs } from '../../core/models/ordem-servico.model';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

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

  scoped = computed<OrdemServico[]>(() => {
    const p = this.perfil();
    const userId = this.user()?.id;
    const list = this.ordens();
    if (p === Perfil.SOLICITANTE && userId) return list.filter((o) => o.solicitante?.id === userId);
    if (p === Perfil.TECNICO && userId) {
      return list.filter(
        (o) => o.tecnico?.id === userId || (o.status === StatusOs.ABERTA && !o.tecnico)
      );
    }
    return list;
  });

  abertas = computed(() => this.indicadores()?.abertas ?? 0);
  emAndamento = computed(() => this.indicadores()?.em_andamento ?? 0);
  aguardandoPeca = computed(() => this.indicadores()?.aguardando_peca ?? 0);
  concluidasMes = computed(() => this.indicadores()?.concluidas_mes ?? 0);
  criticas = computed(() => this.indicadores()?.criticas_abertas ?? 0);
  semTecnico = computed(() => this.indicadores()?.sem_tecnico ?? 0);
  disponiveisParaAssumir = computed(() => this.indicadores()?.disponiveis_para_assumir ?? 0);
  minhasAtribuidas = computed(() => this.indicadores()?.minhas_atribuidas ?? 0);
  apontamentoAberto = computed(() => this.indicadores()?.apontamento_aberto ?? false);

  tempoMedioConclusaoHoras = computed(() => this.indicadores()?.tempo_medio_execucao_horas ?? 0);
  tempoMedioAteInicioHoras = computed(() => this.indicadores()?.tempo_medio_ate_inicio_horas ?? 0);
  tempoMedioAteConclusaoHoras = computed(() => this.indicadores()?.tempo_medio_ate_conclusao_horas ?? 0);
  tempoMedioTrabalhoHoras = computed(() => this.indicadores()?.tempo_medio_trabalho_horas ?? 0);

  recentes = computed(() => this.scoped().slice(0, 5));
  isSupervisor = computed(() => this.perfil() === Perfil.SUPERVISOR);
  isTecnico = computed(() => this.perfil() === Perfil.TECNICO);
  isSolicitante = computed(() => this.perfil() === Perfil.SOLICITANTE);

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
}
