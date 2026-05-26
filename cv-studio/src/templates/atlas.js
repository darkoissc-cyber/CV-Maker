import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { renderProjBlock, certLine, refsHTML } from '../renderers/helpers.js';

export function renderAtlas(doc,s){
  doc.className='cv-doc tpl-atlas';
  const photo=s.photo
    ?`<img class="a-photo" src="${s.photo}" alt="photo">`
    :`<div class="a-photo-ph"><i class="ti ti-user"></i></div>`;
  const sideCI=[
    s.email?`<div class="a-ci"><i class="ti ti-mail"></i>${x(s.email)}</div>`:'',
    s.phone?`<div class="a-ci"><i class="ti ti-phone"></i>${x(s.phone)}</div>`:'',
    s.loc?`<div class="a-ci"><i class="ti ti-map-pin"></i>${x(s.loc)}</div>`:'',
    s.link?`<div class="a-ci"><i class="ti ti-link"></i>${x(s.link)}</div>`:'',
  ].filter(Boolean).join('');
  doc.innerHTML=`
    <div class="a-side">
      <div class="a-photo-wrap">${photo}</div>
      <div class="a-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="a-title">${x(s.title)}</div>`:''}
      ${sideCI?`<div class="a-sec-h">Contact</div>${sideCI}`:''}
      ${s.skills.length?`<div class="a-sec-h">Skills</div><div class="a-skills">${s.skills.map(sk=>`<span class="a-skill">${x(sk.name)}</span>`).join('')}</div>`:''}
      ${s.langs.length?`<div class="a-sec-h">Languages</div><div class="a-skills">${s.langs.map(l=>`<span class="a-skill">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div>`:''}
      ${s.certs.length?`<div class="a-sec-h">Certifications</div>${s.certs.map(c=>`<div class="a-ci" style="font-size:10px"><i class="ti ti-certificate"></i>${certLine(c)}</div>`).join('')}`:''}
    </div>
    <div class="a-main">
      ${s.sum?`<div class="a-msec"><div class="a-sh"><span>Profile</span></div><div class="a-sum">${x(s.sum)}</div></div>`:''}
      ${s.exp.length?`<div class="a-msec"><div class="a-sh"><span>Experience</span></div>${s.exp.map(e=>`
        <div class="a-entry">
          <div class="a-et"><div class="a-role">${x(e.role)||'<em style="color:#ccc">Role</em>'}</div><div class="a-dates">${x(e.dates)}</div></div>
          ${e.co?`<div class="a-org">${x(e.co)}</div>`:''}
          ${e.desc?`<div class="a-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}
        </div>`).join('')}</div>`:''}
      ${s.edu.length?`<div class="a-msec"><div class="a-sh"><span>Education</span></div>${s.edu.map(e=>`
        <div class="a-entry">
          <div class="a-et"><div class="a-role">${x(e.deg)||'<em style="color:#ccc">Degree</em>'}</div><div class="a-dates">${x(e.dates)}</div></div>
          ${e.sch?`<div class="a-org">${x(e.sch)}</div>`:''}
          ${e.desc?`<div class="a-desc">${x(e.desc)}</div>`:''}
        </div>`).join('')}</div>`:''}
      ${s.projects.length?`<div class="a-msec"><div class="a-sh"><span>Projects</span></div>${renderProjBlock(s,'a-entry','a-role','a-org','a-desc','a-org','a-org')}</div>`:''}
      ${refsHTML(s)}
    </div>`;
}

