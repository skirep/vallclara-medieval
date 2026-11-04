import * as T from 'three';
import {residentHeight} from './resident-scale.js';
export function residentThought(p,{social,dragon,hour=9}={}){
 if(p.missionJob&&!p.dragonEmergency&&!p.assembly)return{icon:p.missionJob.phase==='fighting'?'⚔️':'📜',label:p.missionJob.title,text:p.missionJob.phase==='paused'?'He aturat la missió: primer he de respondre al que passa al poble.':p.missionJob.phase==='recovering'?'Necessito recuperar forces abans de continuar.':p.missionJob.objective,priority:8};
 if(p.missionEscort)return{icon:'🏮',label:'Tornant amb la família',text:'Segueixo el fanal fins a Santa Maria. Espera’m si em quedo enrere.',priority:9};
 if(p.royalGuard){const g=p.royalGuard,combat=p.dragonEmergency?.role==='defender',returning=p.dragonEmergency?.role==='returning';return {icon:g.weapon==='spear'?'🔱':'⚔️',label:combat?'Combatent el drac':returning?'Tornant al castell':g.phase==='mobilising'?'Alerta de drac':'Guàrdia reial',text:combat?'Mantindrem el drac lluny dels reis i dels veïns!':returning?'El perill ha passat. Tornem a protegir el castell.':g.phase==='mobilising'?'Un drac al cel! Preparem la defensa de la plaça.':'Vigilo els accessos del castell per protegir el rei i la reina.'};}
 if(p.dragonEmergency){const role=p.dragonEmergency.role;return{icon:role==='defender'?'🥊':role==='returning'?'😮‍💨':'😱',label:role==='defender'?'Plantant cara al drac':role==='returning'?'Tornant després de l’atac':'Fugint del foc',text:role==='defender'?'He de distreure el drac perquè la gent pugui escapar.':role==='returning'?'El drac ja s’ha enlairat. Tornaré amb calma al que estava fent.':'El drac ha baixat a la plaça! Corro a refugiar-me lluny de les flames.',priority:10};}
 if(p.playerDuel)return{icon:'🥊',label:'Duel',text:'A veure si el visitant té una rèplica millor que la meva.',priority:8};
 if(p.assembly)return{icon:p.state==='talking'?'📣':'👂',label:p.state==='talking'?'Prenent la paraula':'Escoltant',text:p.state==='talking'?'Ara em toca explicar la feina feta i els plans d’avui.':'Escolto qui té el torn a la reunió.',priority:4};
 if(p.lifeActivity){const a=p.lifeActivity;return {icon:a.phase==='returning'?'👣':a.icon,label:a.phase==='returning'?'Després de la trobada':a.title,text:a.text,priority:6};}
 if(p.socialMemory)return {...p.socialMemory,priority:4};
 if(p.dramaMood)return{...p.dramaMood,priority:7};
 const conversation=social?.active.find(c=>c.id===p.social?.conversation);
 if(conversation){const other=social.populationById?.get(conversation.a===p.id?conversation.b:conversation.a);return{icon:conversation.kind==='bump'?'💥':conversation.romantic?'💕':'💬',label:conversation.kind==='bump'?'Topada':conversation.romantic?'Flirteig':'Conversa',text:conversation.kind==='bump'?'Ens hem entrebancat. Més val aclarir-ho abans de continuar.':conversation.romantic?'Aquesta conversa em fa venir ganes de quedar-me una mica més.':`Estic pendent del que ${other?.name??'el meu veí'} m’explica.`,priority:5};}
 if(dragon?.flight&&Math.hypot(p.x-dragon.root.position.x,p.z-dragon.root.position.z)<26)return{icon:dragon.fireActive?'🔥':'🐉',label:dragon.fireActive?'Flames al cel':'Drac',text:dragon.fireActive?'Quina flamarada! Sort que passa per damunt de les teulades.':'El drac torna a donar voltes per la vila. Quin espectacle!',priority:6};
 const d=p.duty;
 if(d?.phase==='blocked')return{icon:'⏳',label:'Falta material',text:`Em falta ${d.blocker||'material'} per poder continuar la feina.`,priority:3};
 if(p.state==='walking')return{icon:d?.cargo?'📦':'👣',label:d?.cargo?'Lliurament':'De camí',text:d?.cargo?'Porto la feina acabada al punt de lliurament.':d?.phase==='home'?'Torno a casa per estar amb la família.':`Vaig cap al meu lloc. Avui ${d?.plan??p.story.wish}.`,priority:1};
 if(p.state==='working')return{icon:'🛠️',label:'Concentració',text:`Ara ${d?.task?.label??p.job}. Avui ${d?.plan??p.story.wish}.`,priority:1};
 if(p.dramaCrushId!==undefined)return{icon:'💭',label:'El ball',text:'Encara penso en la invitació al ball. Potser hauria de parlar amb més calma.',priority:2};
 return{icon:hour>=20||hour<6?'🌙':'🏡',label:'Repòs',text:hour>=20||hour<6?'Ja toca descansar. Demà serà un altre dia.':`Ara tinc una estona per pensar: voldria ${p.story.wish}.`,priority:0};
}
// Opaque obstacle rectangles stop icons from appearing through walls. Heights
// include a little margin for roofs; rivers never hide thoughts.
export function thoughtOccluded(camera,target,obstacles){
 for(const b of obstacles){if(b.kind==='river')continue;let lo=0,hi=1;for(const [axis,size]of [['x','w'],['z','d']]){const delta=target[axis]-camera[axis],min=b[axis]-b[size]/2,max=b[axis]+b[size]/2;if(Math.abs(delta)<1e-8){if(camera[axis]<min||camera[axis]>max){lo=2;break;}}else{const a=(min-camera[axis])/delta,c=(max-camera[axis])/delta;lo=Math.max(lo,Math.min(a,c));hi=Math.min(hi,Math.max(a,c));}}if(lo<hi&&lo<.98&&hi>.02&&camera.y+(target.y-camera.y)*Math.max(.02,lo)<(b.h??6)+2)return true;
 }return false;
}
export function createThoughtOverlay(population,{layer,poses,heightAt=()=>0,obstacles=[],context=()=>({})}){
 const nodes=new Map(),projected=new T.Vector3(),target=new T.Vector3();let cooldown=0,selected=null;
 function update(camera,dt,enabled=true){cooldown-=dt;if(cooldown>0&&enabled)return;cooldown=.12;camera.updateMatrixWorld();const used=new Set(),occupied=[];
  if(enabled){const ctx=context(),near=population.map((p,i)=>({p,i,d:Math.hypot(p.x-camera.position.x,p.z-camera.position.z),thought:residentThought(p,ctx)})).filter(x=>!x.p.missionDead&&x.d<28).sort((a,b)=>b.thought.priority-a.thought.priority||a.d-b.d);
   for(const {p,i,thought,d}of near){if(used.size>=22)break;const pose=poses[i]??p;target.set(pose.x,heightAt(pose.x,pose.z)+residentHeight(p)+.64,pose.z);projected.copy(target).project(camera);if(projected.z< -1||projected.z>1||Math.abs(projected.x)>.94||Math.abs(projected.y)>.83||thoughtOccluded(camera.position,target,obstacles))continue;
    const x=(projected.x*.5+.5)*innerWidth,y=(-projected.y*.5+.5)*innerHeight;if(occupied.some(o=>Math.abs(x-o.x)<38&&Math.abs(y-o.y)<40))continue;occupied.push({x,y});used.add(p.id);let el=nodes.get(p.id);if(!el){el=document.createElement('button');el.type='button';el.className='thought-icon';el.append(document.createElement('span'),document.createElement('span'));el.firstChild.className='thought-symbol';el.lastChild.className='thought-detail';el.onclick=()=>{selected=selected===p.id?null:p.id;for(const [id,node]of nodes)node.classList.toggle('expanded',id===selected);};layer.append(el);nodes.set(p.id,el);}
    el.firstChild.textContent=thought.icon;el.lastChild.textContent=`${p.name} · ${thought.label}: ${thought.text}`;el.setAttribute('aria-label',el.lastChild.textContent);el.title=el.lastChild.textContent;el.style.left=`${x}px`;el.style.top=`${y}px`;el.style.opacity=String(Math.min(1,(28-d)/5));el.classList.toggle('expanded',p.id===selected);
   }
  }
  for(const [id,el]of nodes)if(!used.has(id)){el.remove();nodes.delete(id);}
 }
 return{update};
}
