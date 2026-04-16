import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EquipamentoService } from '../../../core/services/equipamento.service';
import { Equipamento } from '../../../core/models/equipamento.model';
import { StatusLabelPipe } from '../../../shared/status-label.pipe';

@Component({
  selector: 'app-equipamento-details',
  imports: [CommonModule, RouterLink, StatusLabelPipe],
  templateUrl: './equipamento-details.html',
})
export class EquipamentoDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(EquipamentoService);

  equipamento = signal<Equipamento | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  osRelacionadas = computed(() => this.equipamento()?.ordensServico ?? []);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('Equipamento não encontrado.');
      return;
    }

    this.loading.set(true);
    this.service.getDetails(id).subscribe({
      next: (equipamento) => {
        this.equipamento.set(equipamento);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar o detalhe do equipamento.');
        this.loading.set(false);
      },
    });
  }
}
