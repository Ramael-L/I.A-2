import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { RESPONSE_DELAY_MS } from '@/lib/riwimate';
import { faultMessage, FAULT_ORDER, FAULTS, INVALID_SUGGESTIONS, missingSubject, OFFLINE_BANNER, type FaultKind } from '@/lib/faults';
import { analizarConsulta, generarRespuesta, respuestaRecuperada, type RiwiReply } from '@/lib/aiService';
import { aviso, AVISO_PRIVACIDAD, TEXTO_CONSENTIMIENTO } from '@/lib/guardrails';
import { EthicsModal, type EthicsTab } from '@/components/riwimate/EthicsModal';
const CONSENT_KEY = 'riwimate-consentimiento-1581';
const NEW_CHAT_SUGGESTIONS = ['¿Qué me falta por entregar en Inglés?', '¿Qué debo entregar primero hoy?', '¿Cuánto tiempo necesito para el taller de SQL?', 'Tuve un problema de conexión / Error 500'];
function RichText({ text }: { text: string }) { return <>{text.split(/\*\*(.+?)\*\*/g).map((part, i) => i % 2 ? <b key={i}>{part}</b> : part)}</>; }
export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'RiwiMate · Tu TL de bolsillo' },
    { name: 'description', content: 'Organiza entregas, aprende con pistas y encuentra apoyo humano en la maqueta navegable de RiwiMate.' },
    { property: 'og:title', content: 'RiwiMate · Tu TL de bolsillo' },
    { property: 'og:description', content: 'Un compañero coder con prioridades claras, fuentes verificables y apoyo de tu TL.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }
  ] }), component: Index,
});
function PrivacyNotice() { return <p role="status" className="privacy-notice">{AVISO_PRIVACIDAD}</p>; }
function AiDisclosure({ fuentes }: { fuentes: string[] }) { return <p className="ai-disclosure"><span aria-hidden="true">✨</span>{aviso(fuentes)}</p>; }
function UserMsg({ text, masked, time, queued }: { text: string; masked?: boolean; time: string; queued?: boolean }) {
  return <article className="msg"><span className="avatar user">N</span><div className="msg-body">
    {masked && <PrivacyNotice />}
    <div className="msg-meta"><span className="msg-name user">Nikola</span><span className="msg-time">{time}</span></div>
    <p className={`bubble-user${queued ? ' is-queued' : ''}`}>{text}</p>
  </div></article>;
}
function SimulatedConversation({ question, reply, masked, onBiasTest }: {question: string; reply: RiwiReply; masked: boolean; onBiasTest: () => void}) {
  return <div className="simulation" aria-live="polite">
    <UserMsg text={question} masked={masked} time="Tu consulta" />
    <article className="msg"><BotAvatar /><div className="msg-body">
      <div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span>{reply.humano && <span className="chip chip-media">🧑‍🏫 Requiere a una persona</span>}{reply.sesgo && <span className="chip chip-cyan">⚖️ Criterios objetivos</span>}<span className="msg-time">Respuesta simulada</span></div>
      <p className="msg-text"><RichText text={reply.intro} /></p>
      {reply.hints.map((hint, i) => <div className="card clue" key={hint}><span className="clue-n">{i+1}</span><p>{hint}</p></div>)}
      {reply.sesgo && <div className="recovery"><Button variant="riwi" size="native" type="button" className="btn btn-soft" onClick={onBiasTest}>🧪 Probar caso en pareja (Test de sesgo)</Button></div>}
      {reply.state === 'error' && <div className="recovery"><Button variant="riwi" size="native" asChild><a className="btn btn-coach" href="#coach-error">{reply.humano ? '🧑‍🏫 Hablar con Felonius Gru (TL)' : '🎧 Hablar directamente con mi TL'}</a></Button><Button variant="riwi" size="native" asChild><a className="btn btn-soft retry-query" href="#inicio">↻ Reintentar consulta</a></Button></div>}
      {reply.state !== 'error' && <p className="mt-4 t-2"><a className="human-link" href={reply.state === 'guardrail' ? '#coach-guardrail' : '#coach-respuesta'}>¿Algo no cuadra? Habla con tu TL →</a></p>}
      <div className="source"><span>📚</span><span><span className="source-label">Fuente verificable</span>{reply.source}{reply.url && <a className="verify-link" href={reply.url} target="_blank" rel="noopener noreferrer">Comprueba tú ↗</a>}</span></div>
      <AiDisclosure fuentes={reply.fuentes} />
    </div></article>
  </div>;
}
function BotAvatar() {
  return <span className="avatar bot"><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg></span>;
}
function FaultConversation({ question, kind, masked, pending, onRetry, onRewrite, onWriteDate, onSuggest }: { question: string; kind: FaultKind; masked: boolean; pending: boolean; onRetry: () => void; onRewrite: () => void; onWriteDate: () => void; onSuggest: (text: string) => void }) {
  const fault = FAULTS[kind];
  const network = kind === 'offline' || kind === 'timeout';
  return <div className="simulation" aria-live="polite">
    <p className="day-sep">Hoy · jueves</p>
    <UserMsg text={question} masked={masked} time={kind === 'offline' ? '⏳ Guardado · pendiente de envío' : 'Tu consulta'} queued={kind === 'offline'} />
    <article className="msg"><BotAvatar /><div className="msg-body">
      <div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span><span className={`chip ${network ? 'chip-alta' : 'chip-media'}`}>{fault.chip}</span></div>
      <div className={`fault-card is-${kind}`} role={network ? 'alert' : undefined}>
        <p className="fault-card-text">{faultMessage(kind, question)}</p>
        {fault.detail && <p className="fault-card-detail">{fault.detail}</p>}
      </div>
      {network && <div className="recovery">
        <Button variant="riwi" size="native" type="button" className="btn btn-primary" onClick={onRetry} disabled={pending}>{kind === 'offline' ? '🔄 Reintentar envío' : '🔄 Reintentar consulta'}</Button>
        <Button variant="riwi" size="native" asChild><a className="btn btn-soft" href="#coach-fallo">{kind === 'offline' ? '🧑‍🏫 Hablar con mi TL' : '🧑‍🏫 Reportar bloqueo a mi TL'}</a></Button>
      </div>}
      {kind === 'missing' && <div className="recovery">
        <Button variant="riwi" size="native" type="button" className="btn btn-primary" onClick={onWriteDate}>✍️ Escribir la fecha límite</Button>
        <Button variant="riwi" size="native" type="button" className="btn btn-soft" onClick={onRewrite}>🔄 Reintentar con otra pregunta</Button>
      </div>}
      {kind === 'invalid' && <>
        <div className="fault-suggestions" role="group" aria-label="Sugerencias">
          {INVALID_SUGGESTIONS.map(text => <Button key={text} variant="riwi" size="native" type="button" className="fault-suggestion" onClick={() => onSuggest(text)} disabled={pending}><span aria-hidden="true">↗</span>{text}</Button>)}
        </div>
        <div className="recovery"><Button variant="riwi" size="native" type="button" className="btn btn-soft" onClick={onRewrite}>🔄 Reintentar</Button></div>
      </>}
      {!network && <p className="mt-4 t-2"><a className="human-link" href="#coach-fallo">¿Algo no cuadra? Habla con tu TL →</a></p>}
      <div className="source"><span aria-hidden="true">📚</span><span><span className="source-label">Fuente verificable</span><b>{fault.source}</b></span><span className="source-meta">simulación</span></div>
      <AiDisclosure fuentes={network ? [] : [fault.source]} />
    </div></article>
  </div>;
}
function Index() {
  const [input, setInput] = useState('');
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<RiwiReply | null>(null);
  const [masked, setMasked] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [consent, setConsent] = useState(true);
  const [ethicsOpen, setEthicsOpen] = useState(false);
  const [ethicsTab, setEthicsTab] = useState<EthicsTab>('decisiones');
  const requestId = useRef(0);
  useEffect(() => { setConsent(window.localStorage.getItem(CONSENT_KEY) === 'si'); }, []);
  function acceptConsent() { setConsent(true); try { window.localStorage.setItem(CONSENT_KEY, 'si'); } catch { /* sin almacenamiento disponible */ } }
  function openEthics(tab: EthicsTab) { setEthicsTab(tab); setEthicsOpen(true); }
  const [pending, setPending] = useState(false);
  const [contactNotice, setContactNotice] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [fault, setFault] = useState<FaultKind | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash !== '#cargando' && timer.current) { clearTimeout(timer.current); timer.current = null; requestId.current++; setPending(false); }
      if (window.location.hash === '#inicio') { setQuestion(''); setReply(null); setFault(null); setMasked(false); }
    };
    window.addEventListener('hashchange', onHash);
    return () => { window.removeEventListener('hashchange', onHash); if (timer.current) clearTimeout(timer.current); };
  }, []);
  const [newInput, setNewInput] = useState('');
  function sendQuestion(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }
  function ask(raw: string) {
    if (!raw.trim() || pending) return;
    // Regla 1: todo mensaje se sanitiza ANTES de procesarlo o mostrarlo.
    const analisis = analizarConsulta(raw);
    if (!consent) acceptConsent();
    if (timer.current) clearTimeout(timer.current);
    const id = ++requestId.current;
    const value = analisis.texto;
    const kind = analisis.fallo;
    setMenuOpen(false);
    setQuestion(value); setMasked(analisis.datosOcultos); setInput(''); setNewInput(''); setReply(null); setFault(null);
    setHistory(items => [value, ...items.filter(item => item !== value)].slice(0, 6));
    if (kind === 'offline') { setFault('offline'); window.location.hash = 'fallo'; return; }
    setPending(true);
    window.location.hash = 'cargando';
    timer.current = setTimeout(() => {
      timer.current = null;
      if (kind) { setPending(false); setFault(kind); window.location.hash = 'fallo'; return; }
      void generarRespuesta(analisis).then(next => {
        if (id !== requestId.current) return;
        setPending(false); setReply(next);
        window.location.hash = next.state;
      });
    }, RESPONSE_DELAY_MS);
  }
  function run(sample: string, kind: FaultKind) {
    if (pending) return;
    if (timer.current) clearTimeout(timer.current);
    requestId.current++;
    setMenuOpen(false);
    setQuestion(sample); setMasked(false); setInput(''); setNewInput(''); setReply(null); setFault(null);
    if (kind === 'offline') { setFault('offline'); window.location.hash = 'fallo'; return; }
    setPending(true);
    window.location.hash = 'cargando';
    timer.current = setTimeout(() => { setPending(false); timer.current = null; setFault(kind); window.location.hash = 'fallo'; }, RESPONSE_DELAY_MS);
  }
  function retryFault() {
    if ((fault !== 'offline' && fault !== 'timeout') || pending) return;
    const value = question; const kind = fault;
    if (timer.current) clearTimeout(timer.current);
    setPending(true);
    window.location.hash = 'cargando';
    timer.current = setTimeout(() => {
      const next = respuestaRecuperada(value, kind); setFault(null); setReply(next); setPending(false); timer.current = null;
      window.location.hash = next.state;
    }, RESPONSE_DELAY_MS);
  }
  function focusComposer(text = '') {
    setInput(text);
    requestAnimationFrame(() => { const el = document.getElementById('mensaje') as HTMLInputElement | null; el?.focus(); el?.setSelectionRange(text.length, text.length); });
  }
  return <>
