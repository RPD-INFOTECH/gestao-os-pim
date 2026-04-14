import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { OrdemServico, Prioridade, StatusOs } from '../../../core/models/ordem-servico.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Perfil } from '../../../core/models/perfil.enum';

@Component({
  selector: 'app-os-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './os-list.html',
  styleUrl: './os-list.css',
})
export class OsList implements OnInit {
  private service = inject(OrdemServicoService);
  private auth = inject(AuthService);

  statuses = Object.values(StatusOs);
  prioridades = Object.values(Prioridade);

  ordens = signal<OrdemServico[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  filtroStatus = signal<StatusOs | ''>('');
  filtroPrioridade = signal<Prioridade | ''>('');

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
      list = list.filter((o) => o.tecnico?.id === userId);
    }

    const s = this.filtroStatus();
    const pr = this.filtroPrioridade();
    if (s) list = list.filter((o) => o.status === s);
    if (pr) list = list.filter((o) => o.prioridade === pr);

    return list;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
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
}
