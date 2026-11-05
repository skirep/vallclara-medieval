// Small autonomous social scenes use the same collision graph as quests and
// gatherings. Work paths and paid cargo stay untouched until everyone returns.
export const LIFE_SCENES={
 tag:{title:'Jugar a tocar i parar',icon:'🏃',children:true,count:3,duration:28,lines:['Qui para? Jo compto fins a tres!','Corre, que gairebé t’atrapo!','T’he tocat! Ara pares tu!','Una altra ronda abans de tornar a casa?']},
 hide:{title:'Fet i amagar',icon:'🙈',children:true,count:3,duration:32,lines:['Un, dos, tres… que ningú es mogui!','Darrere del mercat no s’hi val sempre!','Ja et veig! Pots sortir!','La pròxima vegada comptaré jo!']},
 ball:{title:'Jugar a pilota',icon:'⚽',children:true,count:3,duration:28,lines:['Passa-me-la, que estic lliure!','Compte amb les parades del mercat!','Bona passada! Ara prova des d’aquí!','La guardem per després? Encara hem d’ajudar a casa.']},
 romance:{title:'Una cita al poble',icon:'💕',count:2,duration:24,lines:['Avui he trobat una estona només per veure’t.','Em quedaria una mica més, si tu també vols.','M’agrada quan podem parlar sense pressa.','Ens tornem a veure quan acabem la feina?']},
 affair:{title:'Una trobada discreta',icon:'💌',count:2,duration:24,lines:['He vingut perquè volia tornar-te a veure.','M’agrades, però encara tinc coses per aclarir amb la meva parella.','No podem fer veure que això no tindrà conseqüències.','En parlarem amb calma. No vull més mentides.']},
 quarrel:{title:'Una discussió al mercat',icon:'💢',count:2,duration:25,lines:['Aquesta eina me l’havies de tornar ahir!','I tu em vas dir que no la necessitaves fins demà!','Tens els punys tan ràpids com les excuses!','Més val deixar els punys i parlar del que hem de reparar.','D’acord. Te la torno i arreglem plegats el que s’ha trencat.']},
 jealousy:{title:'Gelosia i retrets',icon:'💔',count:2,duration:24,lines:['T’he vist trobant-te amb algú d’amagat. Necessito una explicació.','Tens raó de demanar-me-la. T’hauria d’haver parlat abans.','No vull decidir res a crits davant de tot el poble.','Parlem-ne en privat. La confiança no es recupera amb una promesa.']},
 apology:{title:'Fer les paus',icon:'🤝',count:2,duration:20,lines:['He estat pensant en el que et vaig dir. Et dec una disculpa.','T’escolto, però també necessito veure què canviarà.','Començaré per complir el que vam acordar.','D’acord. Tornem a parlar quan haguem acabat la feina.']},
 dance:{title:'Ballar a la plaça',icon:'🎶',count:2,duration:24,lines:['Em concedeixes aquest ball?','Sí, però promet que aquesta vegada vigilaràs els peus!','Un pas, una volta… gairebé sembla que en sabem.','Ens guardem el proper ball per a la festa?']},
 gossip:{title:'Safareig entre veïns',icon:'🗣️',count:2,duration:22,lines:['Has sentit què va passar ahir al mercat?','Jo només he vist dos veïns marxant ben somrients.','Més val preguntar abans d’escampar una història equivocada.','Tens raó. Demà els convidem a parlar amb nosaltres.']},
 friendship:{title:'Una estona entre amics',icon:'🍞',count:2,duration:20,lines:['He guardat una mica de pa per compartir-lo amb tu.','M’ha anat bé trobar-te. Avui el dia es feia llarg.','Si demà necessites un cop de mà, vine a buscar-me.','Tracte fet. Ara tornem a la feina abans que ens trobin a faltar.']}
};
const cycle=['tag','romance','quarrel','ball','gossip','affair','hide','dance','friendship'];
const sites=[{x:-18,z:10},{x:-18,z:-10},{x:-36,z:0},{x:36,z:0},{x:18,z:18},{x:-18,z:-36},{x:36,z:18}];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const related=(a,b)=>a.familyId===b.familyId||a.parentIds?.includes(b.id)||a.childIds?.includes(b.id)||b.parentIds?.includes(a.id)||b.childIds?.includes(a.id);
const partners=(a,b)=>a.partnerId===b.id||b.partnerId===a.id;
export function createVillageLife(population,{navigation,social,canPunch=()=>false,canJump=()=>false,onDamage=()=>{},initialData=null,maxActive=4}={}){
 if(!navigation)throw Error('Village life requires safe navigation');
 const byId=new Map(population.map(p=>[p.id,p])),groups=new Map(),bonds=new Map(),cooldowns=new Map(),journal=[],pending=[];
 const escortChild=population.find(p=>p.age<16&&!p.royalGuard);let elapsed=0,nextStart=6,serial=0,cursor=0,lastHour=9,completed=0;
 const free=p=>!!p&&!p.ninja&&!p.lifeActivity&&!p.missionJob&&!p.missionEscort&&!p.missionCombat&&!p.playerDuel&&!p.dragonEmergency&&!p.assembly&&!p.assemblyReleased&&!p.courtSeat&&!p.royalGuard&&p.role!=='priest'&&!p.missionDead&&p.health!==0&&(p.maxHealth===undefined||p.health>p.maxHealth*.6)&&p.social?.conversation===null&&(cooldowns.get(p.id)??0)<=elapsed;
 const key=(a,b)=>[Math.min(a,b),Math.max(a,b)].join(':');
 function relationship(a,b){const k=key(a,b);if(!bonds.has(k))bonds.set(k,{a:Math.min(a,b),b:Math.max(a,b),affinity:0,trust:50,meetings:0,lastKind:null});return bonds.get(k);}
 function relationships(id){return[...bonds.values()].filter(b=>b.a===id||b.b===id).map(b=>({...b,person:byId.get(b.a===id?b.b:b.a)})).filter(b=>b.person).sort((a,b)=>b.meetings-a.meetings).slice(0,6);}
 function eligible(kind,people){const def=LIFE_SCENES[kind];if(!def||people.length!==def.count||people.some(p=>!p)||new Set(people.map(p=>p.id)).size!==people.length||people.some(p=>!free(p)))return false;
  if(def.children)return people.every(p=>p.age>=7&&p.age<16&&p!==escortChild);
  if(people.some(p=>p.age<18))return false;
  const [a,b]=people;
  if(['romance','affair','dance'].includes(kind)&&related(a,b)&&!partners(a,b))return false;
  if(kind==='affair'&&(partners(a,b)||a.partnerId==null&&b.partnerId==null))return false;
  if(kind==='quarrel'&&(related(a,b)||!canPunch(a)||!canPunch(b)))return false;
  return true;
 }
 function route(p,to){return navigation.path(p,to,{seed:p.id+serial*97,diversity:true,recordTraffic:false});}
 function reachable(p,desired){for(const radius of [0,.55,1.1,1.65,2.2])for(let i=0;i<(radius?8:1);i++){
  const a=i*Math.PI/4,q={x:desired.x+Math.sin(a)*radius,z:desired.z+Math.cos(a)*radius};if(!navigation.segmentClear(q,q))continue;
  try{const path=route(p,q);if(path.length)return{point:q,path};}catch{}
 }return null;}
 function choose(kind,site){const def=LIFE_SCENES[kind],pool=population.filter(free).filter(p=>def.children?p.age>=7&&p.age<16&&p!==escortChild:p.age>=18).sort((a,b)=>dist(a,site)-dist(b,site)||a.id-b.id);
  if(def.children)return pool.slice(0,def.count);
  let chosen=null,best=Infinity;for(const a of pool.slice(0,24))for(const b of pool.slice(0,36)){if(a===b||!eligible(kind,[a,b]))continue;const score=dist(a,site)+dist(b,site)+dist(a,b)*.2-(bonds.get(key(a.id,b.id))?.affinity??0)*.1-(partners(a,b)?8:0)+(a.id*31+b.id*17+serial)%19*.1;if(score<best){best=score;chosen=[a,b];}}
  return chosen??[];
 }
 function start(kind,ids=null){const def=LIFE_SCENES[kind];if(!def||groups.size>=maxActive)return false;
  const site=sites[serial%sites.length],people=ids?ids.map(id=>byId.get(id)):choose(kind,site);if(!eligible(kind,people))return false;
  const average={x:people.reduce((n,p)=>n+p.x,0)/people.length,z:people.reduce((n,p)=>n+p.z,0)/people.length};
  // Social destinations remain distributed on both banks, close to the pair.
  const center=[...sites].sort((a,b)=>dist(a,average)-dist(b,average))[0],members=[];
  for(let i=0;i<people.length;i++){const p=people[i],a=i/people.length*Math.PI*2,to={x:center.x+Math.sin(a)*1.05,z:center.z+Math.cos(a)*1.05},found=reachable(p,to);if(!found)return false;members.push({p,origin:{x:p.x,z:p.z},path:found.path,index:0,point:found.point});}
  const group={id:++serial,kind,def,members,center:{...center},phase:'travelling',age:0,travelAge:0,turn:-1,lastDamageTurn:-1,leader:0,round:-1,tags:0,speech:null,ball:null,returnReason:''};
  for(const m of members){m.p.lifeActivity={id:group.id,kind,title:def.title,icon:def.icon,phase:group.phase,origin:m.origin,text:`Vaig a trobar-me amb ${people.filter(p=>p!==m.p).map(p=>p.name).join(' i ')}.`};m.p.seated=false;}
  groups.set(group.id,group);return true;
 }
 function walk(m,dt,speed){const p=m.p;let budget=speed*dt,moved=0;while(m.index<m.path.length&&budget>0){const q=m.path[m.index],d=dist(p,q);if(d<1e-7){m.index++;continue;}const step=Math.min(d,budget);p.x+=(q.x-p.x)/d*step;p.z+=(q.z-p.z)/d*step;p.heading=Math.atan2(q.x-p.x,q.z-p.z);p.walk+=step*5;budget-=step;moved+=step;if(step===d)m.index++;}p.state=moved?'walking':'resting';p.lifeSpeed=speed;return m.index===m.path.length;}
 function setGoal(m,to){const found=reachable(m.p,to);if(!found)return false;m.path=found.path;m.index=0;m.point=found.point;return true;}
 function returnHome(g,reason=''){if(g.phase==='returning')return;g.phase='returning';g.ball=null;g.returnReason=reason;
  for(const m of g.members){m.path=[];m.index=0;m.needsReturn=true;delete m.p.duelPose;delete m.p.lifeAction;delete m.p.lifeSpeed;}
 }
 function release(m){delete m.p.lifeActivity;delete m.p.lifeSpeed;delete m.p.lifeAction;delete m.p.duelPose;m.p.state=m.p.missionDead?'dead':m.p.path.length?'walking':'resting';cooldowns.set(m.p.id,elapsed+18+m.p.id%13);}
 function complete(g){const def=g.def,names=g.members.map(m=>m.p.name),outcome=`${names.join(' i ')}: ${def.title.toLocaleLowerCase('ca')}. ${def.lines.at(-1)}`;
  completed++;const event={id:g.id,kind:g.kind,title:def.title,people:g.members.map(m=>m.p.id),text:outcome};journal.unshift(event);journal.length=Math.min(40,journal.length);
  for(let i=0;i<g.members.length;i++)for(let j=i+1;j<g.members.length;j++){
   const b=relationship(g.members[i].p.id,g.members[j].p.id),conflict=['quarrel','jealousy'].includes(g.kind);b.affinity=clamp(b.affinity+(conflict?-5:g.kind==='romance'||g.kind==='affair'?12:6),-100,100);b.trust=clamp(b.trust+(g.kind==='jealousy'?-15:g.kind==='quarrel'?-3:g.kind==='apology'?9:4),0,100);b.meetings++;b.lastKind=g.kind;
  }
  for(const m of g.members)m.p.socialMemory={icon:def.icon,label:def.title,text:outcome,until:elapsed+75};
  social?.recordEvent?.({kind:g.kind,a:g.members[0].p.id,b:g.members[1].p.id,turns:def.lines.map((text,i)=>({speakerId:g.members[i%g.members.length].p.id,text})),outcome});
  if(g.kind==='affair')for(const m of g.members){const spouse=byId.get(m.p.partnerId);if(spouse&&!g.members.some(n=>n.p===spouse))pending.push({kind:'jealousy',ids:[spouse.id,m.p.id]});}
  if(['quarrel','jealousy'].includes(g.kind))pending.push({kind:'apology',ids:g.members.map(m=>m.p.id)});
  returnHome(g);
 }
 function game(g,dt){const ms=g.members,round=Math.floor(g.age/(g.kind==='hide'?16:5));
  if(g.kind==='tag'||g.kind==='hide'){
   if(round!==g.round){g.round=round;for(let i=0;i<ms.length;i++)if(i!==g.leader){const angle=(i+round*.7)*2.399;setGoal(ms[i],{x:g.center.x+Math.sin(angle)*3.4,z:g.center.z+Math.cos(angle)*3.4});}}
   const leader=ms[g.leader],runner=ms[(g.leader+1)%ms.length];
   for(let i=0;i<ms.length;i++)if(i!==g.leader)walk(ms[i],dt,g.kind==='hide'?1.9:2.1);
   if(g.kind==='hide'&&g.age%16<3){leader.p.state='resting';leader.p.heading=Math.PI;return;}
   if(g.seekAfter===undefined||g.age>=g.seekAfter){setGoal(leader,runner.p);g.seekAfter=g.age+.7;}
   walk(leader,dt,2.4);
   if(dist(leader.p,runner.p)<1.0&&(g.tagAfter??0)<g.age){g.tags++;g.leader=(g.leader+1)%ms.length;g.tagAfter=g.age+2;g.round=-1;g.speech={person:runner.p,text:g.kind==='hide'?'M’has trobat! Ara compto jo.':'Tocat! Ara paro jo!',until:g.age+2.5};}
  }else if(g.kind==='ball'){
   const beat=Math.floor(g.age/2.8),from=ms[beat%ms.length],to=ms[(beat+1)%ms.length];g.ball={from:from.p.id,to:to.p.id,t:navigation.segmentClear(from.p,to.p)?g.age/2.8%1:0};
   for(const m of ms){m.p.heading=Math.atan2(from.p.x-m.p.x,from.p.z-m.p.z);m.p.state='resting';}
   if(canJump(to.p)&&g.age%2.8>=1.95)to.p.lifeAction={action:'jump',time:g.age%2.8-1.95};
  }
 }
 function act(g,dt){g.age+=dt;const turn=Math.min(g.def.lines.length-1,Math.floor(g.age/g.def.duration*g.def.lines.length));g.turn=turn;
  for(const m of g.members){delete m.p.duelPose;delete m.p.lifeAction;m.p.lifeActivity.phase='acting';m.p.lifeActivity.text=`Participo en «${g.def.title}» amb ${g.members.filter(n=>n!==m).map(n=>n.p.name).join(' i ')}.`;m.p.state='resting';}
  if(g.def.children)game(g,dt);
  else if(g.kind==='dance'){
   const beat=Math.floor(g.age/2.2);if(beat!==g.round){g.round=beat;for(let i=0;i<g.members.length;i++){const a=beat*Math.PI/2+i*Math.PI;setGoal(g.members[i],{x:g.center.x+Math.sin(a)*1.1,z:g.center.z+Math.cos(a)*1.1});}}
   for(const m of g.members)walk(m,dt,1.45);
  }else{
   const [a,b]=g.members.map(m=>m.p);a.heading=Math.atan2(b.x-a.x,b.z-a.z);b.heading=Math.atan2(a.x-b.x,a.z-b.z);g.members[turn%g.members.length].p.state='talking';
   if(g.kind==='quarrel'&&(turn===1||turn===2)){
    const beat=g.age-turn*g.def.duration/g.def.lines.length,attacker=g.members[turn%2].p,victim=g.members[(turn+1)%2].p;
    if(beat<.66){attacker.duelPose={punchTime:beat};victim.duelPose={hitTime:beat};}
    if(g.lastDamageTurn!==turn){onDamage(victim,6);g.lastDamageTurn=turn;}
   }
  }
  if(g.age>=g.def.duration)complete(g);
 }
 function update(dt,hour=lastHour,{busy=false,autonomous=true}={}){
  if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,1);elapsed+=dt;lastHour=(hour%24+24)%24;
  for(const p of population)if(p.socialMemory?.until<=elapsed)delete p.socialMemory;
  for(const g of [...groups.values()]){
   if(g.members.some(m=>m.p.missionDead)){for(const m of g.members)release(m);groups.delete(g.id);continue;}
   if(busy||g.members.some(m=>m.p.assembly||m.p.dragonEmergency||m.p.health===0||m.p.missionEscort||m.p.missionJob))returnHome(g,'La trobada s’ha aturat per atendre el que passa al poble.');
   if(g.phase==='returning'){
    for(const m of [...g.members]){const p=m.p;if(busy||p.assembly||p.assemblyReleased||p.dragonEmergency||p.health===0||p.missionEscort||p.missionJob)continue;
     if(m.needsReturn){try{m.path=route(p,m.origin);m.index=0;m.needsReturn=false;}catch{continue;}}
     p.lifeActivity.phase='returning';p.lifeActivity.text=g.returnReason||'Torno al meu lloc després de la trobada.';
     if(walk(m,dt,Math.max(1.4,p.speed*1.3))){release(m);g.members.splice(g.members.indexOf(m),1);}
    }if(!g.members.length)groups.delete(g.id);continue;
   }
   if(g.phase==='travelling'){g.travelAge+=dt;const arrived=g.members.map(m=>walk(m,dt,Math.max(1.6,m.p.speed*1.5))).every(Boolean);if(arrived){g.phase='acting';g.age=0;}else if(g.travelAge>100)returnHome(g,'Ja fa massa estona que ens esperem. Ho deixem per a un altre moment.');}
   else act(g,dt);
  }
  if(!autonomous||busy||lastHour<7||lastHour>=22||elapsed<nextStart||groups.size>=maxActive)return;
  nextStart=elapsed+16;
  const queued=pending.findIndex(e=>e.ids.every(id=>free(byId.get(id))));if(queued>=0&&start(pending[queued].kind,pending[queued].ids)){pending.splice(queued,1);return;}
  for(let i=0;i<cycle.length;i++){const kind=cycle[cursor++%cycle.length];if(start(kind))break;}
 }
 function bubbles(){return[...groups.values()].filter(g=>g.phase==='acting').map(g=>({id:`life-${g.id}-${g.turn}`,person:g.speech?.until>g.age?g.speech.person:g.members[Math.max(0,g.turn)%g.members.length].p,text:g.speech?.until>g.age?g.speech.text:g.def.lines[Math.max(0,g.turn)],priority:1,kind:'life'}));}
 function serialize(){return{version:1,elapsed,nextStart,serial,cursor,completed,bonds:[...bonds.values()].map(b=>({...b})),cooldowns:[...cooldowns],pending:pending.slice(-30),journal:journal.map(e=>({...e,people:[...e.people]}))};}
 function restore(data){if(data?.version!==1)return false;
  if(Number.isFinite(data.elapsed)&&data.elapsed>=0&&data.elapsed<1e8)elapsed=data.elapsed;
  if(Number.isFinite(data.nextStart))nextStart=clamp(data.nextStart,elapsed,elapsed+60);
  if(Number.isSafeInteger(data.completed)&&data.completed>=0)completed=data.completed;
  if(Number.isSafeInteger(data.serial)&&data.serial>=0)serial=data.serial;if(Number.isSafeInteger(data.cursor)&&data.cursor>=0)cursor=data.cursor;
  for(const b of (Array.isArray(data.bonds)?data.bonds:[]).slice(0,1000))if(b&&byId.has(b.a)&&byId.has(b.b)&&b.a!==b.b&&Number.isFinite(b.affinity)&&Number.isFinite(b.trust)&&Number.isInteger(b.meetings)&&b.meetings>=0&&LIFE_SCENES[b.lastKind]&&(LIFE_SCENES[b.lastKind].children?[b.a,b.b].every(id=>byId.get(id).age<16):[b.a,b.b].every(id=>byId.get(id).age>=18)))bonds.set(key(b.a,b.b),{a:Math.min(b.a,b.b),b:Math.max(b.a,b.b),affinity:clamp(b.affinity,-100,100),trust:clamp(b.trust,0,100),meetings:Math.min(b.meetings,1e6),lastKind:b.lastKind});
  for(const e of (Array.isArray(data.cooldowns)?data.cooldowns:[]).slice(0,population.length))if(Array.isArray(e)&&byId.has(e[0])&&Number.isFinite(e[1]))cooldowns.set(e[0],clamp(e[1],elapsed,elapsed+300));
  for(const e of (Array.isArray(data.pending)?data.pending:[]).slice(0,30))if(['jealousy','apology'].includes(e?.kind)&&Array.isArray(e.ids)&&e.ids.length===2&&e.ids.every(id=>byId.get(id)?.age>=18))pending.push({kind:e.kind,ids:[...e.ids]});
  for(const e of (Array.isArray(data.journal)?data.journal:[]).slice(0,40))if(e&&LIFE_SCENES[e.kind]&&Array.isArray(e.people)&&e.people.every(id=>byId.has(id))&&typeof e.text==='string'&&e.text.length<1500)journal.push({...e,people:[...e.people]});return true;
 }
 restore(initialData);
 return{start,update,bubbles,serialize,restore,relationships,journal,summary(){return{active:groups.size,completed,bonds:bonds.size};},get activities(){return[...groups.values()];}};
}
