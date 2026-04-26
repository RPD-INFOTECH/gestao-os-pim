import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '@features/usuarios/services/usuario.service';
import { Perfil } from '@core/models/perfil.enum';
import { CreateUsuarioDto, UpdateUsuarioDto } from '@shared/models/usuario.model';
import { ToastService } from '@shared/components/toast/toast.service';
import { BackButton } from '@shared/components/back-button/back-button';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, FormsModule, RouterLink, BackButton],
  templateUrl: './usuario-form.html',
})
export class UsuarioForm implements OnInit {
  private service = inject(UsuarioService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  perfis = Object.values(Perfil);
  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  id = signal<string | null>(null);

  model = {
    nome: '',
    email: '',
    matricula: '',
    senha: '',
    perfil: Perfil.SOLICITANTE as Perfil,
    setor: '' as string,
    ativo: true,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.id.set(id);
      this.loading.set(true);
      this.service.getById(id).subscribe({
        next: (u) => {
          this.model = {
            nome: u.nome,
            email: u.email,
            matricula: u.matricula,
            senha: '',
            perfil: u.perfil,
            setor: u.setor ?? '',
            ativo: u.ativo,
          };
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Usuário não encontrado.');
          this.loading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    if (this.isEdit()) {
      const dto: UpdateUsuarioDto = {
        nome: this.model.nome,
        email: this.model.email,
        matricula: this.model.matricula,
        perfil: this.model.perfil,
        setor: this.model.setor || null,
        ativo: this.model.ativo,
      };
      if (this.model.senha) dto.senha = this.model.senha;
      this.service.update(this.id()!, dto).subscribe({
        next: () => {
          this.toast.success('Usuario atualizado com sucesso.');
          this.router.navigate(['/usuarios']);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao atualizar usuário.');
          this.loading.set(false);
        },
      });
    } else {
      const dto: CreateUsuarioDto = {
        nome: this.model.nome,
        email: this.model.email,
        matricula: this.model.matricula,
        senha: this.model.senha,
        perfil: this.model.perfil,
        setor: this.model.setor || null,
        ativo: this.model.ativo,
      };
      this.service.create(dto).subscribe({
        next: () => {
          this.toast.success('Usuario criado com sucesso.');
          this.router.navigate(['/usuarios']);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao criar usuário.');
          this.loading.set(false);
        },
      });
    }
  }
}