<a href="#chat" className="skip">Saltar al chat</a>

<input type="checkbox" id="toggle-entregas" aria-label="Mostrar panel de entregas" className="sr-only" />
<input type="checkbox" id="collapse-board" aria-label="Ocultar tablero de entregas" className="sr-only" />
<div className="layout">

<aside aria-label="Navegación de RiwiMate" className="sidebar">
<header className="side-head">
<p className="brand-logo" aria-label="RiwiMate"><span className="brand-tag">&lt;/</span>RiwiMate<span className="brand-tag-end">&gt;</span></p>
<p className="side-sub">Copiloto académico · Clan Tesla 🚀</p>
</header>
<div className="scroll flex-1 overflow-y-auto px-3 pb-4">
<a href="#nuevo" className="new-chat-btn">✏️ Nuevo chat</a>
<p className="section-title">Vistas</p>
<nav aria-label="Estados del asistente" className="nav">
<a href="#inicio" className="nav-link"><span aria-hidden="true" className="side-ic">🏠</span><span ><b >Inicio</b><small >Bienvenida y sugerencias</small></span><span className="num">1</span></a>
<a href="#cargando" className="nav-link"><span aria-hidden="true" className="side-ic">⏳</span><span ><b >Cargando</b><small >Cruzando fechas de Moodle</small></span><span className="num">2</span></a>
<a href="#respuesta" className="nav-link"><span aria-hidden="true" className="side-ic">📌</span><span ><b >Respuesta con fuente</b><small >Prioridades + fuente</small></span><span className="num">3</span></a>
<a href="#guardrail" className="nav-link"><span aria-hidden="true" className="side-ic">🛡️</span><span ><b >Guardrail de código</b><small >Solo 3 pistas, nunca código</small></span><span className="num">4</span></a>
<a href="#error" className="nav-link"><span aria-hidden="true" className="side-ic">🧭</span><span ><b >Error honesto</b><small >Límite + salida humana</small></span><span className="num">5</span></a>
</nav>
<p className="section-title">Historial</p>
{history.length ? <ul className="history" aria-label="Consultas de esta sesión">
{history.map(item => <li key={item}><Button variant="riwi" size="native" type="button" className="history-item" onClick={() => ask(item)} disabled={pending} title={item}><span aria-hidden="true">💬</span><span className="truncate">{item}</span></Button></li>)}
</ul> : <p className="history-empty">Tus consultas de esta sesión aparecen aquí, ya sin datos personales. No se guardan al cerrar.</p>}
<p className="section-title">Soporte humano</p>
<a href="#coach" className="nav-link">
<span className="avatar coach xs">FG<span className="status source-detail-0"></span></span>
<span ><b >Felonius Gru</b><small >TL de tu clan · responde en ~10 min</small></span>
</a>
<div className="card mx-1 mt-5 p-3">
<p className="text-[12px] font-bold source-ink-1">💡 Tip de RiwiMate</p>
<p className="mt-1 text-[12.5px] leading-relaxed t-2">Si llevas 30 min bloqueado en lo mismo, no es falta de talento: es momento de pedir ayuda. Para eso estamos.</p>
</div>
</div>
<footer className="me">
<span className="avatar user sm">N<span className="status"></span></span>
<span className="min-w-0">
<b className="block text-[13.5px] font-bold leading-tight">Nikola Tesla</b>
<small className="block text-[11.5px] t-3">Coder · Cohorte 6</small>
</span>
<span className="chip chip-brand ml-auto">VIP 💜</span>
</footer>
</aside>

