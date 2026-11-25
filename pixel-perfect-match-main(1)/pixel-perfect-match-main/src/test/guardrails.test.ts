import { describe, expect, it } from 'vitest';
import { aviso, preguntaPorSesgo, protegerDatos, requiereHumano, testSesgoEnPareja, TEMAS_HUMANOS } from '@/lib/guardrails';

describe('protegerDatos (Ley 1581)', () => {
  it('enmascara correos', () => {
    expect(protegerDatos('escríbeme a nikola.tesla@riwi.io')).toBe('escríbeme a [correo]');
  });
  it('enmascara celulares colombianos de 10 dígitos que empiezan por 3', () => {
    expect(protegerDatos('mi cel es 3001234567')).toBe('mi cel es [celular]');
  });
  it('enmascara otros números de 6 a 10 dígitos como documento', () => {
    expect(protegerDatos('cédula 1036654321')).toBe('cédula [documento]');
    expect(protegerDatos('TI 123456')).toBe('TI [documento]');
  });
  it('respeta el orden correo → celular → documento', () => {
    expect(protegerDatos('a@b.co 3109876543 98765432')).toBe('[correo] [celular] [documento]');
  });
  it('no toca números cortos como horas o errores', () => {
    expect(protegerDatos('error 500 en 48 horas')).toBe('error 500 en 48 horas');
  });
});

describe('requiereHumano', () => {
  it.each(TEMAS_HUMANOS)('deriva a humano el tema %s', (tema) => {
    expect(requiereHumano(`Tengo una duda sobre ${tema}`)).toBe(true);
  });
  it('no deriva preguntas académicas normales', () => {
    expect(requiereHumano('¿Qué debo entregar primero hoy?')).toBe(false);
  });
});

describe('aviso', () => {
  it('con fuentes', () => {
    expect(aviso(['Moodle', 'MDN'])).toBe('Respuesta generada con IA a partir de 2 fuentes: Moodle, MDN. Verifica la información.');
  });
  it('sin fuentes', () => {
    expect(aviso([])).toBe('Respuesta generada con IA sin fuentes: no la uses para decisiones importantes.');
  });
});

describe('control de sesgos', () => {
  it('detecta comparaciones y preguntas por sesgo', () => {
    expect(preguntaPorSesgo('¿Por qué voy peor que otro coder?')).toBe(true);
    expect(preguntaPorSesgo('¿Hay sesgo en mi ruta?')).toBe(true);
  });
  it('dos perfiles con las mismas entregas reciben la misma recomendación', () => {
    const r = testSesgoEnPareja();
    expect(r.a.genero).not.toBe(r.b.genero);
    expect(r.iguales).toBe(true);
    expect(r.recA.orden[0]).toBe('Git: ramas y Pull Request');
  });
});
