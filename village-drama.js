import {duelRound} from './duels.js';
export function loveDuelPlan(a,b,crush,seed=0){
 const r1=duelRound(seed),r2=duelRound(seed+1),r3=duelRound(seed+2),winner=seed%2?a:b;
 return{kind:'love-duel',topic:0,chapter:0,romantic:false,crushId:crush.id,outcome:`${winner.name} guanya la picabaralla de rèpliques per 2 a 1. ${crush.name} decideix amb qui vol ballar.`,turns:[
  {speakerId:a.id,text:`Has convidat ${crush.name} al ball? Jo també volia fer-ho. ${r1.insult}`},
  {speakerId:b.id,text:`${r1.replies[r1.correct]} I ${crush.name} ja decidirà amb qui vol ballar.`,action:'punch'},
  {speakerId:b.id,text:r2.insult},
  {speakerId:a.id,text:r2.replies[r2.correct],action:'punch'},
  {speakerId:(winner===a?b:a).id,text:r3.insult},
  {speakerId:winner.id,text:r3.replies[r3.correct],action:'punch'},
  {speakerId:winner.id,text:'D’acord, deixem els punys. Avui he guanyat jo… el dret de pagar la primera gerra.'},
  {speakerId:(winner===a?b:a).id,text:'Tracte fet. I al ball, que cadascú triï la seva companyia.'}
 ]};
}
export function bumpPlan(a,b,count=0){const lines=[['Ep! Mira per on vas, que portava el dia ben dret.','Perdona! Els meus peus anaven més de pressa que el cap.'],['Aquest carrer és estret, però hi cabem tots dos!','Tens raó. Passa tu, que jo tinc la pressa mal posada.'],['Ui! Un altre pas i compartim les sabates.','Les sabates no, però et dec una disculpa!']][count%3];return{kind:'bump',topic:0,chapter:0,outcome:'Una topada, dues rèpliques i cadascú reprèn el seu camí.',turns:lines.map((text,i)=>({speakerId:(i?b:a).id,text,duration:2.5}))};}
export function createVillageDrama(population,social,{canPunch=()=>true,onDamage=()=>{}}={}){
 let elapsed=0,scan=0,nextDuel=20,count=0;const previous=new Map(population.map(p=>[p.id,{x:p.x,z:p.z}])),contacts=new Set(),byId=new Map(population.map(p=>[p.id,p]));
 const free=p=>!p.missionJob&&!p.royalGuard&&!p.assembly&&!p.courtSeat&&!p.playerDuel&&p.social.conversation===null&&p.social.cooldown<=0;
 function crushFor(a,b){const candidates=population.filter(p=>p.age>=18&&p.id!==a.id&&p.id!==b.id&&p.familyId!==a.familyId&&p.familyId!==b.familyId);return candidates[(a.id+b.id)%candidates.length];}
 function beginDuel(a,b,hour){if(!free(a)||!free(b)||a.age<18||b.age<18||a.familyId===b.familyId||!canPunch(a)||!canPunch(b))return false;const crush=crushFor(a,b);if(!crush)return false;
  if(!social.begin(a,b,hour,loveDuelPlan(a,b,crush,count++)))return false;
  a.dramaCrushId=b.dramaCrushId=crush.id;a.dramaRivalId=b.id;b.dramaRivalId=a.id;nextDuel=elapsed+75;return true;}
 function update(dt,hour,{allowNew=true}={}){
  elapsed+=dt;scan+=dt;
  for(const p of population){if(p.dramaMood){p.dramaMood.remaining-=dt;if(p.dramaMood.remaining<=0)delete p.dramaMood;}if(!p.playerDuel&&!p.missionCombat)delete p.duelPose;}
  for(const c of social.active){if(c.kind!=='love-duel')continue;const turn=c.turns[c.index],a=byId.get(c.a),b=byId.get(c.b);for(const [p,other]of [[a,b],[b,a]]){p.heading=Math.atan2(other.x-p.x,other.z-p.z);p.dramaMood={icon:'💢',label:'Gelosia',text:`Estic discutint amb ${other.name} per la invitació al ball de ${byId.get(c.crushId)?.name??'la plaça'}.`,remaining:7};}
   if(turn.action==='punch'&&c.damageTurn!==c.index){c.damageTurn=c.index;const victim=turn.speakerId===a.id?b:a;onDamage(victim,8);}
   if(turn.action==='punch'){const actor=byId.get(turn.speakerId),other=actor===a?b:a;actor.duelPose={punchTime:c.turnElapsed};other.duelPose={hitTime:c.turnElapsed};}
  }
  if(scan<.2)return;scan=0;const grid=new Map(),nowContacts=new Set();
  for(const a of population){const gx=Math.floor(a.x/3),gz=Math.floor(a.z/3);for(let x=gx-1;x<=gx+1;x++)for(let z=gz-1;z<=gz+1;z++)for(const b of grid.get(`${x}:${z}`)||[]){const distance=Math.hypot(a.x-b.x,a.z-b.z),key=[Math.min(a.id,b.id),Math.max(a.id,b.id)].join(':');if(distance<.82){nowContacts.add(key);const pa=previous.get(a.id),pb=previous.get(b.id),moving=Math.hypot(a.x-pa.x,a.z-pa.z)+Math.hypot(b.x-pb.x,b.z-pb.z)>.025;
    if(allowNew&&!contacts.has(key)&&moving&&free(a)&&free(b)){if(elapsed>=nextDuel&&beginDuel(a,b,hour))continue;social.begin(a,b,hour,bumpPlan(a,b,count++));}
   }else if(allowNew&&distance<2.3&&elapsed>=nextDuel)beginDuel(a,b,hour);
  }const key=`${gx}:${gz}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(a);}
  contacts.clear();for(const key of nowContacts)contacts.add(key);for(const p of population)previous.set(p.id,{x:p.x,z:p.z});
 }
 return{update,beginDuel};
}
