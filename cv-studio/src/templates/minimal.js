import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { certLine } from '../renderers/helpers.js';

export function renderMinimal(doc,s){
  doc.className='cv-doc tpl-minimal';
  const photo=s.photo?`<img class="m-photo" src="${s.photo}" alt="">`:'';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).map(x).join('<br>');
  doc.innerHTML=`
    <div class="m-body">
      <div class="m-top"><div><div class="m-name">${s.name||'Your Name'}</div>${s.title?`<div class="m-title">${x(s.title)}</div>`:''}</div>
      <div style="display:flex;gap:12px;align-items:flex-start">${contacts?`<div class="m-contacts">${contacts}</div>`:''}${photo}</div></div>
      ${s.sum?`<div class="m-sec"><div class="m-sh">Summary</div><div class="m-desc">${x(s.sum)}</div></div>`:''}
      <div class="m-grid">
        <div>
          ${s.skills.length?`<div class="m-sec"><div class="m-sh">Skills</div><div class="m-skills">${s.skills.map(sk=>x(sk.name)).join(', ')}</div></div>`:''}
          ${s.langs.length?`<div class="m-sec"><div class="m-sh">Languages</div><div class="m-skills">${s.langs.map(l=>`${x(l.name)} (${x(l.level)})`).join(', ')}</div></div>`:''}
          ${s.edu.length?`<div class="m-sec"><div class="m-sh">Education</div>${s.edu.map(e=>`<div class="m-entry"><div class="m-role">${x(e.deg)}</div><div class="m-meta">${x(e.sch)} · ${x(e.dates)}</div></div>`).join('')}</div>`:''}
          ${s.certs.length?`<div class="m-sec"><div class="m-sh">Certs</div>${s.certs.map(c=>`<div class="m-entry"><div class="m-desc">${certLine(c)}</div></div>`).join('')}</div>`:''}
        </div>
        <div>
          ${s.exp.length?`<div class="m-sec"><div class="m-sh">Experience</div>${s.exp.map(e=>`
            <div class="m-entry"><div class="m-role">${x(e.role)}</div><div class="m-meta">${x(e.co)} · ${x(e.dates)}</div>
            ${e.desc?`<div class="m-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}</div>`:''}
          ${s.projects.length?`<div class="m-sec"><div class="m-sh">Projects</div>${s.projects.map(p=>`
            <div class="m-entry"><div class="m-role">${x(p.name)}</div>${p.tech?`<div class="m-meta">${x(p.tech)}</div>`:''}
            ${p.desc?`<div class="m-desc">${x(p.desc)}</div>`:''}</div>`).join('')}</div>`:''}
        </div>
      </div>
      ${s.showRefs&&s.refs.length?`<div class="m-sec"><div class="m-sh">References</div>${s.refs.map(r=>`<div class="m-entry"><div class="m-role">${x(r.name)}</div><div class="m-meta">${x(r.role)} · ${x(r.contact)}</div></div>`).join('')}</div>`:''}
    </div>`;
}

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
