// Cocina Clara: recetas adaptadas de fuentes externas verificables. La IA externa se conectará en una versión futura.
const recetas = [
{id:'arroz',nombre:'Arroz blanco suelto',categoria:'almuerzo',minutos:30,porciones:'3 porciones',imagen:'imagenes/arroz.svg',descripcion:'Un básico colombiano, explicado paso a paso.',ingredientes:['1 taza de arroz blanco','2 tazas de agua (verifica las indicaciones del empaque)','1 cucharadita de aceite','Sal al gusto'],pasos:['Revisa el tipo de arroz y las instrucciones de su empaque.','Pon a calentar el agua con sal y aceite en una olla.','Agrega el arroz y cocina hasta que se reduzca el líquido.','Baja el fuego, tapa y deja cocer hasta que el grano esté tierno.','Retira del fuego, deja reposar y suelta los granos con un tenedor.'],fuente:'Recetas Nestlé Colombia',url:'https://www.recetasnestle.com.co/blog-sabor/coccion/comidas-faciles-hacer',etiquetas:['arroz','arroz blanco','guarnición','colombiana','económico','fácil'],nota:'Adaptación resumida de una guía de cocina básica; proporción y tiempos varían según el arroz.'},
{id:'pasta',nombre:'Pasta fresca con tomate',categoria:'almuerzo',minutos:25,porciones:'2 porciones',imagen:'imagenes/pasta.svg',descripcion:'Tomate fresco, ajo y pasta, sin una salsa pesada.',ingredientes:['200 g de pasta','3 tomates maduros','1 diente de ajo','Aceite de oliva','Hojas de albahaca (opcional)','Sal al gusto'],pasos:['Cuece la pasta en agua con sal siguiendo su envase.','Corta los tomates y pica finamente el ajo.','Calienta el aceite, cocina el ajo brevemente e incorpora el tomate.','Deja que se ablande el tomate, ajusta la sal y añade albahaca si deseas.','Mezcla la pasta con la salsa, usando un poco del agua de cocción si hace falta.'],fuente:'BBC Good Food',url:'https://www.bbcgoodfood.com/recipes/fresh-tomato-pasta',etiquetas:['pasta','espaguetis','tomate','italiana','vegetariano','rápido'],nota:'Versión simplificada inspirada en la receta publicada; consulta las cantidades exactas en la fuente.'},
{id:'huevos',nombre:'Huevos revueltos con maíz',categoria:'desayuno',minutos:15,porciones:'2 porciones',imagen:'imagenes/huevos.svg',descripcion:'Un desayuno con huevos, maíz tierno y un toque de queso.',ingredientes:['3 huevos','1/2 taza de maíz tierno cocido','Queso rallado al gusto','1 cucharadita de mantequilla o aceite','Sal al gusto'],pasos:['Escurre el maíz y bate los huevos en un recipiente.','Calienta una sartén y agrega la mantequilla o el aceite.','Incorpora el maíz y el queso, y remueve brevemente.','Vierte los huevos y cocina removiendo hasta que queden bien cocidos.','Sirve caliente con arepa o pan.'],fuente:'RecetasGratis',url:'https://www.recetasgratis.net/receta-de-huevos-revueltos-con-maiz-tierno-60372.html',etiquetas:['huevos','huevo','pericos','maíz','choclo','queso','rápido'],nota:'Adaptación casera basada en la preparación de huevos con maíz de la fuente.'},
{id:'arepa',nombre:'Arepa de choclo con queso',categoria:'desayuno',minutos:30,porciones:'4 arepas pequeñas',imagen:'imagenes/arepa.svg',descripcion:'Arepa dulce de maíz tierno con queso derretido.',ingredientes:['2 tazas de granos de maíz tierno','1/4 taza de leche (ajusta la textura)','2 cucharadas de azúcar (opcional)','Queso fresco o doble crema','Mantequilla para la sartén'],pasos:['Procesa el maíz tierno con la leche hasta lograr una mezcla espesa.','Añade azúcar si deseas y mezcla sin dejar la masa demasiado líquida.','Calienta una sartén con un poco de mantequilla.','Forma arepas pequeñas y cocínalas por ambos lados hasta dorarlas y cocer el centro.','Sirve con queso para que se derrita con el calor.'],fuente:'RecetasGratis',url:'https://www.recetasgratis.net/receta-de-arepa-de-choclo-dulce-con-queso-55389.html',etiquetas:['arepa','arepas','choclo','maíz','queso','colombiana','dulce'],nota:'Adaptación para una preparación doméstica. Consulta la receta original para proporciones precisas.'},
{id:'ensalada',nombre:'Ensalada de tomate y pepino',categoria:'ligero',minutos:12,porciones:'2 porciones',imagen:'imagenes/ensalada.svg',descripcion:'Fresca y sencilla, con hierbas aromáticas.',ingredientes:['2 tomates','1 pepino','Un puñado de cilantro fresco','Jugo de limón','Aceite de oliva','Sal al gusto'],pasos:['Lava los tomates, el pepino y el cilantro.','Corta las verduras en trozos pequeños.','Pica el cilantro y mézclalo con las verduras.','Añade aceite, limón y sal poco antes de servir.','Revuelve suavemente y sirve fría.'],fuente:'BBC Good Food',url:'https://www.bbcgoodfood.com/recipes/tomato-cucumber-coriander-salad',etiquetas:['ensalada','tomate','pepino','verduras','vegetariano','ligero','rápido'],nota:'Adaptación breve de una ensalada con tomate, pepino y cilantro.'},
{id:'avena',nombre:'Avena con banano y canela',categoria:'desayuno',minutos:15,porciones:'2 porciones',imagen:'imagenes/avena.svg',descripcion:'Avena caliente con fruta y aroma de canela.',ingredientes:['1 taza de avena en hojuelas','2 tazas de leche o bebida vegetal','1 banano maduro','Canela al gusto','Yogur natural (opcional)'],pasos:['Calienta la leche en una olla a fuego medio-bajo.','Agrega la avena y cocina revolviendo hasta obtener una textura cremosa.','Añade una pizca de canela.','Corta el banano en rodajas y úsalo para cubrir la avena.','Sirve con yogur si deseas.'],fuente:'BBC Good Food',url:'https://www.bbcgoodfood.com/recipes/cinnamon-porridge-banana-berries',etiquetas:['avena','banano','banana','desayuno','fruta','dulce','rápido'],nota:'Versión simplificada inspirada en la avena con banano y canela de la fuente.'}
];
recetas.forEach(r => r.tiempo = r.minutos + ' min');
let categoriaActual='todas';
let ultimaPregunta='';
let temporizador;
const $ = id => document.getElementById(id);
const estados=['estado-vacio','estado-cargando','estado-respuesta','estado-error'];
function mostrarEstado(nombre){estados.forEach(id=>$(id).classList.toggle('oculto',id!==nombre));}
function prepararTexto(texto){return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
const equivalencias = {huevos:'huevo',bananas:'banano',banana:'banano',guineo:'banano',espagueti:'pasta',espaguetis:'pasta',maiz:'choclo',arrozito:'arroz',arros:'arroz',facil:'facil',rapida:'rapido',rapidas:'rapido',desayunar:'desayuno',almorzar:'almuerzo',verdura:'verduras'};
const comunes = new Set(['que','como','quiero','hacer','preparar','una','unos','unas','para','algo','con','tengo','hacerme','receta','recetas','de','del','la','el','los','las','y','en','me','gustaria','cocinar','hay','se','puede','un']);
function normalizarPalabra(palabra){const p=prepararTexto(palabra).replace(/[^a-z0-9]/g,'');return equivalencias[p]||p;}
function tokensBuscar(cadena){return cadena.split(/\s+/).map(normalizarPalabra).filter(p=>p.length>1&&!comunes.has(p));}
function similitud(a,b){if(Math.abs(a.length-b.length)>2)return false;const dp=Array.from({length:a.length+1},(_,i)=>i);for(let i=1;i<=b.length;i++){let prev=dp[0];dp[0]=i;for(let j=1;j<=a.length;j++){const tmp=dp[j];dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(a[j-1]===b[i-1]?0:1));prev=tmp;}}return dp[a.length]<=1;}
function puntuacionReceta(receta,consulta){
  const palabras=tokensBuscar(consulta);if(!palabras.length)return 1;
  const nombre=tokensBuscar(receta.nombre),ingredientes=tokensBuscar(receta.ingredientes.join(' ')),etiquetas=tokensBuscar(receta.etiquetas.join(' '));
  let puntos=0,coincidencias=0;
  palabras.forEach(p=>{const enNombre=nombre.some(t=>t.includes(p)||p.includes(t)||similitud(t,p));const enEtiquetas=etiquetas.some(t=>t.includes(p)||similitud(t,p));const enIngredientes=ingredientes.some(t=>t.includes(p)||similitud(t,p));if(enNombre||enEtiquetas||enIngredientes){coincidencias++;puntos+=enNombre?7:enEtiquetas?5:3;}});
  if(!coincidencias)return 0;
  if(prepararTexto(consulta).includes('rapido')||prepararTexto(consulta).includes('facil')||prepararTexto(consulta).includes('menos de'))puntos+=receta.minutos<=15?5:0;
  if(prepararTexto(consulta).includes('desayun'))puntos+=receta.categoria==='desayuno'?6:0;
  if(prepararTexto(consulta).includes('almuerz'))puntos+=receta.categoria==='almuerzo'?6:0;
  return puntos+coincidencias/palabras.length;
}
let ordenActual='relevancia';let soloFavoritos=false;
function recetasEncontradas(){
  const consulta=$('buscar-receta').value.trim();
  let resultados=recetas.map(r=>({receta:r,puntos:puntuacionReceta(r,consulta)}))
    .filter(x=>x.puntos>0&&(categoriaActual==='todas'||x.receta.categoria===categoriaActual)&&(!soloFavoritos||favoritos.includes(x.receta.id)));
  if(ordenActual==='rapidas')resultados.sort((a,b)=>a.receta.minutos-b.receta.minutos);
  else if(ordenActual==='nombre')resultados.sort((a,b)=>a.receta.nombre.localeCompare(b.receta.nombre));
  else resultados.sort((a,b)=>b.puntos-a.puntos);
  return resultados.map(x=>x.receta);
}
let favoritos=[]; // No acceder a favoritos persistentes antes del consentimiento explícito.
function pintarRecetas(){
  const filtradas=recetasEncontradas();$('lista-recetas').replaceChildren();
  filtradas.forEach(r=>{
    const articulo=document.createElement('article');articulo.className='receta-tarjeta';
    articulo.innerHTML=`<div class="foto-pendiente">Guía local · Consulta la fuente para ver su presentación original</div><div class="receta-cuerpo"><div class="meta"><span>⏱ ${r.tiempo}</span><span>🍽 ${r.porciones}</span></div><h3>${r.nombre}</h3><p>${r.descripcion}</p><p class="fuente-mini">📚 ${r.fuente} · Adaptación</p><div class="acciones-receta"><button type="button" class="boton boton-principal ver-receta" data-id="${r.id}">Ver receta →</button><button type="button" class="boton favorito" data-id="${r.id}" aria-label="${favoritos.includes(r.id)?'Quitar de favoritos':'Guardar en favoritos'}" aria-pressed="${favoritos.includes(r.id)}">${favoritos.includes(r.id)?'♥':'♡'}</button></div></div>`;
    $('lista-recetas').append(articulo);
  });
  $('sin-recetas').classList.toggle('oculto',filtradas.length>0);
  $('cantidad-recetas').textContent=filtradas.length+' '+(filtradas.length===1?'receta':'recetas');
  $('texto-busqueda').textContent=$('buscar-receta').value.trim()?`Resultados para «${$('buscar-receta').value.trim()}»`:'Explora ideas caseras con referencias comprobables';
}
function abrirReceta(id){
  const r=recetas.find(x=>x.id===id); if(!r)return;
  $('detalle-imagen').style.display='none';$('detalle-imagen').alt='';
  $('detalle-titulo').textContent=r.nombre;$('detalle-resumen').textContent=r.descripcion+' · '+r.tiempo+' · '+r.porciones;
  $('detalle-ingredientes').replaceChildren();$('detalle-pasos').replaceChildren();
  r.ingredientes.forEach(x=>{const li=document.createElement('li');li.textContent=x;$('detalle-ingredientes').append(li);});
  r.pasos.forEach(x=>{const li=document.createElement('li');li.textContent=x;$('detalle-pasos').append(li);});
  $('detalle-fuente').href=r.url;$('detalle-fuente').textContent=r.fuente+' ↗';$('detalle-nota').textContent=r.nota;
  $('detalle-receta').showModal();
}
$('buscar-receta').addEventListener('input',pintarRecetas);
$('ordenar-recetas').addEventListener('change',e=>{ordenActual=e.target.value;pintarRecetas();});
$('solo-favoritos').addEventListener('click',()=>{soloFavoritos=!soloFavoritos;$('solo-favoritos').setAttribute('aria-pressed',String(soloFavoritos));pintarRecetas();});
document.querySelectorAll('.busqueda-sugerida').forEach(b=>b.addEventListener('click',()=>{$('buscar-receta').value=b.dataset.busqueda;pintarRecetas();}));
$('limpiar-busqueda').addEventListener('click',()=>{$('buscar-receta').value='';categoriaActual='todas';soloFavoritos=false;$('solo-favoritos').setAttribute('aria-pressed','false');$('ordenar-recetas').value='relevancia';ordenActual='relevancia';actualizarFiltros();pintarRecetas();});
function actualizarFiltros(){document.querySelectorAll('.filtro').forEach(b=>{const activo=b.dataset.categoria===categoriaActual;b.classList.toggle('activo',activo);b.setAttribute('aria-pressed',String(activo));});}
document.querySelectorAll('.filtro').forEach(b=>b.addEventListener('click',()=>{categoriaActual=b.dataset.categoria;actualizarFiltros();pintarRecetas();}));
$('lista-recetas').addEventListener('click',e=>{const b=e.target.closest('.ver-receta');if(b){abrirReceta(b.dataset.id);return;}const f=e.target.closest('.favorito');if(f){const id=f.dataset.id;favoritos=favoritos.includes(id)?favoritos.filter(x=>x!==id):[...favoritos,id];if(permisos.preferencias)localStorage.setItem('cocina-clara-favoritos',JSON.stringify(favoritos));pintarRecetas();}});
$('cerrar-detalle').addEventListener('click',()=>$('detalle-receta').close());
// Tema guardado. Se respeta la preferencia explícita del usuario.
const temaGuardado=localStorage.getItem('cocina-clara-consent-preferencias')==='si'?localStorage.getItem('cocina-clara-tema'):null;
if(temaGuardado==='oscuro')document.documentElement.dataset.tema='oscuro';
function actualizarBotonTema(){const oscuro=document.documentElement.dataset.tema==='oscuro';$('cambiar-tema').textContent=oscuro?'☀️ Claro':'🌙 Oscuro';$('cambiar-tema').setAttribute('aria-pressed',String(oscuro));$('cambiar-tema').setAttribute('aria-label',oscuro?'Activar modo claro':'Activar modo oscuro');}
$('cambiar-tema').addEventListener('click',()=>{const oscuro=document.documentElement.dataset.tema==='oscuro';document.documentElement.dataset.tema=oscuro?'claro':'oscuro';if(permisos.preferencias)localStorage.setItem('cocina-clara-tema',document.documentElement.dataset.tema);actualizarBotonTema();});
actualizarBotonTema();
// La conexión reportada por el navegador es REAL, no una simulación.
function actualizarConexion(){const online=navigator.onLine;$('conexion-estado').textContent=online?'Con conexión':'Sin conexión';$('conexion-luz').classList.toggle('caida',!online);$('conexion-luz').title=online?'Navegador conectado a la red':'Sin conexión detectada';}
window.addEventListener('online',actualizarConexion);window.addEventListener('offline',actualizarConexion);actualizarConexion();
function mostrarError(tipo,simulado=false){
  const titulo=$('error-titulo'), texto=$('error-texto'),reintentar=$('reintentar');
  $('error-fuente').classList.add('oculto');reintentar.classList.remove('oculto');
  const prefijo=simulado?'[Simulación] ':' ';
  if(tipo==='offline'){titulo.textContent='📡 '+prefijo+'Sin conexión';texto.textContent='No se pudo consultar un servicio externo. La pregunta permanece guardada: puedes reintentar cuando tengas conexión. Las recetas locales siguen disponibles.';}
  else if(tipo==='servidor'){titulo.textContent='⚠️ '+prefijo+'Servicio no disponible';texto.textContent='La conexión al servicio falló. No voy a inventar una respuesta. Puedes reintentar o hablar con una persona.';}
  else if(tipo==='invalida'){titulo.textContent='🤔 Pregunta poco clara';texto.textContent='No entendí la consulta. Prueba «¿Cómo preparo arroz?» o elige una receta del catálogo.';reintentar.classList.add('oculto');}
  else if(tipo==='delicado'){titulo.textContent='👩‍🍳 Consulta que requiere una persona';texto.textContent='Para alergias, intoxicaciones y seguridad alimentaria no debo recomendar una solución sin revisión profesional.';reintentar.classList.add('oculto');}
  else {titulo.textContent='📚 No encontré esa información';texto.textContent='No hay una respuesta respaldada en el catálogo local y no voy a inventarla. Busca una receta o reformula tu consulta.';$('error-fuente').classList.remove('oculto');reintentar.classList.add('oculto');}
  mostrarEstado('estado-error');
}
function consultar(pregunta){
  const texto=pregunta.trim();if(!texto){$('pregunta').focus();return;}
  ultimaPregunta=texto;$('pregunta').value=texto;clearTimeout(temporizador);mostrarEstado('estado-cargando');
  temporizador=setTimeout(()=>{
    const normal=prepararTexto(texto);
    if(/alerg|intoxic|medicamento|enferm|vencid|caducad|seguro comer|embaraz/.test(normal)){mostrarError('delicado');return;}
    if(normal.length<5||/^(asdf|qwerty|12345)/.test(normal)){mostrarError('invalida');return;}
    const receta=recetas.map(r=>({r,puntuacion:puntuacionReceta(r,texto)})).sort((a,b)=>b.puntuacion-a.puntuacion)[0];
    if(!receta||receta.puntuacion<=0){mostrarError('desconocido');return;}
    const r=receta.r;
    $('respuesta-tipo').textContent='🍽️ Respuesta de la guía local · NO es IA';$('respuesta-advertencia').textContent='Respuesta de reglas locales. Puede ser incompleta: verifica la fuente. Si hay una duda urgente, consulta con una persona.';$('pregunta-visible').textContent='Tú: '+texto;
    $('respuesta-texto').textContent=r.pasos.slice(0,3).join(' ')+' Puedes ver el resto en la receta completa.';
    $('fuente-enlace').textContent=r.fuente+' · '+r.nombre+' ↗';$('fuente-enlace').href=r.url;
    mostrarEstado('estado-respuesta');
  },650);
}
$('formulario').addEventListener('submit',e=>{e.preventDefault();solicitarRespuesta($('pregunta').value);});
document.querySelectorAll('.sugerencia').forEach(b=>b.addEventListener('click',()=>solicitarRespuesta(b.dataset.pregunta)));

