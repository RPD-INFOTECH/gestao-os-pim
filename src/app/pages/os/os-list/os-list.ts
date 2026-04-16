import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { OrdemServico, Prioridade, StatusOs } from '../../../core/models/ordem-servico.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Perfil } from '../../../core/models/perfil.enum';
import { Usuario } from '../../../core/models/usuario.model';
import { StatusLabelPipe } from '../../../shared/status-label.pipe';

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

  perfil = this.auth.currentPerfil;
  user = this.auth.currentUser;

  canCreate = computed(() => {
    const p = this.perfil();
    return p === Perfil.SOLICITANTE || p === Perfil.SUPERVISOR;
  });

  filtered = computed<OrdemServico[]>(() => {
    const p = this.perfil();
    const userId = this.user()?.id;
    let list = this.ordens();

    if (p === Perfil.SOLICITANTE && userId) {
      list = list.filter((o) => o.solicitante?.id === userId);
    } else if (p === Perfil.TECNICO && userId) {
      list = list.filter(
        (o) => o.tecnico?.id === userId || (o.status === StatusOs.ABERTA && !o.tecnico)
      );
    }

    return list;
  });

  ngOnInit(): void {
    if (this.perfil() === Perfil.SUPERVISOR) {
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
    this.load();
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

  slaBadge(o: OrdemServico): string {
    const limiteHoras = this.slaLimiteHoras(o.prioridade);
    const base = new Date(o.inicio_em ?? o.abertura_em).getTime();
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

  slaLabel(o: OrdemServico): string {
    const limiteHoras = this.slaLimiteHoras(o.prioridade);
    const base = new Date(o.inicio_em ?? o.abertura_em).getTime();
    const fim = new Date(o.conclusao_em ?? new Date()).getTime();
    const horas = (fim - base) / (1000 * 60 * 60);

    if (o.status === StatusOs.CONCLUIDA && horas <= limiteHoras) {
      return 'NO PRAZO';
    }

    if (horas > limiteHoras) {
      return 'ESTOURADO';
    }

    return 'EM SLA';
  }

  private slaLimiteHoras(prioridade: Prioridade): number {
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
