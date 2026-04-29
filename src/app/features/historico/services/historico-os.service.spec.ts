import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HistoricoOsService } from './historico-os.service';

describe('HistoricoOsService', () => {
  let service: HistoricoOsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HistoricoOsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(HistoricoOsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar historico sem filtros', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/historico-os');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve montar query apenas com filtros preenchidos', () => {
    service.list({
      busca: ' OS-0001 ',
      statusNovo: ' CONCLUIDA ',
      prioridade: '',
      usuarioId: 'user-1',
      osId: 'os-1',
      dataInicio: '2026-01-01',
      dataFim: '2026-01-31',
    }).subscribe();

    const req = httpMock.expectOne(
      '/api/historico-os?busca=OS-0001&statusNovo=CONCLUIDA&usuarioId=user-1&osId=os-1&dataInicio=2026-01-01&dataFim=2026-01-31',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve buscar historico por ordem de servico', () => {
    service.byOs('os-1').subscribe();

    const req = httpMock.expectOne('/api/historico-os/ordem-servico/os-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve buscar historico por usuario', () => {
    service.byUsuario('user-1').subscribe();

    const req = httpMock.expectOne('/api/historico-os/usuario/user-1');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
