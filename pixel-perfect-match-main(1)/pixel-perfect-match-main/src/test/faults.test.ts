import { describe, expect, it } from 'vitest';
import { detectFault, faultMessage, FAULTS, OFFLINE_BANNER, recoveredReply, replyFor } from '@/lib/faults';

describe('Simulador de errores y casos borde', () => {
  it.each(['Estoy sin internet', 'quedé offline', 'Sin conexión otra vez'])('"%s" activa la tarjeta sin conexión', t => expect(detectFault(t)).toBe('offline'));
  it.each(['Me sale error 500', 'Moodle está caído', 'Se cayó el servidor'])('"%s" activa la tarjeta de Moodle caído', t => expect(detectFault(t)).toBe('timeout'));
  it.each(['asdf', 'asdfghjkl', 'qwerty'])('"%s" activa la tarjeta de entrada inválida', t => expect(detectFault(t)).toBe('invalid'));
  it('la pregunta de física activa el dato inexistente', () => expect(detectFault('¿Cuándo es el examen de física?')).toBe('missing'));
  it.each(['¿Qué me falta por entregar en Inglés?', 'html', 'Dame pistas de SQL'])('"%s" sigue siendo una pregunta normal', t => expect(detectFault(t)).toBeNull());
  it('el banner offline dice que el mensaje quedó guardado', () => expect(OFFLINE_BANNER).toContain('Tu mensaje quedó guardado'));
  it('el timeout menciona el cronograma de Moodle', () => expect(FAULTS.timeout.message).toContain('tiempo de espera agotado'));
  it('física no inventa fechas y cita la Semana 3', () => { expect(faultMessage('missing', '¿Cuándo es el examen de física?')).toContain("'Física'"); expect(FAULTS.missing.message).toContain('no voy a inventar fechas'); expect(FAULTS.missing.source).toBe('Cronograma Moodle · Semana 3'); });
  it('reintentar sin internet responde la consulta guardada', () => { const r = recoveredReply('¿Cuánto tiempo necesito para el taller de SQL?', 'offline'); expect(r.state).toBe('respuesta'); expect(r.intro).toContain('1h 45m'); });
  it('reintentar un error 500 ya no devuelve otro error', () => expect(recoveredReply('Tuve un problema de conexión / Error 500', 'timeout').state).not.toBe('error'));
});
describe('fecha escrita por el usuario', () => {
  it('física con plazo propio ya no repite el dato inexistente y se prioriza', () => {
    expect(detectFault('El examen de física vence en 3 dias')).toBeNull();
    const r = replyFor('El examen de física vence en 3 dias');
    expect(r.priority).toBe('media');
  });
});
