import { S, counters } from '../state/store.js';
import { calcATS } from './calcATS.js';
import { x } from '../utils/escape.js';
import { $ } from '../utils/dom.js';

export function renderATS(){
  const{score,tips,missingKw}=calcATS();
  const el=document.getElementById('ats-score');
  el.textContent=score+'%';
  el.className='ats-score '+(score>=75?'good':score>=50?'mid':'low');
  const fill=document.getElementById('ats-fill');
  fill.style.width=score+'%';
  fill.style.background=score>=75?'linear-gradient(90deg,#22c55e,#10b981)':score>=50?'linear-gradient(90deg,#f59e0b,#eab308)':'linear-gradient(90deg,#ef4444,#f97316)';
  document.getElementById('ats-tips').innerHTML=tips.map(t=>
    `<div class="ats-tip ${t.type}"><i class="ti ti-${t.type==='ok'?'circle-check':t.type==='warn'?'alert-triangle':'bulb'}"></i><span>${x(t.text)}</span></div>`
  ).join('');
  const kw=document.getElementById('ats-kw');
  if(missingKw.length){
    kw.style.display='';
    kw.innerHTML='<strong>Keywords to weave in:</strong> '+missingKw.map(k=>`<span style="color:#f59e0b">${x(k)}</span>`).join(', ');
  }else{kw.style.display='none';}
}

// ══════════════════════════════════════════════
// UPDATE (main change handler)
// ══════════════════════════════════════════════
