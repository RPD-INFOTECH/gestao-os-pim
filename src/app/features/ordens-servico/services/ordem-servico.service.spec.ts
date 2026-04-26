import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrdemServicoService } from './ordem-servico.service';
import { Prioridade, StatusOs } from '@shared/models/ordem-servico.model';

describe('OrdemServicoService', () => {
  let service: OrdemServicoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrdemServicoService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrdemServicoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve sanitizar params vazios na listagem', () => {
    service
      .list({
        status: StatusOs.EM_ANDAMENTO,
        prioridade: undefined,
        busca: '',
        tecnicoId: '',
        setor: 'Operação',
      })
      .subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/api/ordens-servico' &&
        request.params.get('status') === StatusOs.EM_ANDAMENTO &&
        request.params.get('setor') === 'Operação' &&
        !request.params.has('busca') &&
        !request.params.has('tecnicoId') &&
        !request.params.has('prioridade'),
    );

    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve chamar endpoint de assumir OS', () => {
    service.assumir('os-1').subscribe();

    const req = httpMock.expectOne('/api/ordens-servico/os-1/assumir');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('deve chamar endpoint de iniciar OS', () => {
    service.iniciar('os-1').subscribe();

    const req = httpMock.expectOne('/api/ordens-servico/os-1/iniciar');
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  it('deve enviar observacao opcional na atualizacao de status', () => {
    service.atualizarStatus('os-1', {
      status: StatusOs.AGUARDANDO_PECA,
      observacao: 'Aguardando SSD 1TB',
    }).subscribe();

    const req = httpMock.expectOne('/api/ordens-servico/os-1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      status: StatusOs.AGUARDANDO_PECA,
      observacao: 'Aguardando SSD 1TB',
    });
    req.flush({});
  });

  it('deve chamar endpoint de iniciar apontamento', () => {
    service.iniciarApontamento('os-1', 'Inicio do atendimento').subscribe();

    const req = httpMock.expectOne('/api/ordens-servico/os-1/apontamentos/iniciar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ observacao: 'Inicio do atendimento' });
    req.flush([]);
  });

  it('deve chamar endpoint de finalizar apontamento', () => {
    service.finalizarApontamento('os-1', 'Fim do atendimento').subscribe();

    const req = httpMock.expectOne('/api/ordens-servico/os-1/apontamentos/finalizar');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ observacao: 'Fim do atendimento' });
    req.flush([]);
  });
});
