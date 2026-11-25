const test=require('node:test');const assert=require('node:assert/strict');
const {createApp,keyword,mapMeal}=require('../server');
const meal={idMeal:'12345',strMeal:'Rice Delight',strMealThumb:'https://www.themealdb.com/rice.jpg',strCategory:'Vegetarian',strArea:'Colombian',strIngredient1:'Rice',strMeasure1:'1 cup',strInstructions:'Boil the rice and cook until tender.',strSource:'https://example.com/rice'};
const fakeFetch=async(url,options)=>{
 if(url.includes('themealdb'))return{ok:true,json:async()=>({meals:[meal]})};
 if(url.includes('api.openai.com'))return{ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'Cocina el arroz con agua y comprueba el punto.'}]}]})};
 throw Error('unexpected');
};
async function withServer(apiKey,run){const app=createApp({fetchImpl:fakeFetch,apiKey});await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));try{await run(`http://127.0.0.1:${app.address().port}`);}finally{await new Promise(resolve=>app.close(resolve));}}
test('convierte «arroz» a término de API en inglés',()=>assert.equal(keyword('¿Cómo preparo arroz?'),'rice'));
test('mapea receta con fuente real',()=>assert.equal(mapMeal(meal).sourceUrl,'https://example.com/rice'));
test('estado indica cuándo no hay IA',async()=>withServer('',async(url)=>{const d=await(await fetch(url+'/api/status')).json();assert.equal(d.aiConfigured,false);}));
test('recetas de API reales con fuente y fotos',async()=>withServer('',async(url)=>{const r=await fetch(url+'/api/recipes?q=arroz');const d=await r.json();assert.equal(r.status,200);assert.equal(d.recipes[0].name,'Rice Delight');assert.ok(d.recipes[0].sourceUrl)}));
test('rechaza IA sin configuración',async()=>withServer('',async(url)=>{const r=await fetch(url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,question:'¿Cómo preparo arroz?'})});assert.equal(r.status,503)}));
test('rechaza enviar pregunta a IA sin consentimiento',async()=>withServer('fakekey',async(url)=>{const r=await fetch(url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:false,question:'¿Cómo preparo arroz?'})});assert.equal(r.status,403)}));
test('deriva consulta sobre alergias',async()=>withServer('fakekey',async(url)=>{const r=await fetch(url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,question:'¿Tengo alergia a arroz?'})});assert.equal(r.status,422)}));
test('marca respuesta como IA y muestra fuente verificable',async()=>withServer('fakekey',async(url)=>{const r=await fetch(url+'/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({consent:true,question:'¿Cómo preparo arroz?'})});const d=await r.json();assert.equal(r.status,200);assert.equal(d.generatedBy,'IA');assert.equal(d.source.url,'https://example.com/rice')}));
test('protege ruta fuera del directorio',async()=>withServer('',async(url)=>{const r=await fetch(url+'/../../../../etc/passwd');assert.notEqual(r.status,200)}));
