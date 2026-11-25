import type { Reply } from '@/lib/riwimate';
import { detectFault, recoveredReply, replyFor, type FaultKind } from '@/lib/faults';
import { BOARD_SOURCE } from '@/lib/board';
import { aviso, preguntaPorSesgo, protegerDatos, REGLAS_OBJETIVAS, ATRIBUTOS_IGNORADOS, temaHumano } from '@/lib/guardrails';

/* =========================================================================
   RiwiMate · servicio de IA
   Única puerta de entrada a las respuestas. Siempre: 1) sanitiza con
   protegerDatos, 2) valida requiereHumano, 3) responde. La interfaz solo
   habla con este módulo, así que cambiar el motor no rompe la UI.
   ========================================================================= */

export type RiwiReply = Reply & { fuentes: string[]; humano?: boolean; tema?: string; sesgo?: boolean };

export type Analisis = {
  original: string;
  /** Texto ya sanitizado: es lo único que se muestra y se procesa. */
  texto: string;
  datosOcultos: boolean;
  humano: boolean;
  tema: string | null;
  sesgo: boolean;
  fallo: FaultKind | null;
};

export function analizarConsulta(raw: string): Analisis {
  const original = raw.trim();
  const texto = protegerDatos(original);
  const tema = temaHumano(texto);
  const humano = tema !== null;
  return { original, texto, datosOcultos: texto !== original, humano, tema, sesgo: !humano && preguntaPorSesgo(texto), fallo: humano ? null : detectFault(texto) };
}

export function conFuentes(reply: Reply): RiwiReply {
  return { ...reply, fuentes: reply.source ? [reply.source] : [] };
}

export const FUENTE_CONTROL_HUMANO = 'Decisiones éticas del clan · control humano';
export const FUENTE_REGLAS = `${BOARD_SOURCE} · reglas de prioridad`;

export function respuestaHumana(tema: string): RiwiReply {
  return {
    state: 'error', humano: true, tema, hints: [],
    intro: `Este tema (**${tema}**) es de alto impacto, así que no lo decido ni improviso. Te derivo con una persona real: **Felonius Gru**, tu TL, puede orientarte. No compartas datos médicos ni personales aquí; tú decides qué contarle directamente.`,
    source: FUENTE_CONTROL_HUMANO, fuentes: [FUENTE_CONTROL_HUMANO],
  };
}

export function respuestaSesgo(): RiwiReply {
  return {
    state: 'respuesta', sesgo: true, hints: [],
    intro: `Buena pregunta, coder. Evalúo tu avance **solo con métricas objetivas del tablero**: fechas de entrega, horas estimadas y prioridad. Reglas aplicadas: ${REGLAS_OBJETIVAS.join(' ')} **Nunca uso ${ATRIBUTOS_IGNORADOS.join(', ')}** ni comparo coders entre sí. Si tu prioridad es Alta es porque alguna entrega vence en menos de 24 h. Puedes comprobarlo con el test de sesgo.`,
    source: FUENTE_REGLAS, fuentes: [FUENTE_REGLAS],
  };
}

/** Respuesta local determinista (maqueta). */
export function responderLocal(a: Analisis): RiwiReply {
  if (a.humano && a.tema) return respuestaHumana(a.tema);
  if (a.sesgo) return respuestaSesgo();
  return conFuentes(replyFor(a.texto));
}

export async function generarRespuesta(a: Analisis): Promise<RiwiReply> {
  // Las reglas de control humano y sesgo se resuelven ANTES de cualquier modelo.
  if (a.humano || a.sesgo) return responderLocal(a);
  // TODO: Conectar fetch() a Gemini / OpenAI API en Trayecto 3
  // Enviar SOLO `a.texto` (ya sanitizado), nunca `a.original`, y devolver un RiwiReply con sus fuentes.
  return responderLocal(a);
}

export function respuestaRecuperada(texto: string, kind: 'offline' | 'timeout'): RiwiReply {
  return conFuentes(recoveredReply(protegerDatos(texto), kind));
}

export { aviso };
