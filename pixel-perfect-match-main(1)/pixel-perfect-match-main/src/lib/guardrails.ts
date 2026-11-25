import { priorityFor, type Priority } from '@/lib/riwimate';

/* =========================================================================
   RiwiMate · Reglas verificables de IA responsable (Sesión 5 + clan)
   Módulo puro: sin DOM ni red, para poder probar cada regla con tests.
   ========================================================================= */

// ---------- 1. Privacidad y consentimiento (Ley 1581 de 2012) ----------
export const AVISO_PRIVACIDAD = '🔒 Privacidad protegida (Ley 1581 de 2012): ocultamos tus datos personales antes de procesar la consulta.';
export const TEXTO_CONSENTIMIENTO = 'Al conversar con RiwiMate aceptas el tratamiento de consultas académicas sin almacenamiento de datos personales · Ley 1581 de 2012';

const CORREO = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const CELULAR = /\b3\d{9}\b/g;
const DOCUMENTO = /\b\d{6,10}\b/g;

/** Enmascara datos personales en este orden exacto: correo → celular → documento. */
export function protegerDatos(texto: string): string {
  return texto.replace(CORREO, '[correo]').replace(CELULAR, '[celular]').replace(DOCUMENTO, '[documento]');
}

export function contieneDatosPersonales(texto: string): boolean {
  return protegerDatos(texto) !== texto;
}

// ---------- 3. Control humano en alto impacto ----------
export const TEMAS_HUMANOS = ['salud', 'dolor', 'medicamento', 'nota', 'notas', 'permanencia', 'sacar', 'dinero', 'subsidio', 'excusa'] as const;

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Tema crítico detectado (palabra completa, admite plural), o null. */
export function temaHumano(pregunta: string): string | null {
  const words = norm(pregunta).match(/[a-zñ]+/g) ?? [];
  return TEMAS_HUMANOS.find(t => words.some(w => w === t || w === `${t}s` || w === `${t}es`)) ?? null;
}

/** true cuando la pregunta toca un tema de alto impacto que decide una persona real. */
export function requiereHumano(pregunta: string): boolean {
  return temaHumano(pregunta) !== null;
}

// ---------- 4. Divulgación y transparencia ----------
export function aviso(fuentes: string[]): string {
  return fuentes.length
    ? `Respuesta generada con IA a partir de ${fuentes.length} fuentes: ${fuentes.join(", ")}. Verifica la información.`
    : 'Respuesta generada con IA sin fuentes: no la uses para decisiones importantes.';
}

// ---------- 2. Control de sesgos y explicabilidad ----------
const SESGO = /sesgo|discrimin|injust|(voy|estoy|me va|salgo) (peor|mejor)|peor que|mejor que|compar\w*.*(companer|otr[oa]s? coder|otr[oa]s?)|por ?que tengo (esta |esa )?prioridad|por ?que (es|esta|sale|aparece) (en )?(alta|media|baja)|por ?que (mi|me) (ruta|prioridad)/;

/** El coder pregunta por su prioridad, se compara con otro o sospecha sesgo. */
export function preguntaPorSesgo(texto: string): boolean {
  return SESGO.test(norm(texto));
}

export const REGLAS_OBJETIVAS = [
  '🔴 Alta: vence en menos de 24 h o es el reto del día.',
  '🟡 Media: vence entre 2 y 4 días.',
  '🟢 Baja: 5 días o más, o lectura complementaria.',
  '⏱ Horas estimadas de cada entrega del tablero para ordenar el día.',
];
export const ATRIBUTOS_IGNORADOS = ['nombre', 'género', 'edad', 'barrio'] as const;

export type EntregaObjetiva = { titulo: string; horasParaVencer: number; horasEstimadas: number; retoDelDia?: boolean; lectura?: boolean };
export type PerfilCoder = { nombre: string; genero: string; edad: number; barrio: string; entregas: EntregaObjetiva[] };
export type Recomendacion = { orden: string[]; prioridades: Record<string, Priority>; horasUrgentes: number; mensaje: string };

const RANK: Record<Priority, number> = { alta: 0, media: 1, 'sin-clasificar': 2, baja: 3 };

/** Recomienda la ruta del día usando SOLO métricas del tablero (fechas, horas, prioridad). */
export function recomendarRuta(perfil: PerfilCoder): Recomendacion {
  const { entregas } = perfil; // nombre, género, edad y barrio nunca se leen
  const prioridades: Record<string, Priority> = {};
  for (const e of entregas) prioridades[e.titulo] = priorityFor(e.horasParaVencer, e.retoDelDia, e.lectura);
  const orden = [...entregas]
    .sort((a, b) => RANK[prioridades[a.titulo] ?? 'baja'] - RANK[prioridades[b.titulo] ?? 'baja'] || a.horasParaVencer - b.horasParaVencer)
    .map(e => e.titulo);
  const horasUrgentes = entregas.filter(e => prioridades[e.titulo] === 'alta').reduce((sum, e) => sum + e.horasEstimadas, 0);
  const mensaje = `Empieza por «${orden[0] ?? 'tu próxima entrega'}». Tienes ${horasUrgentes} h de trabajo en Prioridad Alta 🔴.`;
  return { orden, prioridades, horasUrgentes, mensaje };
}

/** Entregas de ejemplo de la Semana 3 con datos numéricos para el test de sesgo. */
export const ENTREGAS_PAREJA: EntregaObjetiva[] = [
  { titulo: 'Reto diario: Manipulación del DOM', horasParaVencer: 13, horasEstimadas: 2.5, retoDelDia: true },
  { titulo: 'Git: ramas y Pull Request', horasParaVencer: 10, horasEstimadas: 0.75 },
  { titulo: 'Taller SQL: consultas con JOIN', horasParaVencer: 21, horasEstimadas: 1.75 },
  { titulo: 'Video speaking: My daily routine', horasParaVencer: 60, horasEstimadas: 1 },
  { titulo: 'Proyecto integrador responsive', horasParaVencer: 91, horasEstimadas: 3 },
  { titulo: 'Clean Code, cap. 2', horasParaVencer: 120, horasEstimadas: 0.5, lectura: true },
];

export const PERFILES_PAREJA: [PerfilCoder, PerfilCoder] = [
  { nombre: 'Valentina Ríos', genero: 'Femenino', edad: 19, barrio: 'Robledo', entregas: ENTREGAS_PAREJA },
  { nombre: 'Andrés Mejía', genero: 'Masculino', edad: 34, barrio: 'El Poblado', entregas: ENTREGAS_PAREJA },
];

/** Dos perfiles con las mismas entregas deben recibir exactamente la misma recomendación. */
export function testSesgoEnPareja(perfiles: [PerfilCoder, PerfilCoder] = PERFILES_PAREJA) {
  const [a, b] = perfiles;
  const recA = recomendarRuta(a);
  const recB = recomendarRuta(b);
  return { a, b, recA, recB, iguales: JSON.stringify(recA) === JSON.stringify(recB) };
}
