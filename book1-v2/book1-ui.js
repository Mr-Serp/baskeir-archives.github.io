function book1Matches(e,q) {
  const a=BOOK1.articles.find(a=>a.id===e[0]);
  const words=[a.name,a.summary,...(a.aliases||[])].join(' ').toLowerCase();
  return q.split(/\s+/).every(word=>words.includes(word));
}
function book1Article(e) {
  const a = BOOK1.articles.find(a => a.id === e[0]);
  if (!a) return starterArticle(e);
  const isMap=a.refs.every(r=>r.kind==='map');
  const chapter=a.id.startsWith('chapter-')?Number(a.id.slice(8)):0;
  const sectionLink = (id, label) => `<a href="#/entry/${a.id}" data-scroll="${id}">${title(label)}</a>`;
  const cite = refs => `<sup class="citations">${refs.map(n => `<a href="#/entry/${a.id}" data-scroll="source-${n}" aria-label="Source ${n}">[${n}]</a>`).join(' ')}</sup>`;
  return `<div class="crumb"><a href="#/">Main Page</a> › <a href="#/category/${a.category}">${a.category}</a> › ${title(a.name)}</div>
    <div class="article"><div class="eyebrow">${isMap?'World Atlas · Map reference':'Book 1 · Sourced article'}</div><h1>${title(a.name)}</h1><div class="separator"></div>
    <div class="notice">${isMap?'Geographic reference from the original world atlas.':'Full Book 1 spoilers, including the ending and all three appendices.'}</div>
    <aside class="infobox"><h3>${title(a.name)}</h3><div class="ico">✥</div><dl><dt>Category</dt><dd>${a.category}</dd><dt>${title(a.fact[0])}</dt><dd>${title(a.fact[1])}</dd><dt>Source</dt><dd>${isMap?'Original world atlas':'Book 1, second edition'}</dd><dt>Coverage</dt><dd>${isMap?'Mapped geography':'Complete Book 1'}</dd></dl></aside>
    <p><b>${title(a.name)}</b> — ${title(a.summary)}</p>
    <div class="contents"><strong>Contents</strong>${a.sections.map((s, i) => sectionLink(`section-${i}`, `${i + 1}. ${s.title}`)).join('')}${sectionLink('related', 'Related articles')}${sectionLink('sources', 'Sources and notes')}</div>
    ${a.sections.map((s, i) => `<section><h2 id="section-${i}">${title(s.title)}</h2><p>${title(s.text)} ${cite(s.refs)}</p></section>`).join('')}
    <h2 id="related">Related articles</h2><p>${a.related.map(id => allowed().find(e => e[0] === id)).filter(Boolean).map(link).join(' · ')}</p>
    <h2 id="sources">Sources and notes</h2><p>${isMap?'The original atlas supplied for the archive. Geographic labels are checked separately from the novel’s narrative.':title(BOOK1.edition)+'. Page references use printed pagination; PDF numbers refer to the local eProof.'}</p>
    <ol class="source-list">${a.refs.map((r, i) => `<li id="source-${i + 1}">${book1Reference(r)}</li>`).join('')}</ol>
    ${a.note ? `<p class="rightnote">${title(a.note)}</p>` : ''}<p><a href="#/sources">About the source edition and evidence →</a></p>
    ${chapter?`<div class="chapter-nav">${chapter>1?`<a href="#/entry/chapter-${chapter-1}">← Chapter ${chapter-1}</a>`:''} · <a href="#/chapters">Chapter Guide</a> · ${chapter<36?`<a href="#/entry/chapter-${chapter+1}">Chapter ${chapter+1} →</a>`:'<a href="#/entry/creation-tale">Appendices →</a>'}</div>`:''}</div>${footer()}`;
}

function book1Reference(r) {
  if(r.kind==='map')return 'Original world atlas, <a href="map.jpg" target="_blank" rel="noopener">Map of Baskeir</a>, supplied with the archive. Geographic labels checked separately from the novel’s text.';
  const range = p => p[0] === p[1] ? `${p[0]}` : `${p[0]}–${p[1]}`;
  return `<i>Wardens of the Abyss</i>, ${r.chapter>36?'Appendix':'ch. '+r.chapter}, “${title(BOOK1.chapters[r.chapter].title)},” printed ${r.pages[0] === r.pages[1] ? 'p.' : 'pp.'} ${range(r.pages)} (eProof PDF ${range(r.pages.map(p => p + 14))}).`;
}

