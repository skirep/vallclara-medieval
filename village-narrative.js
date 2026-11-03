import {canFlirt,flirtConversation} from './flirt-dialogue.js';
import {VILLAGE_LORE,THREADS,KEY_RESIDENTS} from './village-lore.js';
import {dialogueEntry,DIALOGUE_COUNT} from './dialogue-catalogue.js';
export function attachNarrative(population){
 const byId=new Map(population.map(p=>[p.id,p]));
 for(const [i,p]of population.entries()){
  const friend=population[(i+17)%population.length],rival=population[(i+83)%population.length],witness=population[(i+1)%population.length];
  p.story.narrative={friendId:friend.id,rivalId:rival.id,witnessId:witness.id,thread:p.familyId%16,stance:['obrir els comptes a totes les cases','protegir els torns de les llars petites','reparar el pas sense nous deutes','escoltar els testimonis abans de decidir'][p.familyId%4],secret:`A casa ${p.family.household} es conserva un record relacionat amb ${THREADS[p.familyId%16].stages[p.familyId%4].proof}. ${witness.name} pot ajudar a contrastar-lo.`,lineCount:DIALOGUE_COUNT};
 }
 for(const key of KEY_RESIDENTS){const p=byId.get(key.id);if(p)Object.assign(p.story.narrative,{thread:key.topic,role:key.role,motive:key.motive,secret:key.secret});}
 for(const p of population){const n=p.story.narrative;p.story.biography+=` Davant del pacte de les dues ribes, defensa ${n.stance}. Confia en ${byId.get(n.friendId).name}; discrepa amb ${byId.get(n.rivalId).name}, però poden arribar a entendre’s.`;}
}
export function narrativeConversation(a,b,hour,meeting=0,{topic,chapter=0,relationship}={}){
 if(canFlirt(a,b))return flirtConversation(a,b,hour,meeting);
 topic=topic??((Math.floor((a.social.meetings+b.social.meetings)/2)+a.familyId+b.familyId+meeting)%16);
 const first=meeting%2?b:a,second=first===a?b:a;
 const turns=Array.from({length:8},(_,beat)=>dialogueEntry(beat%2?second:first,topic*32+chapter*8+beat,beat%2?first:second));
 const greeting=hour<12?'Bon dia':hour<18?'Bona tarda':'Bon vespre',familiar=(a.social.met[b.id]||0)>0;
 turns[0].text=`${greeting}, ${second.name}.${familiar?' Com va tot des de l’última vegada?':''} ${turns[0].text}`;
 if(a.familyId===b.familyId)turns[1].text='Parlem-ne amb la gent de casa. '+turns[1].text;
 else if(relationship?.score<0)turns[1].text='Encara discrepem sobre el pacte, però t’escolto. '+turns[1].text;
 turns[4].text+=` També voldria ${first.story.wish}.`;
 if(chapter>=1&&first.story.narrative?.thread===topic)turns[4].text+=` Et puc explicar la meva part: ${first.story.narrative.secret}`;
 const duty=second.duty;
 if(duty)turns[5].text+=duty.phase==='blocked'?` Ara em falta ${duty.blocker} per continuar la feina.`:duty.lastCompleted?` La darrera tasca completada és «${duty.lastCompleted.label}».`:` Avui tinc previst això: ${duty.plan}.`;
 if(relationship?.promise)turns[6].text=`Ens vam prometre tornar a parlar de «${THREADS[relationship.promise.topic].title}». Avui hi som tots dos. ${turns[6].text}`;
 else turns[7].text+=` Ens prometem tornar-ne a parlar quan ens retrobem, ${first.name}?`;
 const child=a.age<16?a:b.age<16?b:null;
 if(child)turns.find((t,i)=>i>=4&&t.speakerId===child.id).text+=' Després vull jugar a la plaça amb la gent de casa; a les obres només hi aniré acompanyat.';
 return turns;
}
export function createVillageNarrative(population){
 const byId=new Map(population.map(p=>[p.id,p])),relationships=new Map(),evidence=new Set(),witnesses=new Set(),topics=new Set(),events=[];
 let chapter=0,total=0;const target=24,key=(a,b)=>[Math.min(a.id,b.id),Math.max(a.id,b.id)].join(':');
 function relation(a,b){const k=key(a,b);if(!relationships.has(k)){
  relationships.set(k,{a:Math.min(a.id,b.id),b:Math.max(a.id,b.id),score:a.story.narrative.rivalId===b.id||b.story.narrative.rivalId===a.id?-2:a.familyId===b.familyId?2:0,encounters:0,promise:null});
  if(relationships.size>4000)relationships.delete(relationships.keys().next().value);
 }return relationships.get(k);}
 function plan(a,b,hour){const r=relation(a,b),topic=r.promise?.topic??((r.encounters+Math.floor(a.social.meetings/2)+a.familyId+b.familyId)%16);return{topic,chapter,romantic:canFlirt(a,b),turns:narrativeConversation(a,b,hour,a.social.met[b.id]||0,{topic,chapter,relationship:r})};}
 function complete(a,b,c){
  const r=relation(a,b),reunited=!!r.promise;
  if(c.romantic){r.encounters++;r.score=Math.min(10,r.score+1);return 'Conversa de flirteig · sense compromís ni cap promesa obligada';}
  r.encounters++;r.score=Math.min(10,r.score+1+(reunited?1:0));r.promise=reunited?null:{topic:c.topic};total++;
  const token=`${key(a,b)}:${c.topic}`;
  if(c.chapter===chapter&&!evidence.has(token)&&evidence.size<4000){evidence.add(token);witnesses.add(a.id);witnesses.add(b.id);topics.add(c.topic);}
  if(chapter<3&&evidence.size>=target&&witnesses.size>=Math.min(12,population.length)&&topics.size>=6){chapter++;events.unshift({chapter,text:VILLAGE_LORE.chapters[chapter].summary});evidence.clear();witnesses.clear();topics.clear();}
  return reunited?'Retrobença complerta · augmenta la confiança':'Retrobença acordada · queda pendent tornar-ne a parlar';
 }
 function summary(){return{chapter,title:VILLAGE_LORE.chapters[chapter].title,description:VILLAGE_LORE.chapters[chapter].summary,exchanges:evidence.size,target,witnesses:witnesses.size,topics:topics.size,total,events:[...events]};}
 function serialize(){return{version:1,chapter,total,evidence:[...evidence],relationships:[...relationships.values()]};}
 function restore(data){
  if(!data||data.version!==1)return;const topicOK=n=>Number.isInteger(n)&&n>=0&&n<16;
  chapter=Number.isInteger(data.chapter)&&data.chapter>=0&&data.chapter<=3?data.chapter:0;total=Number.isSafeInteger(data.total)&&data.total>=0?data.total:0;
  evidence.clear();witnesses.clear();topics.clear();relationships.clear();events.length=0;
  for(const token of (Array.isArray(data.evidence)?data.evidence:[]).slice(0,4000)){
   if(typeof token!=='string'||!/^\d+:\d+:\d+$/.test(token))continue;const[a,b,t]=token.split(':').map(Number);
   if(a<b&&byId.has(a)&&byId.has(b)&&topicOK(t)){evidence.add(`${a}:${b}:${t}`);witnesses.add(a);witnesses.add(b);topics.add(t);}
  }
  for(const r of (Array.isArray(data.relationships)?data.relationships:[]).slice(0,4000)){
   if(!r||!byId.has(r.a)||!byId.has(r.b)||r.a>=r.b||!Number.isFinite(r.score)||!Number.isSafeInteger(r.encounters)||r.encounters<0)continue;
   relationships.set(`${r.a}:${r.b}`,{a:r.a,b:r.b,score:Math.max(-10,Math.min(10,r.score)),encounters:r.encounters,promise:r.promise&&topicOK(r.promise.topic)?{topic:r.promise.topic}:null});
  }
  for(let i=chapter;i>=1;i--)events.push({chapter:i,text:VILLAGE_LORE.chapters[i].summary});
 }
 return{plan,complete,relation,summary,serialize,restore};
}
