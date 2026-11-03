import {random} from './simulation.js';
import {createAssemblyNavigation} from './assembly-navigation.js';
import {CASTLE} from './castle.js';
import {guardCombatPost} from './royal-guard-posts.js';
import {dragonFlight} from './dragon-encounter.js';
export const ROYAL_GUARD_COUNT=12;
// Stable new identities preserve every existing villager and saved relationship.
export function addRoyalGuards(population){
 const names=['Ramon','Hug','Guerau','Ferran','Ot','Galceran','Aina','Aldonça','Riquer','Elisenda','Ponç','Marçal'];
 for(let i=0;i<ROYAL_GUARD_COUNT;i++){
  const weapon=i<6?'sword':'spear',id=700+i,post=i<4?{x:30+i*4,z:-54}:i<8?{x:i%2?54:18,z:-63-Math.floor((i-4)/2)*9}:{x:30+(i-8)*4,z:-88};
  const family={id:700+i,surname:'de la Guàrdia Reial',household:701+i,home:5,homeX:post.x,homeZ:post.z,memberIds:[id]},job=weapon==='sword'?'soldat reial · espasa i escut':'soldat reial · llança',name=`${names[i]} de la Guàrdia`;
  population.push({id,name,character:{name},spriteId:weapon==='sword'?'royal-swordsman':'royal-spearman',royalGuard:{weapon,post,index:i,phase:'guarding'},dragonDefender:true,job,jobId:9,workRole:9,home:5,work:5,node:5,path:[],x:post.x,z:post.z,lane:0,speed:1.25,phase:i*.7,height:1,sex:i===6||i===7||i===9?1:0,age:24+i*2,state:'resting',wait:0,heading:0,walk:0,rng:random(id),familyId:family.id,surname:family.surname,family,familyRole:'soldat de la casa reial',parentIds:[],childIds:[],partnerId:null});
 }
 return population;
}
export function createRoyalGuard(population,{obstacles=[],navigation=null}={}){
 const nav=navigation??createAssemblyNavigation(obstacles),members=population.filter(p=>p.royalGuard).map(p=>({person:p,path:[],step:0,key:null,wait:3+p.id%7,patrol:0}));
 let flight=null;
 function update(dt,hours){
  if(!Number.isFinite(dt)||dt<=0)return;flight=dragonFlight(hours);
  for(const m of members){const p=m.person,g=p.royalGuard;
   if(p.dragonEmergency){g.phase=p.dragonEmergency.role==='returning'?'returning':'responding';m.key=null;continue;}
   // The castle stays guarded during the daily gathering as well as at night.
   const post=g.post,target=flight?guardCombatPost(p,nav):m.patrol?{x:post.x+(post.x<CASTLE.x?1:-1)*1.1,z:post.z}:post,key=`${target.x}:${target.z}`;
   if(key!==m.key){m.path=nav.path(p,target,{seed:p.id,diversity:false,recordTraffic:false});m.step=0;m.key=key;}
   let budget=(flight?5.4:p.speed)*dt;
   while(m.step<m.path.length&&budget>0){const q=m.path[m.step],dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<1e-7){m.step++;continue;}const step=Math.min(d,budget);p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;if(step===d)m.step++;}
   const arrived=m.step===m.path.length;g.phase=flight?'mobilising':arrived?'guarding':'patrolling';p.state=arrived?'resting':'walking';
   if(arrived&&!flight){p.heading=Math.atan2(post.x-CASTLE.x,post.z-CASTLE.z);m.wait-=dt;if(m.wait<=0){m.patrol=1-m.patrol;m.wait=5+p.id%8;m.key=null;}}
  }
 }
 return{update,members};
}
