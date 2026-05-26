import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';

export function renderExecutive(doc,s){
  doc.className='cv-doc tpl-executive';
  const photo=s.photo?`<img class="e-photo" src="${s.photo}" alt="">`:'';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).join(' · ');
  doc.innerHTML=`
    <div class="e-header"><div class="e-hdr-inner"><div>
      <div class="e-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="e-title">${x(s.title)}</div>`:''}
      ${contacts?`<div class="e-contacts">${x(contacts)}</div>`:''}
    </div>${photo}</div></div>
    <div class="e-body">
      ${s.sum?`<div class="e-sh">Executive Summary</div><div class="e-sum">${x(s.sum)}</div>`:''}
      ${s.exp.length?`<div class="e-sh">Professional Experience</div>${s.exp.map(e=>`
        <div class="e-entry"><div class="e-et"><div class="e-role">${x(e.role)}</div><div class="e-dates">${x(e.dates)}</div></div>
        ${e.co?`<div class="e-org">${x(e.co)}</div>`:''}${e.desc?`<div class="e-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}`:''}
      ${s.edu.length?`<div class="e-sh">Education</div>${s.edu.map(e=>`
        <div class="e-entry"><div class="e-et"><div class="e-role">${x(e.deg)}</div><div class="e-dates">${x(e.dates)}</div></div>
        ${e.sch?`<div class="e-org">${x(e.sch)}</div>`:''}</div>`).join('')}`:''}
      ${s.projects.length?`<div class="e-sh">Key Projects</div>${renderProjBlock(s,'e-entry','e-role','e-org','e-desc','e-org','e-org')}`:''}
      ${s.skills.length?`<div class="e-sh">Core Competencies</div><div class="e-pills">${s.skills.map(sk=>`<span class="e-pill">${x(sk.name)}</span>`).join('')}</div>`:''}
      ${s.langs.length?`<div class="e-sh">Languages</div><div class="e-pills">${s.langs.map(l=>`<span class="e-pill">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div>`:''}
      ${s.certs.length?`<div class="e-sh">Certifications</div>${s.certs.map(c=>`<div class="e-desc" style="margin-bottom:6px">${certLine(c)}</div>`).join('')}`:''}
      ${refsHTML(s)}
    </div>`;
}

