import type { Reply } from '@/lib/riwimate';
import { simulateReply } from '@/lib/riwimate';

export const BOARD_SOURCE = 'Cronograma Moodle · Semana 3';
type Level = 'alta' | 'media' | 'baja';
export type BoardTask = { subject: string; title: string; due: string; time: string; priority: Level; keys: RegExp };
const label: Record<Level, string> = { alta: 'Prioridad Alta 🔴', media: 'Prioridad Media 🟡', baja: 'Prioridad Baja 🟢' };

/** The 8 deliveries shown in the right-hand board (Semana 3). */
export const BOARD_TASKS: BoardTask[] = [
  { subject: 'JavaScript', title: 'Reto diario: Manipulación del DOM', due: 'hoy a las 11:59 p.m.', time: '2h 30m', priority: 'alta', keys: /javascript|\bjs\b|\bdom\b/ },
  { subject: 'Control de versiones', title: 'Git: ramas y Pull Request del proyecto', due: 'hoy a las 9:00 p.m.', time: '40m', priority: 'alta', keys: /\bgit\b|control de versiones|pull request|ramas/ },
  { subject: 'Bases de datos', title: 'Taller SQL: consultas con JOIN', due: 'mañana a las 8:00 a.m.', time: '1h 45m', priority: 'alta', keys: /\bsql\b|bases? de datos|\bjoins?\b/ },
  { subject: 'Inglés', title: 'Video speaking: “My daily routine”', due: 'el sábado a las 11:59 p.m.', time: '50 minutos', priority: 'media', keys: /ingles|english|speaking/ },
  { subject: 'HTML y CSS', title: 'Proyecto integrador: maquetación responsive', due: 'el lunes a las 7:00 a.m.', time: '3h', priority: 'media', keys: /\bhtml\b|\bcss\b|maquetacion|responsive|integrador/ },
  { subject: 'Lectura complementaria', title: 'Clean Code, cap. 2: “Nombres con sentido”', due: 'el martes a las 11:59 p.m.', time: '30m', priority: 'baja', keys: /lectura|clean code/ },
  { subject: 'JavaScript · complementario', title: 'Video: el Event Loop explicado', due: 'sin fecha límite', time: '25m', priority: 'baja', keys: /javascript|\bjs\b|event loop/ },
  { subject: 'Habilidades blandas', title: 'Reflexión semanal de habilidades blandas', due: 'el jueves 26 a las 6:00 p.m.', time: '20m', priority: 'baja', keys: /habilidades blandas|blandas|reflexion|soft skills/ },
];

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const DELICATE = /\b(urgencias?|medic[oa]s?|notas?|salud|incapacidad|calamidad|ansiedad|depresion|conexion|internet|500|caid[oa]|servidor)\b|error|cambi.*fecha|mover.*fecha|excus[ao]/;
const CODE_REQUEST = /\b(codigo|solucion|resuelve|resuelvelo|hazme|copiar|pistas?|bucle|funcion)\b/;
const ASKS_SUBJECT = /\b(que (me )?(falta|tengo|debo)|pendiente|entregas? de|tareas? de|cuanto tiempo|cuando vence)\b/;

export function boardReply(question: string): Reply {
  const q = norm(question);
  if (DELICATE.test(q)) {
    const network = /conexion|internet|500|caid|servidor|error/.test(q) && !/medic|urgencia|salud|nota/.test(q);
    if (network) return { state: 'error', intro: 'Uy, coder, eso suena a un problema técnico que no puedo revisar ni resolver desde aquí. No puedo confirmar si tu entrega quedó registrada ni mover la fecha. Reintenta en un momento y, si sigue fallando, avísale a Felonius Gru con una captura del error.', hints: [], source: BOARD_SOURCE };
    return simulateReply(question);
  }
  if (CODE_REQUEST.test(q)) return simulateReply(`${question} codigo`);

  const matches = BOARD_TASKS.filter(t => t.keys.test(q));
  if (matches.length) {
    const lines = matches.map(t => `**${t.title}** (${label[t.priority]}). Vence ${t.due} y te tomará unos **${t.time}**.`);
    const subj = (matches[0]?.subject ?? '').split(' · ')[0];
    const intro = matches.length === 1
      ? `En ${subj} tienes pendiente el ${lines[0]}`
      : `En ${subj} tienes ${matches.length} entregas: ${lines.map((l, i) => `${i + 1}) ${l}`).join(' ')}`;
    return { state: 'respuesta', intro: `${intro} ¡Tú puedes, coder! 💜`, hints: [], source: BOARD_SOURCE };
  }
  if (/prioridad|primero|urgente|organiza|hoy/.test(q)) {
    const high = BOARD_TASKS.filter(t => t.priority === 'alta');
    return { state: 'respuesta', intro: `¡Vamos con orden, coder! Tus 3 entregas de **Prioridad Alta 🔴** son: ${high.map((t, i) => `${i + 1}) **${t.title}** · ${t.time}`).join(' ')}. ¿En cuál tema sientes más falencias hoy? Empieza por ese.`, hints: [], source: BOARD_SOURCE };
  }
  if (ASKS_SUBJECT.test(q) || /\b(python|java|react|matematicas?|fisica|quiz)\b/.test(q)) {
    return { state: 'respuesta', intro: 'No encuentro entregas de ese tema en tu tablero de la Semana 3 y no voy a inventar fechas. ¿Quieres escribirla con su fecha para priorizarla?', hints: [], source: BOARD_SOURCE };
  }
  return simulateReply(question);
}
