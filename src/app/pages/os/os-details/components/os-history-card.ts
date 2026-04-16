import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HistoricoOS } from '../../../../core/models/historico-os.model';
import { StatusLabelPipe } from '../../../../shared/status-label.pipe';

@Component({
  selector: 'app-os-history-card',
  imports: [CommonModule, StatusLabelPipe],
  templateUrl: './os-history-card.html',
})
export class OsHistoryCard {
  historico = input.required<HistoricoOS[]>();
}
