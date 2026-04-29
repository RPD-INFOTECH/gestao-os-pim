import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tempoTrabalhado',
})
export class TempoTrabalhadoPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const horasDecimais = Number(value ?? 0);

    if (!Number.isFinite(horasDecimais) || horasDecimais <= 0) {
      return '0h';
    }

    const minutosTotais = Math.round(horasDecimais * 60);
    const horas = Math.floor(minutosTotais / 60);
    const minutos = minutosTotais % 60;

    if (horas > 0 && minutos > 0) {
      return `${horas}h ${String(minutos).padStart(2, '0')}min`;
    }

    if (horas > 0) {
      return `${horas}h`;
    }

    return `${minutos}min`;
  }
}
