import {taskFor} from './resident-tasks.js';
// Fictional opening-day history, followed by activities actually observed in the simulation.
const work=[
 ['vaig treballar al camp','revisaré els sembrats','regaré l’hort','prepararé les llavors'],
 ['vaig treballar al forn','prepararé la massa del pa','faré una nova fornada','revisaré la farina del rebost'],
 ['vaig treballar a la ferreria','repararé les eines dels veïns','revisaré la manxa de la fornal','prepararé peces per als carros'],
 ['vaig treballar al teler','acabaré una peça de lli','prepararé els fils del teler','revisaré la roba encarregada'],
 ['vaig fer feina de transport','revisaré el carro abans de sortir','portaré provisions als masos','organitzaré els farcells del mercat'],
 ['vaig treballar a la parada del mercat','prepararé la parada','ordenaré les provisions del mercat','revisaré els comptes de la venda'],
 ['vaig treballar la fusta al taller','repararé un banc de la vila','prepararé fusta per als veïns','revisaré les eines del taller'],
 ['vaig dedicar una estona a la bugada','rentaré la roba que queda pendent','estendré la roba vora el safareig','ordenaré els farcells de roba'],
 ['vaig tenir cura del ramat','acompanyaré el ramat a pasturar','revisaré les tanques del corral','prepararé menjar per als animals'],
 ['vaig fer guàrdia a la vila','revisaré les portes de la vila','faré ronda pels carrers','comprovaré que el pont sigui transitable'],
 ['vaig treballar la terrissa','modelaré peces de fang','revisaré la cuita del forn','prepararé recipients per al mercat'],
 ['vaig assajar música','assajaré una tonada nova','prepararé música per a la plaça','practicaré amb la gent de la vila']
];
const childhood=['llegiré una estona','ajudaré la gent de casa','practicaré els nusos que he après','cuidaré l’hort amb la família','jugaré amb els amics quan acabi les feines'];
const mod=(n,length)=>((n%length)+length)%length;
function workDone(p){return p.role==='priest'?'vaig ajudar els veïns i preparar la reunió':p.age<16?'vaig aprendre coses noves i ajudar la gent de casa':work[mod(p.jobId||0,work.length)][0];}
export function dailyPlan(p,day){
 if(p.duty)return taskFor(p,day).future;
 const variation=p.id+Math.floor(p.id/5)+day;
 if(p.role==='priest')return ['coordinaré les peticions de la vila','visitaré els veïns que necessiten ajuda','prepararé la reunió de demà'][mod(variation,3)];
 if(p.age<16)return childhood[mod(variation,childhood.length)];
 const tasks=work[mod(p.jobId||0,work.length)];return tasks[1+mod(variation,3)];
}
export function createDailyReports(population,initialHours=9){
 let day=Math.floor(initialHours/24),current=new Map(),previous=new Map(population.map(p=>[p.id,{opening:workDone(p)}]));
 function observe(dt,hours){
  const observedDay=Math.floor(hours/24);
  if(observedDay!==day){previous=observedDay===day+1?current:new Map();current=new Map();day=observedDay;}
  if(!(dt>0))return;
  for(const p of population){
   if(p.assembly)continue;
   const key=p.state==='working'?'work':p.state==='walking'?'walk':p.state==='talking'?'talk':p.state==='resting'?'rest':null;
   if(!key)continue;
   let entry=current.get(p.id);if(!entry){entry={};current.set(p.id,entry);}entry[key]=(entry[key]||0)+dt;
  }
 }
 function report(p){
  if(p.duty){const recorded=p.duty.yesterday,completed=recorded?.day===day-1&&recorded.completed>0;const yesterday=completed?[...new Set(recorded.tasks)].slice(0,2).join(' i '):'no vaig completar cap tasca anotada';const today=dailyPlan(p,day),blocker=p.duty.phase==='blocked'?` Ara em falta ${p.duty.blocker}.`:'';return{personId:p.id,day,yesterday,today,text:`Ahir ${yesterday}. Avui ${today}.${blocker}`};}
  const entry=previous.get(p.id),past=[];
  if(entry?.opening)past.push(entry.opening);
  else{
   if(entry?.work>0)past.push(workDone(p));
   if(entry?.talk>0)past.push('vaig conversar amb els veïns');
   if(!past.length&&entry?.walk>0)past.push('vaig recórrer els camins de la vila');
   if(!past.length&&entry?.rest>0)past.push('vaig reservar una estona per descansar');
  }
  const yesterday=past.length?past.slice(0,2).join(' i '):'no vaig deixar cap activitat anotada';
  return {personId:p.id,day,yesterday,today:dailyPlan(p,day),text:`Ahir ${yesterday}. Avui ${dailyPlan(p,day)}.`};
 }
 return {observe,report,get day(){return day;}};
}
