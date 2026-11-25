const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../server');
const mock=async url=>({ok:true,json:async()=>({meals:[{idMeal:url.includes('f=a')?'100':'200',strMeal:url.includes('f=a')?'Arepa':'Biryani',strMealThumb:'https://www.themealdb.com/images/media/meals/sample.jpg',strInstructions:'Cocinar y servir.',strIngredient1:'Rice',strMeasure1:'1 cup'}]})});
test('catálogo devuelve 2 letras, fotos y paginación',async()=>{
 const server=createApp({fetchImpl:mock});await new Promise(r=>server.listen(0,r));
 try {let r=await fetch(`http://localhost:${server.address().port}/api/catalog?page=0`);assert.equal(r.status,200);let d=await r.json();assert.equal(d.recipes.length,2);assert.equal(d.nextPage,1);assert(d.recipes.every(x=>x.image.startsWith('https://')));}
 finally {server.close();}
});
test('rechaza páginas de catálogo inválidas',async()=>{
 const server=createApp({fetchImpl:mock});await new Promise(r=>server.listen(0,r));
 try {let r=await fetch(`http://localhost:${server.address().port}/api/catalog?page=99`);assert.equal(r.status,400);}
 finally {server.close();}
});
