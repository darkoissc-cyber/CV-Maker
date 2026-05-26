import { S, counters } from '../state/store.js';
import { ACTION_VERBS } from '../state/constants.js';
import { x } from '../utils/escape.js';

export function calcATS(){
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

