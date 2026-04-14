import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { HistoricoOsService } from '../../../core/services/historico-os.service';
import { OrdemServico, StatusOs } from '../../../core/models/ordem-servico.model';
import { Usuario } from '../../../core/models/usuario.model';
import { HistoricoOS } from '../../../core/models/historico-os.model';
import { AuthService } from '../../../core/auth/auth.service';
import { Perfil } from '../../../core/models/perfil.enum';

@Component({
  selector: 'app-os-details',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './os-details.html',
})
export class OsDetails implements OnInit {
  private osService = inject(OrdemServicoService);
  private usuarioService = inject(UsuarioService);
  private historicoService = inject(HistoricoOsService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  os = signal<OrdemServico | null>(null);
  tecnicos = signal<Usuario[]>([]);
  historico = signal<HistoricoOS[]>([]);
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
    horas_trabalhadas: 0,
  };

  isSupervisor = computed(() => this.perfil() === Perfil.SUPERVISOR);
  isTecnicoAtribuido = computed(() => {
    const o = this.os();
    return this.perfil() === Perfil.TECNICO && o?.tecnico?.id === this.user()?.id;
  });

  canAtribuirTecnico = computed(() => {
    const o = this.os();
    return this.isSupervisor() && o && o.status !== StatusOs.CONCLUIDA && o.status !== StatusOs.CANCELADA;
  });

  canAtualizarStatus = computed(() => {
    const o = this.os();
    if (!o || o.status === StatusOs.CONCLUIDA || o.status === StatusOs.CANCELADA) return false;
    return this.isSupervisor() || this.isTecnicoAtribuido();
  });

  canConcluir = computed(() => {
    const o = this.os();
    if (!o || !o.tecnico || o.status === StatusOs.CONCLUIDA || o.status === StatusOs.CANCELADA) return false;
    return this.isSupervisor() || this.isTecnicoAtribuido();
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.osService.getById(id).subscribe({
      next: (o) => {
        this.os.set(o);
        this.loading.set(false);
        if (this.isSupervisor()) {
          this.usuarioService.list().subscribe({
            next: (users) => this.tecnicos.set(users.filter((u) => u.perfil === Perfil.TECNICO && u.ativo)),
            error: () => {},
          });
        }
        this.historicoService.byOs(o.id).subscribe({
          next: (h) => this.historico.set(h),
          error: () => {},
        });
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
        alert(e?.error?.message || 'Falha ao atribuir técnico.');
        this.action.set(null);
      },
    });
  }

  atualizarStatus(): void {
    const o = this.os();
    const s = this.novoStatus();
    if (!o || !s) return;
    this.action.set('status');
    this.osService.atualizarStatus(o.id, s as StatusOs).subscribe({
      next: (updated) => {
        this.os.set(updated);
        this.novoStatus.set('');
        this.action.set(null);
        this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
      },
      error: (e) => {
        alert(e?.error?.message || 'Falha ao atualizar status.');
        this.action.set(null);
      },
    });
  }

  concluir(): void {
    const o = this.os();
    if (!o) return;
    if (!this.conclusao.descricao_servico || !this.conclusao.horas_trabalhadas) {
      alert('Descrição do serviço e horas trabalhadas são obrigatórios.');
      return;
    }
    this.action.set('concluir');
    this.osService
      .concluir(o.id, {
        descricao_servico: this.conclusao.descricao_servico,
        pecas_utilizadas: this.conclusao.pecas_utilizadas || null,
        horas_trabalhadas: Number(this.conclusao.horas_trabalhadas),
      })
      .subscribe({
        next: (updated) => {
          this.os.set(updated);
          this.action.set(null);
          this.historicoService.byOs(updated.id).subscribe((h) => this.historico.set(h));
        },
        error: (e) => {
          alert(e?.error?.message || 'Falha ao concluir O.S.');
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
