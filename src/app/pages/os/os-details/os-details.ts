import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { HistoricoOsService } from '../../../core/services/historico-os.service';
import { ApontamentoOs, OrdemServico, StatusOs } from '../../../core/models/ordem-servico.model';
import { Usuario } from '../../../core/models/usuario.model';
import { HistoricoOS } from '../../../core/models/historico-os.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Perfil } from '../../../core/models/perfil.enum';
import { ToastService } from '../../../shared/toast/toast.service';
import { OsSummaryCard } from './components/os-summary-card';
import { OsWorklogsCard } from './components/os-worklogs-card';
import { OsHistoryCard } from './components/os-history-card';
import { OsWorkflowActions } from './components/os-workflow-actions';
import { OsDetailsFacade } from './os-details.facade';
import { switchAll } from 'rxjs';
import { StatusLabelPipe } from '../../../shared/status-label.pipe';

@Component({
  selector: 'app-os-details',
  imports: [CommonModule, FormsModule, RouterLink, OsSummaryCard, OsWorklogsCard, OsHistoryCard, OsWorkflowActions, StatusLabelPipe],
  templateUrl: './os-details.html',
})
export class OsDetails implements OnInit {
  private osService = inject(OrdemServicoService);
  private historicoService = inject(HistoricoOsService);
  private facade = inject(OsDetailsFacade);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  os = signal<OrdemServico | null>(null);
  tecnicos = signal<Usuario[]>([]);
  historico = signal<HistoricoOS[]>([]);
  apontamentos = signal<ApontamentoOs[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  action = signal<string | null>(null);

  statusOptions = Object.values(StatusOs);

  perfil = this.auth.currentPerfil;
  user = this.auth.currentUser;

  tecnicoSelecionado = signal<string>('');
  novoStatus = signal<StatusOs | ''>('');
  conclusao = {
    descricao_servico: '',
    pecas_utilizadas: '',
  };
  observacaoStatus = signal('');
  observacaoApontamento = signal('');

  isSupervisor = computed(() => this.perfil() === Perfil.SUPERVISOR);
  isSolicitante = computed(() => this.perfil() === Perfil.SOLICITANTE);
  isTecnicoAtribuido = computed(() => {
    const o = this.os();
    return this.perfil() === Perfil.TECNICO && o?.tecnico?.id === this.user()?.id;
  });

  canAtribuirTecnico = computed(() => {
    const o = this.os();
    return this.isSupervisor() && !!o && o.status !== StatusOs.CONCLUIDA && o.status !== StatusOs.CANCELADA;
  });

  canAssumir = computed(() => {
    const o = this.os();
    return this.perfil() === Perfil.TECNICO && !!o && !o.tecnico && o.status === StatusOs.ABERTA;
  });

  canIniciar = computed(() => {
    const o = this.os();
    if (!o || o.status !== StatusOs.ABERTA || !o.tecnico) return false;
    return this.isSupervisor() || this.isTecnicoAtribuido();
  });

  canAtualizarStatus = computed(() => {
    const o = this.os();
    if (!o || o.status === StatusOs.CONCLUIDA || o.status === StatusOs.CANCELADA) return false;
    return this.isSupervisor() || this.isTecnicoAtribuido();
  });

  availableStatusOptions = computed(() => {
    const o = this.os();
    if (!o) return [] as StatusOs[];

    return this.statusOptions.filter(
      (status) => status !== StatusOs.CANCELADA || this.isSupervisor()
    );
  });

  canConcluir = computed(() => {
    const o = this.os();
    if (!o || !o.tecnico || o.status === StatusOs.CONCLUIDA || o.status === StatusOs.CANCELADA) return false;
    return this.isSupervisor() || this.isTecnicoAtribuido();
  });

  canIniciarTrabalho = computed(() => {
    const o = this.os();
    return !!o && o.status === StatusOs.EM_ANDAMENTO && this.isTecnicoAtribuido() && !o.apontamento_aberto;
  });

  canFinalizarTrabalho = computed(() => {
    const o = this.os();
    return !!o && this.isTecnicoAtribuido() && !!o.apontamento_aberto;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.facade.load(id, this.perfil()).pipe(switchAll()).subscribe({
      next: ({ ordem, historico, apontamentos, tecnicos }) => {
        this.os.set(ordem);
        this.historico.set(historico);
        this.apontamentos.set(apontamentos);
        this.tecnicos.set(tecnicos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Ordem de serviço não encontrada.');
        this.loading.set(false);
      },
    });
  }

  atribuirTecnico(): void {
    const o = this.os();
    const tid = this.tecnicoSelecionado();
    if (!o || !tid) return;
    this.action.set('atribuir');
    this.osService.atribuirTecnico(o.id, tid).subscribe({
      next: (updated) => {
        this.os.set(updated);
        this.tecnicoSelecionado.set('');
        this.action.set(null);
        this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao atribuir técnico.');
        this.action.set(null);
      },
    });
  }

  assumir(): void {
    const o = this.os();
    if (!o) return;
    this.action.set('assumir');
    this.osService.assumir(o.id).subscribe({
      next: (updated) => {
        this.os.set(updated);
        this.action.set(null);
        this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao assumir O.S.');
        this.action.set(null);
      },
    });
  }

  iniciar(): void {
    const o = this.os();
    if (!o) return;
    this.action.set('iniciar');
    this.osService.iniciar(o.id).subscribe({
      next: (updated) => {
        this.os.set(updated);
        this.action.set(null);
        this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao iniciar O.S.');
        this.action.set(null);
      },
    });
  }

  iniciarTrabalho(): void {
    const o = this.os();
    if (!o) return;
    this.action.set('apontamento-iniciar');
    this.osService.iniciarApontamento(o.id, this.observacaoApontamento()).subscribe({
      next: (apontamentos) => {
        this.apontamentos.set(apontamentos);
        this.observacaoApontamento.set('');
        this.action.set(null);
        this.load(o.id);
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao iniciar apontamento.');
        this.action.set(null);
      },
    });
  }

  finalizarTrabalho(): void {
    const o = this.os();
    if (!o) return;
    this.action.set('apontamento-finalizar');
    this.osService.finalizarApontamento(o.id, this.observacaoApontamento()).subscribe({
      next: (apontamentos) => {
        this.apontamentos.set(apontamentos);
        this.observacaoApontamento.set('');
        this.action.set(null);
        this.load(o.id);
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao finalizar apontamento.');
        this.action.set(null);
      },
    });
  }

  atualizarStatus(): void {
    const o = this.os();
    const s = this.novoStatus();
    if (!o || !s) return;
    this.action.set('status');
    this.osService
      .atualizarStatus(o.id, {
        status: s as StatusOs,
        observacao: this.observacaoStatus().trim() || null,
      })
      .subscribe({
      next: (updated) => {
        this.os.set(updated);
        this.novoStatus.set('');
        this.observacaoStatus.set('');
        this.action.set(null);
        this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
      },
      error: (e) => {
        this.toast.error(e?.error?.message || 'Falha ao atualizar status.');
        this.action.set(null);
      },
    });
  }

  concluir(): void {
    const o = this.os();
    if (!o) return;
    if (!this.conclusao.descricao_servico) {
      this.toast.error('Descrição do serviço é obrigatória.');
      return;
    }
    this.action.set('concluir');
    this.osService
      .concluir(o.id, {
        descricao_servico: this.conclusao.descricao_servico,
        pecas_utilizadas: this.conclusao.pecas_utilizadas || null,
      })
      .subscribe({
        next: (updated) => {
          this.os.set(updated);
          this.conclusao = {
            descricao_servico: '',
            pecas_utilizadas: '',
          };
          this.action.set(null);
          this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
        },
        error: (e) => {
          this.toast.error(e?.error?.message || 'Falha ao concluir O.S.');
          this.action.set(null);
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
}
