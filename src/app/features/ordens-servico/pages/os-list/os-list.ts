import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '@features/ordens-servico/services/ordem-servico.service';
import { UsuarioService } from '@features/usuarios/services/usuario.service';
import { OrdemServico, Prioridade, StatusOs, StatusPrazoOs } from '@shared/models/ordem-servico.model';
import { AuthService } from '@core/auth/auth.service';
import { Perfil } from '@core/models/perfil.enum';
import { Usuario } from '@shared/models/usuario.model';
import { StatusLabelPipe } from '@shared/ui/status-label.pipe';

@Component({
  selector: 'app-os-list',
  imports: [CommonModule, FormsModule, RouterLink, StatusLabelPipe],
  templateUrl: './os-list.html',
})
export class OsList implements OnInit {
  private service = inject(OrdemServicoService);
  private usuarioService = inject(UsuarioService);
  private auth = inject(AuthService);

  statuses = Object.values(StatusOs);
  prioridades = Object.values(Prioridade);

  ordens = signal<OrdemServico[]>([]);
  tecnicos = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  filtroBusca = signal('');
  filtroStatus = signal<StatusOs | ''>('');
  filtroPrioridade = signal<Prioridade | ''>('');
  filtroTecnicoId = signal('');
  filtroSetor = signal('');
  filtroApontamento = signal<'todos' | 'com' | 'sem' | 'aberto'>('todos');

  perfil = this.auth.currentPerfil;
  user = this.auth.currentUser;

  canCreate = computed(() => {
    const p = this.perfil();
    return p === Perfil.SOLICITANTE || p === Perfil.SUPERVISOR;
  });
  canFilterTecnico = computed(() => {
    const p = this.perfil();
    return p === Perfil.SUPERVISOR || p === Perfil.GESTOR;
  });

  filtered = computed<OrdemServico[]>(() => {
    const filtroApontamento = this.filtroApontamento();

    return this.ordens().filter((ordem) => {
      const totalApontamentos = ordem.apontamentos?.length ?? 0;

      if (filtroApontamento === 'com') return totalApontamentos > 0;
      if (filtroApontamento === 'sem') return totalApontamentos === 0;
      if (filtroApontamento === 'aberto') return !!ordem.apontamento_aberto;

      return true;
    });
  });

  setores = computed(() => {
    const values = new Set(
      this.ordens()
        .map((ordem) => ordem.equipamento?.setor?.trim())
        .filter((setor): setor is string => !!setor)
    );

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  });

  ngOnInit(): void {
    if (this.canFilterTecnico()) {
      this.usuarioService.list().subscribe({
        next: (users) => this.tecnicos.set(users.filter((user) => user.perfil === Perfil.TECNICO && user.ativo)),
        error: () => {},
      });
    }

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list({
      status: this.filtroStatus() || undefined,
      prioridade: this.filtroPrioridade() || undefined,
      busca: this.filtroBusca().trim() || undefined,
      tecnicoId: this.filtroTecnicoId() || undefined,
      setor: this.filtroSetor().trim() || undefined,
    }).subscribe({
      next: (data) => {
        this.ordens.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar as ordens de serviço.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.load();
  }

  clearFilters(): void {
    this.filtroBusca.set('');
    this.filtroStatus.set('');
    this.filtroPrioridade.set('');
    this.filtroTecnicoId.set('');
    this.filtroSetor.set('');
    this.filtroApontamento.set('todos');
    this.load();
  }

  prioridadeLabel(prioridade: Prioridade): string {
    return prioridade;
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

  prioridadeClass(p: Prioridade): string {
    switch (p) {
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

  apontamentoLabel(ordem: OrdemServico): string {
    if (ordem.apontamento_aberto) return 'EM ABERTO';
    if ((ordem.apontamentos?.length ?? 0) > 0) return 'REGISTRADO';
    return 'NENHUM';
  }

  apontamentoClass(ordem: OrdemServico): string {
    if (ordem.apontamento_aberto) {
      return 'bg-amber-900/40 text-amber-300';
    }

    if ((ordem.apontamentos?.length ?? 0) > 0) {
      return 'bg-blue-900/40 text-blue-300';
    }

    return 'bg-slate-800 text-slate-400';
  }

  private prazoLimiteHoras(prioridade: Prioridade): number {
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
