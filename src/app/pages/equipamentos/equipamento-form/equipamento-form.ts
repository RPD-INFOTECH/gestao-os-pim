import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EquipamentoService } from '../../../core/services/equipamento.service';
import { CreateEquipamentoDto, UpdateEquipamentoDto } from '../../../core/models/equipamento.model';

@Component({
  selector: 'app-equipamento-form',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './equipamento-form.html',
})
export class EquipamentoForm implements OnInit {
  private service = inject(EquipamentoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  id = signal<number | null>(null);

  model = {
    codigo: '',
    nome: '',
    tipo: '',
    localizacao: '',
    fabricante: '',
    modelo: '',
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
            fabricante: e.fabricante ?? '',
            modelo: e.modelo ?? '',
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
      codigo: this.model.codigo,
      nome: this.model.nome,
      tipo: this.model.tipo,
      localizacao: this.model.localizacao,
      fabricante: this.model.fabricante || null,
      modelo: this.model.modelo || null,
      ativo: this.model.ativo,
    };

    if (this.isEdit()) {
      this.service.update(this.id()!, payload as UpdateEquipamentoDto).subscribe({
        next: () => this.router.navigate(['/equipamentos']),
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao atualizar equipamento.');
          this.loading.set(false);
        },
      });
    } else {
      this.service.create(payload as CreateEquipamentoDto).subscribe({
        next: () => this.router.navigate(['/equipamentos']),
        error: (e) => {
          this.error.set(e?.error?.message || 'Falha ao criar equipamento.');
          this.loading.set(false);
        },
      });
    }
  }
}
