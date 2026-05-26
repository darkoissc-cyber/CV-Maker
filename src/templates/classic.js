import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { projLinks, certLine } from '../renderers/helpers.js';

export function renderClassic(doc,s){
  doc.className='cv-doc tpl-classic';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).map(x).join(' · ');
  doc.innerHTML=`
    <div class="c-body">
      <div class="c-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="c-title">${x(s.title)}</div>`:''}
      ${contacts?`<div class="c-contacts">${contacts}</div>`:''}
      ${s.sum?`<div class="c-sh">Professional Summary</div><div class="c-sum">${x(s.sum)}</div>`:''}
      ${s.exp.length?`<div class="c-sh">Experience</div>${s.exp.map(e=>`
        <div class="c-entry"><div class="c-et"><span class="c-role">${x(e.role)}</span><span class="c-dates">${x(e.dates)}</span></div>
        ${e.co?`<div class="c-org">${x(e.co)}</div>`:''}${e.desc?`<div class="c-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}`:''}
      ${s.edu.length?`<div class="c-sh">Education</div>${s.edu.map(e=>`
        <div class="c-entry"><div class="c-et"><span class="c-role">${x(e.deg)}</span><span class="c-dates">${x(e.dates)}</span></div>
        ${e.sch?`<div class="c-org">${x(e.sch)}</div>`:''}${e.desc?`<div class="c-desc">${x(e.desc)}</div>`:''}</div>`).join('')}`:''}
      ${s.projects.length?`<div class="c-sh">Projects</div>${s.projects.map(p=>`
        <div class="c-entry"><div class="c-role">${x(p.name)}</div>${p.tech?`<div class="c-proj-tech">${x(p.tech)}</div>`:''}
        ${p.desc?`<div class="c-desc">${x(p.desc).replace(/\n/g,'<br>')}</div>`:''}
        ${(p.github||p.demo)?`<div class="c-links">${projLinks(p,'')}</div>`:''}</div>`).join('')}`:''}
      ${s.skills.length?`<div class="c-sh">Skills</div><div class="c-skills">${s.skills.map(sk=>x(sk.name)).join(' · ')}</div>`:''}
      ${s.langs.length?`<div class="c-sh">Languages</div><div class="c-skills">${s.langs.map(l=>`${x(l.name)} (${x(l.level)})`).join(' · ')}</div>`:''}
      ${s.certs.length?`<div class="c-sh">Certifications</div>${s.certs.map(c=>`<div class="c-entry"><span class="c-role">${certLine(c)}</span></div>`).join('')}`:''}
      ${s.showRefs&&s.refs.length?`<div class="c-sh">References</div>${s.refs.map(r=>`<div class="c-entry"><span class="c-role">${x(r.name)}</span> — ${x(r.role)} ${r.contact?`· ${x(r.contact)}`:''}</div>`).join('')}`:''}
    </div>`;
}

