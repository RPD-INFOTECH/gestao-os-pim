import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '@features/usuarios/services/usuario.service';
import { Usuario } from '@shared/models/usuario.model';
import { ToastService } from '@shared/components/toast/toast.service';
import { Perfil } from '@core/models/perfil.enum';
import { computed } from '@angular/core';
import { ConfirmationService } from '@shared/components/confirm/confirmation.service';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-usuarios-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios-list.html',
})
export class UsuariosList implements OnInit {
  private service = inject(UsuarioService);
  private toast = inject(ToastService);
  private confirmation = inject(ConfirmationService);
  private auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  busca = signal('');
  perfilFiltro = signal<Perfil | ''>('');
  setorFiltro = signal('');
  statusFiltro = signal<'todos' | 'ativos' | 'inativos'>('todos');
  perfis = Object.values(Perfil);
  canWrite = computed(() => {
    const perfil = this.auth.currentPerfil();
    return perfil === Perfil.SUPERVISOR || perfil === Perfil.GESTOR;
  });
  canDelete = computed(() => this.auth.currentPerfil() === Perfil.SUPERVISOR);

  canEdit(usuario: Usuario): boolean {
    const perfil = this.auth.currentPerfil();

    if (perfil === Perfil.GESTOR) {
      return [Perfil.SUPERVISOR, Perfil.TECNICO, Perfil.SOLICITANTE].includes(usuario.perfil);
    }

    if (perfil === Perfil.SUPERVISOR) {
      return [Perfil.TECNICO, Perfil.SOLICITANTE].includes(usuario.perfil);
    }

    return false;
  }

  setores = computed(() => {
    const values = new Set(
      this.usuarios()
        .map((usuario) => usuario.setor?.trim())
        .filter((setor): setor is string => !!setor)
    );

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  });

  filtrados = computed(() => {
    const busca = this.busca().trim().toLowerCase();
    const perfil = this.perfilFiltro();
    const setor = this.setorFiltro();
    const status = this.statusFiltro();

    return this.usuarios().filter((usuario) => {
      const matchBusca =
        !busca ||
        usuario.nome.toLowerCase().includes(busca) ||
        usuario.email.toLowerCase().includes(busca) ||
        usuario.matricula.toLowerCase().includes(busca);

      const matchPerfil = !perfil || usuario.perfil === perfil;
      const matchSetor = !setor || usuario.setor === setor;
      const matchStatus =
        status === 'todos' ||
        (status === 'ativos' && usuario.ativo) ||
        (status === 'inativos' && !usuario.ativo);

      return matchBusca && matchPerfil && matchSetor && matchStatus;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar a lista de usuários.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.busca.set('');
    this.perfilFiltro.set('');
    this.setorFiltro.set('');
    this.statusFiltro.set('todos');
  }

  async onDelete(u: Usuario): Promise<void> {
    if (!this.canDelete()) return;

    const confirmed = await this.confirmation.confirm({
      title: 'Desativar usuário',
      message: `Confirma a desativação do usuário "${u.nome}"?`,
      confirmLabel: 'Desativar',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) return;

    this.service.delete(u.id).subscribe({
      next: () => {
        this.toast.success('Usuário desativado com sucesso.');
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Falha ao excluir usuário.'),
    });
  }
}
