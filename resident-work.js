import {nodes,route,blocked} from './simulation.js';
import {familyTime} from './families.js';
import {taskFor,roleFor,RESOURCE_LABELS,ROLE_LABELS} from './resident-tasks.js';
export const WORK_SITES=nodes.filter(n=>n.index!==24).map((n,id)=>({id,node:n.index,role:id%14,name:ROLE_LABELS[id%14],x:n.x,z:n.z}));
const INITIAL_STOCK={grain:100,water:140,timber:100,wool:80,bread:80,tools:0,cloth:0,cleanLinen:0,repairs:0,safety:0,pots:0,morale:0,knowledge:0,care:0,provisions:0};
const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const blankDay=day=>({day,completed:0,tasks:[]});
const nodeOK=v=>Number.isInteger(v)&&v>=0&&v<nodes.length;
const MAX_STOCK=100000;
export function createVillageWork(population,{initialHours=9,obstacles=[]}={}){
 const byId=new Map(population.map(p=>[p.id,p])),stock={...INITIAL_STOCK},journal=[];
 let day=Math.floor(initialHours/24),delivered=0;
 function assign(p){
  const task=taskFor(p,day),sites=WORK_SITES.filter(s=>s.role===task.role),site=sites[Math.floor(p.id/12)%sites.length];
  p.work=site.node;p.path=[];
  p.duty={role:task.role,task,taskDay:day,plan:task.future,station:site.id,phase:'resting',destination:p.home,inputPaid:false,remaining:task.duration,elapsed:0,cargo:null,blocker:'',retry:0,today:blankDay(day),yesterday:blankDay(day-1),lastCompleted:null};
 }
 for(const p of population)assign(p);
 function headTo(p,node,phase){p.duty.phase=phase;p.duty.destination=node;p.path=[p.node,...route(p.node,node)];}
 function travel(p,dt){
  let budget=p.speed*dt;const lane=((p.id%7)-3)*.24;
  p.state='walking';
  while(p.path.length){
   const target=nodes[p.path[0]],home=p.path.length===1&&target.index===p.home&&p.duty.phase==='home';
   const tx=target.x+lane+(home?(p.homeOffsetX||0):0),tz=target.z+lane,dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);
   if(d<1e-7){p.node=p.path.shift();continue;}
   if(budget<=0)break;const step=Math.min(d,budget);p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;
   if(step===d)p.node=p.path.shift();else break;
  }
  return p.path.length===0;
 }
 function rollDay(hours){
  const observed=Math.floor(hours/24);if(observed===day)return;day=observed;
  for(const p of population){const d=p.duty;d.yesterday=observed===d.today.day+1?d.today:blankDay(observed-1);d.today=blankDay(observed);d.plan=taskFor(p,day).future;}
 }
 function missing(task){return Object.entries(task.inputs).filter(([key,amount])=>stock[key]<amount).map(([key])=>RESOURCE_LABELS[key]).join(', ');}
 function start(p){
  const d=p.duty;d.blocker=missing(d.task);
  if(!d.inputPaid&&d.blocker){d.phase='blocked';d.retry=8;p.state='resting';return;}
  if(!d.inputPaid){for(const [key,amount]of Object.entries(d.task.inputs))stock[key]-=amount;d.inputPaid=true;}
  d.blocker='';d.phase='working';p.state='working';
 }
 function deliveryNode(p){return [9,11,13].includes(p.duty.role)?(p.home+7+Math.floor(p.id/5))%nodes.length:p.duty.role===6?27:25;}
 function deliver(p){
  const d=p.duty;if(!d.cargo)return;
  for(const [key,amount]of Object.entries(d.cargo))stock[key]=Math.min(MAX_STOCK,stock[key]+amount);
  delivered++;d.today.completed++;d.today.tasks.push(d.task.past);d.today.tasks=d.today.tasks.slice(-4);
  d.lastCompleted={day,label:d.task.label,past:d.task.past};
  journal.unshift({personId:p.id,day,label:d.task.label,outputs:{...d.cargo}});if(journal.length>120)journal.length=120;
  d.cargo=null;d.inputPaid=false;d.task=taskFor(p,day);d.taskDay=day;d.remaining=d.task.duration;d.elapsed=0;d.phase='resting';p.state='resting';
 }
 function updateResident(p,dt,hour){
  const d=p.duty;
  if(p.assembly||p.assemblyReleased||p.courtSeat||p.playerDuel||p.dragonEmergency)return;
  if(p.social?.conversation!==null&&p.social?.conversation!==undefined){p.state='talking';return;}
  // Do not throw away paid work or carried output when the family goes home.
  const quota=p.age<16||p.age>=68?1:2+(p.id%2);
  const rest=familyTime(hour)||d.today.completed>=quota;
  if(rest){
   if(d.phase!=='home'&&(p.node!==p.home||p.path.length||Math.hypot(p.x-(nodes[p.home].x+(p.homeOffsetX||0)),p.z-nodes[p.home].z)>2))headTo(p,p.home,'home');
   if(d.phase==='home')travel(p,dt);
   p.state=p.path.length?'walking':'resting';return;
  }
  if(d.phase==='home'||d.phase==='resting'){
   if(!d.inputPaid&&!d.cargo){d.task=taskFor(p,day);d.taskDay=day;d.plan=d.task.future;d.remaining=d.task.duration;d.elapsed=0;}
   headTo(p,d.cargo?deliveryNode(p):WORK_SITES[d.station].node,d.cargo?'delivery':'travel');return;
  }
  if(d.phase==='travel'){if(travel(p,dt))start(p);return;}
  if(d.phase==='delivery'){if(travel(p,dt))deliver(p);return;}
  if(d.phase==='blocked'){p.state='resting';d.retry-=dt;if(d.retry<=0)start(p);return;}
  if(d.phase==='working'){
   p.state='working';d.remaining=Math.max(0,d.remaining-dt);d.elapsed+=dt;
   p.heading=Math.atan2(WORK_SITES[d.station].x+1.8-p.x,WORK_SITES[d.station].z+1.8-p.z);
   if(d.remaining===0){d.cargo={...d.task.outputs};headTo(p,deliveryNode(p),'delivery');}
  }
 }
 function update(dt,hours){
  if(!finite(hours,0,1e7))return;rollDay(hours);
  if(!finite(dt,0,60)||dt===0)return;const hour=(hours%24+24)%24;
  for(const p of population){if(roleFor(p)!==p.duty.role&&!p.duty.inputPaid&&!p.duty.cargo){const previous=p.duty;assign(p);p.duty.today=previous.today;p.duty.yesterday=previous.yesterday;}updateResident(p,dt,hour);}
 }
 function summary(){return{day,delivered,stock:{...stock},working:population.filter(p=>p.duty.phase==='working'&&!p.assembly&&p.state==='working').length,blocked:population.filter(p=>p.duty.phase==='blocked').length,journal:[...journal]};}
 function serialize(){return {version:1,day,delivered,stock:{...stock},residents:population.map(p=>({id:p.id,x:p.dragonEmergency?.origin.x??p.x,z:p.dragonEmergency?.origin.z??p.z,node:p.node,path:[...p.path],duty:{...p.duty,task:p.duty.task.id}})),journal:[...journal]};}
 function cleanDay(value,expected){
  if(!value||value.day!==expected||!Number.isInteger(value.completed)||value.completed<0||value.completed>3)return blankDay(expected);
  return{day:expected,completed:value.completed,tasks:(Array.isArray(value.tasks)?value.tasks:[]).filter(t=>typeof t==='string'&&t.length<200).slice(-4)};
 }
 function restore(data,hours=initialHours){
  if(!data||data.version!==1||!Number.isInteger(data.day)||data.day<0||data.day!==Math.floor(hours/24)||!data.stock||!Object.keys(INITIAL_STOCK).every(k=>finite(data.stock[k],0,MAX_STOCK)))return false;
  day=data.day;Object.assign(stock,Object.fromEntries(Object.keys(INITIAL_STOCK).map(k=>[k,Math.floor(data.stock[k])])));delivered=Number.isSafeInteger(data.delivered)&&data.delivered>=0?data.delivered:0;
  const restored=new Set();
  for(const entry of (Array.isArray(data.residents)?data.residents:[]).slice(0,population.length)){
   const p=byId.get(entry?.id),saved=entry?.duty;
   if(!p||restored.has(p.id)||!saved||!nodeOK(entry.node)||!finite(entry.x,-90,90)||!finite(entry.z,-90,90)||blocked(entry.x,entry.z,obstacles,.1)||!nodeOK(saved.destination))continue;
   if(!Number.isInteger(saved.taskDay)||saved.taskDay<0||saved.taskDay>day)continue;
   const task=taskFor(p,saved.taskDay);if(saved.task!==task.id||!['resting','home','travel','working','delivery','blocked'].includes(saved.phase)||!finite(saved.remaining,0,task.duration)||!finite(saved.elapsed,0,task.duration+1))continue;
   if(!Array.isArray(entry.path)||entry.path.length>nodes.length||entry.path.some(n=>!nodeOK(n)))continue;
   const phasesPaid=['working','delivery'];if(phasesPaid.includes(saved.phase)&&saved.inputPaid!==true)continue;
   restored.add(p.id);p.x=entry.x;p.z=entry.z;p.node=entry.node;p.path=[...entry.path];const d=p.duty;
   Object.assign(d,{task,taskDay:saved.taskDay,plan:taskFor(p,day).future,phase:saved.phase,destination:saved.destination,inputPaid:saved.inputPaid===true,remaining:saved.remaining,elapsed:saved.elapsed,cargo:saved.cargo?{...task.outputs}:null,blocker:typeof saved.blocker==='string'?saved.blocker.slice(0,100):'',retry:0,today:cleanDay(saved.today,day),yesterday:cleanDay(saved.yesterday,day-1)});
   if(saved.lastCompleted&&Number.isInteger(saved.lastCompleted.day)&&saved.lastCompleted.day<=day&&typeof saved.lastCompleted.label==='string'&&typeof saved.lastCompleted.past==='string')d.lastCompleted={day:saved.lastCompleted.day,label:saved.lastCompleted.label.slice(0,100),past:saved.lastCompleted.past.slice(0,200)};
   p.state=p.path.length?'walking':d.phase==='working'?'working':'resting';
  }
  journal.length=0;for(const e of (Array.isArray(data.journal)?data.journal:[]).slice(0,120))if(e&&byId.has(e.personId)&&Number.isInteger(e.day)&&e.day<=day&&typeof e.label==='string'&&e.label.length<100&&e.outputs&&typeof e.outputs==='object')journal.push({personId:e.personId,day:e.day,label:e.label,outputs:Object.fromEntries(Object.entries(e.outputs).filter(([k,v])=>Object.hasOwn(stock,k)&&finite(v,0,20)))});
  return true;
 }
 return {update,summary,serialize,restore,sites:WORK_SITES,get stock(){return {...stock};}};
}
