import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { EquipamentoService } from '../../../core/services/equipamento.service';
import { Equipamento } from '../../../core/models/equipamento.model';
import {
  CreateOrdemServicoDto,
  Prioridade,
  TipoManutencao,
} from '../../../core/models/ordem-servico.model';

@Component({
  selector: 'app-nova-os',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nova-os.html',
  styleUrl: './nova-os.css',
})
export class NovaOs implements OnInit {
  private osService = inject(OrdemServicoService);
  private equipService = inject(EquipamentoService);
  private router = inject(Router);

  tipos = Object.values(TipoManutencao);
  prioridades = Object.values(Prioridade);

  equipamentos = signal<Equipamento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  model = {
    equipamentoId: null as number | null,
    tipo_manutencao: TipoManutencao.CORRETIVA as TipoManutencao,
    prioridade: Prioridade.MEDIA as Prioridade,
    descricao_falha: '',
  };

  ngOnInit(): void {
    this.equipService.list().subscribe({
      next: (data) => this.equipamentos.set(data.filter((e) => e.ativo)),
      error: () => this.error.set('Não foi possível carregar equipamentos.'),
    });
  }

  onSubmit(): void {
    if (!this.model.equipamentoId) return;
    this.loading.set(true);
    this.error.set(null);

    const dto: CreateOrdemServicoDto = {
      equipamentoId: Number(this.model.equipamentoId),
      tipo_manutencao: this.model.tipo_manutencao,
      prioridade: this.model.prioridade,
      descricao_falha: this.model.descricao_falha,
    };

    this.osService.create(dto).subscribe({
      next: (os) => this.router.navigate(['/ordens-de-servico', os.id]),
      error: (e) => {
        this.error.set(e?.error?.message || 'Falha ao criar ordem de serviço.');
        this.loading.set(false);
      },
    });
  }
}