function book1Sources() {
  const categories=[...new Set(BOOK1.articles.map(a=>a.category))].sort();
  return `<div class="crumb"><a href="#/">Main Page</a> › Sources & coverage</div><div class="eyebrow">The archive’s reading desk</div>
    <h1>Sources & Coverage</h1><p class="lead">Complete Book 1 pass: ${BOOK1.articles.length} cited entries, ${BOOK1.articles.reduce((n,a)=>n+a.sections.length,0)} cited sections, all 36 chapter guides, and all three appendices.</p>
    <h2>Source edition</h2><p>${title(BOOK1.edition)}, by A.J. Arestia. Checked against the local print proof <b>${title(BOOK1.sourceFile)}</b>, ISBN 9798295836336. Printed page 1 is PDF page 15. The text runs through printed page 431. The original world atlas is a separate source for geography.</p>
    <p>Articles summarize the novel in original prose. The manuscript itself is not hosted here. References distinguish directly depicted events from testimony, suspicions, and theories.</p>
    <h2>Browse the encyclopedia</h2><div class="categorylinks">${categories.map(c=>`<button onclick="location.hash='/category/${encodeURIComponent(c)}'">${title(c)} · ${BOOK1.articles.filter(a=>a.category===c).length}</button>`).join('')}</div><p><a href="#/chapters">Complete chapter guide →</a> · <a href="#/category/All">All articles →</a></p>
    <h2>Editorial boundaries</h2><p>Full Book 1 spoilers are present throughout. Events are distinguished from testimony and suspicion. The creation tale is mythology; the Inquisition text is church doctrine and propaganda. Atlas-only references establish locations and labels, not governments or untold histories.</p>
    <p>Tynir is Throgberd in narration and Faulksmith in his introduction to the Count. The text uses Garreth Holloway; the starter used Halloway. Yeass in the prose and Yess Hyaag on the atlas are preserved as source spellings. Mattis’s stand is a sacrifice without a witnessed death being asserted.</p>
    <h2>Coverage register</h2><ol>${Object.entries(BOOK1.chapters).map(([n,c])=>`<li><a href="#/entry/${Number(n)>36?{37:'creation-tale',38:'greenweft-treatise',39:'inquisition-text'}[n]:'chapter-'+n}">${title(c.title)}</a> — printed pages ${c.pages.join('–')}</li>`).join('')}</ol>
    <h2>Outside this edition</h2><p>Unpublished sequel notes are excluded. Unsupported starter claims about the Hollow, detailed governing councils, and a tiefling classification for Valsira are not carried into this edition. An unanswered question remains unanswered.</p>${footer()}`;
}

function book1Guide() {
  const arcs=[['Lenont: strangers and a trap',1,9],['The ship and the arena',10,18],['Trials of the maze',19,27],['The Deep Pearl and the dragon',28,33],['The Abyss and the Wardens',34,36]];
  return `<div class="crumb"><a href="#/">Main Page</a> › Book 1 Chapter Guide</div><div class="eyebrow">Wardens of the Abyss · Complete reading guide</div><h1>Book 1 Chapter Guide</h1><p class="lead">Follow all 36 chapters from Lenont to the Valenrok shore, then explore the three appended texts.</p><div class="notice">Full Book 1 spoilers, including deaths and the ending. These are editorial summaries; the novel itself is not reproduced.</div>${arcs.map(([label,lo,hi])=>`<h2>${label}</h2><div class="archivegrid">${Array.from({length:hi-lo+1},(_,i)=>E.find(e=>e[0]===`chapter-${lo+i}`)).map(card).join('')}</div>`).join('')}<h2>The three appendices</h2><div class="archivegrid">${['creation-tale','greenweft-treatise','inquisition-text'].map(id=>card(E.find(e=>e[0]===id))).join('')}</div>${footer()}`;
}

document.addEventListener('click', event => {
  const anchor = event.target.closest('a[data-scroll]');
  if (!anchor) return;
  event.preventDefault();
  const target = document.getElementById(anchor.dataset.scroll);
  if (target) {
    target.scrollIntoView({block: 'start'});
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
  }
});
