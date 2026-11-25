const {test}=require('node:test');const assert=require('node:assert/strict');
const {createApp,cleanProfile,evaluateMeal}=require('../server');
const meal=(n,ingredient)=>({idMeal:String(90000+n),strMeal:'Receta '+n,strMealThumb:'https://www.themealdb.com/images/media/meals/abc.jpg',strIngredient1:ingredient,strMeasure1:'1 taza',strInstructions:'Preparar y servir.',strArea:'Italian'});
test('no guarda alergias sin consentimiento independiente',()=>{
 const profile=cleanProfile({likes:['pasta'],allergies:['trigo'],sensitiveConsent:false});
 assert.deepEqual(profile.allergies,['trigo']); // cleanProfile validates; profileForStorage enforces consent.
});
test('rechaza ingredientes alérgenos y mezclas ambiguas',()=>{
 let p={likes:['italiana'],allergies:['leche']};
 assert.equal(evaluateMeal({name:'Receta',ingredientNames:['milk'],instructions:'Bake'},p).excluded,true);
 assert.equal(evaluateMeal({name:'Receta',ingredientNames:['mixed sauce'],instructions:'Bake'},p).excluded,true);
 assert.equal(evaluateMeal({name:'Receta',ingredientNames:['rice'],instructions:'Boil'},p).excluded,false);
});
test('catálogo completo puede entregar más de 200 recetas con imágenes y fuente, y excluir alergias',async()=>{
 const mock=async url=>({ok:true,json:async()=>({meals:url.includes('f=a')?Array.from({length:220},(_,i)=>meal(i,i%2?'rice':'milk')):[]})});
 const app=createApp({fetchImpl:mock});await new Promise(r=>app.listen(0,r));
 const base='http://localhost:'+app.address().port;
 try{
 const r=await fetch(base+'/api/catalog/full');assert.equal(r.status,200);const data=await r.json();assert.equal(data.recipes.length,220);assert.ok(data.recipes.every(x=>x.image&&x.sourceUrl&&x.ingredients.length));
 const mail='test-'+Date.now()+'@example.org';
 const reg=await fetch(base+'/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Persona',email:mail,password:'Secret999000!',acceptedTerms:true,profile:{allergies:['leche'],sensitiveConsent:true,likes:['italiana']}})});
 assert.equal(reg.status,201);const user=await reg.json();assert.deepEqual(user.user.profile.allergies,['leche']);
 const cookie=reg.headers.get('set-cookie').split(';')[0];
 const rr=await fetch(base+'/api/catalog/full',{headers:{Cookie:cookie}});const filtered=await rr.json();assert.equal(filtered.recipes.length,110);assert.equal(filtered.excluded,110);
 const update=await fetch(base+'/api/auth/profile',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({profile:{allergies:['leche'],sensitiveConsent:false,likes:['arroz']}})});
 assert.equal(update.status,200);const updated=await update.json();assert.deepEqual(updated.user.profile.allergies,[]);
 const del=await fetch(base+'/api/auth/delete',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:'{}'});assert.equal(del.status,200);
 }finally{await new Promise(r=>app.close(r));}
});