$('reintentar').addEventListener('click',()=>solicitarRespuesta(ultimaPregunta||'¿Cómo preparo arroz?'));
const ayuda=$('ventana-ayuda');document.querySelectorAll('.ayuda-humana').forEach(b=>b.addEventListener('click',()=>ayuda.showModal()));
pintarRecetas();

 
// === PRIVACIDAD Y API: las preguntas no se almacenan en el navegador ===
const permisos={preferencias:false,recetas:false,ia:false};
function actualizarConsentimiento(){
  $('aviso-envio').textContent=permisos.ia?'Al preguntar, tu texto se enviará al servidor y al proveedor de IA si está configurado. No se guarda aquí.':'Consultas locales únicamente. Activa «Autorizar consultas a un proveedor de IA» para usar la IA.';
  $('privacidad-estado').textContent=permisos.preferencias?'Preferencias guardadas solo en este dispositivo.':'Preferencias en memoria temporal; no se guardan tras cerrar la página.';
}
$('permiso-preferencias').addEventListener('change',e=>{
  permisos.preferencias=e.target.checked;
  if(permisos.preferencias){
    localStorage.setItem('cocina-clara-consent-preferencias','si');
    localStorage.setItem('cocina-clara-tema',document.documentElement.dataset.tema||'claro');
    localStorage.setItem('cocina-clara-favoritos',JSON.stringify(favoritos));
  } else {
    ['cocina-clara-consent-preferencias','cocina-clara-tema','cocina-clara-favoritos'].forEach(x=>localStorage.removeItem(x));
  }
  actualizarConsentimiento();
});
$('permiso-recetas').addEventListener('change',e=>{permisos.recetas=e.target.checked;$('permiso-catalogo-rapido').checked=e.target.checked;actualizarConsentimiento();});
$('permiso-ia').addEventListener('change',e=>{permisos.ia=e.target.checked;actualizarConsentimiento();});
$('borrar-datos').addEventListener('click',()=>{
  ['cocina-clara-consent-preferencias','cocina-clara-tema','cocina-clara-favoritos'].forEach(x=>localStorage.removeItem(x));
  permisos.preferencias=false;permisos.recetas=false;permisos.ia=false;
  ['permiso-preferencias','permiso-recetas','permiso-ia','permiso-catalogo-rapido'].forEach(x=>$(x).checked=false);
  favoritos=[];pintarRecetas();actualizarConsentimiento();$('privacidad-estado').textContent='Preferencias eliminadas. No se guardan preguntas.';
});
if(localStorage.getItem('cocina-clara-consent-preferencias')==='si'){
  permisos.preferencias=true;$('permiso-preferencias').checked=true;
  try {const ids=JSON.parse(localStorage.getItem('cocina-clara-favoritos')||'[]'); favoritos=Array.isArray(ids)?ids.filter(x=>typeof x==='string'):[];}catch{favoritos=[];}
  pintarRecetas();
}
actualizarConsentimiento();
let iaDisponible=false;
async function chequearIA(){
  try{const r=await fetch('/api/status',{cache:'no-store'});if(!r.ok)throw new Error('Sin servidor');
    const data=await r.json(); iaDisponible=Boolean(data.aiConfigured);
    $('modo-asistente').textContent=iaDisponible?'IA disponible con consentimiento · Fuente enlazada':'Asistente local · IA sin configurar';
  } catch {iaDisponible=false;$('modo-asistente').textContent='Asistente local · abre la página con npm start para conectar APIs';}
}
chequearIA();

