import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Perfil } from '@core/models/perfil.enum';

const usuario = {
  id: 'user-1',
  nome: 'Supervisor Teste',
  email: 'supervisor@teste.local',
  perfil: Perfil.SUPERVISOR,
  setor: 'Operacao',
  ativo: true,
  matricula: 'USR-000001',
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve autenticar e armazenar usuario e access token', () => {
    service.login('supervisor@teste.local', 'senha').subscribe();

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ email: 'supervisor@teste.local', senha: 'senha' });
    req.flush({ accessToken: 'access-token', usuario });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.accessToken()).toBe('access-token');
    expect(service.currentUser()?.email).toBe(usuario.email);
    expect(service.currentPerfil()).toBe(Perfil.SUPERVISOR);
  });

  it('deve renovar sessao via refresh token em cookie', () => {
    service.refresh().subscribe();

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ accessToken: 'novo-token', usuario });

    expect(service.accessToken()).toBe('novo-token');
    expect(service.hasRole(Perfil.SUPERVISOR)).toBe(true);
  });

  it('deve limpar sessao e redirecionar no logout com sucesso', () => {
    service.login('supervisor@teste.local', 'senha').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ accessToken: 'access-token', usuario });

    service.logout();

    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deve limpar sessao mesmo se logout falhar', () => {
    service.login('supervisor@teste.local', 'senha').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ accessToken: 'access-token', usuario });

    service.logout();
    httpMock.expectOne('/api/auth/logout').flush({ message: 'erro' }, { status: 500, statusText: 'Erro' });

    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('deve limpar sessao manualmente', () => {
    service.login('supervisor@teste.local', 'senha').subscribe();
    httpMock.expectOne('/api/auth/login').flush({ accessToken: 'access-token', usuario });

    service.clearSession();

    expect(service.accessToken()).toBeNull();
    expect(service.currentPerfil()).toBeNull();
  });
});
