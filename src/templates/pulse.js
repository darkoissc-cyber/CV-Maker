import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { ci, renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';

export function renderPulse(doc,s){
  doc.className='cv-doc tpl-pulse';
  const photo=s.photo
    ?`<img class="p-photo" src="${s.photo}" alt="photo">`
    :`<div class="p-photo-ph"><i class="ti ti-user"></i></div>`;
  const contacts=ci(s,'p-ci');
  doc.innerHTML=`
    <div class="p-header">
      <div class="p-hdr-inner">
        ${photo}
        <div>
          <div class="p-name">${s.name||'Your Name'}</div>
          ${s.title?`<div class="p-title">${x(s.title)}</div>`:''}
          ${contacts?`<div class="p-contacts">${contacts}</div>`:''}
        </div>
      </div>
    </div>
    <div class="p-bar"></div>
    <div class="p-body">
      <div class="p-left">
        ${s.sum?`<div class="p-lsec"><div class="p-sh">Profile</div><div class="p-sum">${x(s.sum)}</div></div>`:''}
        ${s.skills.length?`<div class="p-lsec"><div class="p-sh">Skills</div><div class="p-skills">${s.skills.map(sk=>`<span class="p-skill">${x(sk.name)}</span>`).join('')}</div></div>`:''}
        ${s.langs.length?`<div class="p-lsec"><div class="p-sh">Languages</div><div class="p-badge-row">${s.langs.map(l=>`<span class="p-badge">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div></div>`:''}
        ${s.certs.length?`<div class="p-lsec"><div class="p-sh">Certifications</div><div class="p-skills">${s.certs.map(c=>`<span class="p-skill" style="font-size:10px">${certLine(c)}</span>`).join('')}</div></div>`:''}
        ${s.edu.length?`<div class="p-lsec"><div class="p-sh">Education</div>${s.edu.map(e=>`
          <div class="p-entry">
            <div class="p-role">${x(e.deg)||'<em style="color:#ccc">Degree</em>'}</div>
            ${e.sch?`<div class="p-org">${x(e.sch)}</div>`:''}
            <div class="p-dates">${x(e.dates)}</div>
            ${e.desc?`<div class="p-desc">${x(e.desc)}</div>`:''}
          </div>`).join('')}</div>`:''}
      </div>
      <div class="p-right">
        ${s.exp.length?`<div class="p-rsec"><div class="p-sh">Experience</div>${s.exp.map(e=>`
          <div class="p-entry">
            <div class="p-et"><div class="p-role">${x(e.role)||'<em style="color:#ccc">Role</em>'}</div><div class="p-dates">${x(e.dates)}</div></div>
            ${e.co?`<div class="p-org">${x(e.co)}</div>`:''}
            ${e.desc?`<div class="p-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}
          </div>`).join('')}</div>`:''}
        ${s.projects.length?`<div class="p-rsec"><div class="p-sh">Projects</div>${renderProjBlock(s,'p-entry','p-role','p-org','p-desc','p-org','p-org')}</div>`:''}
        ${refsHTML(s)}
      </div>
    </div>`;
}

