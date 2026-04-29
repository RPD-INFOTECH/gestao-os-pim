import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuarioService } from './usuario.service';
import { Perfil } from '@core/models/perfil.enum';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsuarioService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar usuarios', () => {
    service.list().subscribe((usuarios) => expect(usuarios.length).toBe(1));

    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: '1', nome: 'Usuario' }]);
  });

  it('deve buscar usuario por id', () => {
    service.getById('user-1').subscribe();

    const req = httpMock.expectOne('/api/usuarios/user-1');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve buscar detalhes do usuario', () => {
    service.getDetails('user-1').subscribe();

    const req = httpMock.expectOne('/api/usuarios/user-1/detalhes');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve criar usuario sem exigir matricula no front', () => {
    service.create({
      nome: 'Tecnico Novo',
      email: 'tecnico@teste.local',
      senha: 'senha123',
      perfil: Perfil.TECNICO,
      setor: 'Manutencao',
    }).subscribe();

    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nome: 'Tecnico Novo',
      email: 'tecnico@teste.local',
      senha: 'senha123',
      perfil: Perfil.TECNICO,
      setor: 'Manutencao',
    });
    req.flush({});
  });

  it('deve atualizar usuario', () => {
    service.update('user-1', { setor: 'Operacao' }).subscribe();

    const req = httpMock.expectOne('/api/usuarios/user-1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ setor: 'Operacao' });
    req.flush({});
  });

  it('deve desativar usuario por delete logico', () => {
    service.delete('user-1').subscribe();

    const req = httpMock.expectOne('/api/usuarios/user-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
