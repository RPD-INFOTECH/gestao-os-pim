import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ApontamentoOs } from '@shared/models/ordem-servico.model';

type GrupoApontamentos = {
  tecnicoId: string;
  tecnicoNome: string;
  totalMinutos: number;
  totalFormatado: string;
  apontamentos: ApontamentoOs[];
};

@Component({
  selector: 'app-os-worklogs-card',
  imports: [CommonModule],
  templateUrl: './os-worklogs-card.html',
})
export class OsWorklogsCard {
  apontamentos = input.required<ApontamentoOs[]>();

  grupos = computed<GrupoApontamentos[]>(() => {
    const groups = new Map<string, GrupoApontamentos>();

    for (const apontamento of this.apontamentos()) {
      const tecnicoId = apontamento.tecnico?.id ?? apontamento.tecnicoId;
      const tecnicoNome = apontamento.tecnico?.nome ?? 'Técnico não identificado';
      const existente = groups.get(tecnicoId) ?? {
        tecnicoId,
        tecnicoNome,
        totalMinutos: 0,
        totalFormatado: '0h 00min',
        apontamentos: [],
      };

      existente.apontamentos.push(apontamento);

      if (apontamento.fimEm) {
        const diffMinutos = Math.max(
          0,
          Math.round(
            (new Date(apontamento.fimEm).getTime() - new Date(apontamento.inicioEm).getTime()) /
              (1000 * 60)
          )
        );
        existente.totalMinutos += diffMinutos;
      }

      existente.totalFormatado = `${Math.floor(existente.totalMinutos / 60)}h ${String(
        existente.totalMinutos % 60
      ).padStart(2, '0')}min`;

      groups.set(tecnicoId, existente);
    }

    return Array.from(groups.values()).sort((a, b) => b.totalMinutos - a.totalMinutos);
  });
}
