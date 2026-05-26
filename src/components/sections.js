import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { saveToLS } from '../storage/persistence.js';
import { rForms } from './forms.js';
import { renderCV } from '../renderers/pipeline.js';
import { showUndo } from '../core/undo.js';

export function addExp(){S.exp.push({id:counters.ec++,role:'',co:'',dates:'',desc:''});rForms();renderCV();saveToLS();}
export function rmExp(id){
  const idx=S.exp.findIndex(e=>e.id===id);
  const removed=S.exp[idx];
  S.exp.splice(idx,1);
  rForms();renderCV();saveToLS();
  showUndo(`Deleted "${removed.role||'Experience'}"`,()=>{S.exp.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// EDUCATION
// ══════════════════════════════════════════════
export function addEdu(){S.edu.push({id:counters.dc++,deg:'',sch:'',dates:'',desc:''});rForms();renderCV();saveToLS();}
export function rmEdu(id){
  const idx=S.edu.findIndex(e=>e.id===id);
  const removed=S.edu[idx];
  S.edu.splice(idx,1);
  rForms();renderCV();saveToLS();
  showUndo(`Deleted "${removed.deg||'Education'}"`,()=>{S.edu.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════
export function addProj(){S.projects.push({id:counters.pc++,name:'',tech:'',desc:'',github:'',demo:''});rForms();renderCV();saveToLS();}
export function rmProj(id){
  const idx=S.projects.findIndex(e=>e.id===id);
  const removed=S.projects[idx];
  S.projects.splice(idx,1);
  rForms();renderCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Project'}"`,()=>{S.projects.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// REFERENCES
// ══════════════════════════════════════════════
export function toggleRefs(on){
  S.showRefs=on;
  document.getElementById('refs-wrap').style.display=on?'':'none';
  renderCV();saveToLS();
}
export function addRef(){S.refs.push({id:counters.rc++,name:'',role:'',contact:''});rForms();renderCV();saveToLS();}
export function rmRef(id){
  const idx=S.refs.findIndex(e=>e.id===id);
  const removed=S.refs[idx];
  S.refs.splice(idx,1);
  rForms();renderCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Reference'}"`,()=>{S.refs.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// SKILLS / LANGUAGES / CERTIFICATIONS
// ══════════════════════════════════════════════
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
      dragSkillIdx=idx;chip.classList.add('dragging');
      e.dataTransfer.effectAllowed='move';
    });
    chip.addEventListener('dragend',()=>{chip.classList.remove('dragging');box.classList.remove('drag-over-skill');});
    chip.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('drag-over-skill');});
    chip.addEventListener('drop',e=>{
      e.preventDefault();box.classList.remove('drag-over-skill');
      const tgt=parseInt(chip.dataset.idx);
      if(dragSkillIdx===null||dragSkillIdx===tgt)return;
      const [item]=S.skills.splice(dragSkillIdx,1);
      S.skills.splice(tgt,0,item);
      dragSkillIdx=null;rSkills();renderCV();saveToLS();
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

export function addCert(){S.certs.push({id:counters.cc++,name:'',org:'',date:''});rForms();renderCV();saveToLS();}
export function rmCert(id){
  const idx=S.certs.findIndex(c=>c.id===id);
  const removed=S.certs[idx];
  S.certs.splice(idx,1);
  rForms();renderCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Certification'}"`,()=>{S.certs.splice(idx,0,removed);});
}
export function rCerts(){/* certs rendered in rForms */}
