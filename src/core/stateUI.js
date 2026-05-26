import { S } from '../state/store.js';
import { saveToLS } from '../storage/persistence.js';
import { rForms, restoreFormValues } from '../components/forms.js';
import { rSkills, rLangs } from '../components/skills.js';
import { renderCV } from '../renderers/pipeline.js';
import { removePhoto } from '../components/photo.js';
import { applyAppAccentByIndex } from '../theme/applyAccent.js';

export function applyStateToUI(){
  restoreFormValues();
  document.getElementById('refs-toggle').checked=!!S.showRefs;
  document.getElementById('refs-wrap').style.display=S.showRefs?'':'none';
  document.querySelectorAll('.tpl-card').forEach(c=>c.classList.remove('active'));
  document.getElementById('tpl-'+(S.tpl||'vertex'))?.classList.add('active');
  document.querySelectorAll('.swatch').forEach((s,j)=>s.classList.toggle('active',j===(S.ai||0)));
  applyAppAccentByIndex(S.ai||0);
  rForms();rSkills();rLangs();renderCV();
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
