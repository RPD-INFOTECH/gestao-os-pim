import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { HistoricoOsService } from '../../../core/services/historico-os.service';
import { OrdemServicoService } from '../../../core/services/ordem-servico.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Perfil } from '../../../core/models/perfil.enum';

@Injectable({ providedIn: 'root' })
export class OsDetailsFacade {
  private osService = inject(OrdemServicoService);
  private usuarioService = inject(UsuarioService);
  private historicoService = inject(HistoricoOsService);

  load(id: string, perfil: Perfil | null) {
    return this.osService.getById(id).pipe(
      map((ordem) =>
        forkJoin({
          ordem: of(ordem),
          historico:
            perfil === Perfil.SOLICITANTE
              ? of([])
              : this.historicoService.byOs(ordem.id).pipe(catchError(() => of([]))),
          apontamentos:
            perfil === Perfil.SOLICITANTE
              ? of([])
              : this.osService.listarApontamentos(ordem.id).pipe(catchError(() => of([]))),
          tecnicos:
            perfil === Perfil.SUPERVISOR
              ? this.usuarioService
                  .list()
                  .pipe(
                    map((users) => users.filter((u) => u.perfil === Perfil.TECNICO && u.ativo)),
                    catchError(() => of([]))
                  )
              : of([]),
        })
      )
    );
  }
}
