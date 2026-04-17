import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrdemServicoService } from '../../core/services/ordem-servico.service';
import { OrdemServico, Prioridade, StatusOs } from '../../core/models/ordem-servico.model';
import { StatusLabelPipe } from '../../shared/status-label.pipe';

type SerieItem = {
  label: string;
  value: number;
  tone: string;
  bar: string;
};

type TecnicoResumo = {
  id: string;
  nome: string;
  horas: number;
  ordens: number;
  concluidas: number;
  emAndamento: number;
};

type SetorResumo = {
  setor: string;
  total: number;
  abertas: number;
  concluidas: number;
};

type SlaFiltro = '' | 'NO_PRAZO' | 'ESTOURADO';

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, FormsModule, RouterLink, StatusLabelPipe],
  templateUrl: './relatorios.html',
})
export class Relatorios implements OnInit {
  private service = inject(OrdemServicoService);

  ordens = signal<OrdemServico[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  statusFiltro = signal<StatusOs | ''>('');
  slaFiltro = signal<SlaFiltro>('');
  tecnicoFiltro = signal('');
  setorFiltro = signal('');

  statusOptions = [
    StatusOs.ABERTA,
    StatusOs.EM_ANDAMENTO,
    StatusOs.AGUARDANDO_PECA,
    StatusOs.CONCLUIDA,
    StatusOs.CANCELADA,
  ];

  tecnicosOptions = computed(() => {
    const values = new Map<string, string>();

    for (const ordem of this.ordens()) {
      if (ordem.tecnico?.id && ordem.tecnico?.nome) {
        values.set(String(ordem.tecnico.id), ordem.tecnico.nome);
      }

      for (const apontamento of ordem.apontamentos ?? []) {
        const tecnicoId = String(apontamento.tecnico?.id ?? apontamento.tecnicoId);
        const tecnicoNome = apontamento.tecnico?.nome;
        if (tecnicoId && tecnicoNome) {
          values.set(tecnicoId, tecnicoNome);
        }
      }
    }

    return Array.from(values.entries())
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  setoresOptions = computed(() => {
    const values = new Set(
      this.ordens()
        .map((ordem) => ordem.equipamento?.setor?.trim())
        .filter((setor): setor is string => !!setor)
    );

    return Array.from(values).sort((a, b) => a.localeCompare(b));
  });

  ordensFiltradas = computed(() => {
    const status = this.statusFiltro();
    const sla = this.slaFiltro();
    const tecnicoId = this.tecnicoFiltro();
    const setor = this.setorFiltro();

    return this.ordens().filter((o) => {
      const matchStatus = !status || o.status === status;
      const matchSla = !sla || this.slaLabel(o) === sla;
      const matchSetor = !setor || (o.equipamento?.setor?.trim() || '') === setor;
      const tecnicoAtualId = o.tecnico?.id ? String(o.tecnico.id) : '';
      const matchTecnico =
        !tecnicoId ||
        tecnicoAtualId === tecnicoId ||
        (o.apontamentos ?? []).some((apontamento) => String(apontamento.tecnico?.id ?? apontamento.tecnicoId) === tecnicoId);

      return matchStatus && matchSla && matchSetor && matchTecnico;
    });
  });

  total = computed(() => this.ordensFiltradas().length);
  abertas = computed(() => this.ordensFiltradas().filter((o) => o.status === StatusOs.ABERTA).length);
  emAndamento = computed(() => this.ordensFiltradas().filter((o) => o.status === StatusOs.EM_ANDAMENTO).length);
  aguardandoPeca = computed(() => this.ordensFiltradas().filter((o) => o.status === StatusOs.AGUARDANDO_PECA).length);
  concluidas = computed(() => this.ordensFiltradas().filter((o) => o.status === StatusOs.CONCLUIDA).length);
  canceladas = computed(() => this.ordensFiltradas().filter((o) => o.status === StatusOs.CANCELADA).length);
  criticas = computed(() =>
    this.ordensFiltradas().filter(
      (o) => o.prioridade === Prioridade.CRITICA && o.status !== StatusOs.CONCLUIDA && o.status !== StatusOs.CANCELADA
    ).length
  );

  totalHoras = computed(() =>
    this.ordensFiltradas().reduce((acc, o) => acc + (Number(o.horas_trabalhadas) || 0), 0)
  );

  tempoMedioConclusaoHoras = computed(() => {
    const concluidas = this.ordensFiltradas().filter((o) => !!o.conclusao_em);
    if (!concluidas.length) return 0;

    const totalHoras = concluidas.reduce((acc, ordem) => {
      const abertura = new Date(ordem.abertura_em).getTime();
      const conclusao = new Date(ordem.conclusao_em!).getTime();
      return acc + Math.max(0, (conclusao - abertura) / (1000 * 60 * 60));
    }, 0);

    return Number((totalHoras / concluidas.length).toFixed(1));
  });

  statusSeries = computed<SerieItem[]>(() => [
    {
      label: 'Abertas',
      value: this.abertas(),
      tone: 'text-blue-300',
      bar: 'bg-blue-500',
    },
    {
      label: 'Em andamento',
      value: this.emAndamento(),
      tone: 'text-amber-300',
      bar: 'bg-amber-500',
    },
    {
      label: 'Aguardando peça',
      value: this.aguardandoPeca(),
      tone: 'text-orange-300',
      bar: 'bg-orange-500',
    },
    {
      label: 'Concluídas',
      value: this.concluidas(),
      tone: 'text-emerald-300',
      bar: 'bg-emerald-500',
    },
    {
      label: 'Canceladas',
      value: this.canceladas(),
      tone: 'text-slate-300',
      bar: 'bg-slate-500',
    },
  ]);

  prioridadeSeries = computed<SerieItem[]>(() => {
    const ordens = this.ordensFiltradas();
    const count = (prioridade: Prioridade) => ordens.filter((o) => o.prioridade === prioridade).length;

    return [
      {
        label: 'Baixa',
        value: count(Prioridade.BAIXA),
        tone: 'text-slate-300',
        bar: 'bg-slate-400',
      },
      {
        label: 'Média',
        value: count(Prioridade.MEDIA),
        tone: 'text-blue-300',
        bar: 'bg-blue-500',
      },
      {
        label: 'Alta',
        value: count(Prioridade.ALTA),
        tone: 'text-amber-300',
        bar: 'bg-amber-500',
      },
      {
        label: 'Crítica',
        value: count(Prioridade.CRITICA),
        tone: 'text-red-300',
        bar: 'bg-red-500',
      },
    ];
  });

  horasPorTecnico = computed<TecnicoResumo[]>(() => {
    const grupos = new Map<string, TecnicoResumo>();
    const tecnicoSelecionado = this.tecnicoFiltro();

    for (const ordem of this.ordensFiltradas()) {
      for (const apontamento of ordem.apontamentos ?? []) {
        const tecnicoId = String(apontamento.tecnico?.id ?? apontamento.tecnicoId);
        if (tecnicoSelecionado && tecnicoId !== tecnicoSelecionado) continue;
        const tecnicoNome = apontamento.tecnico?.nome ?? ordem.tecnico?.nome ?? 'Técnico não identificado';
        const grupo = grupos.get(tecnicoId) ?? {
          id: tecnicoId,
          nome: tecnicoNome,
          horas: 0,
          ordens: 0,
          concluidas: 0,
          emAndamento: 0,
        };

        if (apontamento.fimEm) {
          grupo.horas += Math.max(
            0,
            (new Date(apontamento.fimEm).getTime() - new Date(apontamento.inicioEm).getTime()) /
              (1000 * 60 * 60)
          );
        }

        grupos.set(tecnicoId, grupo);
      }
    }

    for (const ordem of this.ordensFiltradas()) {
      const tecnicoId = ordem.tecnico?.id ? String(ordem.tecnico.id) : '';
      if (!tecnicoId) continue;
      if (tecnicoSelecionado && tecnicoId !== tecnicoSelecionado) continue;

      const grupo = grupos.get(tecnicoId) ?? {
        id: tecnicoId,
        nome: ordem.tecnico?.nome ?? 'Técnico não identificado',
        horas: 0,
        ordens: 0,
        concluidas: 0,
        emAndamento: 0,
      };

      grupo.ordens += 1;
      if (ordem.status === StatusOs.CONCLUIDA) grupo.concluidas += 1;
      if (ordem.status === StatusOs.EM_ANDAMENTO || ordem.status === StatusOs.AGUARDANDO_PECA) {
        grupo.emAndamento += 1;
      }

      grupos.set(tecnicoId, grupo);
    }

    return Array.from(grupos.values())
      .map((grupo) => ({
        ...grupo,
        horas: Number(grupo.horas.toFixed(2)),
      }))
      .sort((a, b) => b.horas - a.horas || b.concluidas - a.concluidas);
  });

  ordensPorSetor = computed<SetorResumo[]>(() => {
    const grupos = new Map<string, SetorResumo>();

    for (const ordem of this.ordensFiltradas()) {
      const setor = ordem.equipamento?.setor?.trim() || 'Não informado';
      const grupo = grupos.get(setor) ?? {
        setor,
        total: 0,
        abertas: 0,
        concluidas: 0,
      };

      grupo.total += 1;
      if (ordem.status === StatusOs.CONCLUIDA) {
        grupo.concluidas += 1;
      } else if (ordem.status !== StatusOs.CANCELADA) {
        grupo.abertas += 1;
      }

      grupos.set(setor, grupo);
    }

    return Array.from(grupos.values()).sort((a, b) => b.total - a.total);
  });

  ordensRecentes = computed(() =>
    [...this.ordensFiltradas()]
      .sort((a, b) => new Date(b.abertura_em).getTime() - new Date(a.abertura_em).getTime())
      .slice(0, 10)
  );

  ngOnInit(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => {
        this.ordens.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Não foi possível carregar os dados de relatórios.');
        this.loading.set(false);
      },
    });
  }

  percent(value: number, total: number): number {
    if (!total) return 0;
    return Number(((value / total) * 100).toFixed(1));
  }

  widthByMax(value: number, values: number[]): number {
    const max = Math.max(...values, 0);
    if (!max) return 0;
    return Number(((value / max) * 100).toFixed(1));
  }

  statusClass(status: StatusOs): string {
    switch (status) {
      case StatusOs.ABERTA:
        return 'bg-blue-900/40 text-blue-400';
      case StatusOs.EM_ANDAMENTO:
        return 'bg-yellow-900/40 text-yellow-400';
      case StatusOs.AGUARDANDO_PECA:
        return 'bg-orange-900/40 text-orange-400';
      case StatusOs.CONCLUIDA:
        return 'bg-green-900/40 text-green-400';
      case StatusOs.CANCELADA:
        return 'bg-slate-800 text-slate-500';
    }
  }

  prioridadeClass(prioridade: Prioridade): string {
    switch (prioridade) {
      case Prioridade.CRITICA:
        return 'text-red-400';
      case Prioridade.ALTA:
        return 'text-orange-400';
      case Prioridade.MEDIA:
        return 'text-yellow-400';
      case Prioridade.BAIXA:
        return 'text-slate-400';
    }
  }

  slaLabel(ordem: OrdemServico): 'NO_PRAZO' | 'ESTOURADO' {
    const limiteHoras = this.slaLimiteHoras(ordem.prioridade);
    const base = new Date(ordem.inicio_em ?? ordem.abertura_em).getTime();
    const fim = new Date(ordem.conclusao_em ?? new Date()).getTime();
    const horas = (fim - base) / (1000 * 60 * 60);

    if (ordem.status === StatusOs.CONCLUIDA && horas <= limiteHoras) {
      return 'NO_PRAZO';
    }

    if (horas > limiteHoras) {
      return 'ESTOURADO';
    }

    return 'NO_PRAZO';
  }

  private slaLimiteHoras(prioridade: Prioridade): number {
    switch (prioridade) {
      case Prioridade.CRITICA:
        return 4;
      case Prioridade.ALTA:
        return 8;
      case Prioridade.MEDIA:
        return 24;
      case Prioridade.BAIXA:
        return 72;
    }
  }
}
