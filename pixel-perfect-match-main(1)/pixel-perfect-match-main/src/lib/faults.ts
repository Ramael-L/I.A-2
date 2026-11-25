import { simulateReply, type Reply } from '@/lib/riwimate';
import { BOARD_SOURCE, BOARD_TASKS, boardReply } from '@/lib/board';

export type FaultKind = 'offline' | 'timeout' | 'missing' | 'invalid';
export type Fault = {
  kind: FaultKind;
  icon: string;
  label: string;
  hint: string;
  /** Example question used when the scenario is launched from the simulator menu. */
  sample: string;
  chip: string;
  message: string;
  detail?: string;
  source: string;
};

export const FAULT_ORDER: FaultKind[] = ['offline', 'timeout', 'missing', 'invalid'];
export const OFFLINE_BANNER = '📡 Sin conexión a internet. Tu mensaje quedó guardado y se enviará cuando vuelvas a estar en línea.';
export const DEFAULT_RECOVERY_QUESTION = '¿Qué debo entregar primero hoy?';

export const FAULTS: Record<FaultKind, Fault> = {
  offline: {
    kind: 'offline', icon: '📡', label: 'Sin conexión a internet', hint: 'Offline · el mensaje queda guardado',
    sample: DEFAULT_RECOVERY_QUESTION, chip: '📡 Sin conexión',
    message: 'No pude enviar tu mensaje porque tu dispositivo perdió la conexión a internet. No es tu culpa y no se perdió nada: lo guardé y lo envío apenas vuelvas a estar en línea.',
    detail: 'Mientras tanto no puedo consultar tu cronograma, así que no te voy a dar fechas a ciegas.',
    source: 'Estado de conexión de tu dispositivo · simulación sin acceso a Moodle',
  },
  timeout: {
    kind: 'timeout', icon: '⏱️', label: 'Moodle caído · error del servidor', hint: 'Timeout · tiempo de espera agotado',
    sample: '¿Cuánto tiempo necesito para el taller de SQL?', chip: '⚠️ Problema técnico',
    message: '⚠️ Tuvimos un problema técnico conectando con el cronograma de Moodle (tiempo de espera agotado).',
    detail: 'No es tu culpa y no voy a adivinar tus fechas mientras tanto. Reintenta en un momento; si sigue fallando, repórtaselo a Felonius Gru para que no te afecte la entrega.',
    source: 'Conexión con el cronograma Moodle · simulación de tiempo de espera agotado',
  },
  missing: {
    kind: 'missing', icon: '🤔', label: 'Dato inexistente', hint: 'Cero alucinaciones · no invento fechas',
    sample: '¿Cuándo es el examen de física?', chip: '🤔 Dato no encontrado',
    message: "🤔 No encuentro entregas de 'Física' en tu cronograma de la Semana 3 y no voy a inventar fechas. ¿Quieres escribir la fecha límite para ayudarte a priorizarla?",
    source: BOARD_SOURCE,
  },
  invalid: {
    kind: 'invalid', icon: '😅', label: 'Entrada inválida', hint: 'Mensaje sin sentido · ej. asdfghjkl',
    sample: 'asdfghjkl', chip: '😅 No entendí',
    message: '😅 No logré entender esa consulta, coder. Intenta preguntarme por una materia (ej. SQL, Inglés, DOM) o haz clic en una sugerencia.',
    source: 'Tu consulta · sin coincidencias en el cronograma de la Semana 3',
  },
};

export const INVALID_SUGGESTIONS = ['¿Cuánto tiempo necesito para el taller de SQL?', '¿Qué me falta por entregar en Inglés?', 'Dame pistas para el reto del DOM'];

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const OFFLINE = /sin (internet|conexion|red|wifi|datos)|\boff ?line\b|no tengo (internet|conexion|wifi|red)|se (me )?(fue|cayo) (el |la )?(internet|wifi|red)/;
const TIMEOUT = /error\s*500|\b(caid[oa]s?|se cayo)\b|time ?out|tiempo de espera|servidor/;
const MISSING = /\b(fisica|quimica|biologia)\b/;
const DURATION = /(?:en|faltan?|vence(?: en)?)\s*\d+(?:[.,]\d+)?\s*(?:horas?|h\b|dias?)/;
const MASH = /asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwer|wert|zxcv|xcvb/;
const FAULT_WORDS = new RegExp(`${OFFLINE.source}|${TIMEOUT.source}|tuve un problema( tecnico)?( de conexion)?|estoy|ando`, 'g');

function looksLikeGibberish(q: string) {
  if (MASH.test(q) || /([a-z])\1{4,}/.test(q)) return true;
  const words = q.match(/[a-zñ]+/g);
  return !!words && words.every(w => w.length >= 5 && !/[aeiou]/.test(w));
}

/** Detects the edge case a typed message should trigger, or null for a normal question. */
export function detectFault(text: string): FaultKind | null {
  const q = norm(text);
  if (OFFLINE.test(q)) return 'offline';
  if (TIMEOUT.test(q)) return 'timeout';
  if (MISSING.test(q) && !DURATION.test(q)) return 'missing';
  if (looksLikeGibberish(q)) return 'invalid';
  return null;
}

/** Subject the "missing data" card names, e.g. 'Física'. */
export function missingSubject(text: string) {
  const m = norm(text).match(MISSING);
  const names: Record<string, string> = { fisica: 'Física', quimica: 'Química', biologia: 'Biología' };
  return names[m?.[1] ?? 'fisica'] ?? 'Física';
}

export function faultMessage(kind: FaultKind, question: string) {
  return kind === 'missing' ? FAULTS.missing.message.replace("'Física'", `'${missingSubject(question)}'`) : FAULTS[kind].message;
}

/** Reply shown after "Reintentar": the network is back, so the saved question gets answered from the board. */
export function recoveredReply(question: string, kind: 'offline' | 'timeout'): Reply {
  const cleaned = norm(question).replace(FAULT_WORDS, ' ').replace(/[^a-z0-9ñ?¿ ]/g, ' ').replace(/\s+/g, ' ').trim();
  const meaningful = BOARD_TASKS.some(t => t.keys.test(cleaned)) || /prioridad|primero|urgente|organiza|entreg|codigo|pistas?/.test(cleaned);
  let reply = meaningful ? boardReply(cleaned) : null;
  if (!reply || reply.state === 'error') reply = boardReply(DEFAULT_RECOVERY_QUESTION);
  const prefix = kind === 'offline' ? '✅ Volviste a estar en línea y envié tu mensaje guardado.' : '✅ Listo, esta vez el cronograma de Moodle sí respondió.';
  return { ...reply, intro: `${prefix} ${reply.intro}` };
}

/** Normal reply; a subject missing from the board but with a user-given deadline is prioritised from that deadline. */
export function replyFor(text: string): Reply {
  const q = norm(text);
  return MISSING.test(q) && DURATION.test(q) ? simulateReply(text) : boardReply(text);
}
