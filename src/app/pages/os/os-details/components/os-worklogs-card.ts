import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ApontamentoOs } from '../../../../core/models/ordem-servico.model';

@Component({
  selector: 'app-os-worklogs-card',
  imports: [CommonModule],
  templateUrl: './os-worklogs-card.html',
})
export class OsWorklogsCard {
  apontamentos = input.required<ApontamentoOs[]>();
}
