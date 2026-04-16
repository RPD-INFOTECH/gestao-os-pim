import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve buscar indicadores do dashboard', () => {
    service.getIndicadores().subscribe((response) => {
      expect(response.abertas).toBe(3);
      expect(response.em_andamento).toBe(2);
      expect(response.aguardando_peca).toBe(1);
      expect(response.concluidas_mes).toBe(5);
      expect(response.criticas_abertas).toBe(2);
      expect(response.sem_tecnico).toBe(1);
      expect(response.disponiveis_para_assumir).toBe(4);
      expect(response.minhas_atribuidas).toBe(3);
      expect(response.apontamento_aberto).toBe(false);
      expect(response.tempo_medio_execucao_horas).toBe(6.5);
      expect(response.tempo_medio_ate_inicio_horas).toBe(1.5);
      expect(response.tempo_medio_ate_conclusao_horas).toBe(8.2);
      expect(response.tempo_medio_trabalho_horas).toBe(3.4);
    });

    const req = httpMock.expectOne('/api/dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({
      abertas: 3,
      em_andamento: 2,
      aguardando_peca: 1,
      concluidas_mes: 5,
      criticas_abertas: 2,
      sem_tecnico: 1,
      disponiveis_para_assumir: 4,
      minhas_atribuidas: 3,
      apontamento_aberto: false,
      tempo_medio_execucao_horas: 6.5,
      tempo_medio_ate_inicio_horas: 1.5,
      tempo_medio_ate_conclusao_horas: 8.2,
      tempo_medio_trabalho_horas: 3.4,
    });
  });
});
