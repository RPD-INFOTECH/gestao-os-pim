import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { OrdemServico } from '@shared/models/ordem-servico.model';
import { TempoTrabalhadoPipe } from '@shared/ui/tempo-trabalhado.pipe';

@Component({
  selector: 'app-os-summary-card',
  imports: [CommonModule, TempoTrabalhadoPipe],
  templateUrl: './os-summary-card.html',
})
export class OsSummaryCard {
  ordem = input.required<OrdemServico>();
}