// Catálogo externo: se consulta en cada visita autorizada y permite cargar más lotes.
// Las fotos las proporciona la misma fuente de cada receta; sin credenciales de Google.
function crearElemento(tipo,clase,texto){const el=document.createElement(tipo);if(clase)el.className=clase;if(texto)el.textContent=texto;return el;}
let recetasApi=[];let cuentaActual=null;let catalogoCompleto=[];let soloRecomendaciones=false;
let paginaCatalogo=0;
let masPaginas=true;
let consultaEnCurso=false;
let temporizadorBusqueda;
const recetasVistas=new Set();
function mostrarRecetasApi(datos,{reemplazar=false}={}){
  if(reemplazar){recetasApi=[];recetasVistas.clear();}
  datos.forEach(r=>{if(r.id&&!recetasVistas.has(r.id)){recetasVistas.add(r.id);recetasApi.push(r);}});
  $('recetas-externas').classList.remove('oculto');
  $('lista-recetas-externas').replaceChildren();
  for(const r of recetasApi){
    const card=crearElemento('article','receta-tarjeta');
    if(r.image){const img=crearElemento('img');img.src=r.image;img.alt='Fotografía de '+r.name+' facilitada por TheMealDB';img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onerror=()=>{img.style.display='none';};card.append(img);}
    else{card.append(crearElemento('div','foto-pendiente','Esta receta no incluye fotografía verificada'));}
    const body=crearElemento('div','receta-cuerpo');
    if(r.recommendationScore>0)body.append(crearElemento('p','etiqueta-recomendacion','✦ Coincide con tus gustos'));body.append(crearElemento('h3','',r.name));
    body.append(crearElemento('p','',`${r.category||'Receta'} · ${r.area||'Origen no indicado'}`));
    const b=crearElemento('button','boton boton-principal','Ver ingredientes y pasos →');b.type='button';b.addEventListener('click',()=>abrirRecetaApi(r));body.append(b);
    const link=crearElemento('a','fuente-mini','Fuente original ↗');link.href=r.sourceUrl;link.target='_blank';link.rel='noopener noreferrer';body.append(link);card.append(body);$('lista-recetas-externas').append(card);
  }
  $('cuenta-externas').textContent=`${recetasApi.length} recetas con fotografía y referencia de TheMealDB. ${cuentaActual?.profile?.allergies?.length?'Se excluyeron recetas con coincidencias de alérgenos o ingredientes ambiguos.':'Puedes registrar tus gustos en Mi cuenta para personalizar.'}`;
}
function abrirRecetaApi(r){
  $('detalle-imagen').style.display=r.image?'block':'none';$('detalle-imagen').src=r.image||'';$('detalle-imagen').alt='Fotografía de '+r.name;
  $('detalle-titulo').textContent=r.name;
  $('detalle-resumen').textContent=`Receta publicada en TheMealDB · ${r.area||'Origen no indicado'}. Algunos textos están en inglés.`;
  $('detalle-ingredientes').replaceChildren();r.ingredients.forEach(x=>$('detalle-ingredientes').append(crearElemento('li','',x)));
  $('detalle-pasos').replaceChildren();(r.instructions||'Consulta la receta original').split(/\r?\n+/).filter(Boolean).slice(0,16).forEach(x=>$('detalle-pasos').append(crearElemento('li','',x)));
  $('detalle-fuente').href=r.sourceUrl;$('detalle-fuente').textContent='Consultar fuente original ↗';
  $('detalle-nota').textContent='Receta externa no verificada clínicamente. Comprueba cantidades y alérgenos. La fotografía pertenece a la ficha del proveedor.';
  $('detalle-receta').showModal();
}
function verificarPermisoRecetas(){
 if(permisos.recetas)return true;
 $('estado-api-recetas').textContent='Para consultar el catálogo actualizado, activa el permiso de recetas externas en Privacidad. Las guías locales siguen disponibles sin ese permiso.';
 return false;
}
async function peticionRecetas(ruta,{agregar=false,boton=null}={}){
 if(!verificarPermisoRecetas())return;
 if(consultaEnCurso)return;
 if(!navigator.onLine){$('estado-api-recetas').textContent='No hay conexión. Las guías locales continúan disponibles.';return;}
 consultaEnCurso=true;
 if(boton)boton.disabled=true;
 $('estado-api-recetas').textContent='Cargando recetas con fotografías reales…';
 try{
  const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),12000);
  let respuesta;
  try{respuesta=await fetch(ruta,{signal:ctrl.signal,cache:'no-store'});}finally{clearTimeout(t);}
  const data=await respuesta.json();if(!respuesta.ok)throw Error(data.error||'El servicio no respondió.');
  mostrarRecetasApi(data.recipes||[],{reemplazar:!agregar});
  if(data.nextPage!==undefined){paginaCatalogo=data.nextPage??13;masPaginas=data.nextPage!==null;}
  $('descubrir-mas').disabled=!masPaginas;
  $('descubrir-mas').textContent=masPaginas?'Cargar más recetas ↓':'Has explorado todas las letras';
  $('estado-api-recetas').textContent=data.recipes?.length?`Catálogo actualizado desde TheMealDB · ${recetasApi.length} recetas visibles.`:'No hay recetas para esta búsqueda. Prueba con otro ingrediente o nombre en inglés.';
 }catch(e){$('estado-api-recetas').textContent='No fue posible cargar las recetas. Comprueba tu conexión o vuelve a intentar.';}
 finally{consultaEnCurso=false;if(boton)boton.disabled=false;}
}

