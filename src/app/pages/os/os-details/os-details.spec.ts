import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OsDetails } from './os-details';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { HistoricoOsService } from '../../../core/services/historico-os.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Perfil } from '../../../core/models/perfil.enum';
import { Prioridade, StatusOs, TipoManutencao } from '../../../core/models/ordem-servico.model';

describe('OsDetails', () => {
  let component: OsDetails;
  let fixture: ComponentFixture<OsDetails>;

  const ordemBase = {
    id: 'os-1',
    numero: 'OS-0001',
    equipamento: {
      id: 1,
      codigo: 'EQ-1',
      nome: 'Servidor',
      tipo: 'Servidor',
      localizacao: 'CPD',
      setor: 'Operação',
      numero_patrimonio: null,
      fabricante: null,
      modelo: null,
      ativo: true,
      data_cadastro: new Date().toISOString(),
      ultima_revisao: null,
    },
    solicitante: {
      id: 'sol-1',
      nome: 'Solicitante',
      email: 'sol@teste.com',
      matricula: 'MAT-1',
      perfil: Perfil.SOLICITANTE,
      setor: null,
      ativo: true,
      created_at: '',
    },
    tecnico: null,
    tipo_manutencao: TipoManutencao.CORRETIVA,
    prioridade: Prioridade.ALTA,
    status: StatusOs.ABERTA,
    descricao_falha: 'Falha crítica',
    abertura_em: new Date().toISOString(),
    inicio_em: null,
    conclusao_em: null,
    descricao_servico: null,
    pecas_utilizadas: null,
    horas_trabalhadas: null,
    duracao_execucao_minutos: null,
    duracao_execucao_formatada: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OsDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'os-1',
              },
            },
          },
        },
        {
          provide: OrdemServicoService,
          useValue: {
            getById: () => of(ordemBase),
            atribuirTecnico: () => of(ordemBase),
            atualizarStatus: () => of(ordemBase),
            concluir: () => of(ordemBase),
            assumir: () => of({ ...ordemBase, tecnico: { id: 'tec-1', nome: 'Tecnico' } }),
            iniciar: () => of({ ...ordemBase, tecnico: { id: 'tec-1', nome: 'Tecnico' }, status: StatusOs.EM_ANDAMENTO }),
            listarApontamentos: () => of([]),
            iniciarApontamento: () => of([]),
            finalizarApontamento: () => of([]),
          },
        },
        {
          provide: UsuarioService,
          useValue: {
            list: () => of([]),
          },
        },
        {
          provide: HistoricoOsService,
          useValue: {
            byOs: () => of([]),
          },
        },
        {
          provide: AuthService,
          useValue: {
            currentPerfil: () => Perfil.TECNICO,
            currentUser: () => ({ id: 'tec-1' }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OsDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve permitir assumir OS aberta sem técnico', () => {
    expect(component.canAssumir()).toBe(true);
  });

  it('deve bloquear iniciar quando a OS ainda não tem técnico', () => {
    expect(component.canIniciar()).toBe(false);
  });
});
