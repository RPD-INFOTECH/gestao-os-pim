import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfiguracaoPrazoAtendimentoService } from './configuracao-prazo-atendimento.service';
import { Prioridade } from '@shared/models/ordem-servico.model';

describe('ConfiguracaoPrazoAtendimentoService', () => {
  let service: ConfiguracaoPrazoAtendimentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConfiguracaoPrazoAtendimentoService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ConfiguracaoPrazoAtendimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar configuracoes de prazo de atendimento', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/configuracoes/prazo-atendimento');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve atualizar prazo por prioridade', () => {
    service.update(Prioridade.CRITICA, { horas_limite: 2 }).subscribe();

    const req = httpMock.expectOne(
      `/api/configuracoes/prazo-atendimento/${encodeURIComponent(Prioridade.CRITICA)}`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ horas_limite: 2 });
    req.flush({});
  });
});