<main id="chat" className="chat">
<header className="chat-head">
<div className="flex items-center gap-3 min-w-0">
<span className="avatar bot sm">
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</span>
<div className="min-w-0">
<h1 className="chat-title">RiwiMate <span className="badge-tl">Copiloto · IA</span></h1>
<p className="chat-sub">● Maqueta · datos de ejemplo · sin conexión a Moodle</p>
</div>
</div>
<div className="flex items-center gap-2">
<div className="fault-sim" ref={menuRef}>
<Button variant="riwi" size="native" type="button" aria-label="Simular fallo" aria-haspopup="menu" aria-expanded={menuOpen} aria-controls="fault-menu" title="Simular fallo" className="btn btn-ghost fault-trigger" onClick={() => setMenuOpen(open => !open)} disabled={pending}>⚡ <span className="hidden 2xl:inline">Simular fallo</span></Button>
{menuOpen && <div id="fault-menu" role="menu" aria-label="Simulador de errores y casos borde" className="fault-menu">
<p className="fault-menu-title">Simulador de errores y casos borde</p>
{FAULT_ORDER.map((kind, i) => <Button key={kind} variant="riwi" size="native" type="button" role="menuitem" className="fault-menu-item" onClick={() => run(FAULTS[kind].sample, kind)}><span aria-hidden="true" className="fault-menu-ic">{FAULTS[kind].icon}</span><span><b>{i + 1}. {FAULTS[kind].label}</b><small>{FAULTS[kind].hint}</small></span></Button>)}
<p className="fault-menu-foot">También se activa si escribes «sin internet», «error 500», «caído» o «asdf».</p>
</div>}
</div>
<Button variant="riwi" size="native" type="button" aria-label="Decisiones éticas del clan" className="btn btn-ethics" onClick={() => openEthics('decisiones')}>🛡️ <span className="hidden xl:inline">Decisiones éticas del clan</span></Button>
<a href="#nuevo" aria-label="Nuevo chat" className="btn btn-ghost">✏️ <span className="hidden 2xl:inline">Nuevo chat</span></a>
<a href="#coach" aria-label="Hablar con mi TL" className="btn btn-soft">🎧 <span className="hidden 2xl:inline">Hablar con mi TL</span></a>
<label htmlFor="toggle-entregas" className="btn btn-ghost btn-drawer">📋 <span className="hidden sm:inline">Entregas</span>
<span className="count">8</span></label>
<label htmlFor="collapse-board" title="Mostrar u ocultar el tablero" className="btn btn-ghost btn-collapse">📋 <span className="count">8</span></label>
</div>
</header>

<div role="note" aria-label="Aviso sobre las respuestas de IA" className="ai-banner">
<span aria-hidden="true" className="ai-banner-icon">✨</span>
<p ><strong >Respuestas generadas con IA; pueden contener errores.</strong> No entrego código completo, solo pistas para guiarte. Confirma fechas y notas en Moodle.</p>
<span className="ai-banner-pill">🛡️ Modo pistas</span>
</div>

<nav aria-label="Estados de la demo" className="stepper nav scroll">
<a href="#inicio">1 · Inicio</a>
<a href="#cargando">2 · Cargando</a>
<a href="#respuesta">3 · Respuesta</a>
<a href="#guardrail">4 · Guardrail</a>
<a href="#error">5 · Error honesto</a>
</nav>
<div className="states">

<span id="coach" aria-hidden="true" className="coach-anchor"></span>

<section id="cargando" aria-labelledby="cargando-title" className="state scroll" aria-busy="true">
<div className="state-inner">
<h2 id="cargando-title" className="sr-only">Cargando respuesta</h2>
<p className="day-sep">Hoy · jueves</p>
<UserMsg text={question || "Organízame las entregas de esta semana y dime qué hago primero 🙏"} masked={masked && !!question} time="Hoy a las 10:31 a.m." />
<article aria-live="polite" className="msg">
<span className="avatar bot">
<span aria-hidden="true" className="spinner-ring"></span>
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</span>
<div className="msg-body">
<div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span><span className="msg-time">está pensando…</span></div>
<div className="card thinking">
<div className="flex items-center gap-3">
<span aria-hidden="true" className="typing"><i ></i><i ></i><i ></i></span>
<p className="font-semibold">Preparando tu respuesta con datos de ejemplo…</p>
</div>
<div role="progressbar" aria-label="Progreso del análisis" className="progress"><span ></span></div>
<ol className="steps">
<li className="step"><span className="step-ic"><span className="spin"></span><span className="done">✓</span></span> Leyendo cronograma de ejemplo · Semana 3</li>
<li className="step"><span className="step-ic"><span className="spin"></span><span className="done">✓</span></span> Revisando plazos del ejemplo</li>
<li className="step"><span className="step-ic"><span className="spin"></span><span className="done">✓</span></span> Calculando tiempo estimado por tarea</li>
<li className="step"><span className="step-ic"><span className="spin"></span><span className="done">✓</span></span> Aplicando reglas de prioridad 🔴 🟡 🟢</li>
</ol>
<div aria-hidden="true" className="skeleton"><span className="source-detail-2"></span><span className="source-detail-3"></span><span className="source-detail-4"></span></div>
</div>
<div className="ready mt-4 flex flex-wrap items-center gap-3">
<a href="#respuesta" className="btn btn-primary">Ver mis prioridades →</a>
<span className="text-[12.5px] t-3">Datos de ejemplo · sin conexión a Moodle</span>
</div>
</div>
</article>
</div>
</section>

