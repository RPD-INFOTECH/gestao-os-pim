import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EquipamentoService } from './equipamento.service';

describe('EquipamentoService', () => {
  let service: EquipamentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EquipamentoService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EquipamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar equipamentos sem query quando nao ha filtros', () => {
    service.list().subscribe();

    const req = httpMock.expectOne('/api/equipamentos');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve montar query apenas com filtros preenchidos', () => {
    service.list({
      busca: ' prensa ',
      setor: ' Producao ',
      ativo: true,
      comOsAbertas: false,
    }).subscribe();

    const req = httpMock.expectOne('/api/equipamentos?busca=prensa&setor=Producao&ativo=true&comOsAbertas=false');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('deve buscar equipamento por id', () => {
    service.getById(10).subscribe();

    const req = httpMock.expectOne('/api/equipamentos/10');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve buscar detalhes do equipamento', () => {
    service.getDetails(10).subscribe();

    const req = httpMock.expectOne('/api/equipamentos/10/detalhes');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve criar equipamento sem exigir codigo no front', () => {
    service.create({
      nome: 'Motor Linha A',
      tipo: 'Motor',
      localizacao: 'Linha A',
      setor: 'Producao',
      numero_patrimonio: 'PAT-001',
      fabricante: 'Fabricante',
      modelo: 'M1',
      ultima_revisao: '2026-01-01',
    }).subscribe();

    const req = httpMock.expectOne('/api/equipamentos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.codigo).toBeUndefined();
    req.flush({});
  });

  it('deve atualizar equipamento', () => {
    service.update(10, { localizacao: 'Linha B' }).subscribe();

    const req = httpMock.expectOne('/api/equipamentos/10');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ localizacao: 'Linha B' });
    req.flush({});
  });

  it('deve desativar equipamento por delete logico', () => {
    service.delete(10).subscribe();

    const req = httpMock.expectOne('/api/equipamentos/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
