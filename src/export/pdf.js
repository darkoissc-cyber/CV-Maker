import { S, counters } from '../state/store.js';
import { $ } from '../utils/dom.js';

export async function exportPDF(){
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
