import { TempoTrabalhadoPipe } from './tempo-trabalhado.pipe';

describe('TempoTrabalhadoPipe', () => {
  const pipe = new TempoTrabalhadoPipe();

  it('deve retornar zero para valores ausentes ou invalidos', () => {
    expect(pipe.transform(null)).toBe('0h');
    expect(pipe.transform(undefined)).toBe('0h');
    expect(pipe.transform('abc')).toBe('0h');
    expect(pipe.transform(-1)).toBe('0h');
  });

  it('deve formatar somente minutos quando menor que uma hora', () => {
    expect(pipe.transform(0.5)).toBe('30min');
    expect(pipe.transform(0.25)).toBe('15min');
  });

  it('deve formatar somente horas quando nao ha minutos restantes', () => {
    expect(pipe.transform(2)).toBe('2h');
    expect(pipe.transform('3')).toBe('3h');
  });

  it('deve formatar horas e minutos com padding', () => {
    expect(pipe.transform(1.5)).toBe('1h 30min');
    expect(pipe.transform(2.1)).toBe('2h 06min');
  });
});
