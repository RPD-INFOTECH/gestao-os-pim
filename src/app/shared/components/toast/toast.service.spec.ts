import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('deve registrar mensagens success, error e info', () => {
    service.success('Salvo');
    service.error('Erro');
    service.info('Info');

    expect(service.messages()).toEqual([
      { id: 1, kind: 'success', text: 'Salvo' },
      { id: 2, kind: 'error', text: 'Erro' },
      { id: 3, kind: 'info', text: 'Info' },
    ]);
  });

  it('deve remover mensagem manualmente', () => {
    service.success('Salvo');
    service.error('Erro');

    service.dismiss(1);

    expect(service.messages()).toEqual([{ id: 2, kind: 'error', text: 'Erro' }]);
  });

  it('deve remover mensagem automaticamente depois do timeout', () => {
    service.info('Processando');

    vi.advanceTimersByTime(4000);

    expect(service.messages()).toEqual([]);
  });
});
