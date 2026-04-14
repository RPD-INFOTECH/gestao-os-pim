import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EquipamentoService } from '../../core/services/equipamento.service';
import { Equipamento } from '../../core/models/equipamento.model';
import { AuthService } from '../../core/auth/auth.service';
import { Perfil } from '../../core/models/perfil.enum';

@Component({
  selector: 'app-equipamentos',
  imports: [CommonModule, RouterLink],
  templateUrl: './equipamentos.html',
})
export class Equipamentos implements OnInit {
  private service = inject(EquipamentoService);
  private auth = inject(AuthService);

  equipamentos = signal<Equipamento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  canEdit = computed(() => this.auth.currentPerfil() === Perfil.SUPERVISOR);
  canDelete = computed(() => this.auth.currentPerfil() === Perfil.SUPERVISOR);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.list().subscribe({
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

  onDelete(e: Equipamento): void {
    if (!confirm(`Desativar equipamento "${e.nome}"?`)) return;
    this.service.delete(e.id).subscribe({
      next: () => this.load(),
      error: () => alert('Falha ao desativar equipamento.'),
    });
  }
}