async function cargarCatalogoCompleto(){
 if(!verificarPermisoRecetas()||consultaEnCurso)return;
 if(!navigator.onLine){$('estado-api-recetas').textContent='No hay internet; las guías locales siguen disponibles.';return;}
 consultaEnCurso=true;$('actualizar-catalogo').disabled=true;
 $('estado-api-recetas').textContent='Consultando todas las letras del catálogo. Esto puede tardar unos segundos…';
 try{
  const controller=new AbortController();const to=setTimeout(()=>controller.abort(),35000);
  let response;try{response=await fetch('/api/catalog/full',{cache:'no-store',credentials:'same-origin',signal:controller.signal});}finally{clearTimeout(to);}
  const data=await response.json();if(!response.ok)throw Error(data.error||'Sin respuesta');
  catalogoCompleto=data.recipes||[];mostrarRecetasApi(catalogoCompleto,{reemplazar:true});
  $('descubrir-mas').classList.add('oculto');
  $('estado-api-recetas').textContent=`${catalogoCompleto.length} recetas consultadas con su fuente y fotografía · Actualizado: ${new Date(data.updatedAt).toLocaleTimeString()}. ${data.excluded?'Se omitieron '+data.excluded+' platos por el filtro de alérgenos.':''}`;
  $('aviso-alergias').textContent=data.notice;
 }catch(e){$('estado-api-recetas').textContent='El catálogo externo no está disponible ahora. Reintenta; no inventamos fichas ni fotos.';}
 finally{consultaEnCurso=false;$('actualizar-catalogo').disabled=false;}
}

