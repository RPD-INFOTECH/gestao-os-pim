import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-usuarios-list',
  imports: [CommonModule, RouterLink],
  templateUrl: './usuarios-list.html',
})
export class UsuariosList implements OnInit {
  private service = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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

  onDelete(u: Usuario): void {
    if (!confirm(`Excluir usuário "${u.nome}"?`)) return;
    this.service.delete(u.id).subscribe({
      next: () => this.load(),
      error: () => alert('Falha ao excluir usuário.'),
    });
  }
}
