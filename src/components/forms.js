import { S, counters } from '../state/store.js';
import { x } from '../utils/escape.js';
import { makeDraggable } from '../core/dragDrop.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { $ } from '../utils/dom.js';

export function rForms(){
  // Experience
  document.getElementById('exp-list').innerHTML=S.exp.map(e=>`
    <div class="e-card" id="ecard-exp-${e.id}">
      <div class="e-card-hdr">
        <div class="drag-handle" title="Drag to reorder"><i class="ti ti-grip-vertical"></i></div>
        <span class="e-card-title">${x(e.role)||'New Experience'}</span>
        <button class="e-del" onclick="rmExp(${e.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="row2">
        <div class="field"><label>Role</label><input value="${x(e.role)}" placeholder="Software Engineer" oninput="S.exp.find(v=>v.id===${e.id}).role=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Experience';renderCV();saveToLS()"></div>
        <div class="field"><label>Company</label><input value="${x(e.co)}" placeholder="Acme Corp" oninput="S.exp.find(v=>v.id===${e.id}).co=this.value;renderCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Dates</label><input value="${x(e.dates)}" placeholder="Jan 2022 – Present" oninput="S.exp.find(v=>v.id===${e.id}).dates=this.value;renderCV();saveToLS()"></div>
      <div class="field"><label>Description</label><textarea spellcheck="false" oninput="S.exp.find(v=>v.id===${e.id}).desc=this.value;renderCV();saveToLS()" placeholder="Key responsibilities and achievements...">${x(e.desc)}</textarea></div>
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
        <div class="field"><label>Degree</label><input value="${x(e.deg)}" placeholder="BSc Computer Science" oninput="S.edu.find(v=>v.id===${e.id}).deg=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Degree';renderCV();saveToLS()"></div>
        <div class="field"><label>School</label><input value="${x(e.sch)}" placeholder="University of Jordan" oninput="S.edu.find(v=>v.id===${e.id}).sch=this.value;renderCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Dates</label><input value="${x(e.dates)}" placeholder="2019 – 2023" oninput="S.edu.find(v=>v.id===${e.id}).dates=this.value;renderCV();saveToLS()"></div>
      <div class="field"><label>Notes</label><textarea spellcheck="false" oninput="S.edu.find(v=>v.id===${e.id}).desc=this.value;renderCV();saveToLS()" placeholder="GPA, honors, coursework...">${x(e.desc)}</textarea></div>
    </div>`).join('');
  // Projects
  document.getElementById('proj-list').innerHTML=S.projects.map(e=>`
    <div class="e-card" id="ecard-proj-${e.id}">
      <div class="e-card-hdr">
        <div class="drag-handle" title="Drag to reorder"><i class="ti ti-grip-vertical"></i></div>
        <span class="e-card-title">${x(e.name)||'New Project'}</span>
        <button class="e-del" onclick="rmProj(${e.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="field"><label>Project Name</label><input value="${x(e.name)}" placeholder="E-Commerce Platform" oninput="const p=S.projects.find(v=>v.id===${e.id});p.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Project';renderCV();saveToLS()"></div>
      <div class="field"><label>Technologies</label><input value="${x(e.tech)}" placeholder="React, Node.js, PostgreSQL" oninput="S.projects.find(v=>v.id===${e.id}).tech=this.value;renderCV();saveToLS()"></div>
      <div class="field"><label>Description</label><textarea spellcheck="false" oninput="S.projects.find(v=>v.id===${e.id}).desc=this.value;renderCV();saveToLS()" placeholder="What it does, your role, impact...">${x(e.desc)}</textarea></div>
      <div class="row2">
        <div class="field"><label>GitHub</label><input value="${x(e.github)}" placeholder="github.com/user/repo" oninput="S.projects.find(v=>v.id===${e.id}).github=this.value;renderCV();saveToLS()"></div>
        <div class="field"><label>Live Demo</label><input value="${x(e.demo)}" placeholder="myapp.com" oninput="S.projects.find(v=>v.id===${e.id}).demo=this.value;renderCV();saveToLS()"></div>
      </div>
    </div>`).join('');

  // Certifications
  document.getElementById('cert-list').innerHTML=S.certs.map(c=>`
    <div class="e-card" id="ecard-cert-${c.id}">
      <div class="e-card-hdr">
        <span class="e-card-title">${x(c.name)||'New Certification'}</span>
        <button class="e-del" onclick="rmCert(${c.id})" title="Delete"><i class="ti ti-trash"></i></button>
      </div>
      <div class="field"><label>Certification Name</label><input value="${x(c.name)}" placeholder="AWS Solutions Architect" oninput="const cert=S.certs.find(v=>v.id===${c.id});cert.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Certification';renderCV();saveToLS()"></div>
      <div class="row2">
        <div class="field"><label>Organization</label><input value="${x(c.org)}" placeholder="Amazon Web Services" oninput="S.certs.find(v=>v.id===${c.id}).org=this.value;renderCV();saveToLS()"></div>
        <div class="field"><label>Date</label><input value="${x(c.date)}" placeholder="2024" oninput="S.certs.find(v=>v.id===${c.id}).date=this.value;renderCV();saveToLS()"></div>
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
        <div class="field"><label>Name</label><input value="${x(r.name)}" placeholder="Jane Smith" oninput="const r=S.refs.find(v=>v.id===${r.id});r.name=this.value;this.closest('.e-card').querySelector('.e-card-title').textContent=this.value||'New Reference';renderCV();saveToLS()"></div>
        <div class="field"><label>Role / Company</label><input value="${x(r.role)}" placeholder="Engineering Manager, Acme" oninput="S.refs.find(v=>v.id===${r.id}).role=this.value;renderCV();saveToLS()"></div>
      </div>
      <div class="field"><label>Contact</label><input value="${x(r.contact)}" placeholder="jane@acme.com · +1 555…" oninput="S.refs.find(v=>v.id===${r.id}).contact=this.value;renderCV();saveToLS()"></div>
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

export function restoreFormValues(){
  ['name','title','email','phone','loc','link'].forEach(k=>{
    const el=document.getElementById('f-'+k);if(el)el.value=S[k]||'';
  });
  const sum=document.getElementById('f-sum');if(sum)sum.value=S.sum||'';
}

export function syncFromForm(){
  ['name','title','email','phone','loc','link'].forEach(k=>{const e=document.getElementById('f-'+k);if(e)S[k]=e.value;});
  S.sum=document.getElementById('f-sum')?.value||'';
}