async function cargarCatalogo({reiniciar=false}={}){
 if(reiniciar){paginaCatalogo=0;masPaginas=true;}
 await cargarCatalogoCompleto();return;
 if(!masPaginas)return;
 await peticionRecetas('/api/catalog?page='+paginaCatalogo,{agregar:!reiniciar,boton:$('descubrir-mas')});
}
function buscarExterno(){
 const q=$('buscar-receta').value.trim();
 if(!verificarPermisoRecetas())return;
 if(!catalogoCompleto.length){cargarCatalogoCompleto();return;}
 // La búsqueda conserva el filtro del perfil que ya aplicó el servidor.
 const words=tokensBuscar(q);const matches=!words.length?catalogoCompleto:catalogoCompleto.filter(r=>{
   const terms=tokensBuscar([r.name,r.category,r.area,...r.ingredientNames].join(' '));
   return words.some(w=>terms.some(t=>t.includes(w)||w.includes(t)||similitud(t,w)));
 });
 mostrarRecetasApi(matches,{reemplazar:true});
 $('estado-api-recetas').textContent=`${matches.length} resultados dentro de tu catálogo filtrado. Ninguna coincidencia certifica seguridad ante alergias.`;
}
$('buscar-online').addEventListener('click',buscarExterno);
$('permiso-catalogo-rapido').addEventListener('change',event=>{$('permiso-recetas').checked=event.target.checked;$('permiso-recetas').dispatchEvent(new Event('change'));});
$('descubrir-mas').addEventListener('click',()=>cargarCatalogo());
$('actualizar-catalogo').addEventListener('click',()=>cargarCatalogo({reiniciar:true}));
$('buscar-receta').addEventListener('input',()=>{
 clearTimeout(temporizadorBusqueda);
 if(!permisos.recetas)return;
 temporizadorBusqueda=setTimeout(()=>{
  const q=$('buscar-receta').value.trim();if(q.length>=3)buscarExterno();
  else if(!q){mostrarRecetasApi(catalogoCompleto,{reemplazar:true});$('estado-api-recetas').textContent=`${catalogoCompleto.length} recetas disponibles en tu catálogo filtrado.`;}
 },750);
});
if(permisos.recetas)cargarCatalogo({reiniciar:true});
$('permiso-recetas').addEventListener('change',()=>{
 if($('permiso-recetas').checked)cargarCatalogo({reiniciar:true});
 else{$('recetas-externas').classList.add('oculto');$('estado-api-recetas').textContent='Consulta externa desactivada.';}
});

