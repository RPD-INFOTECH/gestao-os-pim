import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StatusOs } from '../../../../core/models/ordem-servico.model';
import { Usuario } from '../../../../core/models/usuario.model';
import { StatusLabelPipe } from '../../../../shared/status-label.pipe';

@Component({
  selector: 'app-os-workflow-actions',
  imports: [CommonModule, FormsModule, StatusLabelPipe],
  templateUrl: './os-workflow-actions.html',
})
export class OsWorkflowActions {
  canAssumir = input(false);
  canAtribuirTecnico = input(false);
  canIniciar = input(false);
  canAtualizarStatus = input(false);
  canIniciarTrabalho = input(false);
  canFinalizarTrabalho = input(false);
  canConcluir = input(false);
  action = input<string | null>(null);

  tecnicos = input<Usuario[]>([]);
  tecnicoSelecionado = input('');
  novoStatus = input<StatusOs | ''>('');
  availableStatusOptions = input<StatusOs[]>([]);
  observacaoStatus = input('');
  observacaoApontamento = input('');
  descricaoServico = input('');
  pecasUtilizadas = input('');

  tecnicoSelecionadoChange = output<string>();
  novoStatusChange = output<StatusOs | ''>();
  observacaoStatusChange = output<string>();
  observacaoApontamentoChange = output<string>();
  descricaoServicoChange = output<string>();
  pecasUtilizadasChange = output<string>();

  assumirClicked = output<void>();
  atribuirClicked = output<void>();
  iniciarClicked = output<void>();
  atualizarStatusClicked = output<void>();
  iniciarTrabalhoClicked = output<void>();
  finalizarTrabalhoClicked = output<void>();
  concluirClicked = output<void>();
}