<section id="respuesta" aria-labelledby="respuesta-title" className="state scroll">
<span id="coach-respuesta" aria-hidden="true" className="coach-anchor"></span>
<div className="state-inner">{question && reply && reply.state === "respuesta" && <SimulatedConversation question={question} reply={reply} masked={masked} onBiasTest={() => openEthics('sesgo')} />}{(!question || reply?.state !== "respuesta") && <>

<h2 id="respuesta-title" className="sr-only">Respuesta con prioridades</h2>
<p className="day-sep">Hoy · jueves</p>
<UserMsg text={question || "Organízame las entregas de esta semana y dime qué hago primero 🙏"} masked={masked && !!question} time="Hoy a las 10:31 a.m." />
<article className="msg">
<span className="avatar bot">
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</span>
<div className="msg-body">
<div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span><time className="msg-time">Hoy a las 10:31 a.m.</time></div>
<p className="msg-text">¡Listo, Nikola! Este es el <b >cronograma de ejemplo de la Semana 3</b>. Tienes <b >8 entregas pendientes</b> que suman <b >≈ 10 h</b>. Así te recomiendo atacarlas:</p>
<div className="summary-strip">
<div ><b >8</b><span >entregas</span></div>
<div ><b className="mono">10h</b><span >tiempo estimado</span></div>
<div ><b className="source-detail-5">3</b><span >urgentes hoy</span></div>
</div>

<div className="card prio alta">
<div className="prio-head">
<span className="chip chip-alta">🔴 Prioridad alta</span>
<span className="prio-rule">Vence en &lt; 24 h o es el reto del día</span>
<span className="prio-total">⏱ 4h 55m</span>
</div>
<ul className="prio-list">
<li ><span className="bullet"></span><div ><p className="t">Reto diario: Manipulación del DOM <span className="tag-mini">Obligatorio</span></p><p className="m">JavaScript · ⏰ Hoy, 11:59 p.m.</p></div><span className="time">2h 30m</span></li>
<li ><span className="bullet"></span><div ><p className="t">Taller SQL: consultas con JOIN</p><p className="m">Bases de datos · ⏰ Mañana, 8:00 a.m. (en 21 h)</p></div><span className="time">1h 45m</span></li>
<li ><span className="bullet"></span><div ><p className="t">Git: ramas y Pull Request del proyecto</p><p className="m">Control de versiones · ⏰ Hoy, 9:00 p.m.</p></div><span className="time">40m</span></li>
</ul>
</div>

<div className="card prio media">
<div className="prio-head">
<span className="chip chip-media">🟡 Prioridad media</span>
<span className="prio-rule">Vence en 2 a 4 días</span>
<span className="prio-total">⏱ 3h 50m</span>
</div>
<ul className="prio-list">
<li ><span className="bullet"></span><div ><p className="t">Video speaking: “My daily routine”</p><p className="m">Inglés · ⏰ Sábado, 11:59 p.m. (2 días)</p></div><span className="time">50m</span></li>
<li ><span className="bullet"></span><div ><p className="t">Proyecto integrador: maquetación responsive</p><p className="m">HTML y CSS · ⏰ Lunes, 7:00 a.m. (4 días)</p></div><span className="time">3h</span></li>
</ul>
</div>

<div className="card prio baja">
<div className="prio-head">
<span className="chip chip-baja">🟢 Prioridad baja</span>
<span className="prio-rule">Lecturas complementarias o 5+ días</span>
<span className="prio-total">⏱ 1h 15m</span>
</div>
<ul className="prio-list">
<li ><span className="bullet"></span><div ><p className="t">Lectura: Clean Code, cap. 2 “Nombres con sentido”</p><p className="m">Complementaria · ⏰ Martes (5 días)</p></div><span className="time">30m</span></li>
<li ><span className="bullet"></span><div ><p className="t">Video: el Event Loop explicado</p><p className="m">JavaScript · Complementaria · sin fecha límite</p></div><span className="time">25m</span></li>
<li ><span className="bullet"></span><div ><p className="t">Reflexión semanal de habilidades blandas</p><p className="m">Habilidades blandas · ⏰ Jueves 26 (7 días)</p></div><span className="time">20m</span></li>
</ul>
</div>

<div className="card tiebreak">
<p className="flex items-center gap-2 text-[15px] font-bold">⚖️ Desempate inteligente <span className="chip chip-brand">Pregunta de RiwiMate</span></p>
<p className="mt-1 text-[14px] leading-relaxed t-2">Tienes <b className="source-ink-6">3 tareas en 🔴 Alta</b>. Sé honesto conmigo: <b className="source-detail-7">¿en cuál tema sientes más falencias hoy?</b> La pongo como tu prioridad #1 y te doy una pista para arrancar.</p>
<input type="radio" name="falencia" id="fal-dom" className="sr-only" />
<input type="radio" name="falencia" id="fal-sql" className="sr-only" />
<input type="radio" name="falencia" id="fal-git" className="sr-only" />
<div role="group" aria-label="Elige el tema con más falencias" className="tb-options">
<label htmlFor="fal-dom">🧩 DOM en JavaScript</label>
<label htmlFor="fal-sql">🗄️ JOINs en SQL</label>
<label htmlFor="fal-git">🌿 Ramas en Git</label>
</div>
<div className="tb-results">
<p className="tb-placeholder">👆 Elige un tema y reordeno tu plan de hoy.</p>
<div className="tb-result r-dom">
<p className="text-[14px] font-bold">Perfecto, arrancamos por el DOM 💪</p>
<ol className="plan"><li >Reto DOM · 2h 30m</li><li >Git: ramas y PR · 40m</li><li >Taller SQL JOIN · 1h 45m</li></ol>
<p className="hint"><b className="source-detail-8">Pista para arrancar:</b> antes de escribir una línea, dibuja en papel qué elementos de la página cambian y qué acción del usuario provoca cada cambio.</p>
<a href="#guardrail" className="btn btn-soft mt-3">Ver las 3 pistas del reto →</a>
</div>
<div className="tb-result r-sql">
<p className="text-[14px] font-bold">Va, le damos prioridad a SQL 🗄️</p>
<ol className="plan"><li >Taller SQL JOIN · 1h 45m</li><li >Reto DOM · 2h 30m</li><li >Git: ramas y PR · 40m</li></ol>
<p className="hint"><b className="source-detail-9">Pista para arrancar:</b> dibuja las dos tablas lado a lado y marca con color la columna que comparten. Esa columna es la que “une” la consulta.</p>
</div>
<div className="tb-result r-git">
<p className="text-[14px] font-bold">Bien visto, Git primero 🌿 (y es corto)</p>
<ol className="plan"><li >Git: ramas y PR · 40m</li><li >Reto DOM · 2h 30m</li><li >Taller SQL JOIN · 1h 45m</li></ol>
<p className="hint"><b className="source-detail-10">Pista para arrancar:</b> piensa en una rama como una “copia segura” para experimentar. ¿Desde qué rama debería nacer la tuya y hacia cuál vuelve en el PR?</p>
</div>
</div>
</div>

<div className="source">
<span aria-hidden="true">📚</span>
<span ><span className="source-label">Fuente verificable</span>
<b >Cronograma Moodle · Semana 3</b> · Ruta Desarrollo Web · Clan Tesla</span>
<span className="source-meta">ejemplo</span>
</div>
<div className="feedback">
<span >¿Te sirvió este orden?</span>
<input type="radio" name="fb-respuesta" id="fb-si" className="sr-only fb-input" />
<label htmlFor="fb-si" className="fb">👍 Sí</label>
<input type="radio" name="fb-respuesta" id="fb-no" className="sr-only fb-input" />
<label htmlFor="fb-no" className="fb">👎 No del todo</label>
<span className="fb-thanks">¡Gracias! Así aprendo a ayudarte mejor.</span>
<a href="#coach-respuesta" className="ml-auto text-[12.5px] font-semibold source-ink-11 hover:underline">¿Algo no cuadra? Habla con tu TL →</a>
</div>
<AiDisclosure fuentes={["Cronograma Moodle · Semana 3"]} />
</div>
</article>
</>}</div>
</section>

