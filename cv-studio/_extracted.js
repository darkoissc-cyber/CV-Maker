// ══════════════════════════════════════════════
// DATA MODEL (S) — schema v3 with migration
// ══════════════════════════════════════════════
const SCHEMA_VERSION=3;
const LS_KEY='cvstudio_v2_data';
const LS_THEME='cvstudio_v2_theme';

const ACCENTS=[
  {name:'Amber',  hex:'#f59e0b',dark:'#1c1200',light:'rgba(251,191,36,.88)'},
  {name:'Violet', hex:'#7c3aed',dark:'#130a2e',light:'rgba(167,139,250,.88)'},
  {name:'Teal',   hex:'#0d9488',dark:'#041c1a',light:'rgba(45,212,191,.88)'},
  {name:'Rose',   hex:'#e11d48',dark:'#1c0009',light:'rgba(251,113,133,.88)'},
  {name:'Indigo', hex:'#4338ca',dark:'#0e0b30',light:'rgba(129,140,248,.88)'},
  {name:'Emerald',hex:'#059669',dark:'#031710',light:'rgba(52,211,153,.88)'},
  {name:'Stone',  hex:'#57534e',dark:'#141210',light:'rgba(168,162,158,.88)'},
];

const PROG_FIELDS=[
  {key:'name',label:'Name'},{key:'title',label:'Title'},{key:'contact',label:'Contact'},
  {key:'sum',label:'Summary'},{key:'exp',label:'Experience'},{key:'edu',label:'Education'},
  {key:'skills',label:'Skills'},{key:'projects',label:'Projects'},{key:'langs',label:'Languages'},
  {key:'certs',label:'Certifications'},
];

const ACTION_VERBS=['achieved','built','created','delivered','designed','developed','drove','enhanced','established','executed','generated','grew','implemented','improved','increased','launched','led','managed','optimized','produced','reduced','scaled','streamlined'];

function createDefaultState(){
  return{
    v:SCHEMA_VERSION,
    name:'',title:'',email:'',phone:'',loc:'',link:'',sum:'',
    photo:null,
    exp:[],edu:[],projects:[],skills:[],langs:[],certs:[],refs:[],
    showRefs:false,
    tpl:'vertex',ai:0,
  };
}

function migrateState(raw){
  const d=createDefaultState();
  if(!raw||typeof raw!=='object')return d;
  Object.assign(d,raw);
  d.v=SCHEMA_VERSION;
  d.exp=Array.isArray(d.exp)?d.exp:[];
  d.edu=Array.isArray(d.edu)?d.edu:[];
  d.projects=Array.isArray(d.projects)?d.projects:[];
  d.langs=Array.isArray(d.langs)?d.langs:[];
  d.refs=Array.isArray(d.refs)?d.refs:[];
  d.showRefs=!!d.showRefs;
  // skills: string[] → {id,name}[]
  if(d.skills.length&&typeof d.skills[0]==='string'){
    d.skills=d.skills.map((n,i)=>({id:i,name:n}));
  }else{
    d.skills=d.skills.map((s,i)=>({id:s.id??i,name:s.name||''}));
  }
  // certs: string[] → {id,name,org,date}[]
  if(d.certs.length&&typeof d.certs[0]==='string'){
    d.certs=d.certs.map((c,i)=>({id:i,name:c,org:'',date:''}));
  }else{
    d.certs=d.certs.map((c,i)=>({id:c.id??i,name:c.name||'',org:c.org||'',date:c.date||''}));
  }
  // projects: migrate link/role → github/demo/tech
  d.projects=d.projects.map((p,i)=>({
    id:p.id??i,
    name:p.name||'',
    tech:p.tech||'',
    desc:p.desc||'',
    github:p.github||p.link||'',
    demo:p.demo||'',
  }));
  d.refs=d.refs.map((r,i)=>({id:r.id??i,name:r.name||'',role:r.role||'',contact:r.contact||''}));
  return d;
}

function syncCounters(){
  ec=Math.max(0,...S.exp.map(e=>e.id+1),0);
  dc=Math.max(0,...S.edu.map(e=>e.id+1),0);
  pc=Math.max(0,...S.projects.map(e=>e.id+1),0);
  rc=Math.max(0,...S.refs.map(e=>e.id+1),0);
  cc=Math.max(0,...S.certs.map(e=>e.id+1),0);
  sc=Math.max(0,...S.skills.map(e=>e.id+1),0);
}

let S=createDefaultState();
let ec=0,dc=0,pc=0,rc=0,cc=0,sc=0;
let undoStack=null,undoTimer=null,saveTimer=null;
let dragSrc=null,dragArr=null,dragSkillIdx=null;

