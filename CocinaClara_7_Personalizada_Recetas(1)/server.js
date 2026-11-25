// Servidor educativo sin dependencias. Node 20+.
// No escribimos preguntas, IP ni respuestas a archivos o logs.
'use strict';
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const {URL}=require('node:url');
const crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
let db;
function database(){
 if(!db){const dir=path.join(__dirname,'data');require('node:fs').mkdirSync(dir,{recursive:true,mode:0o700});db=new DatabaseSync(path.join(dir,'cuentas.sqlite'));db.exec(`CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, salt TEXT NOT NULL, hash TEXT NOT NULL, created_at INTEGER NOT NULL, accepted_terms_at INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires INTEGER NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id));`);const cols=db.prepare('PRAGMA table_info(users)').all().map(x=>x.name);if(!cols.includes('profile_json'))db.exec("ALTER TABLE users ADD COLUMN profile_json TEXT NOT NULL DEFAULT '{}'");}return db;
}
const attempts=new Map();
function cookies(req){return Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=')).filter(x=>x.length===2));}
function sha256(v){return crypto.createHash('sha256').update(v).digest('hex');}
function authed(req){const t=cookies(req).cc_session;if(!t||!/^[a-f0-9]{64}$/.test(t))return null;return database().prepare('SELECT u.id,u.name,u.email,u.profile_json FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>?').get(sha256(t),Date.now())||null;}
// Personalización opcional. No incluye diagnósticos ni historial de preguntas.
const ALLERGENS=['leche','huevo','mani','frutos_secos','trigo','soya','pescado','mariscos','sesamo'];
const LIKES=['colombiana','italiana','asiatica','mexicana','vegetariana','rapida','postres','desayunos','pollo','pasta','arroz','verduras'];
function cleanProfile(p){
 const likes=Array.isArray(p?.likes)?p.likes.filter(x=>LIKES.includes(x)).slice(0,12):[];
 const allergies=Array.isArray(p?.allergies)?p.allergies.filter(x=>ALLERGENS.includes(x)).slice(0,9):[];
 return {likes:[...new Set(likes)],allergies:[...new Set(allergies)],sensitiveConsent:p?.sensitiveConsent===true};
}
function publicUser(u){if(!u)return null;let profile={likes:[],allergies:[],sensitiveConsent:false};try{profile={...profile,...JSON.parse(u.profile_json||'{}')}}catch{}return {id:u.id,name:u.name,email:u.email,profile};}
function profileForStorage(p){const profile=cleanProfile(p);if(!profile.sensitiveConsent)profile.allergies=[];return JSON.stringify(profile);}
function sessionCookie(res,token,clear=false){const secure=process.env.COOKIE_SECURE==='true'?'; Secure':'';res.setHeader('Set-Cookie',`cc_session=${clear?'':token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${clear?0:604800}${secure}`);}
function sameOrigin(req){const origin=req.headers.origin;if(!origin)return true;try{return new URL(origin).host===req.headers.host;}catch{return false;}}
function takeAttempt(key){const now=Date.now();const old=attempts.get(key)||[];const recent=old.filter(t=>now-t<15*60*1000);if(recent.length>=5)return false;recent.push(now);attempts.set(key,recent);return true;}
function validateUserInput(o){return typeof o.name==='string'&&o.name.trim().length>=2&&o.name.trim().length<=60&&typeof o.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email)&&o.email.length<=180&&typeof o.password==='string'&&o.password.length>=10&&o.password.length<=128;}

