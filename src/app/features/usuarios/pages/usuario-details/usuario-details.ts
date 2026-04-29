import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UsuarioService } from '@features/usuarios/services/usuario.service';
import { UsuarioDetails } from '@shared/models/usuario.model';
import { BackButton } from '@shared/components/back-button/back-button';
import { TempoTrabalhadoPipe } from '@shared/ui/tempo-trabalhado.pipe';

@Component({
  selector: 'app-usuario-details',
  imports: [CommonModule, RouterLink, BackButton, TempoTrabalhadoPipe],
  templateUrl: './usuario-details.html',
})
export class UsuarioDetailsPage implements OnInit {
  private service = inject(UsuarioService);
  private route = inject(ActivatedRoute);

  usuario = signal<UsuarioDetails | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loading.set(true);
    this.service.getDetails(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Usuário não encontrado.');
        this.loading.set(false);
      },
    });
  }
}
