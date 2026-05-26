import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';

export function projLinks(p,cls){
  const parts=[];
  if(p.github)parts.push(`<span class="${cls}"><i class="ti ti-brand-github"></i> ${x(p.github)}</span>`);
  if(p.demo)parts.push(`<span class="${cls}"><i class="ti ti-world"></i> ${x(p.demo)}</span>`);
  return parts.join(' ');
}

export function renderProjBlock(s,entryCls,roleCls,orgCls,descCls,techCls,linksCls){
  return s.projects.map(p=>`
    <div class="${entryCls}">
      <div class="v-et"><div class="${roleCls}">${x(p.name)||'Project'}</div></div>
      ${p.tech?`<div class="${techCls||orgCls}">${x(p.tech)}</div>`:''}
      ${p.desc?`<div class="${descCls}">${x(p.desc).replace(/\n/g,'<br>')}</div>`:''}
      ${(p.github||p.demo)?`<div class="${linksCls||orgCls}">${projLinks(p,linksCls||orgCls)}</div>`:''}
    </div>`).join('');
}

export function certLine(c){return [c.name,c.org,c.date].filter(Boolean).map(x).join(' · ');}

export function refsHTML(s){
  if(!s.showRefs||!s.refs.length)return '';
  return `<div class="v-sec" style="margin-top:18px"><div class="v-sh" style="margin-bottom:10px"><span>References</span></div>${s.refs.map(r=>`
    <div style="font-size:12.5px;line-height:1.7;margin-bottom:8px;color:#555"><strong style="color:#1a1a2e">${x(r.name)}</strong>${r.role?` — ${x(r.role)}`:''}${r.contact?`<br><span style="font-size:11px">${x(r.contact)}</span>`:''}</div>`).join('')}</div>`;
}

export function ci(s,cls){
  return[
    s.email?`<span class="${cls}"><i class="ti ti-mail"></i>${x(s.email)}</span>`:'',
    s.phone?`<span class="${cls}"><i class="ti ti-phone"></i>${x(s.phone)}</span>`:'',
    s.loc?`<span class="${cls}"><i class="ti ti-map-pin"></i>${x(s.loc)}</span>`:'',
    s.link?`<span class="${cls}"><i class="ti ti-link"></i>${x(s.link)}</span>`:'',
  ].filter(Boolean).join('');
}

// ══════════════════════════════════════════════
// TEMPLATE RENDERERS
