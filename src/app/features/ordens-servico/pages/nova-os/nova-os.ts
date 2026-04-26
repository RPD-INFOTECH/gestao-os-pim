import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrdemServicoService } from '@features/ordens-servico/services/ordem-servico.service';
import { EquipamentoService } from '@features/equipamentos/services/equipamento.service';
import { Equipamento } from '@shared/models/equipamento.model';
import {
  CreateOrdemServicoDto,
  Prioridade,
  TipoManutencao,
} from '@shared/models/ordem-servico.model';
import { ToastService } from '@shared/components/toast/toast.service';
import { BackButton } from '@shared/components/back-button/back-button';


@Component({
  selector: 'app-nova-os',
  imports: [CommonModule, FormsModule, RouterLink, BackButton],
  templateUrl: './nova-os.html',
})
export class NovaOs implements OnInit {
  private osService = inject(OrdemServicoService);
  private equipService = inject(EquipamentoService);
  private router = inject(Router);
  private toast = inject(ToastService);

  tipos = Object.values(TipoManutencao);
  prioridades = Object.values(Prioridade);

  equipamentos = signal<Equipamento[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private submitted = false;

  private createInitialModel() {
    return {
      equipamentoId: null as number | null,
      tipo_manutencao: TipoManutencao.CORRETIVA as TipoManutencao,
      prioridade: Prioridade.MEDIA as Prioridade,
      descricao_falha: '',
    };
  }

  model = this.createInitialModel();

  hasUnsavedChanges(): boolean {
    return !this.submitted && JSON.stringify(this.model) !== JSON.stringify(this.createInitialModel());
  }

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
      next: (os) => {
        this.submitted = true;
        this.toast.success('Ordem de servico criada com sucesso.');
        this.router.navigate(['/ordens-de-servico', os.id]);
      },
      error: (e) => {
        this.error.set(e?.error?.message || 'Falha ao criar ordem de serviço.');
        this.loading.set(false);
      },
    });
  }
}
