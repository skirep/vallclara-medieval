export const NINJA_STORY={title:'La Lluna Trencada',intro:'Una confraria arribada amb una caravana de seda busca el Segell de les Hores. Aki, una infiltrada, ha deixat un missatge sota el pont. El rellotger t’ha confiat la seva pistola d’espurna: un prototip impossible que la confraria també vol robar.',ending:'Raiga i els seus infiltrats han caigut. El segell torna a quedar sota la custòdia de la vila. La pistola queda sota la teva custòdia; Vallclara torna a tenir una nit tranquil·la.'};
export const NINJA_STEPS=[{title:'Llegeix el missatge del pont',x:0,z:0,text:'«Soc l’Aki. La Lluna Trencada vol obrir el segell del castell. Busca’m a l’altra riba. No els entreguis la pistola del rellotger.»'}, {title:'Parla amb l’Aki a la riba est',x:18,z:0,text:'Aki: «El segell és a la cancelleria. Porta’l al pou abans que Raiga el trobi. A l’armeria pots reposar la munició. Quan l’agafis, els infiltrats vindran a buscar-te.»'}, {title:'Recupera el Segell de les Hores',x:28,z:-73.5,text:'Sota els comptes del castell trobes una pedra marcada amb una lluna partida. A fora sona un xiulet: la confraria ha descobert el teu pla.'}, {title:'Atura Raiga i els 18 infiltrats',combat:true,text:'Els ninjes ataquen la població i els reis, i et persegueixen pels carrers. Mou-te, apunta amb la mira i aprofita els murs per protegir-te.'}, {title:'Torna el segell a l’Aki, davant del pou',x:-13,z:0,text:NINJA_STORY.ending}];
export const ARMORY={x:28,z:-61.5};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function createNinjaStory(population,{navigation,onPlayerDamage=()=>{},onResidentDamage=()=>{},initialData=null,onChange=()=>{}}={}){
 const members=population.filter(p=>p.ninja).map(p=>({p,path:[],index:0,key:null,nextRoute:0,patrol:0,wait:2+p.id%4,attack:0})),ally=members.find(m=>!m.p.ninja.hostile)?.p,captured=new Set(),hostileCount=members.filter(m=>m.p.ninja.hostile).length,guards=population.filter(p=>p.royalGuard).map(p=>({p,path:[],index:0,key:null,nextRoute:0,attack:0}));let stage=0,time=0,notice=NINJA_STORY.intro;
 function target(){if(stage>=NINJA_STEPS.length)return null;const s=NINJA_STEPS[stage];if(stage===1&&ally)return{...s,x:ally.x,z:ally.z};if(stage===3){const p=members.filter(m=>m.p.ninja.hostile&&!m.p.ninja.captured).map(m=>m.p).sort((a,b)=>a.id-b.id)[0];return p?{...s,x:p.x,z:p.z,person:p}:null;}return{...s};}
 function changed(){onChange(serialize());}
 function progress(){if(stage===3&&captured.size===hostileCount){stage=4;notice='La confraria ha caigut. Porta el segell al pou i espera l’Aki.';changed();}}
 function interact(position){const s=target();if(!s||s.combat||dist(s,position)>3.2)return false;if(stage===4&&ally&&!ally.missionDead&&dist(ally,s)>4){notice='L’Aki està venint al pou. Espera-la per retornar el segell.';return false;}notice=ally?.missionDead&&stage===1?'Entre les pertinences de l’Aki trobes una nota: el Segell de les Hores és a la cancelleria.':ally?.missionDead&&stage===4?'Deixes el segell sota la custòdia de la vila. L’Aki no ha sobreviscut.':s.text;stage++;progress();changed();return true;}
 function route(m,to,key){if(m.key===key&&(time<m.nextRoute||m.index<m.path.length||dist(m.p,to)<.3))return true;m.key=key;m.nextRoute=time+.8;
  const points=[];for(const radius of [0,.8,1.6,2.4])for(let i=0;i<(radius?8:1);i++){const a=i*Math.PI/4,q={x:to.x+Math.sin(a)*radius,z:to.z+Math.cos(a)*radius};if(navigation.segmentClear(q,q))points.push(q);}
  for(const q of points){try{m.path=navigation.path(m.p,q,{seed:m.p.id,diversity:false,recordTraffic:false});m.index=0;return true;}catch{}}m.path=[];return false;
 }
 function walk(m,dt,speed){let budget=dt*speed,moved=0;const p=m.p;while(m.index<m.path.length&&budget>0){const q=m.path[m.index],d=dist(p,q);if(d<1e-7){m.index++;continue;}const step=Math.min(d,budget),dx=q.x-p.x,dz=q.z-p.z;p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;moved+=step;if(step===d)m.index++;}p.ninjaSpeed=speed;p.state=moved?'walking':'resting';return m.index===m.path.length;}
 function shot(event){const hit=event.person;if(hit?.ninja?.hostile){hit.ninja.alerted=true;if(hit.health<=0&&!hit.ninja.captured){hit.ninja.captured=true;hit.ninja.alerted=false;captured.add(hit.id);notice=`${hit.name} ha mort · ${captured.size}/${hostileCount} infiltrats aturats`;progress();changed();}}
  for(const m of members)if(m.p.ninja.hostile&&!m.p.ninja.captured&&dist(m.p,event.origin)<16)m.p.ninja.alerted=true;
 }
 // Running attackers and responding guards share the same collision graph.
 const alive=p=>p&&!p.missionDead&&!p.dead&&p.health>0;
 function clearCombat(m){m.attack=0;m.damageTurn=null;delete m.p.ninjaAttackTime;delete m.p.guardAttackTime;}
 function strike(m,victim,dt,{speed=4.2,damage=6,period=1.8,guard=false}={}){
  const p=m.p,distance=dist(p,victim),reach=victim.seated&&distance>.75?{x:victim.x+(p.x-victim.x)*.75/distance,z:victim.z+(p.z-victim.z)*.75/distance}:victim;
  if(distance<1.85&&navigation.segmentClear(p,reach)){
   p.state='resting';p.heading=Math.atan2(victim.x-p.x,victim.z-p.z);m.attack+=dt;const beat=m.attack%period;
   if(beat<.8)p[guard?'guardAttackTime':'ninjaAttackTime']=beat;
   const turn=Math.floor(m.attack/period);if(beat>=.6&&m.damageTurn!==turn){m.damageTurn=turn;if(victim===playerTarget)onPlayerDamage(damage);else onResidentDamage(victim,damage);}
  }else{clearCombat(m);if(route(m,victim,`fight:${victim.id??'player'}:${Math.round(victim.x/2)}:${Math.round(victim.z/2)}`))walk(m,dt,speed);}
 }
 let playerTarget=null;
 function update(dt,player,{active=false,raids=false,busy=false}={}){
  if(!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);time+=dt;playerTarget=player;
  const assigned=new Map();
  for(const m of members)if(alive(m.victim))assigned.set(m.victim.id,(assigned.get(m.victim.id)??0)+1);
  for(const m of members){const p=m.p,n=p.ninja;delete p.ninjaAttackTime;delete p.ninjaSpeed;delete p.ninjaVictim;
   if(!alive(p)&&n.hostile&&!n.captured){n.captured=true;captured.add(p.id);progress();changed();}
   if(busy||!alive(p)||p.assembly||p.dragonEmergency||p.missionCombat||p.missionJob){clearCombat(m);continue;}
   if(n.captured){p.state='resting';n.alerted=false;continue;}
   const chase=n.hostile&&active&&(stage===3||n.alerted&&dist(p,player)<65)&&(!raids||dist(p,player)<10)&&(!raids||p.id%3===0);
   if(chase){n.alerted=true;m.victim=null;strike(m,player,dt);continue;}
   // A maximum of three attackers per target keeps the assault distributed.
   if(n.hostile&&raids){
    const nearbyGuard=guards.filter(g=>alive(g.p)&&!g.p.dragonEmergency&&dist(p,g.p)<5).sort((a,b)=>dist(p,a.p)-dist(p,b.p))[0]?.p;
    if(!alive(m.victim)||time>=(m.retargetAt??0)||nearbyGuard&&m.victim!==nearbyGuard){
     if(m.victim)assigned.set(m.victim.id,Math.max(0,(assigned.get(m.victim.id)??1)-1));
     const candidates=population.filter(q=>!q.ninja&&alive(q)&&(assigned.get(q.id)??0)<3);
     const royals=candidates.filter(q=>q.spriteId==='king-berenguer'||q.spriteId==='queen-almodis');
     const pool=nearbyGuard?[nearbyGuard]:n.index%3===1&&royals.length?royals:candidates;
     m.victim=pool.sort((a,b)=>dist(p,a)-dist(p,b)||a.id-b.id)[0]??null;m.retargetAt=time+3;
     if(m.victim)assigned.set(m.victim.id,(assigned.get(m.victim.id)??0)+1);clearCombat(m);
    }
    if(alive(m.victim)){p.ninjaVictim=m.victim.name;strike(m,m.victim,dt);continue;}
   }else m.victim=null;
   clearCombat(m);let to=stage>=4&&!n.hostile?{x:-13,z:0}:n.home;
   if(n.hostile){m.wait-=dt;if(m.wait<=0){m.patrol=1-m.patrol;m.wait=6+p.id%4;}to={x:n.home.x+(m.patrol?1.5:0),z:n.home.z};}
   if(route(m,to,`patrol:${m.patrol}:${stage>=4}`))walk(m,dt,1.2);
  }
  for(const g of guards){const p=g.p,wasDefending=p.ninjaDefense;delete p.ninjaDefense;delete p.ninjaSpeed;
   if(!raids||busy||!alive(p)||p.dragonEmergency||p.missionCombat){if(wasDefending)clearCombat(g);continue;}
   if(wasDefending)delete p.guardAttackTime;
   const enemy=members.filter(m=>m.p.ninja.hostile&&!m.p.ninja.captured&&alive(m.p)&&dist(p,m.p)<12).sort((a,b)=>dist(p,a.p)-dist(p,b.p))[0]?.p;
   if(enemy){p.ninjaDefense=true;p.seated=false;strike(g,enemy,dt,{speed:3.2,damage:14,period:1.5,guard:true});}else clearCombat(g);
  }
 }
 function serialize(){return{version:2,roster:members.map(m=>m.p.id),stage,captured:[...captured],positions:members.map(m=>({id:m.p.id,x:m.p.x,z:m.p.z}))};}
 function restore(data){if(![1,2].includes(data?.version)||!Number.isInteger(data.stage)||data.stage<0||data.stage>NINJA_STEPS.length||!Array.isArray(data.captured))return false;
  const ids=data.captured.filter(id=>members.some(m=>m.p.id===id&&m.p.ninja.hostile));if(ids.length!==data.captured.length||new Set(ids).size!==ids.length||data.stage>=4&&ids.length!==(data.version===1?4:hostileCount))return false;
  stage=data.version===1&&data.stage>=4?3:data.stage;for(const id of ids){captured.add(id);members.find(m=>m.p.id===id).p.ninja.captured=true;}
  for(const pos of (Array.isArray(data.positions)?data.positions:[]).slice(0,members.length)){const m=members.find(m=>m.p.id===pos?.id);if(m&&!m.p.missionDead&&Number.isFinite(pos.x)&&Number.isFinite(pos.z)&&Math.abs(pos.x)<90&&Math.abs(pos.z)<90&&navigation.segmentClear(pos,pos)){m.p.x=pos.x;m.p.z=pos.z;}}
  notice=stage===NINJA_STEPS.length?NINJA_STORY.ending:stage?NINJA_STEPS[stage-1].text:NINJA_STORY.intro;progress();return true;
 }
 restore(initialData);return{update,shot,interact,target,serialize,restore,members,get stage(){return stage;},get completed(){return stage===NINJA_STEPS.length;},get hostileCount(){return hostileCount;},get defeated(){return captured.size;},get notice(){return notice;}};
}
