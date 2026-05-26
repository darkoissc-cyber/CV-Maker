import { S, counters } from '../state/store.js';
import { PROG_FIELDS } from '../state/constants.js';
import { $ } from '../utils/dom.js';

export function pct(){
  const segs=PROG_FIELDS.map(f=>{
    let done=false;
    if(f.key==='name')done=!!S.name;
    else if(f.key==='title')done=!!S.title;
    else if(f.key==='contact')done=!!(S.email||S.phone);
    else if(f.key==='sum')done=!!S.sum;
    else if(f.key==='exp')done=S.exp.length>0;
    else if(f.key==='edu')done=S.edu.length>0;
    else if(f.key==='skills')done=S.skills.length>0;
    else if(f.key==='projects')done=S.projects.length>0;
    else if(f.key==='langs')done=S.langs.length>0;
    else if(f.key==='certs')done=S.certs.length>0;
    return{...f,done};
  });
  const score=Math.round(segs.filter(s=>s.done).length/segs.length*100);

  // render segments
  document.getElementById('prog-segs').innerHTML=segs.map(s=>
    `<span class="prog-seg ${s.done?'done':'todo'}"><i class="ti ti-${s.done?'check':'circle'}"></i>${s.label}</span>`
  ).join('');

  // gradient color
  const fill=document.getElementById('prog-fill');
  if(score<40) fill.style.background='linear-gradient(90deg,#ef4444,#f97316)';
  else if(score<70) fill.style.background='linear-gradient(90deg,#f59e0b,#eab308)';
  else fill.style.background='linear-gradient(90deg,#22c55e,#10b981)';

  return score;
}

// ══════════════════════════════════════════════
// EXPERIENCE