// ══════════════════════════════════════════════
// LOCALSTORAGE AUTO-SAVE
// ══════════════════════════════════════════════
function saveToLS(immediate){
  const badge=document.getElementById('save-badge');
  const txt=document.getElementById('save-txt');
  badge.className='save-badge saving';
  txt.textContent='Saving…';
  clearTimeout(saveTimer);
  const doSave=()=>{
    try{
      localStorage.setItem(LS_KEY,JSON.stringify(S));
      badge.className='save-badge saved';
      txt.textContent='Saved';
      setTimeout(()=>{badge.className='save-badge';txt.textContent='Auto-saved';},2000);
    }catch(e){
      badge.className='save-badge';txt.textContent='Save failed';
    }
  };
  if(immediate)doSave();
  else saveTimer=setTimeout(doSave,500);
}

function loadFromLS(){
  try{
    const raw=localStorage.getItem(LS_KEY);
    if(!raw)return false;
    S=migrateState(JSON.parse(raw));
    syncCounters();
    return true;
  }catch(e){return false;}
}

window.addEventListener('beforeunload',()=>{try{localStorage.setItem(LS_KEY,JSON.stringify(S));}catch(e){}});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveToLS(true);});

// ══════════════════════════════════════════════
// IMPORT / EXPORT JSON
// ══════════════════════════════════════════════
function exportJSON(){
  syncFromForm();
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=(S.name||'cv').replace(/\s+/g,'-').toLowerCase()+'-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function importJSON(){document.getElementById('import-input').click();}
function handleImport(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    try{
      S=migrateState(JSON.parse(e.target.result));
      syncCounters();
      applyStateToUI();
      saveToLS(true);
    }catch(ex){alert('Invalid JSON file. Please use a CV Studio export.');}
  };
  r.readAsText(f);
  inp.value='';
}

function applyStateToUI(){
  restoreFormValues();
  document.getElementById('refs-toggle').checked=!!S.showRefs;
  document.getElementById('refs-wrap').style.display=S.showRefs?'':'none';
  document.querySelectorAll('.tpl-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('tpl-'+(S.tpl||'vertex'))?.classList.add('active');
  document.querySelectorAll('.swatch').forEach((s,j)=>s.classList.toggle('active',j===(S.ai||0)));
  rForms();rSkills();rLangs();rCV();
  if(S.photo){
    const img=document.getElementById('photo-img');
    img.src=S.photo;img.style.display='block';
    document.getElementById('photo-ph').style.display='none';
    document.getElementById('photo-rm').style.display='block';
  }else{
    removePhoto(true);
  }
}

// ══════════════════════════════════════════════
// PDF EXPORT (html2pdf)
// ══════════════════════════════════════════════
async function exportPDF(){
  const el=document.getElementById('cv-doc');
  if(el.querySelector('.cv-empty')){alert('Add some content before exporting.');return;}
  const name=(S.name||'cv').replace(/\s+/g,'-').toLowerCase();
  const btn=document.querySelector('[onclick="exportPDF()"]');
  const prev=btn?.innerHTML;
  if(btn){btn.disabled=true;btn.innerHTML='<i class="ti ti-loader"></i> Exporting…';}
  const opt={
    margin:[10,10,12,10],
    filename:`${name}-cv.pdf`,
    image:{type:'jpeg',quality:.98},
    html2canvas:{scale:2,useCORS:true,letterRendering:true,logging:false,scrollY:0},
    jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},
    pagebreak:{mode:['avoid-all','css','legacy'],before:'.page-break-before',after:'.page-break-after'},
  };
  try{
    await html2pdf().set(opt).from(el).save();
  }catch(err){
    alert('PDF export failed. Try again or use a smaller photo.');
  }finally{
    if(btn){btn.disabled=false;btn.innerHTML=prev;}
  }
}

// ══════════════════════════════════════════════
// DRAG & DROP
// ══════════════════════════════════════════════
function makeDraggable(card,arr,id){
  card.draggable=true;
  card.addEventListener('dragstart',e=>{
    dragSrc=card;dragArr=arr;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',id);
  });
  card.addEventListener('dragend',()=>{
    card.classList.remove('dragging');
    document.querySelectorAll('.e-card').forEach(c=>c.classList.remove('drag-over'));
  });
  card.addEventListener('dragover',e=>{
    e.preventDefault();e.dataTransfer.dropEffect='move';
    if(card!==dragSrc)card.classList.add('drag-over');
  });
  card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));
  card.addEventListener('drop',e=>{
    e.preventDefault();
    card.classList.remove('drag-over');
    if(dragSrc===card||dragArr!==arr)return;
    const srcId=parseInt(e.dataTransfer.getData('text/plain'));
    const tgtId=id;
    const si=arr.findIndex(v=>v.id===srcId);
    const ti=arr.findIndex(v=>v.id===tgtId);
    if(si<0||ti<0)return;
    const [item]=arr.splice(si,1);
    arr.splice(ti,0,item);
    rForms();rCV();saveToLS();
  });
}

