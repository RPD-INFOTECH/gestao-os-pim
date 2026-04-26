import { Pipe, PipeTransform } from '@angular/core';

const STATUS_LABELS: Record<string, string> = {
  ABERTA: 'ABERTA',
  EM_ANDAMENTO: 'EM ANDAMENTO',
  AGUARDANDO_PECA: 'AGUARDANDO PEÇA',
  CONCLUIDA: 'CONCLUÍDA',
  CANCELADA: 'CANCELADA',
};

@Pipe({
  name: 'statusLabel',
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';

    return STATUS_LABELS[value] ?? value.replaceAll('_', ' ');
  }
}
