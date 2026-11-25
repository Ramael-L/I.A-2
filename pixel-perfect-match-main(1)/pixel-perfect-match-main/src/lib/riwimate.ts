export const RESPONSE_DELAY_MS = 1200;
export type Priority = 'alta' | 'media' | 'baja' | 'sin-clasificar';
export function priorityFor(hours: number, dailyChallenge = false, reading = false): Priority {
  if (dailyChallenge || hours < 24) return 'alta';
  if (reading) return 'baja';
  if (hours >= 48 && hours <= 96) return 'media';
  if (hours >= 120) return 'baja';
  return 'sin-clasificar';
}
export type Reply = { state: 'respuesta' | 'guardrail' | 'error'; intro: string; hints: string[]; source: string; url?: string; priority?: Priority };
export function simulateReply(question: string): Reply {
  const q = question.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  if (/\b(urgencias?|medic[oa]s?|notas?|error(?:es)?|salud|incapacidad|calamidad|ansiedad|depresion)\b|cambi.*fecha|mover.*fecha|excus[ao]/.test(q)) {
    return { state: 'error', intro: 'Te acompaño, pero esto requiere a Felonius Gru, tu TL. No puedo aprobar excusas, cambiar notas o fechas ni tomar decisiones sobre ti. No compartas datos médicos aquí. Tú decides qué contarle directamente.', hints: [], source: 'Límites del prototipo RiwiMate · control humano. Confirma el procedimiento con tu TL; no tengo acceso al reglamento oficial.' };
  }
  if (/\b(codigo|dom|javascript|sql|git|css|html|pistas?|programar|reto|for|funcion|bucle)\b/.test(q) && !/prioridad|entreg|organiza|vence/.test(q)) {
    let hints = ['Separa la entrada, la transformación y el resultado esperado. ¿Qué debe pasar antes de escribir código?', 'Divide el problema en pasos pequeños. ¿Cuál puedes probar por separado?', 'Prueba un caso normal y uno límite con tu propio intento. ¿Qué resultado esperabas?'];
    let url = 'https://developer.mozilla.org/es/docs/Learn_web_development';
    let source = 'MDN Web Docs · aprendizaje de desarrollo web';
    if (/dom|javascript/.test(q)) { hints = ['Identifica los elementos que vas a modificar. ¿Cómo obtendrías una referencia con querySelector?', 'Piensa en el evento que dispara el cambio. ¿Necesitas submit o click?', 'Crea el elemento, completa su contenido y adjúntalo. ¿En qué contenedor debe aparecer?']; url = 'https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction'; source = 'MDN Web Docs · Introducción al DOM'; }
    if (/sql/.test(q)) { hints = ['Dibuja las tablas y su columna compartida. ¿Qué clave las relaciona?', 'Decide qué filas necesitas conservar. ¿Qué diferencia hay entre INNER JOIN y LEFT JOIN?', 'Comprueba una relación con datos pequeños. ¿Una clave repetida multiplica las filas?']; url = 'https://www.postgresql.org/docs/current/tutorial-join.html'; source = 'PostgreSQL · Tutorial de joins'; }
    if (/git/.test(q)) { hints = ['Revisa la rama de origen. ¿Desde dónde debería empezar tu cambio?', 'Separa tu trabajo en una rama propia. ¿Qué cambio concreto debe contener?', 'Revisa las diferencias antes del Pull Request. ¿A qué rama volverá tu trabajo?']; url = 'https://git-scm.com/book/es/v2/Ramificaciones-en-Git-Ramas-en-pocas-palabras'; source = 'Pro Git · Ramas en pocas palabras'; }
    return { state: 'guardrail', intro: '¡Vamos paso a paso, coder! No te paso una solución completa: te dejo tres pistas para que el logro sea tuyo. Después, comparte tu intento.', hints: hints.slice(0, 3), source, url };
  }
  const duration = q.match(/(?:en|faltan?|vence(?: en)?)\s*(\d+(?:[.,]\d+)?)\s*(horas?|h\b|dias?)/);
  if (duration?.[1] && duration[2]) {
    const hours = Number(duration[1].replace(',', '.')) * (/dia/.test(duration[2]) ? 24 : 1);
    const priority = priorityFor(hours, /reto.*(?:dia|hoy)/.test(q), /lectura.*complementaria/.test(q));
    const labels = { alta: '🔴 Alta: menos de 24 h o reto del día.', media: '🟡 Media: entre 2 y 4 días.', baja: '🟢 Baja: 5 días o más, o lectura complementaria.', 'sin-clasificar': 'Ese plazo no está cubierto por las reglas del taller. Confirma la prioridad con tu TL.' };
    return { state: 'respuesta', intro: `¡Bien, coder! ${labels[priority]} El plazo viene de tu pregunta, no de Moodle. Divide la tarea en un primer paso concreto y confirma la fecha oficial antes de organizarte.`, priority, hints: [], source: 'Tu consulta · plazo indicado por ti + reglas de prioridad del taller (maqueta, sin conexión a Moodle).' };
  }
  if (/prioridad|entreg|organiza|semana|primero|materia/.test(q)) return { state: 'respuesta', intro: '¡Vamos con orden! En el cronograma de ejemplo: primero DOM (2 h 30 min), Git (40 min) y SQL (1 h 45 min). Luego Inglés y maquetación; al final las lecturas. Si hay varias urgentes, empieza por el tema que más te cuesta. Son datos de demostración, no tus entregas reales.', hints: [], source: 'Cronograma de ejemplo incluido en RiwiMate · Semana 3. Comprueba las fechas reales en tu Moodle.' };
  return { state: 'respuesta', intro: '¡Qué más, coder! No encuentro ese dato en el cronograma de ejemplo y no voy a inventarlo. Cuéntame la tarea y su plazo, o pide pistas sobre DOM, SQL o Git. Si necesitas confirmar información del clan, habla con Felonius Gru.', hints: [], source: 'Tu consulta + cronograma de ejemplo RiwiMate · dato no encontrado; sin conexión a Moodle.' };
}