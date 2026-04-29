import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipamentoService } from '@features/equipamentos/services/equipamento.service';
import { CreateEquipamentoDto, UpdateEquipamentoDto } from '@shared/models/equipamento.model';
import { ToastService } from '@shared/components/toast/toast.service';
import { BackButton } from '@shared/components/back-button/back-button';

@Component({
  selector: 'app-equipamento-form',
  imports: [CommonModule, FormsModule, RouterLink, BackButton],
  templateUrl: './equipamento-form.html',
})
export class EquipamentoForm implements OnInit {
  private service = inject(EquipamentoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  model = {
    codigo: '',
    nome: '',
    tipo: '',
    localizacao: '',
    setor: 'Operação',
    numero_patrimonio: '',
    fabricante: '',
    modelo: '',
    ultima_revisao: '',
    ativo: true,
  };

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      const id = Number(param);
      this.isEdit.set(true);
      this.id.set(id);
      this.loading.set(true);
      this.service.getById(id).subscribe({
        next: (e) => {
          this.model = {
            codigo: e.codigo,
            nome: e.nome,
            tipo: e.tipo,
            localizacao: e.localizacao,
            setor: e.setor,
            numero_patrimonio: e.numero_patrimonio ?? '',
            fabricante: e.fabricante ?? '',
            modelo: e.modelo ?? '',
            ultima_revisao: e.ultima_revisao ?? '',
            ativo: e.ativo,
          };
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Equipamento não encontrado.');
          this.loading.set(false);
        },
      });
    }
  }

  onSubmit(): void {
    this.loading.set(true);
    this.error.set(null);

    const payload = {
      nome: this.model.nome,
      tipo: this.model.tipo,
      localizacao: this.model.localizacao,
      setor: this.model.setor,
      numero_patrimonio: this.model.numero_patrimonio || null,
      fabricante: this.model.fabricante || null,
      modelo: this.model.modelo || null,
      ultima_revisao: this.model.ultima_revisao || null,
      ativo: this.model.ativo,
    };

    if (this.isEdit()) {
      this.service.update(this.id()!, { ...payload, codigo: this.model.codigo } as UpdateEquipamentoDto).subscribe({
        next: () => {
          this.toast.success('Equipamento atualizado com sucesso.');
          this.router.navigate(['/equipamentos']);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao atualizar equipamento.');
          this.loading.set(false);
        },
      });
    } else {
      this.service.create(payload as CreateEquipamentoDto).subscribe({
        next: () => {
          this.toast.success('Equipamento criado com sucesso.');
          this.router.navigate(['/equipamentos']);
        },
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao criar equipamento.');
          this.loading.set(false);
        },
      });
    }
  }
}