function preguntaDeRiesgo(texto){return /alerg|intoxic|medicamento|enferm|vencid|caducad|seguro comer|embaraz|anafilax|celiac|gluten para mi|diabet|puedo comer esto|me hace daño/i.test(prepararTexto(texto));}
async function solicitarRespuesta(texto){
  const pregunta=texto.trim();if(!pregunta)return;
  if(!permisos.ia || !iaDisponible){consultar(pregunta);return;}
  ultimaPregunta=pregunta;clearTimeout(temporizador);
  if(preguntaDeRiesgo(pregunta)){mostrarError('delicado');return;}
  if(pregunta.length<5){mostrarError('invalida');return;}
  mostrarEstado('estado-cargando');
  try {
    const controller=new AbortController();const reloj=setTimeout(()=>controller.abort(),14000);
    let resp;
    try{resp=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:pregunta,consent:true}),signal:controller.signal});}
    finally{clearTimeout(reloj);}
    const datos=await resp.json();
    if(!resp.ok){if(resp.status===404){mostrarError('desconocido');return;}if(resp.status===422){mostrarError('delicado');return;}if(resp.status===503){mostrarError('servidor');return;}throw new Error(datos.error||'Error real del servicio');}
    $('respuesta-tipo').textContent='🤖 Respuesta generada por IA · revisa su fuente';
    $('pregunta-visible').textContent='Tú: '+pregunta;
    $('respuesta-texto').textContent=datos.answer;
    $('fuente-enlace').textContent=datos.source.name+' ↗';$('fuente-enlace').href=datos.source.url;
    $('respuesta-advertencia').textContent='Esta respuesta la generó una IA y puede contener errores o sesgos. Verifica la fuente antes de cocinar. Si hay riesgo para tu salud, habla con una persona profesional.';
    mostrarEstado('estado-respuesta');
  } catch(err) {mostrarError(navigator.onLine?'servidor':'offline');}
}