<section id="guardrail" aria-labelledby="guardrail-title" className="state scroll">
<span id="coach-guardrail" aria-hidden="true" className="coach-anchor"></span>
<div className="state-inner">{question && reply && reply.state === "guardrail" && <SimulatedConversation question={question} reply={reply} masked={masked} onBiasTest={() => openEthics('sesgo')} />}{(!question || reply?.state !== "guardrail") && <>

<h2 id="guardrail-title" className="sr-only">Límite de código: solo pistas</h2>
<p className="day-sep">Hoy · jueves</p>
<UserMsg text={question || "Bro, pásame el código completo del reto del DOM porfa, que no me da el tiempo 😩"} masked={masked && !!question} time="Hoy a las 10:40 a.m." />
<article className="msg">
<span className="avatar bot">
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</span>
<div className="msg-body">
<div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span><time className="msg-time">Hoy a las 10:40 a.m.</time></div>
<div className="guard-banner">
<span aria-hidden="true" className="text-[20px]">🛡️</span>
<div >
<p className="text-[14px] font-bold">Guardrail activo · Sin código completo</p>
<p className="mt-0.5 text-[13px] t-2">Regla del asistente: máximo 3 pistas lógicas por consulta.</p>
</div>
</div>
<p className="msg-text mt-3">Te entiendo, el tiempo aprieta 🫂. Pero si te paso el código, mañana el reto te gana a ti. Mejor te doy <b >3 pistas</b> para que lo saques en menos de lo que crees:</p>
<div aria-label="Código completo bloqueado" className="blocked-code">
<div aria-hidden="true" className="blur">const form = ████████(██████);<br  />form.████████(██████, (e) =&gt; &#123; ██████ &#125;);<br  />const item = ████.██████████(████);</div>
<div className="lock">🔒 Código completo no disponible · solo pistas</div>
</div>
<div className="card clue">
<span className="clue-n">1</span>
<h4 >Primero encuentra, después modifica</h4>
<p >Antes de cambiar algo en la página necesitas una <b className="source-detail-12">referencia</b> a ese elemento. Guarda cada referencia una sola vez al inicio. Concepto: <span className="kw">querySelector</span></p>
<p className="ask">Pregúntate: ¿qué elementos del HTML va a tocar mi programa?</p>
</div>
<div className="card clue">
<span className="clue-n">2</span>
<h4 >Escucha el evento correcto</h4>
<p >Un formulario no se “clickea”, se <b className="source-detail-13">envía</b>. Engánchate al evento de envío y evita que la página se recargue. Conceptos: <span className="kw">addEventListener</span>
<span className="kw">submit</span>
<span className="kw">preventDefault</span></p>
<p className="ask">Pregúntate: ¿qué pasa si la página se recarga antes de que mi código corra?</p>
</div>
<div className="card clue">
<span className="clue-n">3</span>
<h4 >Crea → llena → adjunta</h4>
<p >Los elementos nuevos nacen “en el aire”: primero los creas, luego les pones contenido y al final los cuelgas en su contenedor. Conceptos: <span className="kw">createElement</span>
<span className="kw">textContent</span>
<span className="kw">append</span></p>
<p className="ask">Pregúntate: ¿en qué contenedor debe aparecer cada nuevo elemento?</p>
</div>
<p className="msg-text mt-3">🎯 <b >Tu misión:</b> escribe tú la pista 1 y pégamela aquí. Te doy feedback sin escribirlo por ti.</p>
<div className="source">
<span aria-hidden="true">📚</span>
<span ><span className="source-label">Fuente verificable</span>
<b >Moodle · Semana 3 · Reto DOM (rúbrica)</b> (ejemplo) + <a className="verify-link" href="https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model/Introduction" target="_blank" rel="noopener noreferrer">MDN Web Docs: Introducción al DOM ↗</a></span>
<span className="source-meta">3/3 pistas</span>
</div>
<AiDisclosure fuentes={["Moodle · Semana 3 · Reto DOM (rúbrica)", "MDN Web Docs: Introducción al DOM"]} />
<p className="mt-3 text-[13px] t-3">¿Llevas más de 30 min bloqueado con estas pistas? <a href="#coach-guardrail" className="font-semibold source-ink-14 hover:underline">Pide una sesión con tu TL →</a></p>
</div>
</article>
</>}</div>
</section>

<section id="error" aria-labelledby="error-title" className="state scroll">
<span id="coach-error" aria-hidden="true" className="coach-anchor"></span>
<div className="state-inner">{question && reply && reply.state === "error" && <SimulatedConversation question={question} reply={reply} masked={masked} onBiasTest={() => openEthics('sesgo')} />}{(!question || reply?.state !== "error") && <>

<h2 id="error-title" className="sr-only">Error honesto y salida humana</h2>
<p className="day-sep">Hoy · jueves</p>
<UserMsg text={question || "Ayer estuve en urgencias y no pude entregar 😔 ¿Me justificas la falla y me mueves la fecha del reto?"} masked={masked && !!question} time="Hoy a las 10:52 a.m." />
<article className="msg">
<span className="avatar bot">
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</span>
<div className="msg-body">
<div className="msg-meta"><span className="msg-name">RiwiMate</span><span className="badge-tl">Copiloto · IA</span><time className="msg-time">Hoy a las 10:52 a.m.</time><span className="chip chip-media">⚠️ Fuera de mi alcance</span></div>
<p className="msg-text">Lo siento mucho, Nikola. Primero tú y tu salud 💜. Te voy a ser honesto: <b >esto no lo puedo resolver yo</b>, y no quiero darte una respuesta que te perjudique.</p>
<div className="honest mt-3">
<p className="text-[14px] font-bold">🙅 No tengo autorización para:</p>
<ul className="cant">
<li >Aprobar excusas o incapacidades médicas.</li>
<li >Modificar notas o mover fechas de entrega en Moodle.</li>
<li >Tomar decisiones sobre tu situación académica.</li>
</ul>
<p className="mt-4 text-[14px] font-bold">🙌 Lo que sí hago ahora mismo:</p>
<ul className="can">
<li >Conectarte directo con tu TL, que sí puede ayudarte.</li>
<li >Mostrarle las entregas afectadas: Reto DOM (ayer) y Git (hoy).</li>
<li >Recordarte qué llevar: soporte médico en PDF y fecha de atención.</li>
</ul>
</div>
<a href="#coach-error" className="btn btn-coach mt-4">🎧 Hablar directamente con mi TL</a><a href="#inicio" className="btn btn-soft retry-query mt-3">↻ Reintentar consulta</a>
<p className="mt-2 text-center text-[12.5px] t-3">Disponibilidad de ejemplo: <b className="source-detail-15">en línea</b> · respuesta promedio ~10 min</p>
<div className="draft">
<p className="mb-1 text-[11px] font-extrabold uppercase tracking-wider t-3">Borrador sugerido para tu TL (tú decides si enviarlo)</p>
                  “Hola Felonius, ayer estuve en urgencias y no pude entregar el Reto DOM. Tengo el soporte médico. ¿Me orientas sobre cómo reportarlo?”
                </div>
<div className="source">
<span aria-hidden="true">📚</span>
<span ><span className="source-label">Fuente verificable</span>
<b >Límites de RiwiMate · control humano</b> · Confirma el reglamento oficial y el procedimiento con tu TL</span>
<span className="source-meta">escalado a humano</span>
</div>
<AiDisclosure fuentes={["Límites de RiwiMate · control humano"]} />
</div>
</article>
</>}</div>
</section>

<section id="nuevo" aria-labelledby="nuevo-title" className="state scroll">
<div className="new-chat">
<h2 id="nuevo-title" className="new-chat-title grad-text">Hola, Nikola. ¿Qué tienes en mente?</h2>
<form className="new-chat-box" onSubmit={(event) => { event.preventDefault(); ask(newInput); }}>
<label htmlFor="nuevo-mensaje" className="sr-only">Pregunta a RiwiMate</label>
<input id="nuevo-mensaje" type="text" placeholder="Pregúntale a RiwiMate sobre tus entregas..." autoComplete="off" className="composer-input" value={newInput} onChange={(event) => setNewInput(event.target.value)} maxLength={1000} disabled={pending} />
<Button variant="riwi" size="native" aria-label="Enviar pregunta" type="submit" className="send" disabled={pending || !newInput.trim()}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"></path></svg>
</Button>
</form>
{!consent && <p className="consent-inline">🔒 {TEXTO_CONSENTIMIENTO}</p>}
<ul className="new-chat-list" aria-label="Sugerencias rápidas">
{NEW_CHAT_SUGGESTIONS.map((text) => <li key={text}><Button variant="riwi" size="native" type="button" className="new-chat-item" onClick={() => ask(text)} disabled={pending}><span aria-hidden="true">↗</span>{text}</Button></li>)}
</ul>
</div>
</section>

<section id="fallo" aria-labelledby="fallo-title" className="state scroll">
<span id="coach-fallo" aria-hidden="true" className="coach-anchor"></span>
{fault === 'offline' && <div role="status" className="offline-banner"><span>{OFFLINE_BANNER}</span></div>}
<div className="state-inner">
<h2 id="fallo-title" className="sr-only">Simulador de errores y casos borde</h2>
{fault && question ? <FaultConversation question={question} kind={fault} masked={masked} pending={pending} onRetry={retryFault} onRewrite={() => focusComposer()} onWriteDate={() => focusComposer(`El examen de ${missingSubject(question).toLowerCase()} vence en `)} onSuggest={ask} /> : <div className="fault-empty"><p className="text-[15px] font-bold">⚡ Simulador de errores y casos borde</p><p className="mt-1 text-[13.5px] t-2">Elige un escenario en «Simular fallo», arriba a la derecha, para ver cómo responde RiwiMate cuando algo falla.</p></div>}
</div>
</section>

<section id="inicio" aria-labelledby="inicio-title" className="state scroll">
<div className="state-inner">
<div className="welcome">
<div className="welcome-avatar">
<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="6" y="10" width="20" height="15" rx="6" fill="currentColor"></rect><circle cx="12.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><circle cx="19.5" cy="17.2" r="2" className="bot-eye" fill="currentColor"></circle><path d="M13 21.2c1.8 1.2 4.2 1.2 6 0" className="bot-mouth" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path><path d="M16 10V6.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"></path><circle cx="16" cy="5.4" r="1.8" fill="currentColor"></circle></svg>
</div>
<span className="pill-top">👋 Jueves · Semana 3 de Moodle</span>
<h2 id="inicio-title" className="welcome-title">¡Qué más, Nikola! Soy <span className="grad-text">RiwiMate</span>,<br className="hidden sm:block" /> tu TL de bolsillo.</h2>
<p className="welcome-sub">En esta maqueta revisamos entregas de ejemplo, las ordeno por prioridad y te digo cuánto tiempo te toma cada una. Tú pones el código, yo pongo el orden. 🤝</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<span className="chip chip-alta">🔴 3 urgentes</span>
<span className="chip chip-media">🟡 2 esta semana</span>
<span className="chip chip-baja">🟢 3 sin afán</span>
</div>
</div>
<p className="section-title mt-8 text-center">Empieza por aquí</p>
<div className="grid gap-3 sm:grid-cols-2">
<a href="#cargando" className="suggestion">
<span aria-hidden="true" className="ico">📅</span>
<span ><strong >¿Qué entrego primero hoy?</strong><span className="desc">Ordeno tus entregas por urgencia y tiempo estimado.</span></span>
<span aria-hidden="true" className="go">→</span>
</a>
<a href="#cargando" className="suggestion">
<span aria-hidden="true" className="ico">🗂️</span>
<span ><strong >Organiza mi Semana 3 por materia</strong><span className="desc">JavaScript, SQL, Inglés y más, con hora límite.</span></span>
<span aria-hidden="true" className="go">→</span>
</a>
<a href="#guardrail" className="suggestion">
<span aria-hidden="true" className="ico">🧩</span>
<span ><strong >Pásame el código del reto DOM</strong><span className="desc">Mira cómo te guío con pistas, sin regalarte la respuesta.</span></span>
<span aria-hidden="true" className="go">→</span>
</a>
<a href="#error" className="suggestion">
<span aria-hidden="true" className="ico">🩺</span>
<span ><strong >Tuve una calamidad médica, ¿qué hago?</strong><span className="desc">Cuando algo me queda grande, te conecto con tu TL.</span></span>
<span aria-hidden="true" className="go">→</span>
</a>
</div>
<div className="rules">
<span >Cómo priorizo:</span>
<span className="chip chip-alta">🔴 &lt; 24 h o reto del día</span>
<span className="chip chip-media">🟡 2 a 4 días</span>
<span className="chip chip-baja">🟢 5+ días o lecturas</span>
</div>
</div>
</section>
</div>

<footer className="composer">
<div aria-label="Atajos" className="quick">
<a href="#cargando">/prioridades</a>
<a href="#guardrail">/pistas</a>
<a href="#coach">/coach</a>
</div>
{!consent && <div role="note" className="consent-bar"><span aria-hidden="true">🔒</span><p>{TEXTO_CONSENTIMIENTO}</p><Button variant="riwi" size="native" type="button" className="btn btn-soft consent-ok" onClick={acceptConsent}>Entendido</Button></div>}
<form className="composer-box" onSubmit={sendQuestion}>
<label htmlFor="mensaje" className="sr-only">Escribe tu tarea o pregunta</label>
<input id="mensaje" type="text" placeholder="Escribe una tarea o pregúntale a RiwiMate…" autoComplete="off" className="composer-input" value={input} onChange={(event) => setInput(event.target.value)} maxLength={1000} disabled={pending} />
<Button variant="riwi" size="native" aria-label="Enviar mensaje" type="submit" className="send" disabled={pending || !input.trim()} title="Enviar mensaje">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"></path></svg>
</Button>
</form>
</footer>
</main>

<label htmlFor="toggle-entregas" aria-label="Cerrar panel de entregas" className="drawer-overlay"></label>
<aside aria-labelledby="entregas-title" className="entregas">
<header className="ent-head">
<div className="flex items-start justify-between gap-3">
<div >
<p className="eyebrow">Moodle · Semana 3</p>
<h2 id="entregas-title" className="mt-1 text-[17px] font-extrabold">Tablero de entregas</h2>
</div>
<label htmlFor="toggle-entregas" aria-label="Cerrar" className="drawer-close btn btn-ghost source-detail-16">✕</label>
<label htmlFor="collapse-board" aria-label="Ocultar tablero" title="Ocultar tablero" className="board-collapse btn btn-ghost source-detail-16">⟩</label>
</div>
<div className="mt-3 flex items-center justify-between text-[12px] t-2"><span >2 de 8 completadas</span><span className="mono t-3">≈ 10h restantes</span></div>
<div aria-hidden="true" className="week-bar"><span ></span></div>
</header>

<input type="radio" name="filtro" id="f-todas" defaultChecked className="sr-only" />
<input type="radio" name="filtro" id="f-alta" className="sr-only" />
<input type="radio" name="filtro" id="f-media" className="sr-only" />
<input type="radio" name="filtro" id="f-baja" className="sr-only" />
<div role="group" aria-label="Filtrar por prioridad" className="filters">
<label htmlFor="f-todas"><span >Todas</span><span className="n">8</span></label>
<label htmlFor="f-alta"><span >🔴 Alta</span><span className="n">3</span></label>
<label htmlFor="f-media"><span >🟡 Media</span><span className="n">2</span></label>
<label htmlFor="f-baja"><span >🟢 Baja</span><span className="n">3</span></label>
</div>
<div className="task-list scroll">
<div className="group g-alta">
<p className="group-title">🔴 Alta <span className="line"></span> 4h 55m</p>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">JavaScript</span><span className="chip chip-alta">Reto del día</span></span>
<span className="task-title">Reto diario: Manipulación del DOM</span>
<span className="task-meta"><span >⏰ Hoy · 11:59 p.m.</span><span className="mono">⏱ 2h 30m</span></span>
</span>
</label>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">Control de versiones</span><span className="chip chip-alta">&lt; 24 h</span></span>
<span className="task-title">Git: ramas y Pull Request del proyecto</span>
<span className="task-meta"><span >⏰ Hoy · 9:00 p.m.</span><span className="mono">⏱ 40m</span></span>
</span>
</label>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">Bases de datos</span><span className="chip chip-alta">&lt; 24 h</span></span>
<span className="task-title">Taller SQL: consultas con JOIN</span>
<span className="task-meta"><span >⏰ Mañana · 8:00 a.m.</span><span className="mono">⏱ 1h 45m</span></span>
</span>
</label>
</div>
<div className="group g-media">
<p className="group-title">🟡 Media <span className="line"></span> 3h 50m</p>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">Inglés</span><span className="chip chip-media">2 días</span></span>
<span className="task-title">Video speaking: “My daily routine”</span>
<span className="task-meta"><span >⏰ Sábado · 11:59 p.m.</span><span className="mono">⏱ 50m</span></span>
</span>
</label>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">HTML y CSS</span><span className="chip chip-media">4 días</span></span>
<span className="task-title">Proyecto integrador: maquetación responsive</span>
<span className="task-meta"><span >⏰ Lunes · 7:00 a.m.</span><span className="mono">⏱ 3h</span></span>
</span>
</label>
</div>
<div className="group g-baja">
<p className="group-title">🟢 Baja <span className="line"></span> 1h 15m</p>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">Lectura complementaria</span><span className="chip chip-baja">5 días</span></span>
<span className="task-title">Clean Code, cap. 2: “Nombres con sentido”</span>
<span className="task-meta"><span >⏰ Martes · 11:59 p.m.</span><span className="mono">⏱ 30m</span></span>
</span>
</label>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">JavaScript · complementario</span><span className="chip chip-baja">Lectura</span></span>
<span className="task-title">Video: el Event Loop explicado</span>
<span className="task-meta"><span >⏰ Sin fecha límite</span><span className="mono">⏱ 25m</span></span>
</span>
</label>
<label className="task">
<input type="checkbox" className="task-check sr-only" />
<span aria-hidden="true" className="checkbox">✓</span>
<span className="task-body">
<span className="task-top"><span className="subject">Habilidades blandas</span><span className="chip chip-baja">7 días</span></span>
<span className="task-title">Reflexión semanal de habilidades blandas</span>
<span className="task-meta"><span >⏰ Jueves 26 · 6:00 p.m.</span><span className="mono">⏱ 20m</span></span>
</span>
</label>
</div>
</div>
<footer className="ent-foot">
<div className="source compact">
<span aria-hidden="true">📚</span>
<span ><span className="source-label">Fuente</span>
<b >Cronograma Moodle · S3</b> + tareas del chat</span>
</div>
</footer>
</aside>
</div>

<div role="dialog" aria-modal="true" aria-labelledby="coach-title" className="modal">

<a href="#inicio" aria-label="Cerrar" className="modal-backdrop ret ret-inicio"></a>
<a href="#respuesta" aria-label="Cerrar" className="modal-backdrop ret ret-respuesta"></a>
<a href="#guardrail" aria-label="Cerrar" className="modal-backdrop ret ret-guardrail"></a>
<a href="#error" aria-label="Cerrar" className="modal-backdrop ret ret-error"></a>
<a href="#fallo" aria-label="Cerrar" className="modal-backdrop ret ret-fallo"></a>
<div className="modal-card scroll">
<div className="modal-cover">
<a href="#inicio" aria-label="Cerrar" className="modal-close ret ret-inicio">✕</a>
<a href="#respuesta" aria-label="Cerrar" className="modal-close ret ret-respuesta">✕</a>
<a href="#guardrail" aria-label="Cerrar" className="modal-close ret ret-guardrail">✕</a>
<a href="#error" aria-label="Cerrar" className="modal-close ret ret-error">✕</a>
<a href="#fallo" aria-label="Cerrar" className="modal-close ret ret-fallo">✕</a>
</div>
<div className="px-6 pb-6">
<div className="coach-avatar">FG<span className="status"></span></div>
<div className="mt-3">
<h3 id="coach-title" className="text-[22px] font-extrabold">Felonius Gru</h3>
<p className="text-[13.5px] t-2">Team Lead (TL) · Clan Tesla · Ruta Desarrollo Web</p>
<div className="mt-3 flex flex-wrap gap-2">
<span className="chip chip-baja"><span className="dot online"></span> En línea</span>
<span className="chip chip-ghost">⚡ Responde en ~10 min</span>
<span className="chip chip-brand">🤝 Tu TL asignado</span>
</div>
</div>
<p className="mt-4 rounded-xl p-3 text-[14px] leading-relaxed t-2 source-detail-17">
          “Hola, Nikola 👋 Para eso estoy. Cuéntame qué pasó y lo resolvemos juntos, sin juicios.”
        </p>
<p className="section-title source-detail-18">Conexión rápida</p>
<div className="grid gap-2">
<Button variant="riwi" size="native" type="button" className="connect-btn discord" onClick={() => setContactNotice("Simulación: no se envió ningún mensaje ni se reservó una cita. Contacta a tu TL por el canal oficial de tu clan.")}>
<span aria-hidden="true" className="ic">
<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 5.2A17 17 0 0 0 15.4 4l-.5 1a15.8 15.8 0 0 0-5.8 0l-.5-1a17 17 0 0 0-4.2 1.3C1.8 9.2 1.1 13 1.4 16.8a17 17 0 0 0 5.2 2.6l1.1-1.8a11 11 0 0 1-1.7-.8l.4-.3a12.2 12.2 0 0 0 11.2 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.2-2.6c.4-4.4-.7-8.2-3-11.6ZM8.7 14.5c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.8 2.1-1.9 2.1Z"></path></svg>
</span>
<span ><b >Abrir DM en Discord</b><small >@felonius.tl · Clan Tesla</small></span>
<span aria-hidden="true" className="arrow">→</span>
</Button>
<Button variant="riwi" size="native" type="button" className="connect-btn slack" onClick={() => setContactNotice("Simulación: no se envió ningún mensaje ni se reservó una cita. Contacta a tu TL por el canal oficial de tu clan.")}>
<span aria-hidden="true" className="ic">
<svg width="20" height="20" viewBox="0 0 24 24"><rect x="9.5" y="2" width="3.6" height="9" rx="1.8" fill="currentColor"></rect><rect x="2" y="10.9" width="9" height="3.6" rx="1.8" fill="currentColor"></rect><rect x="10.9" y="13" width="3.6" height="9" rx="1.8" fill="currentColor"></rect><rect x="13" y="9.5" width="9" height="3.6" rx="1.8" fill="currentColor"></rect></svg>
</span>
<span ><b >Enviar mensaje por Slack</b><small >#tl-tesla · respuesta prioritaria</small></span>
<span aria-hidden="true" className="arrow">→</span>
</Button>
<Button variant="riwi" size="native" type="button" className="connect-btn cal" onClick={() => setContactNotice("Simulación: no se envió ningún mensaje ni se reservó una cita. Contacta a tu TL por el canal oficial de tu clan.")}>
<span aria-hidden="true" className="ic">📅</span>
<span ><b >Agendar 1:1</b><small >Próximo espacio: hoy, 2:00 p.m. · 20 min</small></span>
<span aria-hidden="true" className="arrow">→</span>
</Button>
</div>
<div className="privacy mt-4">
<span aria-hidden="true">🔒</span>
<span >Maqueta: los canales y horarios son de ejemplo. No se envían mensajes ni datos médicos; contacta a tu TL por el canal oficial.</span>
{contactNotice && <p role="status">{contactNotice}</p>}</div>
</div>
</div>
</div>
<EthicsModal open={ethicsOpen} onOpenChange={setEthicsOpen} tab={ethicsTab} onTabChange={setEthicsTab} />
</>;
}
