import {createAssemblyNavigation} from './assembly-navigation.js';
export const ASSEMBLY_INTERVAL=6,ASSEMBLY_LEAD=4;
const sermons=[
 ['La vila es cuida entre tots.','Quan la nit és llarga, una llum a la finestra recorda al viatger que no està sol.','Compartiu aixopluc i feu costat a qui passa un mal moment.','Demà tornarem als camps i als obradors. Avui, ningú no queda enrere.'],
 ['Comença un nou dia a Vallclara.','Abans de sortir al camp, reviseu les eines i ajudeu els veïns que no poden fer la feina tots sols.','Una bona collita necessita mans, paciència i una vila que sàpiga compartir.','Que tingueu una jornada tranquil·la. Ens retrobarem a la plaça.'],
 ['Aturem la feina un moment i escoltem la vila.','El riu ens dona aigua, i el pont ens acosta als qui viuen a l’altra riba.','Cuideu els camins, el pou i els llocs que compartim. Allò que és de tots també és responsabilitat de cadascú.','Abans de tornar a la feina, pregunteu a algú de casa com li ha anat el matí.'],
 ['La llum baixa, i és hora de retrobar-nos.','A cada casa hi ha una història: escolteu els grans i deixeu que els infants expliquin la seva.','Si avui heu tingut una disputa, demà encara podeu parlar-ne amb calma.','Torneu a casa amb cura. Que la nit sigui serena per a tothom.']
];
export function nextAssemblyTime(hours){return (Math.floor(hours/ASSEMBLY_INTERVAL)+1)*ASSEMBLY_INTERVAL;}
export function createAssemblies(population,{obstacles=[],social,initialHours=9}={}){
 const nav=createAssemblyNavigation(obstacles),priest=population.find(p=>p.sex===0&&p.age>=60)||population[0];
 if(!priest)throw Error('Cal un habitant per fer de sacerdot');
 if(nav.seats.length<population.length-1)throw Error(`La plaça només té ${nav.seats.length} llocs segurs`);
 priest.role='priest';priest.job='sacerdot de la vila';priest.name='Mossèn '+priest.name;
 if(priest.story)priest.story.biography+=' És el sacerdot de Vallclara i reuneix la vila a la plaça cada sis hores.';
 let phase='idle',nextAt=nextAssemblyTime(initialHours),line=0,lineTime=0,cycle=0,completed=0;
 const members=new Map();
 function setPath(p,target){const member=members.get(p.id);member.path=nav.path(p,target,{seed:Math.imul(p.id+1,2654435761)^Math.round(nextAt/ASSEMBLY_INTERVAL)^(phase==='dispersing'?0x51ed270b:0)});member.index=0;member.arrived=false;p.assembly=true;}
 function gather(){
  social?.interruptAll();members.clear();nav.resetTraffic();let seat=0;
  for(const p of population){members.set(p.id,{returnTo:{x:p.x,z:p.z},path:[],index:0,arrived:false});setPath(p,p===priest?nav.priest:nav.seats[seat++]);}
  phase='gathering';line=0;lineTime=0;
 }
 function disperse(){phase='dispersing';nav.resetTraffic();for(const p of population)setPath(p,members.get(p.id).returnTo);}
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
   else{p.state=p===priest&&phase==='sermon'?'talking':'resting';p.heading=p===priest?0:Math.atan2(priest.x-p.x,priest.z-p.z);}
  }else p.state='walking';
 }
 function update(dt,realDt,hours){
  for(const p of population)p.assemblyReleased=false;
  if(phase==='idle'&&hours>=nextAt-ASSEMBLY_LEAD)gather();
  if(phase==='idle')return;
  for(const p of population)move(p,dt);
  if(phase==='dispersing'){
   if(population.every(p=>!p.assembly)){phase='idle';members.clear();}
   return;
  }
  if(phase==='gathering'&&hours>=nextAt&&population.every(p=>members.get(p.id).arrived)){phase='sermon';priest.state='talking';cycle=Math.round(nextAt/6);}
  if(phase==='sermon'){
   lineTime+=realDt;
   const text=sermons[cycle%4][line],duration=Math.max(5,3+text.length*.065);
   if(lineTime>=duration){lineTime-=duration;line++;if(line>=sermons[cycle%4].length){completed++;nextAt+=ASSEMBLY_INTERVAL;disperse();}}
  }
 }
 function seek(hours){
  nextAt=nextAssemblyTime(hours);line=0;lineTime=0;
  if(phase!=='idle'&&phase!=='dispersing')disperse();
 }
 function bubbles(){return phase==='sermon'?[{id:`sermon-${cycle}`,person:priest,text:sermons[cycle%4][line],priority:1}]:[];}
 return {update,seek,bubbles,priest,get phase(){return phase;},get nextAt(){return nextAt;},get completed(){return completed;},
  get clockLimit(){return phase==='gathering'||phase==='sermon'?nextAt:Infinity;},
  get attending(){return phase==='gathering'||phase==='sermon'?[...members.values()].filter(m=>m.arrived).length:0;},
  get active(){return phase!=='idle';}};
}
