import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ATRIBUTOS_IGNORADOS, aviso, protegerDatos, REGLAS_OBJETIVAS, requiereHumano, temaHumano, testSesgoEnPareja } from '@/lib/guardrails';

export type EthicsTab = 'decisiones' | 'probador' | 'sesgo';

const DECISIONES = [
  { situacion: 'El coder escribe su correo, celular o documento.', actua: 'Oculta el dato antes de procesar y avisa sobre la burbuja.', regla: 'protegerDatos() → [correo] · [celular] · [documento] (Ley 1581 de 2012)' },
  { situacion: 'Pregunta sobre salud, notas, permanencia, dinero o excusas.', actua: 'No decide ni improvisa: deriva el caso a Felonius Gru (TL).', regla: 'requiereHumano() === true' },
  { situacion: '«¿Por qué voy peor que otro coder?» o «¿hay sesgo?».', actua: 'Explica las reglas objetivas aplicadas y ofrece el test en pareja.', regla: 'Mismas entregas ⇒ misma recomendación (sin nombre, género, edad ni barrio)' },
  { situacion: 'Cualquier respuesta de RiwiMate.', actua: 'Muestra un pie de transparencia con sus fuentes.', regla: 'aviso(fuentes) debajo de cada respuesta' },
  { situacion: 'Pide el código completo del reto.', actua: 'Da máximo 3 pistas lógicas, nunca la solución.', regla: 'Guardrail de código · 3/3 pistas' },
  { situacion: 'Pregunta por un dato que no está en el tablero.', actua: 'Dice que no lo encuentra y no inventa fechas.', regla: 'Cero alucinaciones · fuente: Cronograma Moodle S3' },
];

const EJEMPLO = 'Soy nikola@riwi.io, cel 3001234567, CC 1036654321. ¿Me pueden subir la nota?';

export function EthicsModal({ open, onOpenChange, tab, onTabChange }: { open: boolean; onOpenChange: (open: boolean) => void; tab: EthicsTab; onTabChange: (tab: EthicsTab) => void }) {
  const [texto, setTexto] = useState(EJEMPLO);
  const [pareja, setPareja] = useState<ReturnType<typeof testSesgoEnPareja> | null>(null);
  const limpio = protegerDatos(texto);
  const humano = requiereHumano(texto);
  const tema = temaHumano(texto);

  function hablarConTL() {
    onOpenChange(false);
    window.location.hash = 'coach';
  }

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="ethics-modal scroll">
      <DialogHeader>
        <p className="eyebrow">Sesión 5 · IA responsable</p>
        <DialogTitle className="ethics-title">🛡️ Decisiones éticas del clan</DialogTitle>
        <DialogDescription className="t-2">Reglas que RiwiMate cumple en cada mensaje. Puedes comprobarlas aquí mismo.</DialogDescription>
      </DialogHeader>
      <Tabs value={tab} onValueChange={(v) => onTabChange(v as EthicsTab)}>
        <TabsList className="ethics-tabs">
          <TabsTrigger value="decisiones">Nuestras decisiones</TabsTrigger>
          <TabsTrigger value="probador">Probador en vivo</TabsTrigger>
          <TabsTrigger value="sesgo">Reglas y sesgo</TabsTrigger>
        </TabsList>

        <TabsContent value="decisiones">
          <div className="ethics-table-wrap">
            <table className="ethics-table">
              <thead><tr><th>Situación</th><th>Cómo actúa</th><th>Regla que se comprueba</th></tr></thead>
              <tbody>{DECISIONES.map(d => <tr key={d.regla}><td>{d.situacion}</td><td>{d.actua}</td><td><code>{d.regla}</code></td></tr>)}</tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="probador">
          <label htmlFor="probador-texto" className="ethics-label">Escribe un mensaje de prueba</label>
          <textarea id="probador-texto" className="ethics-input" rows={3} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={500} />
          <div className="ethics-grid">
            <div className="ethics-result">
              <p className="ethics-result-title">protegerDatos()</p>
              <p className="mono ethics-output">{limpio || '—'}</p>
              <p className={limpio !== texto ? 'ethics-ok' : 't-3'}>{limpio !== texto ? '🔒 Datos personales ocultos' : 'Sin datos personales detectados'}</p>
            </div>
            <div className="ethics-result">
              <p className="ethics-result-title">requiereHumano()</p>
              <p className="mono ethics-output">{String(humano)}</p>
              {humano ? <>
                <p className="ethics-warn">🧑‍🏫 Tema crítico «{tema}»: RiwiMate no decide, deriva al TL.</p>
                <Button variant="riwi" size="native" type="button" className="btn btn-coach mt-3" onClick={hablarConTL}>Hablar con Felonius Gru (TL)</Button>
              </> : <p className="t-3">Tema académico: RiwiMate puede orientar.</p>}
            </div>
          </div>
          <p className="ai-disclosure"><span aria-hidden="true">✨</span>Ejemplo de aviso(): {aviso(['Cronograma Moodle · Semana 3'])}</p>
        </TabsContent>

        <TabsContent value="sesgo">
          <div className="ethics-result">
            <p className="ethics-result-title">Reglas objetivas aplicadas</p>
            <ul className="ethics-rules">{REGLAS_OBJETIVAS.map(r => <li key={r}>{r}</li>)}</ul>
            <p className="mt-2 t-3">Nunca se usan: {ATRIBUTOS_IGNORADOS.join(', ')}.</p>
          </div>
          <Button variant="riwi" size="native" type="button" className="btn btn-primary mt-4" onClick={() => setPareja(testSesgoEnPareja())}>🧪 Probar caso en pareja (Test de sesgo)</Button>
          {pareja && <div className="mt-4" aria-live="polite">
            <div className="ethics-grid">
              {[{ p: pareja.a, r: pareja.recA }, { p: pareja.b, r: pareja.recB }].map(({ p, r }) => <div className="ethics-result" key={p.nombre}>
                <p className="ethics-result-title">{p.nombre}</p>
                <p className="t-3">{p.genero} · {p.edad} años · {p.barrio} · {p.entregas.length} entregas</p>
                <p className="mt-2">{r.mensaje}</p>
                <ol className="ethics-order">{r.orden.slice(0, 3).map(t => <li key={t}>{t}</li>)}</ol>
              </div>)}
            </div>
            <p className={pareja.iguales ? 'ethics-pass' : 'ethics-fail'}>{pareja.iguales ? '✅ Prueba superada: los dos perfiles reciben exactamente la misma recomendación.' : '❌ Las recomendaciones difieren: hay que revisar las reglas.'}</p>
          </div>}
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>;
}
