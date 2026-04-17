import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EquipamentoService } from '../../core/services/equipamento.service';
import { Equipamento } from '../../core/models/equipamento.model';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';
import { ToastService } from '../../shared/toast/toast.service';
import { ConfirmationService } from '../../shared/confirm/confirmation.service';

@Component({
  selector: 'app-equipamentos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipamentos.html',
})
export class Equipamentos implements OnInit {
  private service = inject(EquipamentoService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);

  equipamentos = signal<Equipamento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  busca = signal('');
  setor = signal('');
  ativo = signal<'todos' | 'ativos' | 'inativos'>('todos');
  comOsAbertas = signal(false);

  canEdit = computed(() => this.auth.currentPerfil() === Perfil.SUPERVISOR);
  canDelete = computed(() => this.auth.currentPerfil() === Perfil.SUPERVISOR);
  total = computed(() => this.equipamentos().length);
  ativos = computed(() => this.equipamentos().filter((item) => item.ativo).length);
  inativos = computed(() => this.equipamentos().filter((item) => !item.ativo).length);
  comChamados = computed(() => this.equipamentos().filter((item) => (item.os_abertas_count ?? 0) > 0).length);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list({
      busca: this.busca() || undefined,
      setor: this.setor() || undefined,
      ativo:
        this.ativo() === 'todos'
          ? undefined
          : this.ativo() === 'ativos',
      comOsAbertas: this.comOsAbertas() ? true : undefined,
    }).subscribe({
      next: (data) => {
        this.equipamentos.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de equipamentos.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.busca.set('');
    this.setor.set('');
    this.ativo.set('todos');
    this.comOsAbertas.set(false);
    this.load();
  }

  async onDelete(e: Equipamento): Promise<void> {
    const confirmed = await this.confirmation.confirm({
      title: 'Desativar equipamento',
      message: `Confirma a desativação do equipamento "${e.nome}"?`,
      confirmLabel: 'Desativar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) return;

    this.service.delete(e.id).subscribe({
      next: () => {
        this.toast.success('Equipamento desativado com sucesso.');
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Falha ao desativar equipamento.'),
    });
  }
}
