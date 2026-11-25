import { describe, expect, it } from 'vitest';
import { analizarConsulta, generarRespuesta } from '@/lib/aiService';

describe('aiService', () => {
  it('sanitiza antes de procesar y marca los datos ocultos', () => {
    const a = analizarConsulta('Soy nikola@riwi.io, ¿qué entrego primero?');
    expect(a.texto).toBe('Soy [correo], ¿qué entrego primero?');
    expect(a.datosOcultos).toBe(true);
  });
  it('deriva al TL los temas de alto impacto aunque parezcan un fallo', async () => {
    const reply = await generarRespuesta(analizarConsulta('Se cayó el servidor y me van a bajar la nota'));
    expect(reply.humano).toBe(true);
    expect(reply.state).toBe('error');
  });
  it('explica las reglas objetivas ante una pregunta por sesgo', async () => {
    const reply = await generarRespuesta(analizarConsulta('¿Hay sesgo en mi ruta?'));
    expect(reply.sesgo).toBe(true);
  });
  it('cada respuesta trae sus fuentes para el pie de transparencia', async () => {
    const reply = await generarRespuesta(analizarConsulta('¿Qué me falta por entregar en Inglés?'));
    expect(reply.fuentes).toEqual(['Cronograma Moodle · Semana 3']);
  });
});