// === CUENTAS ===
// La cuenta no es requisito para consultar recetas; solo guardamos nombre/correo/hash en SQLite.
const dlgCuenta=$('dialogo-cuenta');let esRegistro=true;
const opcionesGustos={colombiana:'🇨🇴 Colombiana',italiana:'🍝 Italiana',asiatica:'🥢 Asiática',mexicana:'🌮 Mexicana',vegetariana:'🥗 Vegetariana',rapida:'⏱ Recetas rápidas',postres:'🍰 Postres',desayunos:'🍳 Desayunos',pollo:'🍗 Pollo',pasta:'🍝 Pasta',arroz:'🍚 Arroz',verduras:'🥦 Verduras'};
const opcionesAlergias={leche:'Leche',huevo:'Huevo',mani:'Maní',frutos_secos:'Frutos secos',trigo:'Trigo',soya:'Soya',pescado:'Pescado',mariscos:'Mariscos',sesamo:'Sésamo'};
function crearChips(id,items){const dest=$(id);for(const [value,label] of Object.entries(items)){const chip=crearElemento('label','chip-perfil');const input=document.createElement('input');input.type='checkbox';input.value=value;chip.append(input,document.createTextNode(label));dest.append(chip);}}
for(const name of ['registro','perfil']){crearChips('gustos-'+name,opcionesGustos);crearChips('alergias-'+name,opcionesAlergias);}
function leerChips(prefix){return {likes:[...$('gustos-'+prefix).querySelectorAll('input:checked')].map(x=>x.value),allergies:[...$('alergias-'+prefix).querySelectorAll('input:checked')].map(x=>x.value),sensitiveConsent:$('permiso-alergias-'+prefix).checked};}
function mostrarChips(prefix,profile={}){for(const input of $('gustos-'+prefix).querySelectorAll('input'))input.checked=(profile.likes||[]).includes(input.value);for(const input of $('alergias-'+prefix).querySelectorAll('input'))input.checked=(profile.allergies||[]).includes(input.value);$('permiso-alergias-'+prefix).checked=Boolean(profile.sensitiveConsent);}