const ROOT=__dirname;
const TYPES={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.ico':'image/x-icon'};
const terms={arroz:'rice',pollo:'chicken',pasta:'pasta',tomate:'tomato',huevo:'egg',huevos:'egg',ensalada:'salad',carne:'beef',pescado:'fish',patata:'potato',papa:'potato',avena:'oat',sopa:'soup',vegetariano:'vegetarian',arepa:'corn',limon:'lemon',queso:'cheese',desayuno:'egg',almuerzo:'chicken'};
const unsafe=/alerg|intoxic|venen|me enferm|medicament|intoleran|embaraz|puedo comer esto|me hace dano|es seguro comer|diabet|anafilax|caducad|vencid|celiac|salud|hospital/i;
function normalize(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function keyword(q){const words=normalize(q).replace(/[^a-z\s]/g,' ').split(/\s+/).filter(Boolean);for(const w of words){if(terms[w])return terms[w];}const blacklist=new Set(['como','hacer','preparar','quiero','receta','recetas','tengo','con','para','algo','cocinar','una','unos','unos','las','los','del','esta','puedo','comer','que','de','en','el','la','y']);return words.find(w=>w.length>=3&&!blacklist.has(w))?.slice(0,40)||'rice';}
function urlSafe(str){try{const url=new URL(str);return url.protocol==='https:'?url.toString():null;}catch{return null;}}
function mapMeal(meal){
  const id=String(meal.idMeal||'').replace(/\D/g,'');
  const source=urlSafe(meal.strSource)||`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
  return {id,name:String(meal.strMeal||'Receta'),category:String(meal.strCategory||''),area:String(meal.strArea||''),image:urlSafe(meal.strMealThumb)||'',sourceUrl:source,
    ingredientNames:Array.from({length:20},(_,i)=>String(meal['strIngredient'+(i+1)]||'').trim()).filter(Boolean),ingredients:Array.from({length:20},(_,i)=>{const k=i+1;const ingredient=String(meal['strIngredient'+k]||'').trim();const amount=String(meal['strMeasure'+k]||'').trim();return ingredient?`${amount} ${ingredient}`.trim():null;}).filter(Boolean),
    instructions:String(meal.strInstructions||'').slice(0,3600),provider:'TheMealDB'};
}
// Safety: this is an approximate screen, never a determination of allergen safety.
const ALLERGEN_WORDS={
 leche:/milk|cheese|cream|butter|yogurt|yoghurt|ghee|whey|paneer|queso|leche|mantequilla|crema|lactose/i,
 huevo:/egg|mayonnaise|meringue|huevo|mayonesa/i,
 mani:/peanut|groundnut|mani|cacahuete|cacahuate/i,
 frutos_secos:/almond|walnut|cashew|pistachio|hazelnut|pecan|macadamia|pine nut|almendra|nuez|anacardo/i,
 trigo:/wheat|flour|pasta|bread|noodle|couscous|semolina|breadcrumbs|harina|trigo|pan|galleta|tortilla de harina/i,
 soya:/soy|soya|tofu|miso|tempeh|edamame/i,
 pescado:/fish|salmon|tuna|cod|anchov|sardine|tilapia|trout|bacalao|atún|salmón/i,
 mariscos:/shrimp|prawn|crab|lobster|oyster|mussel|scallop|clam|squid|octopus|camar[oó]n|langostino|calamar|almeja|ostra/i,
 sesamo:/sesame|tahini|ajonjoli|sésamo|sesamo/i
};
const AMBIGUOUS=/sauce|seasoning|spice mix|stock cube|bouillon|dressing|marinade|curry paste|gravy|mixed|salsa preparada|aderezo/i;
const MEAT=/beef|chicken|pork|lamb|veal|bacon|ham|turkey|duck|sausage|fish|salmon|tuna|shrimp|prawn|crab|anchov|gelatin/i;
function evaluateMeal(meal,profile){
 const ingredients=meal.ingredientNames||[];
 const combined=ingredients.join(' / ');
 const allergies=profile.allergies||[];
 const detected=allergies.filter(a=>ALLERGEN_WORDS[a]?.test(combined));
 const incomplete=!ingredients.length||!meal.instructions||AMBIGUOUS.test(combined);
 let score=0;const text=[meal.name,meal.category,meal.area,...ingredients].join(' ').toLowerCase();
 for(const like of profile.likes||[]){if(like==='vegetariana'){if(!MEAT.test(text))score+=5;else score-=25;}
  else if(like==='rapida'){score+=0;} // El proveedor no publica tiempos comprobables.
  else if(like==='italiana'&&/italian|pasta/i.test(text))score+=8;
  else if(like==='asiatica'&&/chinese|japanese|thai|vietnamese/i.test(text))score+=8;
  else if(like==='mexicana'&&/mexican/i.test(text))score+=8;
  else if(like==='colombiana'&&/colombian/i.test(text))score+=8;
  else if(like==='postres'&&/dessert|cake|pudding|sweet|pie/i.test(text))score+=7;
  else if(like==='desayunos'&&/breakfast|egg|pancake/i.test(text))score+=7;
  else if(text.includes(like))score+=5;
 }
 return {detected,incomplete,score,excluded:detected.length>0||(allergies.length>0&&incomplete)};
}
const fullCatalog={expires:0,recipes:[],promise:null};
async function wholeCatalog(fetchImpl){
 if(fullCatalog.expires>Date.now()&&fullCatalog.recipes.length)return fullCatalog.recipes;
 if(fullCatalog.promise)return fullCatalog.promise;
 fullCatalog.promise=(async()=>{
  const letters='abcdefghijklmnopqrstuvwxyz'.split('');const results=[];let idx=0;
  async function worker(){while(idx<letters.length){const letter=letters[idx++];const c=new AbortController();const timer=setTimeout(()=>c.abort(),8500);
   try{const response=await fetchImpl(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`,{signal:c.signal});if(!response.ok)continue;const payload=await response.json();for(const meal of payload.meals||[])results.push(mapMeal(meal));}catch{}finally{clearTimeout(timer);}
  }}
  await Promise.all(Array.from({length:6},worker));
  const unique=[...new Map(results.map(r=>[r.id,r])).values()].filter(r=>r.image&&r.ingredientNames.length&&r.instructions.trim()&&r.sourceUrl);
  if(!unique.length)throw Error('No se pudo obtener el catálogo externo');
  fullCatalog.recipes=unique;fullCatalog.expires=Date.now()+30*60*1000;return unique;
 })();try{return await fullCatalog.promise}finally{fullCatalog.promise=null;}
}
function send(res,status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(payload));}
async function fetchRecipes(text,fetchImpl){
 const q=keyword(text);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),7500);
 try{
   const req=await fetchImpl(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`,{signal:controller.signal});
   if(!req.ok)throw Error('Proveedor de recetas no disponible');
   const data=await req.json();return Array.isArray(data.meals)?data.meals.slice(0,9).map(mapMeal):[];
 }finally{clearTimeout(timer);}
}
function extractText(body){
 if(typeof body.output_text==='string')return body.output_text;
 return (body.output||[]).flatMap(item=>item.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
}
async function readBody(req){
 let value='';for await(const piece of req){value+=piece.toString();if(value.length>5000)throw Object.assign(new Error('Mensaje demasiado largo'),{status:413});}
 try{return JSON.parse(value);}catch{throw Object.assign(new Error('JSON inválido'),{status:400});}
}
function createApp({fetchImpl=globalThis.fetch,apiKey=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL||'gpt-4.1-mini'}={}){
 return http.createServer(async(req,res)=>{
  // Se recomienda usar HTTPS al publicar; no registrar contenido de usuarios.
  const url=new URL(req.url,'http://localhost');
  try{
   if(url.pathname.startsWith('/api/auth/')){
     if(req.method!=='GET'&&!sameOrigin(req))return send(res,403,{error:'Origen no autorizado'});
     if(req.method==='GET'&&url.pathname==='/api/auth/me'){const u=authed(req);return send(res,200,{user:publicUser(u)});}
     if(req.method==='POST'&&url.pathname==='/api/auth/register'){
       const o=await readBody(req);if(!validateUserInput(o)||o.acceptedTerms!==true)return send(res,400,{error:'Completa nombre, correo y contraseña (mínimo 10 caracteres), y acepta los términos.'});
       const email=o.email.trim().toLowerCase(), d=database();
       if(d.prepare('SELECT id FROM users WHERE email=?').get(email))return send(res,409,{error:'Ese correo ya está registrado.'});
       const salt=crypto.randomBytes(16).toString('hex'), hash=crypto.scryptSync(o.password,salt,64).toString('hex'),id=crypto.randomUUID(),now=Date.now();
       d.prepare('INSERT INTO users(id,name,email,salt,hash,created_at,accepted_terms_at,profile_json) VALUES(?,?,?,?,?,?,?,?)').run(id,o.name.trim(),email,salt,hash,now,now,profileForStorage(o.profile));
       const token=crypto.randomBytes(32).toString('hex');d.prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)').run(sha256(token),id,now+604800000);sessionCookie(res,token);return send(res,201,{user:publicUser({id,name:o.name.trim(),email,profile_json:profileForStorage(o.profile)})});
     }
     if(req.method==='POST'&&url.pathname==='/api/auth/login'){
       const o=await readBody(req), email=String(o.email||'').trim().toLowerCase(),pass=String(o.password||'');
       if(email.length>180||pass.length>128||!takeAttempt(sha256(email)))return send(res,429,{error:'Demasiados intentos. Vuelve a intentarlo en 15 minutos.'});
       const u=database().prepare('SELECT * FROM users WHERE email=?').get(email);
       const candidate=crypto.scryptSync(pass,u?.salt||'00000000000000000000000000000000',64);
       if(!u||!crypto.timingSafeEqual(candidate,Buffer.from(u.hash,'hex')))return send(res,401,{error:'Correo o contraseña incorrectos.'});
       const token=crypto.randomBytes(32).toString('hex');database().prepare('INSERT INTO sessions(token_hash,user_id,expires) VALUES(?,?,?)').run(sha256(token),u.id,Date.now()+604800000);sessionCookie(res,token);return send(res,200,{user:publicUser(u)});
     }
     if(req.method==='POST'&&url.pathname==='/api/auth/profile'){
       const u=authed(req);if(!u)return send(res,401,{error:'Primero inicia sesión.'});
       const input=await readBody(req);const profile=profileForStorage(input.profile);
       database().prepare('UPDATE users SET profile_json=? WHERE id=?').run(profile,u.id);
       return send(res,200,{user:publicUser({...u,profile_json:profile})});
     }
     if(req.method==='POST'&&url.pathname==='/api/auth/logout'){const token=cookies(req).cc_session;if(token)database().prepare('DELETE FROM sessions WHERE token_hash=?').run(sha256(token));sessionCookie(res,'',true);return send(res,200,{ok:true});}
     if(req.method==='POST'&&url.pathname==='/api/auth/delete'){const u=authed(req);if(!u)return send(res,401,{error:'Inicia sesión primero.'});database().prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);database().prepare('DELETE FROM users WHERE id=?').run(u.id);sessionCookie(res,'',true);return send(res,200,{ok:true});}
     return send(res,404,{error:'Ruta de cuenta desconocida'});
   }
   if(req.method==='GET'&&url.pathname==='/api/status')return send(res,200,{aiConfigured:Boolean(apiKey),recipeProvider:'TheMealDB',privacy:'Sin historial guardado por esta aplicación'});
   if(req.method==='GET'&&url.pathname==='/api/catalog/full'){
     const user=authed(req);const profile=user?publicUser(user).profile:{likes:[],allergies:[]};
     const list=await wholeCatalog(fetchImpl);
     const enriched=list.map(recipe=>({recipe,check:evaluateMeal(recipe,profile)}));
     const eligible=enriched.filter(x=>!x.check.excluded).sort((a,b)=>b.check.score-a.check.score);
     const blocked=enriched.length-eligible.length;
     return send(res,200,{recipes:eligible.map(({recipe,check})=>({...recipe,recommendationScore:check.score,allergenNote:profile.allergies?.length?'Filtro orientativo: ingredientes publicados, sin garantía sobre trazas ni contaminación cruzada.':'Ingredientes del proveedor; verifica antes de consumir.'})),total:eligible.length,excluded:blocked,source:'TheMealDB',updatedAt:new Date().toISOString(),notice:'El filtro no certifica ausencia de alérgenos. Revisa etiquetas, trazas, sustituciones y contaminación cruzada con un profesional.'});
   }
   if(req.method==='GET'&&url.pathname==='/api/recipes'){
     const q=(url.searchParams.get('q')||'').trim();if(q.length>120)return send(res,400,{error:'Búsqueda muy larga'});
     const recipes=await fetchRecipes(q||'rice',fetchImpl);return send(res,200,{recipes,source:'TheMealDB'});
   }
   // Catálogo renovable: dos letras por lote, actualización del proveedor al recargar.
   if(req.method==='GET'&&url.pathname==='/api/catalog'){
     const page=Number(url.searchParams.get('page')||0);
     if(!Number.isInteger(page)||page<0||page>12)return send(res,400,{error:'Página inválida'});
     const alphabet='abcdefghijklmnopqrstuvwxyz';
     const letters=alphabet.slice(page*2,page*2+2).split('');
     const collected=await Promise.allSettled(letters.map(async letter=>{
       const controller=new AbortController(); const tm=setTimeout(()=>controller.abort(),8000);
       try{const r=await fetchImpl(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`,{signal:controller.signal});
         if(!r.ok)throw Error('Proveedor de recetas no disponible');const data=await r.json();
         return (data.meals||[]).map(mapMeal);
       }finally{clearTimeout(tm);}
     }));
     const recipes=collected.filter(x=>x.status==='fulfilled').flatMap(x=>x.value);
     if(!recipes.length&&collected.every(x=>x.status==='rejected'))return send(res,503,{error:'No pudimos actualizar las recetas desde TheMealDB'});
     return send(res,200,{recipes:[...new Map(recipes.map(x=>[x.id,x])).values()],source:'TheMealDB',page,nextPage:page<12?page+1:null,updatedAt:new Date().toISOString()});
   }
   if(req.method==='GET'&&url.pathname==='/api/discover'){
      const letter=(url.searchParams.get('letter')||'a').toLowerCase();if(!/^[a-z]$/.test(letter))return send(res,400,{error:'Letra inválida'});
      const controller=new AbortController();const tm=setTimeout(()=>controller.abort(),7500);
      try{const r=await fetchImpl(`https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`,{signal:controller.signal});if(!r.ok)throw Error('API no disponible');const data=await r.json();return send(res,200,{recipes:(data.meals||[]).slice(0,24).map(mapMeal),source:'TheMealDB'});}finally{clearTimeout(tm);}
   }
   if(req.method==='POST'&&url.pathname==='/api/ask'){
     if(!apiKey)return send(res,503,{error:'IA no configurada en el servidor'});
     if(!String(req.headers['content-type']||'').includes('application/json'))return send(res,415,{error:'Se requiere JSON'});
     const input=await readBody(req);
     if(input.consent!==true)return send(res,403,{error:'Se requiere consentimiento explícito para enviar la pregunta a la IA'});
     const question=typeof input.question==='string'?input.question.trim():'';
     if(question.length<5||question.length>500)return send(res,400,{error:'Pregunta inválida'});
     if(unsafe.test(normalize(question)))return send(res,422,{error:'Consulta delicada: acudir a una persona profesional'});
     const meals=await fetchRecipes(question,fetchImpl);
     if(!meals.length)return send(res,404,{error:'No encontré una receta verificable y no voy a inventarla'});
     const meal=meals[0];const context={name:meal.name,ingredients:meal.ingredients,instructions:meal.instructions,source:meal.sourceUrl};
     const abort=new AbortController();const timeout=setTimeout(()=>abort.abort(),11000);
     let result;
     try{
      result=await fetchImpl('https://api.openai.com/v1/responses',{method:'POST',signal:abort.signal,headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`},body:JSON.stringify({model,store:false,max_output_tokens:300,instructions:'Eres un asistente culinario de carácter educativo. Responde SOLO en español, máximo 110 palabras, basándote estrictamente en la receta y los ingredientes recibidos. No inventes cantidades, pasos ni fuentes, ni supongas preferencias personales. Reconoce límites y diferencias culturales. Si falta información, dilo. Nunca des consejos médicos o dietéticos personales. Esta respuesta es generada por IA y puede equivocarse.',input:`Pregunta del usuario: ${question}\nReceta fuente verificable (datos externos): ${JSON.stringify(context)}`})});
     }finally{clearTimeout(timeout);}
     if(!result.ok)return send(res,503,{error:'Proveedor de IA no disponible'});
     const body=await result.json();const answer=extractText(body).trim();
     if(!answer)return send(res,503,{error:'El proveedor no devolvió texto'});
     return send(res,200,{answer,generatedBy:'IA',source:{name:`TheMealDB · ${meal.name}`,url:meal.sourceUrl},warning:'La IA puede equivocarse. Comprueba siempre la fuente.'});
   }
   if(req.method!=='GET')return send(res,405,{error:'Método no permitido'});
   const requested=url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname);
   const file=path.resolve(ROOT,'.'+requested);
   if(!file.startsWith(ROOT+path.sep))return send(res,403,{error:'Acceso denegado'});
   if(!TYPES[path.extname(file)])return send(res,404,{error:'No encontrado'});
   const data=await fs.readFile(file);
   res.writeHead(200,{'Content-Type':TYPES[path.extname(file)],'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'self'; img-src 'self' https://www.themealdb.com https://www.bbcgoodfood.com data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'"});res.end(data);
  }catch(err){
   if(err.code==='ENOENT')return send(res,404,{error:'No encontrado'});
   return send(res,err.status||503,{error:err.status?err.message:'No se pudo completar la solicitud. Prueba de nuevo.'});
  }
 });
}
if(require.main===module){const PORT=Number(process.env.PORT||3000);createApp().listen(PORT,()=>process.stdout.write(`Cocina Clara disponible en http://localhost:${PORT}\n`));}
module.exports={createApp,keyword,mapMeal,cleanProfile,evaluateMeal};
