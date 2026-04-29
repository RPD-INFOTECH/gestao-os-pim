import { StatusLabelPipe } from './status-label.pipe';

describe('StatusLabelPipe', () => {
  const pipe = new StatusLabelPipe();

  it('deve retornar marcador para valor ausente', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
    expect(pipe.transform('')).toBe('—');
  });

  it('deve traduzir status conhecidos', () => {
    expect(pipe.transform('EM_ANDAMENTO')).toBe('EM ANDAMENTO');
    expect(pipe.transform('AGUARDANDO_PECA')).toBe('AGUARDANDO PEÇA');
    expect(pipe.transform('CONCLUIDA')).toBe('CONCLUÍDA');
  });

  it('deve formatar status desconhecido trocando underscore por espaco', () => {
    expect(pipe.transform('AGUARDANDO_TERCEIRO')).toBe('AGUARDANDO TERCEIRO');
  });
});
