import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ConfirmationService] });
    service = TestBed.inject(ConfirmationService);
  });

  it('deve abrir confirmacao ativa', () => {
    service.confirm({ title: 'Confirmar', message: 'Deseja continuar?' });

    expect(service.active()?.title).toBe('Confirmar');
    expect(service.active()?.message).toBe('Deseja continuar?');
  });

  it('deve resolver true ao aceitar', async () => {
    const promise = service.confirm({ title: 'Confirmar', message: 'Salvar?' });

    service.accept();

    await expect(promise).resolves.toBe(true);
    expect(service.active()).toBeNull();
  });

  it('deve resolver false ao cancelar', async () => {
    const promise = service.confirm({ title: 'Confirmar', message: 'Cancelar?' });

    service.cancel();

    await expect(promise).resolves.toBe(false);
    expect(service.active()).toBeNull();
  });

  it('deve ignorar accept e cancel sem confirmacao ativa', () => {
    service.accept();
    service.cancel();

    expect(service.active()).toBeNull();
  });
});
