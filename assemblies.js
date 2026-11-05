import {createAssemblyNavigation} from './assembly-navigation.js';
import {createDailyReports} from './daily-reports.js';
export const ASSEMBLY_INTERVAL=24,ASSEMBLY_HOUR=12,ASSEMBLY_LEAD=0,DAILY_REPORT_LIMIT=50;
export function nextAssemblyTime(hours){const noon=Math.floor(hours/24)*24+ASSEMBLY_HOUR;return hours<=noon+1e-8?noon:noon+24;}
export function selectDailySpeakers(population,day){
 const ordered=[...population].sort((a,b)=>a.id-b.id),count=Math.min(DAILY_REPORT_LIMIT,ordered.length);
 const offset=ordered.length?((day*count)%ordered.length+ordered.length)%ordered.length:0;
 return Array.from({length:count},(_,i)=>ordered[(offset+i)%ordered.length]);
}
export function createAssemblies(population,{obstacles=[],social,initialHours=9}={}){
 const allResidents=population.filter(p=>!p.royalGuard&&!p.ninja);population=allResidents;
 const nav=createAssemblyNavigation(obstacles),priest=population.find(p=>p.role==='priest')||population.find(p=>p.sex===0&&p.age>=60)||population[0];
 if(!priest)throw Error('Cal un habitant per fer de sacerdot');
 if(nav.seats.length<population.length-1)throw Error(`La plaça només té ${nav.seats.length} llocs segurs`);
 priest.role='priest';priest.job='sacerdot i moderador de la reunió diària';if(!priest.name.startsWith('Mossèn '))priest.name='Mossèn '+priest.name;
 if(priest.story&&!priest.story.biography.includes('modera la reunió diària'))priest.story.biography+=' És el sacerdot de Vallclara i modera la reunió diària de les dotze.';
 const reports=createDailyReports(population,initialHours),members=new Map();
 let phase='idle',nextAt=nextAssemblyTime(initialHours),turns=[],turnIndex=0,turnTime=0,completed=0,lastCompletedDay=-Infinity,meetingDay=0;
 function setPath(p,target){const member=members.get(p.id);member.path=nav.path(p,target,{seed:Math.imul(p.id+1,2654435761)^Math.floor(nextAt/24)^(phase==='dispersing'?0x51ed270b:0)});member.index=0;member.arrived=false;p.assembly=true;}
 function gather(){
  social?.interruptAll();members.clear();nav.resetTraffic();let seat=0;
  for(const p of population){members.set(p.id,{returnTo:{x:p.x,z:p.z},path:[],index:0,arrived:false});setPath(p,p===priest?nav.priest:nav.seats[seat++]);}
  phase='gathering';turns=[];turnIndex=0;turnTime=0;
 }
 function disperse(){phase='dispersing';nav.resetTraffic();for(const p of population)setPath(p,members.get(p.id).returnTo);}
 function orientAudience(){
  const speaker=turns[turnIndex]?.person;if(!speaker)return;
  const listeners=population.filter(p=>p!==speaker);
  const target=speaker===priest?(listeners.length?{x:listeners.reduce((n,p)=>n+p.x,0)/listeners.length,z:listeners.reduce((n,p)=>n+p.z,0)/listeners.length}:{x:0,z:0}):priest;
  for(const p of population){p.state=p===speaker?'talking':'resting';const lookingAt=p===speaker?target:speaker;p.heading=Math.atan2(lookingAt.x-p.x,lookingAt.z-p.z);}
 }
 function beginDaily(){
  phase='daily';meetingDay=Math.floor(nextAt/24);turnIndex=0;turnTime=0;
  const order=selectDailySpeakers(population,meetingDay);
  turns=[{kind:'opening',person:priest,text:`Bon migdia, vila. ${social?.narrative?`El pacte és a l’etapa «${social.narrative.summary().title}». `:''}Avui escoltarem ${order.length} habitants: què van fer ahir i què faran avui. Els torns roten cada dia; la resta escolta i ajuda a coordinar la feina.`},
   ...order.map(person=>({kind:'report',person,...reports.report(person)})),
   {kind:'closing',person:priest,text:'Gràcies a tothom. Ja hem compartit la feina feta i els plans d’avui. Ajudeu qui ho necessiti i tornem a les nostres activitats. Ens retrobem demà a les dotze.'}];
  orientAudience();
 }
 function nextTurn(){
  if(phase!=='daily')return false;
  turnTime=0;turnIndex++;
  if(turnIndex>=turns.length){completed++;lastCompletedDay=meetingDay;nextAt=(meetingDay+1)*24+ASSEMBLY_HOUR;disperse();}
  else orientAudience();
  return true;
 }
 function move(p,dt){
  const m=members.get(p.id);if(!m||!p.assembly)return;
  let budget=p.speed*dt;
  while(m.index<m.path.length){const target=m.path[m.index],dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
   if(d<1e-8){m.index++;continue;}
   if(budget<=0)break;const step=Math.min(budget,d);p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;
   if(step===d)m.index++;else break;
  }
  m.arrived=m.index===m.path.length;
  if(m.arrived){
   if(phase==='dispersing'){p.assembly=false;p.assemblyReleased=true;p.wait=0;p.state=p.path.length?'walking':'resting';}
   else if(phase==='gathering'){p.state='resting';p.heading=p===priest?0:Math.atan2(priest.x-p.x,priest.z-p.z);}
  }else p.state='walking';
 }
 function update(dt,realDt,hours){
  population=allResidents.filter(p=>!p.missionDead&&!p.missionEscort);
  for(const p of population)p.assemblyReleased=false;
  reports.observe(dt,hours);
  if(phase==='idle'&&hours>=nextAt)gather();
  if(phase==='idle')return;
  if(phase==='daily'){
   // Simulation time, rather than wall time, makes the existing speed/pause control apply to every turn.
   turnTime+=Math.max(0,dt);const duration=Math.max(4,Math.min(12,2+turns[turnIndex].text.length*.045));
   if(turnTime>=duration)nextTurn();
   return;
  }
  for(const p of population)move(p,dt);
  if(phase==='dispersing'){if(population.every(p=>!p.assembly)){phase='idle';members.clear();}return;}
  if(phase==='gathering'&&hours>=nextAt&&population.every(p=>members.get(p.id).arrived))beginDaily();
 }
 function seek(hours){
  reports.observe(0,hours);nextAt=Math.max(nextAssemblyTime(hours),(lastCompletedDay+1)*24+ASSEMBLY_HOUR);turnTime=0;
  if(phase!=='idle'&&phase!=='dispersing')disperse();
 }
 function bubbles(){const turn=turns[turnIndex];return phase==='daily'&&turn?[{id:`daily-${meetingDay}-${turnIndex}`,person:turn.person,text:turn.text,priority:1}]:[];}
 function serialize(){return{version:1,lastCompletedDay:Number.isFinite(lastCompletedDay)?lastCompletedDay:null};}
 function restore(data,hours){if(data?.version===1&&Number.isInteger(data.lastCompletedDay)&&data.lastCompletedDay>=0&&data.lastCompletedDay<=Math.floor(hours/24))lastCompletedDay=data.lastCompletedDay;reports.observe(0,hours);nextAt=Math.max(nextAssemblyTime(hours),(lastCompletedDay+1)*24+ASSEMBLY_HOUR);}
 return {navigation:nav,update,seek,bubbles,priest,serialize,restore,advanceTurn:nextTurn,get phase(){return phase;},get nextAt(){return nextAt;},get completed(){return completed;},
  get currentTurn(){return phase==='daily'?turns[turnIndex]:null;},get reportNumber(){return phase==='daily'&&turns[turnIndex]?.kind==='report'?turnIndex:0;},get totalReports(){return Math.min(DAILY_REPORT_LIMIT,population.length);},
  get clockLimit(){return nextAt;},
  get attending(){return phase==='gathering'||phase==='daily'?[...members.values()].filter(m=>m.arrived).length:0;},
  get active(){return phase!=='idle';}};
}
