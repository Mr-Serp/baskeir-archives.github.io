import fs from 'node:fs';
import vm from 'node:vm';
const dir=new URL('./',import.meta.url);
const html=fs.readFileSync(new URL('index.html',dir),'utf8');
const data=fs.readFileSync(new URL('book1-v2/book1-data.js',dir),'utf8');
const ui=fs.readFileSync(new URL('book1-v2/book1-ui.js',dir),'utf8');
const inline=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements=new Map();
function element(id){
  if(!elements.has(id))elements.set(id,{innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){},toggle(){}},addEventListener(){},closest(){return null}});
  return elements.get(id);
}
const sandbox={document:{querySelector:element,addEventListener(){},body:{classList:{toggle(){}}}},localStorage:{getItem(){return null}},location:{hash:''},window:{scrollTo(){},addEventListener(){}}};
vm.createContext(sandbox);
vm.runInContext(data+'\n'+ui+'\n'+inline,sandbox);
const content=element('#content');
const articles=vm.runInContext('BOOK1.articles',sandbox);
for(const a of articles){
  sandbox.location.hash='#/entry/'+a.id;
  vm.runInContext('render()',sandbox);
  if(!content.innerHTML.includes('<h1>'+a.name.replaceAll('&','&amp;').replaceAll('<','&lt;')+'</h1>'))throw Error('Missing title '+a.id);
  if(/undefined|Page unavailable|starter article|not yet been incorporated/.test(content.innerHTML))throw Error('Stale or incomplete article '+a.id);
  for(const section of a.sections)for(const n of section.refs)if(!content.innerHTML.includes('id="source-'+n+'"'))throw Error('Missing reference target '+a.id);
}
for(const hash of ['#/','#/chapters','#/sources','#/atlas',...new Set(articles.map(a=>'#/category/'+a.category))]){
  sandbox.location.hash=hash;vm.runInContext('render()',sandbox);
  if(/undefined|Page unavailable/.test(content.innerHTML))throw Error('Broken route '+hash);
}
for(const [id,query]of[['tempo','marcus regloth'],['garreth','halloway'],['tynir','faulksmith'],['pearls','deep pearl']]){
  if(!vm.runInContext(`book1Matches(E.find(e=>e[0]===${JSON.stringify(id)}),${JSON.stringify(query)})`,sandbox))throw Error('Alias search failed '+id);
}
console.log(`Rendered all ${articles.length} articles, home, atlas, chapter guide, source register, and category pages; citation targets and alias searches passed.`);
