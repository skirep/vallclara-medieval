import {guardCombatPost} from './royal-guard-posts.js';
import {createAssemblyNavigation} from './assembly-navigation.js';
import {DRAGON_PLAZA,DRAGON_DURATION,DRAGON_RAID,dragonAlarm} from './dragon-encounter.js';
export const isDragonDefender=p=>p.age>=18&&(p.spriteId==='summer-athlete'||p.dragonDefender===true);
const PANIC=['El drac! Correu!','Aparteu-vos de les flames!','Cap als carrers de fora!','No us atureu! El foc ve cap aquí!','Ajudeu els petits! Tothom fora de la plaça!'];
const BRAVE=['Ei, drac! Mira cap aquí!','Deixeu-los marxar! Nosaltres el distraurem!','No faràs fora la nostra gent!'];
export function createDragonEmergency(population,{obstacles=[],navigation=null,social,onDamage=()=>{},onAlarm=()=>{}}={}){
 const allResidents=population;
 const nav=navigation??createAssemblyNavigation(obstacles),members=new Map(),refuges=[[-54,-54],[-54,-36],[-54,0],[-54,36],[-54,54],[-36,-54],[-36,54],[36,-54],[54,-36],[54,0],[54,36],[54,54],[36,54],[36,-72]].map(([x,z])=>({x,z}));
 let phase='idle',flightId=null,elapsed=0,current=null,target=null,targetBeat=null,targetId=null,completed=0;
 const distance=p=>Math.hypot(p.x-DRAGON_PLAZA.x,p.z-DRAGON_PLAZA.z);
 function route(p,to){return nav.path(p,to,{seed:p.id+Math.floor(current?.day??0)*977,diversity:true});}
 function refuge(p,counts){const bank=p.x<9,candidates=refuges.filter(q=>(q.x<9)===bank&&nav.segmentClear(q,q));
  const score=q=>Math.hypot(p.x-q.x,p.z-q.z)+Math.max(0,-((q.x-p.x)*(p.x-DRAGON_PLAZA.x)+(q.z-p.z)*(p.z-DRAGON_PLAZA.z))/Math.max(1,distance(p)))*3+(counts.get(q)??0)*1.1;
  candidates.sort((a,b)=>score(a)-score(b));const q=candidates[0];if(!q)throw Error('No hi ha refugi accessible');const n=counts.get(q)??0;counts.set(q,n+1);const offset={x:q.x+(n%3-1)*.65,z:q.z+(Math.floor(n/3)%3-1)*.65};return nav.segmentClear(q,offset)?offset:q;
 }
 function guardPost(p,index,total){const angle=index/Math.max(1,total)*Math.PI*2,desired={x:DRAGON_PLAZA.x+Math.sin(angle)*6,z:DRAGON_PLAZA.z+Math.cos(angle)*6};return nav.seats.filter(q=>distance(q)>4.8&&distance(q)<7.5).sort((a,b)=>Math.hypot(a.x-desired.x,a.z-desired.z)-Math.hypot(b.x-desired.x,b.z-desired.z))[0]??{x:-18,z:0};}
 function begin(alarm){social?.interruptAll();onAlarm();current=alarm;flightId=alarm.id;phase='alarm';elapsed=0;target=null;targetBeat=targetId=null;nav.resetTraffic();const counts=new Map(),defenders=population.filter(isDragonDefender);let guard=0;
  for(const p of population){const prior=members.get(p.id),origin=prior?.origin??(p.royalGuard?{...p.royalGuard.post}:{x:p.x,z:p.z}),defender=isDragonDefender(p),destination=defender?(p.royalGuard?guardCombatPost(p,nav):guardPost(p,guard++,defenders.length)):refuge(p,counts);const member={origin,defender,path:route(p,destination),step:0,arrived:false};members.set(p.id,member);p.dragonEmergency={origin,role:defender?'defender':'fleeing'};p.seated=false;p.emergencySpeed=defender?Math.max(3.8,p.speed*3.8):Math.max(2.5,p.speed*3.3);}
 }
 function startReturn(){phase='returning';target=null;nav.resetTraffic();for(const p of population){const m=members.get(p.id);if(!m)continue;m.path=route(p,m.origin);m.step=0;m.arrived=false;p.dragonEmergency.role='returning';p.emergencySpeed=Math.max(1.8,p.speed*1.7);delete p.dragonPunchTime;delete p.guardAttackTime;}}
 function release(p){delete p.dragonEmergency;delete p.emergencySpeed;delete p.dragonPunchTime;delete p.guardAttackTime;p.state=p.path.length?'walking':'resting';members.delete(p.id);}
 function move(p,m,dt){let budget=p.emergencySpeed*dt;while(m.step<m.path.length){const q=m.path[m.step],dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<1e-7){m.step++;continue;}if(budget<=0)break;const step=Math.min(budget,d);p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;if(step===d)m.step++;}m.arrived=m.step===m.path.length;p.state=m.arrived?'resting':'walking';}
 function update(dt,hours,{peaceful=false}={}){if(!Number.isFinite(dt)||dt<=0)return;population=allResidents.filter(p=>!p.missionDead);for(const p of allResidents)if(p.missionDead&&members.has(p.id))release(p);const alarm=peaceful?null:dragonAlarm(hours);current=alarm;
  if(alarm&&(alarm.id!==flightId||phase==='idle'||phase==='returning'))begin(alarm);
  if(!alarm&&phase==='alarm')startReturn();
  if(phase==='idle')return;elapsed+=dt;
  for(const p of population){const m=members.get(p.id);if(!m)continue;move(p,m,dt);delete p.dragonPunchTime;delete p.guardAttackTime;
   if(phase==='returning'){if(m.arrived)release(p);continue;}
   if(phase==='alarm'&&current?.phase==='attacking'&&distance(p)<8){m.burnTime=(m.burnTime??0)+dt;if(m.burnTime>=3){onDamage(p,6);m.burnTime=0;}}
   if(m.defender&&m.arrived){p.heading=Math.atan2(DRAGON_PLAZA.x-p.x,DRAGON_PLAZA.z-p.z);const beat=(elapsed+p.id*.23)%2.1;if(current?.phase==='attacking'){if(p.royalGuard&&beat<.8)p.guardAttackTime=beat;else if(!p.royalGuard&&beat<.66)p.dragonPunchTime=beat;}}
  }
  if(phase==='returning'&&!members.size){phase='idle';completed++;}
  if(alarm){const beat=Math.floor((alarm.progress-DRAGON_RAID.descend)*DRAGON_DURATION*180/9);const candidates=population.filter(p=>members.has(p.id)&&distance(p)<28).sort((a,b)=>distance(a)-distance(b));const civilians=candidates.filter(p=>!isDragonDefender(p));const pool=civilians.length?civilians:candidates;let chosen=pool.find(p=>p.id===targetId);if(beat!==targetBeat||!chosen){chosen=pool[Math.abs(beat)%Math.max(1,Math.min(3,pool.length))];targetBeat=beat;targetId=chosen?.id??null;}target=chosen?{id:chosen.id,x:chosen.x,y:1.1,z:chosen.z}:null;}
 }
 function bubbles(observer={x:0,z:0}){if(phase!=='alarm')return[];return population.filter(p=>members.has(p.id)&&(elapsed+p.id*.37)%6<2.1).map(p=>({p,d:Math.hypot(p.x-observer.x,p.z-observer.z)})).filter(x=>x.d<40).sort((a,b)=>a.d-b.d).slice(0,5).map(({p})=>{const lines=p.royalGuard?['Per la corona i per Vallclara!','Manteniu la formació! Allunyeu el drac!','Protegiu els reis! Escuts amunt!']:isDragonDefender(p)?BRAVE:PANIC;return{id:`dragon-shout-${flightId}-${p.id}-${Math.floor(elapsed/6)}`,person:p,text:lines[(p.id+Math.floor(elapsed/6))%lines.length],priority:2,kind:'alarm'};});}
 function summary(){return{phase,fleeing:population.filter(p=>p.dragonEmergency?.role==='fleeing').length,safe:[...members.values()].filter(m=>!m.defender&&m.arrived).length,defenders:[...members.values()].filter(m=>m.defender).length,confronting:[...members.values()].filter(m=>m.defender&&m.arrived).length,remaining:current?Math.max(0,(DRAGON_RAID.leave-current.progress)*DRAGON_DURATION*180):0};}
 return{update,bubbles,summary,members,get target(){return target;},get active(){return phase!=='idle';},get alert(){return phase==='alarm';},get phase(){return phase;},get completed(){return completed;}};
}
