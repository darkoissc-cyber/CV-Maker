import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';

export function renderCreative(doc,s){
  doc.className='cv-doc tpl-creative';
  const photo=s.photo?`<img class="cr-photo" src="${s.photo}" alt="">`:'';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).join(' · ');
  doc.innerHTML=`
    <div class="cr-header"><div class="cr-hdr-inner">${photo}<div>
      <div class="cr-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="cr-title">${x(s.title)}</div>`:''}
      ${contacts?`<div class="cr-contacts">${x(contacts)}</div>`:''}
    </div></div></div>
    <div class="cr-body">
      <div>
        ${s.sum?`<div class="cr-sec"><div class="cr-sh">About</div><div class="cr-sum">${x(s.sum)}</div></div>`:''}
        ${s.skills.length?`<div class="cr-sec"><div class="cr-sh">Skills</div>${s.skills.map(sk=>`<span class="cr-skill">${x(sk.name)}</span>`).join('')}</div>`:''}
        ${s.langs.length?`<div class="cr-sec"><div class="cr-sh">Languages</div>${s.langs.map(l=>`<span class="cr-skill">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div>`:''}
        ${s.certs.length?`<div class="cr-sec"><div class="cr-sh">Certs</div>${s.certs.map(c=>`<div class="cr-desc">${certLine(c)}</div>`).join('')}</div>`:''}
      </div>
      <div>
        ${s.exp.length?`<div class="cr-sec"><div class="cr-sh">Experience</div>${s.exp.map(e=>`
          <div class="cr-entry"><div class="cr-dates">${x(e.dates)}</div><div class="cr-role">${x(e.role)}</div>
          ${e.co?`<div class="cr-org">${x(e.co)}</div>`:''}${e.desc?`<div class="cr-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}</div>`:''}
        ${s.edu.length?`<div class="cr-sec"><div class="cr-sh">Education</div>${s.edu.map(e=>`
          <div class="cr-entry"><div class="cr-role">${x(e.deg)}</div><div class="cr-org">${x(e.sch)}</div><div class="cr-dates">${x(e.dates)}</div></div>`).join('')}</div>`:''}
        ${s.projects.length?`<div class="cr-sec"><div class="cr-sh">Projects</div>${renderProjBlock(s,'cr-entry','cr-role','cr-org','cr-desc','cr-org','cr-org')}</div>`:''}
        ${refsHTML(s)}
      </div>
    </div>`;
}

