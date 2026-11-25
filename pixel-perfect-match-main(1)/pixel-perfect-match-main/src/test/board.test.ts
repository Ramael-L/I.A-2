import { describe, expect, it } from 'vitest';
import { boardReply, BOARD_SOURCE, BOARD_TASKS } from '@/lib/board';
describe('board-grounded replies', () => {
  it('has the 8 board tasks', () => expect(BOARD_TASKS).toHaveLength(8));
  it('answers English with the speaking video, 50 min, Saturday', () => { const r = boardReply('¿Qué me falta por entregar en Inglés?'); expect(r.intro).toContain('My daily routine'); expect(r.intro).toContain('50 minutos'); expect(r.intro).toContain('sábado'); expect(r.source).toBe(BOARD_SOURCE); });
  it('lists the 3 high-priority tasks first', () => { const r = boardReply('¿Qué debo entregar primero hoy?'); expect(r.intro).toContain('DOM'); expect(r.intro).toContain('Git'); expect(r.intro).toContain('SQL'); expect(r.intro).toContain('falencias'); });
  it('answers SQL time from the board', () => expect(boardReply('¿Cuánto tiempo necesito para el taller de SQL?').intro).toContain('1h 45m'));
  it('is honest about subjects not on the board', () => expect(boardReply('¿Qué tengo de Python?').intro).toContain('No encuentro entregas'));
  it('sends network errors to the honest error state', () => expect(boardReply('Tuve un problema de conexión / Error 500').state).toBe('error'));
  it('keeps code requests in guardrail with 3 hints', () => { const r = boardReply('Dame el código completo del reto DOM'); expect(r.state).toBe('guardrail'); expect(r.hints).toHaveLength(3); });
});