// ══════════════════════════════════════════════
// UNDO DELETE
// ══════════════════════════════════════════════
function showUndo(msg,restoreFn){
  undoStack={fn:restoreFn};
  document.getElementById('undo-msg').textContent=msg;
  const t=document.getElementById('undo-toast');
  t.classList.add('show');
  clearTimeout(undoTimer);
  undoTimer=setTimeout(()=>{t.classList.remove('show');undoStack=null;},5000);
}
function undoDelete(){
  if(!undoStack)return;
  clearTimeout(undoTimer);
  undoStack.fn();
  document.getElementById('undo-toast').classList.remove('show');
  undoStack=null;
  rForms();rCV();saveToLS();
}

// ══════════════════════════════════════════════
// THEME / ACCENTS / TEMPLATE
// ══════════════════════════════════════════════
(()=>{
  const w=document.getElementById('swatches');
  ACCENTS.forEach((a,i)=>{
    const d=document.createElement('div');
    d.className='swatch'+(i===0?' active':'');
    d.style.background=a.hex;d.title=a.name;
    d.onclick=()=>setAccent(i);w.appendChild(d);
  });
})();

function setTpl(t){
  S.tpl=t;
  document.querySelectorAll('.tpl-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('tpl-'+t)?.classList.add('active');
  rCV();saveToLS();
}
function setAccent(i){
  S.ai=i;
  document.querySelectorAll('.swatch').forEach((s,j)=>s.classList.toggle('active',j===i));
  rCV();saveToLS();
}
function toggleTheme(){
  const h=document.documentElement,dark=h.dataset.theme==='dark';
  h.dataset.theme=dark?'light':'dark';
  document.getElementById('themeIco').className=dark?'ti ti-moon':'ti ti-sun';
  try{localStorage.setItem(LS_THEME,h.dataset.theme);}catch(e){}
}

// ══════════════════════════════════════════════
// PHOTO
// ══════════════════════════════════════════════
function handlePhoto(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    S.photo=e.target.result;
    const img=document.getElementById('photo-img');
    img.src=S.photo;img.style.display='block';
    document.getElementById('photo-ph').style.display='none';
    document.getElementById('photo-rm').style.display='block';
    rCV();saveToLS();
  };
  r.readAsDataURL(f);
}
function removePhoto(silent){
  S.photo=null;
  document.getElementById('photo-img').style.display='none';
  document.getElementById('photo-ph').style.display='';
  document.getElementById('photo-rm').style.display='none';
  document.getElementById('photo-input').value='';
  if(!silent){rCV();saveToLS();}
}

