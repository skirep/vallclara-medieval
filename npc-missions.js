import {nodes} from './simulation.js';
import {MISSIONS,createMissions} from './missions.js';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const finitePoint=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.z)&&Math.abs(p.x)<=91&&Math.abs(p.z)<=91;
// NPCs and the player own different quests in one shared campaign. Movement
// follows the same collision graph as gatherings, including the sole bridge.
export function createNPCMissions(population,{campaign,navigation,health,onComplete=()=>{},onEvent=()=>{},initialData=null,maxActive=2}={}){
 const jobs=new Map(),byId=new Map(population.map(p=>[p.id,p])),journal=[];let elapsed=0,nextStart=35,serial=0;
 const available=p=>p.age>=18&&p.age<68&&!p.royalGuard&&!p.courtSeat&&p.role!=='priest'&&!p.missionDead&&!p.missionJob&&!p.missionEscort&&!p.assembly&&!p.dragonEmergency&&!p.playerDuel&&!p.missionCombat&&p.health>p.maxHealth*.6&&p.social?.conversation==null;
 const nameFor=id=>MISSIONS.find(m=>m.id===id);
 const snapshot=p=>({id:p.id,origin:{x:p.x,z:p.z},node:p.node,path:[...(p.path??[])]});
 const validSnapshot=s=>s&&byId.has(s.id)&&finitePoint(s.origin)&&navigation.segmentClear(s.origin,s.origin)&&Number.isInteger(s.node)&&s.node>=0&&s.node<nodes.length&&Array.isArray(s.path)&&s.path.length<=nodes.length&&s.path.every(n=>Number.isInteger(n)&&n>=0&&n<nodes.length);
 function resume(p,s){if(s){p.node=s.node;p.path=[...s.path];}delete p.missionJob;p.state='resting';}

 function event(job,text){job.speech=text;job.speechUntil=elapsed+7;const entry={id:++serial,personId:job.person.id,missionId:job.id,stage:campaign.progress[job.id].stage,text};journal.unshift(entry);journal.length=Math.min(30,journal.length);onEvent(entry);}
 function stopFight(job){if(job.fighter){delete job.fighter.missionCombat;delete job.fighter.guardAttackTime;delete job.fighter.duelPose;job.fighter=null;}delete job.person.missionCombat;delete job.person.duelPose;}
 function route(person,to,holder,key){if(holder.key!==key){holder.path=[];holder.index=0;holder.key=key;const candidates=[];for(let radius=0;radius<=2.4;radius+=.6)for(let i=0;i<(radius?12:1);i++){const a=i*Math.PI/6,q={x:to.x+Math.sin(a)*radius,z:to.z+Math.cos(a)*radius};if(navigation.segmentClear(q,q))candidates.push(q);}candidates.sort((a,b)=>distance(a,to)-distance(b,to)||distance(a,person)-distance(b,person));for(const q of candidates.slice(0,12)){try{holder.path=navigation.path(person,q,{seed:person.id,diversity:true,recordTraffic:false});if(holder.path.length)break;}catch{}}}return holder.path.length>0;}
 function walk(person,holder,dt,speed=2.2){let budget=speed*dt,moved=0;while(holder.index<holder.path.length&&budget>0){const q=holder.path[holder.index],d=distance(person,q);if(d<.001){holder.index++;continue;}const n=Math.min(budget,d),dx=q.x-person.x,dz=q.z-person.z;person.x+=dx/d*n;person.z+=dz/d*n;person.heading=Math.atan2(dx,dz);person.walk+=n*5;budget-=n;moved+=n;if(n===d)holder.index++;}person.state=moved?'walking':'resting';return holder.index===holder.path.length;}
 function makeJob(id,p,saved=null){const job={id,person:p,resume:validSnapshot(saved?.resume)?saved.resume:snapshot(p),childContext:validSnapshot(saved?.childContext)?saved.childContext:null,childReturnRoute:{key:null,path:[],index:0},origin:finitePoint(saved?.origin)&&navigation.segmentClear(saved.origin,saved.origin)?{...saved.origin}:{x:p.x,z:p.z},key:null,path:[],index:0,wait:0,attempt:0,returning:saved?.returning===true||campaign.progress[id].stage===nameFor(id).steps.length,speech:'',speechUntil:0,fighter:null,escortRoute:{key:null,path:[],index:0}};
  job.engine=createMissions({population,sharedProgress:campaign.progress,owner:`npc:${p.id}`,onChange:()=>campaign.notify(),onComplete,onEnemyHit(c){if(job.fighter)health.damage(job.fighter,job.fighter.maxHealth/c.maxHp);},onActorHit(c,amount){health.damage(p,amount*p.maxHealth/6);}});
  if(!job.returning&&!job.engine.accept(id,{silent:true}))return null;if(job.engine.escort&&!job.childContext)job.childContext=snapshot(job.engine.escort);if(job.returning&&job.childContext){const child=byId.get(job.childContext.id);child.missionJob={id,title:nameFor(id).title,objective:'Tornar amb la família',phase:'returning'};}p.missionJob={id,title:nameFor(id).title,objective:job.returning?'Tornar a la feina':job.engine.target()?.title??'Preparant la missió',phase:job.returning?'returning':'travelling'};jobs.set(id,job);return job;
 }
 function assign(id){const m=nameFor(id),r=campaign.progress[id];if(!m||jobs.has(id)||jobs.size>=maxActive||r.stage>=m.steps.length||r.owner&&r.owner!=='player')return false;
  const preference=id==='crown'?p=>p.dragonDefender||p.spriteId==='summer-athlete'?0:p.jobId===2?1:2:id==='child'?p=>p.childIds?.length?0:1:id==='water'?p=>[1,7,13].includes(p.jobId)?0:1:p=>p.jobId===11?0:1;
  const target=m.steps[r.stage],candidates=population.filter(available).sort((a,b)=>preference(a)-preference(b)||distance(a,target)-distance(b,target)||a.id-b.id);
  for(const p of candidates){try{navigation.path(p,target,{seed:p.id,recordTraffic:false});}catch{continue;}if(!campaign.transfer(id,`npc:${p.id}`))return false;const job=makeJob(id,p);if(job){event(job,`M’encarrego de «${m.title}». Primer: ${job.engine.target().title.toLocaleLowerCase('ca')}.`);return true;}}
  return false;
 }
 function followChild(job,dt){const child=job.engine.escort;if(!child)return true;if(child.health===0||child.dragonEmergency)return false;const d=distance(child,job.person);if(d>1.7){const key=`${Math.round(job.person.x/2)},${Math.round(job.person.z/2)}`;if(route(child,job.person,job.escortRoute,key))walk(child,job.escortRoute,dt,2.6);}else child.state='resting';return d<6;}
 function prepareFight(job,s,dt){if(!job.fighter){job.fighter=s.person??population.filter(p=>p.royalGuard&&!p.missionDead&&!p.missionCombat&&p.health>0).sort((a,b)=>distance(a,job.person)-distance(b,job.person))[0];if(!job.fighter)return false;job.enemyRoute={key:null,path:[],index:0};}
  const enemy=job.fighter;enemy.missionCombat=true;enemy.seated=false;if(distance(enemy,job.person)>2.8){if(route(enemy,job.person,job.enemyRoute,`enemy:${Math.round(job.person.x)},${Math.round(job.person.z)}`))walk(enemy,job.enemyRoute,dt,2.5);return false;}enemy.heading=Math.atan2(job.person.x-enemy.x,job.person.z-enemy.z);enemy.state='resting';return true;
 }
 function combat(job,dt){const q=job.engine,c=q.combat;if(!c)return;job.punchTime=(job.punchTime??1)+dt;if(job.punchTime<.66)job.person.duelPose={punchTime:job.punchTime};else delete job.person.duelPose;job.person.missionCombat=true;job.person.missionJob.phase='fighting';job.person.state='resting';const enemy=job.fighter;if(enemy){job.person.heading=Math.atan2(enemy.x-job.person.x,enemy.z-job.person.z);enemy.heading=Math.atan2(job.person.x-enemy.x,job.person.z-enemy.z);if(enemy.royalGuard)enemy.guardAttackTime=c.phase==='opening'?Math.min(.79,c.elapsed):undefined;}
  if(c.phase==='warning'&&c.elapsed>.45&&!c.defense){const correct=(job.person.id+job.attempt+c.beat)%5!==0;q.act(correct?(c.heavy?'dodge':'block'):(c.heavy?'block':'dodge'));}
  if(c.phase==='opening'&&c.elapsed>.18&&!c.acted){job.punchTime=0;job.person.duelPose={punchTime:0};q.act('attack');}q.update(dt,job.person);
  if(!q.combat){stopFight(job);job.attempt++;job.wait=5;job.key=null;}
 }
 function update(dt,{busy=false,active=true,hour=9}={}){if(!Number.isFinite(dt)||dt<=0||!active)return;dt=Math.min(dt,.1);elapsed+=dt;
  if(!busy&&hour>=7&&hour<21&&elapsed>=nextStart&&jobs.size<maxActive){nextStart=elapsed+30;const id=['child','water','letters','dragon','crown'].find(id=>!campaign.progress[id].accepted);if(id)assign(id);}
  for(const job of [...jobs.values()]){const p=job.person,q=job.engine,r=campaign.progress[job.id],m=nameFor(job.id);
   if(p.missionDead){stopFight(job);delete p.missionJob;jobs.delete(job.id);continue;}
   if(busy||p.assembly||p.assemblyReleased||p.dragonEmergency||p.playerDuel){q.update(0,p,{busy:true});stopFight(job);job.key=null;job.escortRoute.key=null;job.childReturnRoute.key=null;p.missionJob.phase='paused';continue;}
   if(p.health<p.maxHealth*.35&&!q.combat){stopFight(job);p.state='resting';p.missionJob.phase='recovering';p.missionJob.objective='Recuperar forces abans de continuar';continue;}
   if(job.returning||r.stage===m.steps.length){job.returning=true;stopFight(job);p.missionJob.phase='returning';p.missionJob.objective='Tornar a la feina';const parentDone=route(p,job.origin,job,`return:${job.id}`)&&walk(p,job,dt);let childDone=true;
    if(job.childContext){const child=byId.get(job.childContext.id);childDone=child.health>0&&route(child,job.childContext.origin,job.childReturnRoute,'child-return')&&walk(child,job.childReturnRoute,dt,2.6);}
    if(parentDone&&childDone){resume(p,job.resume);if(job.childContext)resume(byId.get(job.childContext.id),job.childContext);jobs.delete(job.id);campaign.notify();}continue;}
   const s=q.target();if(!s){stopFight(job);delete p.missionJob;jobs.delete(job.id);continue;}p.missionJob.objective=s.title;
   if(q.combat){combat(job,dt);continue;}if(job.wait>0){job.wait-=dt;p.state='talking';p.missionJob.phase='talking';continue;}
   if(!followChild(job,dt)){p.state='resting';p.missionJob.phase='waiting';continue;}
   if(distance(p,s)>(s.requireEscort?1:2.6)){p.missionJob.phase='travelling';const key=`${job.id}:${r.stage}:${Math.round(s.x/2)}:${Math.round(s.z/2)}`;if(route(p,s,job,key))walk(p,job,dt);else{job.key=null;p.missionJob.phase='blocked';}continue;}
   if(s.requireEscort&&distance(q.escort??p,s)>4){p.state='resting';p.missionJob.phase='waiting';continue;}
   if(s.combat&&!prepareFight(job,s,dt)){p.missionJob.phase='waiting';continue;}
   const stage=r.stage,choice=s.choices?.[(p.id+stage)%s.choices.length];if(s.escort&&s.person&&!job.childContext)job.childContext=snapshot(s.person);if(s.requireEscort&&q.escort)q.escort.missionJob={id:job.id,title:m.title,objective:'Tornar amb la família',phase:'returning'};if(q.interact(p,{choice:choice?.value})){event(job,choice?.text??s.text);job.key=null;if(q.combat){q.combat.health=Math.max(1,Math.ceil(p.health/p.maxHealth*6));if(job.fighter)q.combat.hp=Math.max(1,Math.ceil(job.fighter.health/job.fighter.maxHealth*q.combat.maxHp));}else{job.wait=4;if(r.stage===m.steps.length)event(job,`${p.name} ha completat «${m.title}». ${m.ending}`);}}
  }
 }
 function serialize(){return{version:1,elapsed,nextStart,serial,jobs:[...jobs.values()].map(j=>({id:j.id,personId:j.person.id,origin:{...j.origin},resume:j.resume,childContext:j.childContext,returning:j.returning})),journal:journal.map(e=>({...e}))};}
 function restore(data){if(data?.version===1){if(Number.isFinite(data.elapsed)&&data.elapsed>=0)elapsed=data.elapsed;if(Number.isFinite(data.nextStart)&&data.nextStart>=0)nextStart=data.nextStart;if(Number.isSafeInteger(data.serial)&&data.serial>=0)serial=data.serial;for(const e of (Array.isArray(data.journal)?data.journal:[]).slice(0,30))if(e&&byId.has(e.personId)&&nameFor(e.missionId)&&Number.isInteger(e.stage)&&e.stage>=0&&e.stage<=nameFor(e.missionId).steps.length&&typeof e.text==='string'&&e.text.length<1500)journal.push({...e});}
  for(const m of MISSIONS){const r=campaign.progress[m.id];if(!r.owner?.startsWith('npc:'))continue;const p=byId.get(Number(r.owner.slice(4))),saved=data?.version===1&&Array.isArray(data.jobs)?data.jobs.find(j=>j.id===m.id&&j.personId===p?.id):null;if(!p||p.missionJob)continue;if(r.stage<m.steps.length||saved)makeJob(m.id,p,saved);}
 }
 restore(initialData);
 return{assign,update,serialize,journal,get jobs(){return [...jobs.values()];},status(id){const r=campaign.progress[id],person=r?.owner?.startsWith('npc:')?byId.get(Number(r.owner.slice(4))):null;return person?{person,job:jobs.get(id),completed:r.stage===nameFor(id).steps.length}:null;},bubbles(){return[...jobs.values()].filter(j=>j.speechUntil>elapsed&&!j.person.assembly&&!j.person.dragonEmergency&&!j.person.missionDead).map(j=>({id:`npc-mission-${j.id}-${serial}`,person:j.person,text:j.speech,priority:1}));}};
}
