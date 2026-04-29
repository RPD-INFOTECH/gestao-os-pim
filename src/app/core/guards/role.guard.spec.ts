import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard } from './role.guard';
import { AuthService } from '@core/auth/auth.service';
import { Perfil } from '@core/models/perfil.enum';

describe('roleGuard', () => {
  it('deve permitir quando perfil atual esta entre os perfis aceitos', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentPerfil: () => Perfil.GESTOR } },
        { provide: Router, useValue: { createUrlTree: vi.fn() } },
      ],
    });

    const guard = roleGuard(Perfil.GESTOR, Perfil.SUPERVISOR);
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('deve redirecionar para 403 quando perfil nao tem permissao', () => {
    const tree = { redirectTo: '/403' };
    const router = { createUrlTree: vi.fn().mockReturnValue(tree) };
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { currentPerfil: () => Perfil.TECNICO } },
        { provide: Router, useValue: router },
      ],
    });

    const guard = roleGuard(Perfil.GESTOR);
    const result = TestBed.runInInjectionContext(() => guard({} as any, {} as any));

    expect(result).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/403']);
  });
});
