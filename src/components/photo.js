import { S, counters } from '../state/store.js';
import { saveToLS } from '../storage/persistence.js';
import { renderCV } from '../renderers/pipeline.js';
import { $ } from '../utils/dom.js';

export function handlePhoto(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=e=>{
    S.photo=e.target.result;
    const img=document.getElementById('photo-img');
    img.src=S.photo;img.style.display='block';
    document.getElementById('photo-ph').style.display='none';
    document.getElementById('photo-rm').style.display='block';
    renderCV();saveToLS();
  };
  r.readAsDataURL(f);
}
export function removePhoto(silent){
  S.photo=null;
  document.getElementById('photo-img').style.display='none';
  document.getElementById('photo-ph').style.display='';
  document.getElementById('photo-rm').style.display='none';
  document.getElementById('photo-input').value='';
  if(!silent){renderCV();saveToLS();}
}

