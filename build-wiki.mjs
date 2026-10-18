import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(fs.readFileSync(path.join(root, 'content/book1.json'), 'utf8'));
const updates = JSON.parse(fs.readFileSync(path.join(root, 'content/updates.json'), 'utf8'));
const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;').replaceAll('`','&#96;').replaceAll('$','&#36;');
const dateLabel = value => new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
for (const [i,update] of updates.entries()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(update.date) || !update.title || !update.summary || !/^#\/(sources|chapters|atlas|entry\/[a-z0-9-]+)$/.test(update.link) || (i && updates[i-1].date < update.date)) throw Error('Invalid or out-of-order update log entry');
}
const updateLog = `<section class="updates" aria-labelledby="updates-heading"><h2 id="updates-heading">From the Archives · Update Log</h2><p class="updates-intro">The latest additions and improvements, newest first.</p><ol class="updates-list">${updates.map(update=>`<li><div class="update-heading"><h3>${escapeHtml(update.title)}</h3><time datetime="${update.date}">${dateLabel(update.date)}</time></div><p>${escapeHtml(update.summary)}</p><a href="${update.link}">${escapeHtml(update.linkLabel)} →</a></li>`).join('')}</ol></section>`;
const ids = new Set();
for (const a of source.articles) {
  if (ids.has(a.id)) throw Error(`Duplicate article: ${a.id}`);
  ids.add(a.id);
  for (const r of a.refs) {
    if (r.kind === 'map') continue;
    const chapter = source.chapters[r.chapter];
    if (!chapter || r.pages[0] < chapter.pages[0] || r.pages[1] > chapter.pages[1] || r.pages[0] > r.pages[1]) throw Error(`Invalid source range: ${a.id}`);
  }
  for (const s of a.sections) {
    if (!s.refs.length || s.refs.some(n => n < 1 || n > a.refs.length)) throw Error(`Missing reference: ${a.id}`);
  }
}
let html = fs.readFileSync(path.join(root, 'content/site-template.html'), 'utf8').replace(/\r\n/g, '\n');
const insert = (before, after) => {
  if (!html.includes(before)) throw Error(`Template changed: ${before.slice(0, 65)}`);
  html = html.replace(before, after);
};
insert('</style>', '.citations{white-space:nowrap;font-size:11px}.source-list{font-size:12px;padding-left:22px}.source-list li{padding:6px 0;scroll-margin-top:24px}.source-list li:focus{outline:2px solid var(--gold)}.article h2{scroll-margin-top:24px}.archivegrid .entrycard{width:100%}.coverage-link{font-size:12px;color:var(--sub)}\n</style>');
insert('</style>', '.updates{margin:28px 0}.updates-intro{font-size:13px;color:var(--sub)}.updates-list{list-style:none;margin:18px 0 0;padding:0 0 0 17px;border-left:2px solid var(--line)}.updates-list li{position:relative;margin:0 0 22px;padding:0 0 18px 9px;border-bottom:1px solid var(--line)}.updates-list li:last-child{margin-bottom:0;border-bottom:0;padding-bottom:0}.updates-list li:before{content:"";position:absolute;left:-23px;top:6px;width:9px;height:9px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 4px var(--paper)}.update-heading{display:flex;align-items:baseline;justify-content:space-between;gap:8px 20px;flex-wrap:wrap}.update-heading h3{margin:0;font-size:15px}.update-heading time{font-size:11px;color:var(--sub);white-space:nowrap}.updates-list p{font-size:13px;margin:7px 0}.updates-list a{font-size:12px}\n</style>');
insert('<h2>Begin Your Journey</h2>', updateLog+'<h2>Begin Your Journey</h2>');
insert('</div><div class="sidebox"><h3>Reader Settings', '<a href="#/chapters">Book 1 Chapter Guide</a><a href="#/category/All">All Articles</a><a href="#/sources">Sources & Coverage</a></div><div class="sidebox"><h3>Reader Settings');
insert('Choose which books the archive may discuss.', 'Complete Book 1 spoilers, including the ending and all three appendices.');
html = html.replaceAll('Published canon only', 'Author notes hidden');
html = html.replaceAll("'Published canon only'", "'Author notes hidden'");
insert('Prototype edition: article summaries are intentionally short, with room for citations, timelines and expanded histories.', `${source.articles.length} cited entries · 36 chapter guides · 3 appendices. See Sources & Coverage for the edition and evidence.`);
insert('<script>\n', `<script src="${source.version}/book1-data.js"></script><script src="${source.version}/book1-ui.js"></script><script>\n`);
const legacyStart=html.indexOf('const E=['),legacyEnd=html.indexOf('const cats=',legacyStart);
if(legacyStart<0||legacyEnd<0)throw Error('Article table missing');
html=html.slice(0,legacyStart)+"const E=BOOK1.articles.map(a=>[a.id,a.name,a.category,a.summary,a.sections[0].text,...a.fact]);\n"+html.slice(legacyEnd);
insert("'Peoples','Books'];const marks=", "'Peoples','Creatures','Chapters','Books'];const marks=");
insert('function article(e){', 'function starterArticle(e){');
insert("${e[7]?'Author notes':'Published lore / world reference'}", "${e[7]?'Author notes · unchecked':'Starter summary · unchecked'}");
insert("${e[7]?'Unpublished author note — visible because you enabled unreleased material.':'Reader-safe summary. Consult the novels for full context and character developments.'}", "${e[7]?'Unpublished author note — visible because you enabled unreleased material.':'This starter summary has not yet been checked against the Book 1 source edition. It may discuss later events.'}");
insert('This archive defaults to information safe for readers of <i>Wardens of the Abyss</i>. Unpublished story developments can be enabled in Reader Settings.', `Complete Book 1 edition: <a href="#/chapters">36 chapter guides</a>, three appendices, and ${source.articles.length} cited entries. <a href="#/sources">Explore the sources</a>. Full Book 1 spoilers.`);
insert("function render(){", "function article(e){return book1Article(e)}\nfunction render(){");
insert("['category/Books','Books']].map", "['category/Books','Books'],['chapters','Chapter Guide'],['sources','Sources']].map");
insert("!route?home():kind==='atlas'?", "!route?home():kind==='chapters'?book1Guide():kind==='sources'?book1Sources():kind==='atlas'?");
insert("x[1].toLowerCase().includes(q)||x[3].toLowerCase().includes(q)", 'book1Matches(x,q)');
insert(".sort((a,b)=>a[1].localeCompare(b[1]))", ".sort((a,b)=>c==='Chapters'?Number(a[0].slice(8))-Number(b[0].slice(8)):a[1].localeCompare(b[1]))");
html=html.replace(/<div class="sidebox"><h3>Reader Settings<\/h3>[\s\S]*?<\/div>/,'<div class="sidebox"><h3>Reader Notice</h3><p>Full Book 1 spoilers, including the ending and appendices.</p><p>This edition excludes unpublished sequel material.</p></div>');
html=html.replace(/\$\('#spoilers'\).checked=[\s\S]*?(?=let dark=)/,'');
html=html.replaceAll('Fan-encyclopedia-inspired prototype','Book 1 encyclopedia');
html=html.replace('Worldbuilding notes and manuscript developments are not necessarily published canon.','This edition uses Book 1 and the original atlas. Events, testimony, myth, and mapped geography are distinguished.');
html=html.replace("(kind==='entry'&&e?e[1]+' — ':kind==='category'?key+' — ':'')","(kind==='entry'&&e?e[1]+' — ':kind==='category'?key+' — ':kind==='chapters'?'Chapter Guide — ':kind==='sources'?'Sources — ':'')");
html=html.replace('This article is not available with the current spoiler settings.','This article is not part of the sourced Book 1 edition. Browse the chapter guide or all articles.');
// Keep article contents links on the hash router's current route.
html = html.replace(/href="#(overview|related|sources)" onclick="document.getElementById\('(overview|related|sources)'\).scrollIntoView\(\)"/g, 'href="#/entry/${e[0]}" data-scroll="$1"');
const dataJs = `const BOOK1 = ${JSON.stringify(source).replaceAll('<', '\\u003c')};\n`;
const uiJs = fs.readFileSync(path.join(root, 'content/book1-ui.js'), 'utf8');
new vm.Script(dataJs); new vm.Script(uiJs);
const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(inline);
const entries = new vm.Script(inline.slice(0, inline.indexOf('const cats=')) + '\nE.map(e=>e[0]);').runInNewContext({BOOK1:source});
for (const a of source.articles) for (const related of a.related) if (!entries.includes(related)) throw Error(`Broken link: ${a.id} -> ${related}`);
const out = root;
for(let n=1;n<=36;n++)if(!ids.has('chapter-'+n))throw Error('Missing chapter '+n);
for(const [id] of new vm.Script(inline.match(/const marks=(\[[\s\S]*?\]);const \$/)[1]).runInNewContext())if(!ids.has(id))throw Error('Missing map target '+id);
for(const m of html.matchAll(/href="#\/entry\/([a-z0-9-]+)"/g))if(!ids.has(m[1]))throw Error('Missing route '+m[1]);
fs.mkdirSync(path.join(out, source.version), {recursive:true});
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, source.version, 'book1-data.js'), dataJs);
fs.writeFileSync(path.join(out, source.version, 'book1-ui.js'), uiJs);
console.log(`Built ${source.articles.length} sourced articles, ${source.articles.reduce((n,a)=>n+a.sections.length,0)} cited sections; ${entries.length} entries total. JavaScript, source ranges, and related links validated.`);