// ══════════════════════════════════════════════
// PROGRESS BAR
// ══════════════════════════════════════════════
function pct(){
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
// ══════════════════════════════════════════════
function addExp(){S.exp.push({id:ec++,role:'',co:'',dates:'',desc:''});rForms();rCV();saveToLS();}
function rmExp(id){
  const idx=S.exp.findIndex(e=>e.id===id);
  const removed=S.exp[idx];
  S.exp.splice(idx,1);
  rForms();rCV();saveToLS();
  showUndo(`Deleted "${removed.role||'Experience'}"`,()=>{S.exp.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// EDUCATION
// ══════════════════════════════════════════════
function addEdu(){S.edu.push({id:dc++,deg:'',sch:'',dates:'',desc:''});rForms();rCV();saveToLS();}
function rmEdu(id){
  const idx=S.edu.findIndex(e=>e.id===id);
  const removed=S.edu[idx];
  S.edu.splice(idx,1);
  rForms();rCV();saveToLS();
  showUndo(`Deleted "${removed.deg||'Education'}"`,()=>{S.edu.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════
function addProj(){S.projects.push({id:pc++,name:'',tech:'',desc:'',github:'',demo:''});rForms();rCV();saveToLS();}
function rmProj(id){
  const idx=S.projects.findIndex(e=>e.id===id);
  const removed=S.projects[idx];
  S.projects.splice(idx,1);
  rForms();rCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Project'}"`,()=>{S.projects.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// REFERENCES
// ══════════════════════════════════════════════
function toggleRefs(on){
  S.showRefs=on;
  document.getElementById('refs-wrap').style.display=on?'':'none';
  rCV();saveToLS();
}
function addRef(){S.refs.push({id:rc++,name:'',role:'',contact:''});rForms();rCV();saveToLS();}
function rmRef(id){
  const idx=S.refs.findIndex(e=>e.id===id);
  const removed=S.refs[idx];
  S.refs.splice(idx,1);
  rForms();rCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Reference'}"`,()=>{S.refs.splice(idx,0,removed);});
}

// ══════════════════════════════════════════════
// SKILLS / LANGUAGES / CERTIFICATIONS
// ══════════════════════════════════════════════
function addSkill(){
  const i=document.getElementById('ski'),v=i.value.trim();
  if(!v)return;S.skills.push({id:sc++,name:v});i.value='';rSkills();rCV();saveToLS();
}
function rmSkill(i){
  const removed=S.skills[i];
  S.skills.splice(i,1);
  rSkills();rCV();saveToLS();
  showUndo(`Removed skill "${removed.name}"`,()=>{S.skills.splice(i,0,removed);});
}
function rSkills(){
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
      dragSkillIdx=null;rSkills();rCV();saveToLS();
    });
  });
}

function addLang(){
  const inp=document.getElementById('lang-inp'),lvl=document.getElementById('lang-lvl');
  const v=inp.value.trim();if(!v)return;
  S.langs.push({name:v,level:lvl.value});inp.value='';rLangs();rCV();saveToLS();
}
function rmLang(i){S.langs.splice(i,1);rLangs();rCV();saveToLS();}
function rLangs(){
  document.getElementById('lang-chips').innerHTML=S.langs.map((l,i)=>
    `<span class="lang-chip">${x(l.name)} · ${x(l.level)}<button onclick="rmLang(${i})">×</button></span>`).join('');
}

function addCert(){S.certs.push({id:cc++,name:'',org:'',date:''});rForms();rCV();saveToLS();}
function rmCert(id){
  const idx=S.certs.findIndex(c=>c.id===id);
  const removed=S.certs[idx];
  S.certs.splice(idx,1);
  rForms();rCV();saveToLS();
  showUndo(`Deleted "${removed.name||'Certification'}"`,()=>{S.certs.splice(idx,0,removed);});
}
function rCerts(){/* certs rendered in rForms */}

// ══════════════════════════════════════════════
// RENDER FORMS
// ══════════════════════════════════════════════
function rForms(){
  // Experience
  document.getElementById('exp-list').innerHTML=S.exp.map(e=>`
    <div class="e-card" id="ecard-exp-${e.id}">
      <div class="e-card-hdr">
        <div class="drag-handle" title="Drag to reorder"><i class="ti ti-grip-vertical"></i></div>
        <span class="e-card-title">${x(e.role)||'New Experience'}</span>
        <button class="e-del" onclick="rmExp(${e.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="row2">
        <div class="field"><label>Role</label><input value="${x(e.role)}" placeholder="Software Engineer" oninput="S.exp.find(v=>v.id===${e.id}).role=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Experience';rCV();saveToLS()"></div>
        <div class="field"><label>Company</label><input value="${x(e.co)}" placeholder="Acme Corp" oninput="S.exp.find(v=>v.id===${e.id}).co=this.value;rCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Dates</label><input value="${x(e.dates)}" placeholder="Jan 2022 – Present" oninput="S.exp.find(v=>v.id===${e.id}).dates=this.value;rCV();saveToLS()"></div>
      <div class="field"><label>Description</label><textarea oninput="S.exp.find(v=>v.id===${e.id}).desc=this.value;rCV();saveToLS()" placeholder="Key responsibilities and achievements...">${x(e.desc)}</textarea></div>
    </div>`).join('');
  // Education
  document.getElementById('edu-list').innerHTML=S.edu.map(e=>`
    <div class="e-card" id="ecard-edu-${e.id}">
      <div class="e-card-hdr">
        <div class="drag-handle" title="Drag to reorder"><i class="ti ti-grip-vertical"></i></div>
        <span class="e-card-title">${x(e.deg)||'New Degree'}</span>
        <button class="e-del" onclick="rmEdu(${e.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="row2">
        <div class="field"><label>Degree</label><input value="${x(e.deg)}" placeholder="BSc Computer Science" oninput="S.edu.find(v=>v.id===${e.id}).deg=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Degree';rCV();saveToLS()"></div>
        <div class="field"><label>School</label><input value="${x(e.sch)}" placeholder="University of Jordan" oninput="S.edu.find(v=>v.id===${e.id}).sch=this.value;rCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Dates</label><input value="${x(e.dates)}" placeholder="2019 – 2023" oninput="S.edu.find(v=>v.id===${e.id}).dates=this.value;rCV();saveToLS()"></div>
      <div class="field"><label>Notes</label><textarea oninput="S.edu.find(v=>v.id===${e.id}).desc=this.value;rCV();saveToLS()" placeholder="GPA, honors, coursework...">${x(e.desc)}</textarea></div>
    </div>`).join('');
  // Projects
  document.getElementById('proj-list').innerHTML=S.projects.map(e=>`
    <div class="e-card" id="ecard-proj-${e.id}">
      <div class="e-card-hdr">
        <div class="drag-handle" title="Drag to reorder"><i class="ti ti-grip-vertical"></i></div>
        <span class="e-card-title">${x(e.name)||'New Project'}</span>
        <button class="e-del" onclick="rmProj(${e.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="field"><label>Project Name</label><input value="${x(e.name)}" placeholder="E-Commerce Platform" oninput="const p=S.projects.find(v=>v.id===${e.id});p.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Project';rCV();saveToLS()"></div>
      <div class="field"><label>Technologies</label><input value="${x(e.tech)}" placeholder="React, Node.js, PostgreSQL" oninput="S.projects.find(v=>v.id===${e.id}).tech=this.value;rCV();saveToLS()"></div>
      <div class="field"><label>Description</label><textarea oninput="S.projects.find(v=>v.id===${e.id}).desc=this.value;rCV();saveToLS()" placeholder="What it does, your role, impact...">${x(e.desc)}</textarea></div>
      <div class="row2">
        <div class="field"><label>GitHub</label><input value="${x(e.github)}" placeholder="github.com/user/repo" oninput="S.projects.find(v=>v.id===${e.id}).github=this.value;rCV();saveToLS()"></div>
        <div class="field"><label>Live Demo</label><input value="${x(e.demo)}" placeholder="myapp.com" oninput="S.projects.find(v=>v.id===${e.id}).demo=this.value;rCV();saveToLS()"></div>
      </div>
    </div>`).join('');

  // Certifications
  document.getElementById('cert-list').innerHTML=S.certs.map(c=>`
    <div class="e-card" id="ecard-cert-${c.id}">
      <div class="e-card-hdr">
        <span class="e-card-title">${x(c.name)||'New Certification'}</span>
        <button class="e-del" onclick="rmCert(${c.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="field"><label>Certification Name</label><input value="${x(c.name)}" placeholder="AWS Solutions Architect" oninput="const cert=S.certs.find(v=>v.id===${c.id});cert.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Certification';rCV();saveToLS()"></div>
      <div class="row2">
        <div class="field"><label>Organization</label><input value="${x(c.org)}" placeholder="Amazon Web Services" oninput="S.certs.find(v=>v.id===${c.id}).org=this.value;rCV();saveToLS()"></div>
        <div class="field"><label>Date</label><input value="${x(c.date)}" placeholder="2024" oninput="S.certs.find(v=>v.id===${c.id}).date=this.value;rCV();saveToLS()"></div>
      </div>
    </div>`).join('');

  // References
  document.getElementById('ref-list').innerHTML=S.refs.map(r=>`
    <div class="e-card" id="ecard-ref-${r.id}">
      <div class="e-card-hdr">
        <span class="e-card-title">${x(r.name)||'New Reference'}</span>
        <button class="e-del" onclick="rmRef(${r.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="row2">
        <div class="field"><label>Name</label><input value="${x(r.name)}" placeholder="Jane Smith" oninput="const r=S.refs.find(v=>v.id===${r.id});r.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Reference';rCV();saveToLS()"></div>
        <div class="field"><label>Role / Company</label><input value="${x(r.role)}" placeholder="Engineering Manager, Acme" oninput="S.refs.find(v=>v.id===${r.id}).role=this.value;rCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Contact</label><input value="${x(r.contact)}" placeholder="jane@acme.com · +1 555…" oninput="S.refs.find(v=>v.id===${r.id}).contact=this.value;rCV();saveToLS()"></div>
    </div>`).join('');

  // Attach drag & drop
  S.exp.forEach(e=>{
    const card=document.getElementById(`ecard-exp-${e.id}`);
    if(card)makeDraggable(card,S.exp,e.id);
  });
  S.edu.forEach(e=>{
    const card=document.getElementById(`ecard-edu-${e.id}`);
    if(card)makeDraggable(card,S.edu,e.id);
  });
  S.projects.forEach(e=>{
    const card=document.getElementById(`ecard-proj-${e.id}`);
    if(card)makeDraggable(card,S.projects,e.id);
  });
}

function restoreFormValues(){
  ['name','title','email','phone','loc','link'].forEach(k=>{
    const el=document.getElementById('f-'+k);if(el)el.value=S[k]||'';
  });
  const sum=document.getElementById('f-sum');if(sum)sum.value=S.sum||'';
}

function syncFromForm(){
  ['name','title','email','phone','loc','link'].forEach(k=>{const e=document.getElementById('f-'+k);if(e)S[k]=e.value;});
  S.sum=document.getElementById('f-sum')?.value||'';
}

// ══════════════════════════════════════════════
// ATS SCORING
// ══════════════════════════════════════════════
function calcATS(){
  const tips=[];
  let score=0;
  const bodyText=[S.sum,...S.exp.map(e=>e.desc),...S.projects.map(p=>p.desc)].join(' ').toLowerCase();
  const titleWords=(S.title||'').toLowerCase().split(/\W+/).filter(w=>w.length>2);
  const skillNames=S.skills.map(s=>s.name.toLowerCase());

  if(S.name){score+=8;}else tips.push({type:'warn',text:'Add your full name — ATS parsers expect it at the top.'});
  if(S.title){score+=8;}else tips.push({type:'warn',text:'Add a job title targeted to the role you want.'});
  if(S.email&&S.phone){score+=10;}else if(S.email||S.phone){score+=5;tips.push({type:'info',text:'Add both email and phone for complete contact info.'});}
  else tips.push({type:'warn',text:'Include email and phone — recruiters need both.'});
  if(S.sum&&S.sum.length>=80){score+=12;}
  else if(S.sum&&S.sum.length>=40){score+=6;tips.push({type:'info',text:'Expand your summary to 2–4 sentences (80+ characters) with role-specific keywords.'});}
  else tips.push({type:'warn',text:'Write a professional summary (weak or missing). Use keywords from your target role.'});
  if(S.exp.length>=1){score+=12;if(S.exp.length>=2)score+=3;}
  else tips.push({type:'warn',text:'Add at least one work experience entry.'});
  if(S.edu.length>0)score+=8;else tips.push({type:'info',text:'Consider adding education — many ATS filters expect it.'});
  if(S.skills.length>=5)score+=10;
  else if(S.skills.length>=2)score+=5;
  else tips.push({type:'warn',text:'Add more skills (aim for 5+) — ATS often matches on skill keywords.'});
  if(S.projects.length>0)score+=6;
  if(S.langs.length>0)score+=4;
  if(S.certs.length>0)score+=4;
  const hasMetrics=/\d+%?|\$\d|#\d|\d+\+/.test(bodyText);
  if(hasMetrics)score+=5;else if(S.exp.length)tips.push({type:'info',text:'Quantify achievements (numbers, %, $) in experience — ATS and recruiters favor metrics.'});
  const hasAction=ACTION_VERBS.some(v=>bodyText.includes(v));
  if(hasAction)score+=4;else if(S.exp.length)tips.push({type:'info',text:'Use strong action verbs (led, built, improved, delivered) in descriptions.'});
  if(S.photo)score+=2;

  const missingKw=[];
  titleWords.forEach(w=>{if(!bodyText.includes(w)&&!skillNames.some(s=>s.includes(w)))missingKw.push(w);});
  skillNames.slice(0,12).forEach(sk=>{
    if(sk.length>2&&!bodyText.includes(sk)&&!missingKw.includes(sk))missingKw.push(sk);
  });

  if(!S.projects.length&&/developer|engineer|designer/i.test(S.title||''))
    tips.push({type:'info',text:'Projects section recommended for technical roles.'});
  if(!S.langs.length)tips.push({type:'info',text:'Languages section can help for international roles.'});

  score=Math.min(100,Math.round(score));
  if(score>=75&&!tips.some(t=>t.type==='warn'))tips.unshift({type:'ok',text:'Strong ATS foundation. Tailor keywords to each job posting.'});
  return{score,tips:tips.slice(0,6),missingKw:missingKw.slice(0,8)};
}

function renderATS(){
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
function update(){
  syncFromForm();
  const p=pct();
  document.getElementById('prog-fill').style.width=p+'%';
  document.getElementById('prog-pct').textContent=p+'%';
  renderATS();
  rCV();saveToLS();
}

// ══════════════════════════════════════════════
// RENDER CV
// ══════════════════════════════════════════════
function rCV(){
  syncFromForm();
  const p=pct();
  document.getElementById('prog-fill').style.width=p+'%';
  document.getElementById('prog-pct').textContent=p+'%';
  renderATS();

  const doc=document.getElementById('cv-doc');
  const a=ACCENTS[S.ai]||ACCENTS[0];
  doc.style.setProperty('--cv-accent',a.hex);
  doc.style.setProperty('--cv-accent-dark',a.dark);
  doc.style.setProperty('--cv-accent-light',a.light);

  const s=S;
  const hasAny=s.name||s.title||s.email||s.phone||s.sum||s.exp.length||s.edu.length||s.skills.length||s.projects.length||s.langs.length||s.certs.length;
  if(!hasAny){
    doc.className='cv-doc';
    doc.innerHTML=`<div class="cv-empty"><div class="ei">◈</div><h3>Your CV will appear here</h3><p>Start filling in the form on the left</p></div>`;
    return;
  }
  const R={vertex:renderVertex,atlas:renderAtlas,pulse:renderPulse,classic:renderClassic,executive:renderExecutive,creative:renderCreative,minimal:renderMinimal};
  (R[s.tpl]||renderVertex)(doc,s);
}

function projLinks(p,cls){
  const parts=[];
  if(p.github)parts.push(`<span class="${cls}"><i class="ti ti-brand-github"></i> ${x(p.github)}</span>`);
  if(p.demo)parts.push(`<span class="${cls}"><i class="ti ti-world"></i> ${x(p.demo)}</span>`);
  return parts.join(' ');
}

function renderProjBlock(s,entryCls,roleCls,orgCls,descCls,techCls,linksCls){
  return s.projects.map(p=>`
    <div class="${entryCls}">
      <div class="v-et"><div class="${roleCls}">${x(p.name)||'Project'}</div></div>
      ${p.tech?`<div class="${techCls||orgCls}">${x(p.tech)}</div>`:''}
      ${p.desc?`<div class="${descCls}">${x(p.desc).replace(/\n/g,'<br>')}</div>`:''}
      ${(p.github||p.demo)?`<div class="${linksCls||orgCls}">${projLinks(p,linksCls||orgCls)}</div>`:''}
    </div>`).join('');
}

function certLine(c){return [c.name,c.org,c.date].filter(Boolean).map(x).join(' · ');}

function refsHTML(s){
  if(!s.showRefs||!s.refs.length)return '';
  return `<div class="v-sec" style="margin-top:18px"><div class="v-sh" style="margin-bottom:10px"><span>References</span></div>${s.refs.map(r=>`
    <div style="font-size:12.5px;line-height:1.7;margin-bottom:8px;color:#555"><strong style="color:#1a1a2e">${x(r.name)}</strong>${r.role?` — ${x(r.role)}`:''}${r.contact?`<br><span style="font-size:11px">${x(r.contact)}</span>`:''}</div>`).join('')}</div>`;
}

function ci(s,cls){
  return[
    s.email?`<span class="${cls}"><i class="ti ti-mail"></i>${x(s.email)}</span>`:'',
    s.phone?`<span class="${cls}"><i class="ti ti-phone"></i>${x(s.phone)}</span>`:'',
    s.loc?`<span class="${cls}"><i class="ti ti-map-pin"></i>${x(s.loc)}</span>`:'',
    s.link?`<span class="${cls}"><i class="ti ti-link"></i>${x(s.link)}</span>`:'',
  ].filter(Boolean).join('');
}

// ══════════════════════════════════════════════
// TEMPLATE RENDERERS
// ══════════════════════════════════════════════
function renderVertex(doc,s){
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

function renderAtlas(doc,s){
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

function renderPulse(doc,s){
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

function renderClassic(doc,s){
  doc.className='cv-doc tpl-classic';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).map(x).join(' · ');
  doc.innerHTML=`
    <div class="c-body">
      <div class="c-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="c-title">${x(s.title)}</div>`:''}
      ${contacts?`<div class="c-contacts">${contacts}</div>`:''}
      ${s.sum?`<div class="c-sh">Professional Summary</div><div class="c-sum">${x(s.sum)}</div>`:''}
      ${s.exp.length?`<div class="c-sh">Experience</div>${s.exp.map(e=>`
        <div class="c-entry"><div class="c-et"><span class="c-role">${x(e.role)}</span><span class="c-dates">${x(e.dates)}</span></div>
        ${e.co?`<div class="c-org">${x(e.co)}</div>`:''}${e.desc?`<div class="c-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}`:''}
      ${s.edu.length?`<div class="c-sh">Education</div>${s.edu.map(e=>`
        <div class="c-entry"><div class="c-et"><span class="c-role">${x(e.deg)}</span><span class="c-dates">${x(e.dates)}</span></div>
        ${e.sch?`<div class="c-org">${x(e.sch)}</div>`:''}${e.desc?`<div class="c-desc">${x(e.desc)}</div>`:''}</div>`).join('')}`:''}
      ${s.projects.length?`<div class="c-sh">Projects</div>${s.projects.map(p=>`
        <div class="c-entry"><div class="c-role">${x(p.name)}</div>${p.tech?`<div class="c-proj-tech">${x(p.tech)}</div>`:''}
        ${p.desc?`<div class="c-desc">${x(p.desc).replace(/\n/g,'<br>')}</div>`:''}
        ${(p.github||p.demo)?`<div class="c-links">${projLinks(p,'')}</div>`:''}</div>`).join('')}`:''}
      ${s.skills.length?`<div class="c-sh">Skills</div><div class="c-skills">${s.skills.map(sk=>x(sk.name)).join(' · ')}</div>`:''}
      ${s.langs.length?`<div class="c-sh">Languages</div><div class="c-skills">${s.langs.map(l=>`${x(l.name)} (${x(l.level)})`).join(' · ')}</div>`:''}
      ${s.certs.length?`<div class="c-sh">Certifications</div>${s.certs.map(c=>`<div class="c-entry"><span class="c-role">${certLine(c)}</span></div>`).join('')}`:''}
      ${s.showRefs&&s.refs.length?`<div class="c-sh">References</div>${s.refs.map(r=>`<div class="c-entry"><span class="c-role">${x(r.name)}</span> — ${x(r.role)} ${r.contact?`· ${x(r.contact)}`:''}</div>`).join('')}`:''}
    </div>`;
}

function renderExecutive(doc,s){
  doc.className='cv-doc tpl-executive';
  const photo=s.photo?`<img class="e-photo" src="${s.photo}" alt="">`:'';
  const contacts=[s.email,s.phone,s.loc,s.link].filter(Boolean).join(' · ');
  doc.innerHTML=`
    <div class="e-header"><div class="e-hdr-inner"><div>
      <div class="e-name">${s.name||'Your Name'}</div>
      ${s.title?`<div class="e-title">${x(s.title)}</div>`:''}
      ${contacts?`<div class="e-contacts">${x(contacts)}</div>`:''}
    </div>${photo}</div></div>
    <div class="e-body">
      ${s.sum?`<div class="e-sh">Executive Summary</div><div class="e-sum">${x(s.sum)}</div>`:''}
      ${s.exp.length?`<div class="e-sh">Professional Experience</div>${s.exp.map(e=>`
        <div class="e-entry"><div class="e-et"><div class="e-role">${x(e.role)}</div><div class="e-dates">${x(e.dates)}</div></div>
        ${e.co?`<div class="e-org">${x(e.co)}</div>`:''}${e.desc?`<div class="e-desc">${x(e.desc).replace(/\n/g,'<br>')}</div>`:''}</div>`).join('')}`:''}
      ${s.edu.length?`<div class="e-sh">Education</div>${s.edu.map(e=>`
        <div class="e-entry"><div class="e-et"><div class="e-role">${x(e.deg)}</div><div class="e-dates">${x(e.dates)}</div></div>
        ${e.sch?`<div class="e-org">${x(e.sch)}</div>`:''}</div>`).join('')}`:''}
      ${s.projects.length?`<div class="e-sh">Key Projects</div>${renderProjBlock(s,'e-entry','e-role','e-org','e-desc','e-org','e-org')}`:''}
      ${s.skills.length?`<div class="e-sh">Core Competencies</div><div class="e-pills">${s.skills.map(sk=>`<span class="e-pill">${x(sk.name)}</span>`).join('')}</div>`:''}
      ${s.langs.length?`<div class="e-sh">Languages</div><div class="e-pills">${s.langs.map(l=>`<span class="e-pill">${x(l.name)} · ${x(l.level)}</span>`).join('')}</div>`:''}
      ${s.certs.length?`<div class="e-sh">Certifications</div>${s.certs.map(c=>`<div class="e-desc" style="margin-bottom:6px">${certLine(c)}</div>`).join('')}`:''}
      ${refsHTML(s)}
    </div>`;
}

function renderCreative(doc,s){
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

function renderMinimal(doc,s){
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
function x(s){
  if(!s)return'';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
(function init(){
  const theme=localStorage.getItem(LS_THEME);
  if(theme){document.documentElement.dataset.theme=theme;document.getElementById('themeIco').className=theme==='dark'?'ti ti-sun':'ti ti-moon';}
  const loaded=loadFromLS();
  if(loaded)applyStateToUI();
  else{rForms();rSkills();rLangs();rCV();renderATS();}
  const badge=document.getElementById('save-badge');
  const txt=document.getElementById('save-txt');
  if(loaded){badge.className='save-badge saved';txt.textContent='Restored — auto-save on';}
  else{badge.className='save-badge';txt.textContent='Auto-save on';}
})();
