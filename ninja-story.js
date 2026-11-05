export const NINJA_STORY={title:'La Lluna Trencada',intro:'Una confraria arribada amb una caravana de seda busca el Segell de les Hores. Aki, una infiltrada, ha deixat un missatge sota el pont. El rellotger t’ha confiat la seva pistola d’espurna: un prototip impossible que la confraria també vol robar.',ending:'Raiga i els seus infiltrats han caigut. El segell torna a quedar sota la custòdia de la vila. La pistola queda sota la teva custòdia; Vallclara torna a tenir una nit tranquil·la.'};
export const NINJA_STEPS=[{title:'Llegeix el missatge del pont',x:0,z:0,text:'«Soc l’Aki. La Lluna Trencada vol obrir el segell del castell. Busca’m a l’altra riba. No els entreguis la pistola del rellotger.»'}, {title:'Parla amb l’Aki a la riba est',x:18,z:0,text:'Aki: «El segell és a la cancelleria. Porta’l al pou abans que Raiga el trobi. A l’armeria pots reposar la munició. Quan l’agafis, els infiltrats vindran a buscar-te.»'}, {title:'Recupera el Segell de les Hores',x:28,z:-73.5,text:'Sota els comptes del castell trobes una pedra marcada amb una lluna partida. A fora sona un xiulet: els quatre infiltrats han descobert el teu pla.'}, {title:'Atura Raiga i els tres infiltrats',combat:true,text:'Els ninjes et persegueixen pels carrers. Mou-te, apunta amb la mira i aprofita els murs per protegir-te.'}, {title:'Torna el segell a l’Aki, davant del pou',x:-13,z:0,text:NINJA_STORY.ending}];
export const ARMORY={x:28,z:-61.5};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function createNinjaStory(population,{navigation,onPlayerDamage=()=>{},initialData=null,onChange=()=>{}}={}){
 const members=population.filter(p=>p.ninja).map(p=>({p,path:[],index:0,key:null,nextRoute:0,patrol:0,wait:2+p.id%4,attack:0})),ally=members.find(m=>!m.p.ninja.hostile)?.p,captured=new Set();let stage=0,time=0,notice=NINJA_STORY.intro;
 function target(){if(stage>=NINJA_STEPS.length)return null;const s=NINJA_STEPS[stage];if(stage===1&&ally)return{...s,x:ally.x,z:ally.z};if(stage===3){const p=members.filter(m=>m.p.ninja.hostile&&!m.p.ninja.captured).map(m=>m.p).sort((a,b)=>a.id-b.id)[0];return p?{...s,x:p.x,z:p.z,person:p}:null;}return{...s};}
 function changed(){onChange(serialize());}
 function progress(){if(stage===3&&captured.size===4){stage=4;notice='Els quatre infiltrats han caigut. Porta el segell al pou i espera l’Aki.';changed();}}
 function interact(position){const s=target();if(!s||s.combat||dist(s,position)>3.2)return false;if(stage===4&&ally&&!ally.missionDead&&dist(ally,s)>4){notice='L’Aki està venint al pou. Espera-la per retornar el segell.';return false;}notice=ally?.missionDead&&stage===1?'Entre les pertinences de l’Aki trobes una nota: el Segell de les Hores és a la cancelleria.':ally?.missionDead&&stage===4?'Deixes el segell sota la custòdia de la vila. L’Aki no ha sobreviscut.':s.text;stage++;progress();changed();return true;}
 function route(m,to,key){if(m.key===key&&(time<m.nextRoute||m.index<m.path.length||dist(m.p,to)<.3))return true;m.key=key;m.nextRoute=time+.8;
  const points=[];for(const radius of [0,.8,1.6,2.4])for(let i=0;i<(radius?8:1);i++){const a=i*Math.PI/4,q={x:to.x+Math.sin(a)*radius,z:to.z+Math.cos(a)*radius};if(navigation.segmentClear(q,q))points.push(q);}
  for(const q of points){try{m.path=navigation.path(m.p,q,{seed:m.p.id,diversity:false,recordTraffic:false});m.index=0;return true;}catch{}}m.path=[];return false;
 }
 function walk(m,dt,speed){let budget=dt*speed,moved=0;const p=m.p;while(m.index<m.path.length&&budget>0){const q=m.path[m.index],d=dist(p,q);if(d<1e-7){m.index++;continue;}const step=Math.min(d,budget),dx=q.x-p.x,dz=q.z-p.z;p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;moved+=step;if(step===d)m.index++;}p.ninjaSpeed=speed;p.state=moved?'walking':'resting';return m.index===m.path.length;}
 function shot(event){const hit=event.person;if(hit?.ninja?.hostile){hit.ninja.alerted=true;if(hit.health<=0&&!hit.ninja.captured){hit.ninja.captured=true;hit.ninja.alerted=false;captured.add(hit.id);notice=`${hit.name} ha mort · ${captured.size}/4 infiltrats aturats`;progress();changed();}}
  for(const m of members)if(m.p.ninja.hostile&&!m.p.ninja.captured&&dist(m.p,event.origin)<16)m.p.ninja.alerted=true;
 }
 function update(dt,player,{active=false,busy=false}={}){
  if(!Number.isFinite(dt)||dt<=0)return;time+=dt;
  for(const m of members){const p=m.p,n=p.ninja;delete p.ninjaAttackTime;
   if(p.health<=0&&n.hostile&&!n.captured){n.captured=true;captured.add(p.id);progress();changed();}
   if(busy||p.missionDead||p.assembly||p.dragonEmergency||p.missionCombat||p.missionJob||p.health<=0){delete p.ninjaSpeed;continue;}
   if(n.captured){p.state='resting';n.alerted=false;continue;}
   const chase=n.hostile&&active&&(stage===3||n.alerted&&dist(p,player)<65);
   if(chase){n.alerted=true;p.heading=Math.atan2(player.x-p.x,player.z-p.z);
    if(dist(p,player)<2&&navigation.segmentClear(p,player)){
     p.state='resting';m.attack+=dt;const beat=m.attack%1.8;if(beat<.8)p.ninjaAttackTime=beat;
     const turn=Math.floor(m.attack/1.8);if(beat>=.6&&m.damageTurn!==turn){m.damageTurn=turn;onPlayerDamage(6);}
    }else{m.attack=0;m.damageTurn=null;if(route(m,player,`${Math.round(player.x/2)}:${Math.round(player.z/2)}`))walk(m,dt,2.65);}
   }else{
    m.attack=0;m.damageTurn=null;let to=stage>=4&&!n.hostile?{x:-13,z:0}:n.home;
    if(n.hostile){m.wait-=dt;if(m.wait<=0){m.patrol=1-m.patrol;m.wait=6+p.id%4;}to={x:n.home.x+(m.patrol?1.5:0),z:n.home.z};}
    if(route(m,to,`patrol:${m.patrol}:${stage>=4}`))walk(m,dt,1.2);
   }
  }
 }
 function serialize(){return{version:1,stage,captured:[...captured],positions:members.map(m=>({id:m.p.id,x:m.p.x,z:m.p.z}))};}
 function restore(data){if(data?.version!==1||!Number.isInteger(data.stage)||data.stage<0||data.stage>NINJA_STEPS.length||!Array.isArray(data.captured))return false;
  const ids=data.captured.filter(id=>members.some(m=>m.p.id===id&&m.p.ninja.hostile));if(ids.length!==data.captured.length||new Set(ids).size!==ids.length||data.stage>=4&&ids.length!==4)return false;
  stage=data.stage;for(const id of ids){captured.add(id);members.find(m=>m.p.id===id).p.ninja.captured=true;}
  for(const pos of (Array.isArray(data.positions)?data.positions:[]).slice(0,5)){const m=members.find(m=>m.p.id===pos?.id);if(m&&!m.p.missionDead&&Number.isFinite(pos.x)&&Number.isFinite(pos.z)&&Math.abs(pos.x)<90&&Math.abs(pos.z)<90&&navigation.segmentClear(pos,pos)){m.p.x=pos.x;m.p.z=pos.z;}}
  notice=stage===NINJA_STEPS.length?NINJA_STORY.ending:stage?NINJA_STEPS[stage-1].text:NINJA_STORY.intro;progress();return true;
 }
 restore(initialData);return{update,shot,interact,target,serialize,restore,members,get stage(){return stage;},get completed(){return stage===NINJA_STEPS.length;},get defeated(){return captured.size;},get notice(){return notice;}};
}