function cambiarModoCuenta(registro){
  esRegistro=registro;$('perfil-registro').classList.toggle('oculto',!registro);$('label-nombre').classList.toggle('oculto',!registro);$('nombre-cuenta').classList.toggle('oculto',!registro);$('nombre-cuenta').required=registro;
  $('label-terminos').classList.toggle('oculto',!registro);$('acepta-terminos').required=registro;
  $('enviar-cuenta').textContent=registro?'Crear cuenta':'Iniciar sesión';
  $('clave-cuenta').autocomplete=registro?'new-password':'current-password';
  $('tab-registro').className='boton '+(registro?'boton-principal':'boton-secundario');$('tab-login').className='boton '+(!registro?'boton-principal':'boton-secundario');$('estado-cuenta').textContent='';
}
$('abrir-cuenta').addEventListener('click',()=>dlgCuenta.showModal());$('cerrar-cuenta').addEventListener('click',()=>dlgCuenta.close());
$('tab-registro').addEventListener('click',()=>cambiarModoCuenta(true));$('tab-login').addEventListener('click',()=>cambiarModoCuenta(false));
function mostrarUsuario(u){cuentaActual=u;if(u)mostrarChips('perfil',u.profile);$('cuenta-entrada').classList.toggle('oculto',Boolean(u));$('cuenta-sesion').classList.toggle('oculto',!u);$('abrir-cuenta').textContent=u?'Hola, '+u.name.split(' ')[0]:'Mi cuenta';if(u)$('saludo-cuenta').textContent=`Sesión iniciada: ${u.name} (${u.email})`;}
async function enviarCuenta(ruta,payload){const res=await fetch(ruta,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(payload)});const data=await res.json();if(!res.ok)throw Error(data.error||'No se pudo completar la solicitud');return data;}
$('form-cuenta').addEventListener('submit',async event=>{event.preventDefault();$('estado-cuenta').textContent='Comprobando…';$('enviar-cuenta').disabled=true;
  try{const obj={email:$('correo-cuenta').value,password:$('clave-cuenta').value};if(esRegistro){obj.name=$('nombre-cuenta').value;obj.acceptedTerms=$('acepta-terminos').checked;obj.profile=leerChips('registro');}
    const data=await enviarCuenta(esRegistro?'/api/auth/register':'/api/auth/login',obj);mostrarUsuario(data.user);$('form-cuenta').reset();if(permisos.recetas)cargarCatalogoCompleto();$('estado-cuenta').textContent='Cuenta lista. Tus preguntas no se guardan.';
  }catch(err){$('estado-cuenta').textContent=err.message;}finally{$('enviar-cuenta').disabled=false;}
});
$('guardar-perfil').addEventListener('click',async()=>{
 try{const result=await enviarCuenta('/api/auth/profile',{profile:leerChips('perfil')});mostrarUsuario(result.user);$('perfil-estado').textContent='Preferencias actualizadas. Las alergias se guardan solo con consentimiento.';if(permisos.recetas)await cargarCatalogoCompleto();}
 catch(e){$('perfil-estado').textContent=e.message;}
});
$('cerrar-sesion').addEventListener('click',async()=>{try{await enviarCuenta('/api/auth/logout',{});mostrarUsuario(null);if(permisos.recetas)cargarCatalogoCompleto();$('estado-cuenta').textContent='Sesión cerrada.';}catch{$('estado-cuenta').textContent='No se pudo cerrar sesión.';}});
$('eliminar-cuenta').addEventListener('click',async()=>{if(!confirm('¿Eliminar tu cuenta y tus datos de inicio de sesión de forma permanente?'))return;try{await enviarCuenta('/api/auth/delete',{});mostrarUsuario(null);if(permisos.recetas)cargarCatalogoCompleto();$('estado-cuenta').textContent='Cuenta eliminada.';}catch{$('estado-cuenta').textContent='No fue posible eliminar la cuenta.';}});
fetch('/api/auth/me',{credentials:'same-origin'}).then(r=>r.json()).then(d=>{mostrarUsuario(d.user);if(d.user&&permisos.recetas)cargarCatalogoCompleto();}).catch(()=>{});
