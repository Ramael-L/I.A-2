import { describe, expect, it } from 'vitest';
import { priorityFor, RESPONSE_DELAY_MS, simulateReply } from '@/lib/riwimate';
describe('RiwiMate workshop rules', () => {
  it('simulates 1.2 seconds of loading', () => expect(RESPONSE_DELAY_MS).toBe(1200));
  it('marks less than 24 hours red', () => { expect(priorityFor(23)).toBe('alta'); expect(priorityFor(24)).not.toBe('alta'); });
  it('marks two to four days yellow', () => { expect(priorityFor(48)).toBe('media'); expect(priorityFor(96)).toBe('media'); expect(priorityFor(97)).not.toBe('media'); });
  it('marks five days and above green', () => { expect(priorityFor(120)).toBe('baja'); expect(priorityFor(119)).not.toBe('baja'); });
  it('provides at most three conceptual hints without full code', () => { const reply = simulateReply('Pásame el código completo del DOM'); expect(reply.state).toBe('guardrail'); expect(reply.hints).toHaveLength(3); expect(reply.hints.some(h => /const |=>|function\s*\(/.test(h))).toBe(false); });
  it.each(['urgencias', 'médico', 'nota', 'error'])('escalates %s to the human TL', word => { const reply = simulateReply(`Ayúdame con ${word}`); expect(reply.state).toBe('error'); expect(reply.hints).toEqual([]); });
  it('keeps unknown facts unknown', () => { expect(simulateReply('Cuándo vence el quiz de física').state).toBe('respuesta'); expect(simulateReply('Cuándo vence el quiz de física').hints).toEqual([]); });
});