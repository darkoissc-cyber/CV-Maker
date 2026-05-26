import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { showUndo } from '../core/undo.js';
import { dragState } from '../core/dragDrop.js';
import { $ } from '../utils/dom.js';

export function addSkill(){
  const i=document.getElementById('ski'),v=i.value.trim();
  if(!v)return;S.skills.push({id:counters.sc++,name:v});i.value='';rSkills();renderCV();saveToLS();
}
export function rmSkill(i){
  const removed=S.skills[i];
  S.skills.splice(i,1);
  rSkills();renderCV();saveToLS();
  showUndo(`Removed skill "${removed.name}"`,()=>{S.skills.splice(i,0,removed);});
}
export function rSkills(){
  const box=document.getElementById('chips');
  box.innerHTML=S.skills.map((s,i)=>
    `<span class="chip draggable-skill" draggable="true" data-idx="${i}">${x(s.name)}<button onclick="event.stopPropagation();rmSkill(${i})">×</button></span>`).join('');
  box.querySelectorAll('.draggable-skill').forEach(chip=>{
    const idx=parseInt(chip.dataset.idx);
    chip.addEventListener('dragstart',e=>{
      dragState.skillIdx=idx;chip.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';
    });
    chip.addEventListener('dragend',()=>{chip.classList.remove('dragging');box.classList.remove('drag-over-skill');});
    chip.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('drag-over-skill');});
    chip.addEventListener('drop',e=>{
      e.preventDefault();box.classList.remove('drag-over-skill');
      const tgt=parseInt(chip.dataset.idx);
      if(dragState.skillIdx===null||dragState.skillIdx===tgt)return;
      const [item]=S.skills.splice(dragState.skillIdx,1);
      S.skills.splice(tgt,0,item);
      dragState.skillIdx=null;rSkills();renderCV();saveToLS();
    });
  });
}

export function addLang(){
  const inp=document.getElementById('lang-inp'),lvl=document.getElementById('lang-lvl');
  const v=inp.value.trim();if(!v)return;
  S.langs.push({name:v,level:lvl.value});inp.value='';rLangs();renderCV();saveToLS();
}
export function rmLang(i){S.langs.splice(i,1);rLangs();renderCV();saveToLS();}
export function rLangs(){
  document.getElementById('lang-chips').innerHTML=S.langs.map((l,i)=>
    `<span class="lang-chip">${x(l.name)} · ${x(l.level)}<button onclick="rmLang(${i})">×</button></span>`).join('');
}