import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/auth/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: {
    accessToken: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
    clearSession: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = {
      accessToken: vi.fn().mockReturnValue('access-token'),
      refresh: vi.fn(),
      clearSession: vi.fn(),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve anexar Authorization quando existe access token', () => {
    http.get('/api/dashboard').subscribe();

    const req = httpMock.expectOne('/api/dashboard');
    expect(req.request.headers.get('Authorization')).toBe('Bearer access-token');
    req.flush({});
  });

  it('nao deve anexar Authorization quando token nao existe', () => {
    auth.accessToken.mockReturnValue(null);

    http.get('/api/publico').subscribe();

    const req = httpMock.expectOne('/api/publico');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('deve renovar token e repetir requisicao apos 401 fora de rota auth', () => {
    auth.refresh.mockReturnValue(of({ accessToken: 'token-renovado', usuario: null }));
    http.get('/api/ordens-servico').subscribe();

    const original = httpMock.expectOne('/api/ordens-servico');
    expect(original.request.headers.get('Authorization')).toBe('Bearer access-token');
    original.flush({ message: 'expirado' }, { status: 401, statusText: 'Unauthorized' });

    const retry = httpMock.expectOne('/api/ordens-servico');
    expect(retry.request.headers.get('Authorization')).toBe('Bearer token-renovado');
    retry.flush([]);
  });

  it('deve limpar sessao e navegar para login se refresh falhar', () => {
    auth.refresh.mockReturnValue(throwError(() => new Error('refresh falhou')));
    http.get('/api/usuarios').subscribe({ error: () => undefined });

    httpMock.expectOne('/api/usuarios').flush(
      { message: 'expirado' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(auth.clearSession).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
