import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { ci, renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';

export function renderVertex(doc,s){
  doc.className='cv-doc tpl-vertex';
  const photo=s.photo?`<img class="v-photo" src="${s.photo}" alt="photo">`:'';
  const contacts=ci(s,'v-ci');
  doc.innerHTML=`
    <div class="v-header">
      <div class="v-hdr-inner">
        <div>
          <div class="v-name">${s.name||'<span style="color:#ddd">Your Name</span>'}</div>
          ${s.title?`<div class="v-title">${x(s.title)}</div>`:''}
          ${contacts?`<div class="v-contacts">${contacts}</div>`:''}
        </div>
        ${photo}
      </div>
    </div>
    <div class="v-body">
      ${s.sum?`<div class="v-sec"><div class="v-sh"><span>Profile</span></div><div class="v-sum">${x(s.sum)}</div></div>`:''}
      ${s.exp.length?`<div class="v-sec"><div class="v-sh"><span>Experience</span></div>${s.exp.map(e=>`
        <div class="v-entry">
          <div class="v-et"><div class="v-role">${x(e.role)||'<em style="color:#ccc">Role</em>'}</div><div class="v-dates">${x(e.dates)}</div></div>
          ${e.co?`<div class="v-org">${x(e.co)}</div>`:''}
          ${e.desc?`<div class="v-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}
        </div>`).join('')}</div>`:''}
      ${s.edu.length?`<div class="v-sec"><div class="v-sh"><span>Education</span></div>${s.edu.map(e=>`
        <div class="v-entry">
          <div class="v-et"><div class="v-role">${x(e.deg)||'<em style="color:#ccc">Degree</em>'}</div><div class="v-dates">${x(e.dates)}</div></div>
          ${e.sch?`<div class="v-org">${x(e.sch)}</div>`:''}
          ${e.desc?`<div class="v-desc">${x(e.desc)}</div>`:''}
        </div>`).join('')}</div>`:''}
      ${s.projects.length?`<div class="v-sec"><div class="v-sh"><span>Projects</span></div>${renderProjBlock(s,'v-entry','v-role','v-org','v-desc','v-org','v-org')}</div>`:''}
      ${s.skills.length?`<div class="v-sec"><div class="v-sh"><span>Skills</span></div><div class="v-pills">${s.skills.map(sk=>`<span class="v-pill">${x(sk.name)}</span>`).join('')}</div></div>`:''}
      ${s.langs.length?`<div class="v-sec"><div class="v-sh"><span>Languages</span></div><div class="v-badge-row">${s.langs.map(l=>`<span class="v-badge">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div></div>`:''}
      ${s.certs.length?`<div class="v-sec"><div class="v-sh"><span>Certifications</span></div><div class="v-badge-row">${s.certs.map(c=>`<span class="v-cert">${certLine(c)}</span>`).join('')}</div></div>`:''}
      ${refsHTML(s)}
    </div>`;
}

