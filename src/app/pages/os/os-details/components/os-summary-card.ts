import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { OrdemServico } from '../../../../core/models/ordem-servico.model';

@Component({
  selector: 'app-os-summary-card',
  imports: [CommonModule],
  templateUrl: './os-summary-card.html',
})
export class OsSummaryCard {
  ordem = input.required<OrdemServico>();
}
