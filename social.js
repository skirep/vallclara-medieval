import {random} from './simulation.js';
const chores=[['la collita','A l’hort ens aniria bé una mica de pluja.'],['el pa','El forn ja és calent; encara queda una fornada.'],['les eines','Tinc una aixada per adobar abans del vespre.'],['la roba','El lli d’enguany té una fibra ben resistent.'],['els camins','Al camí del coll hi ha massa fang per al carro.'],['el mercat','Aquest matí han demanat molt de gra.'],['la fusta','La fusta s’ha d’assecar abans de treballar-la.'],['l’aigua','Avui la roba triga a eixugar-se.'],['el ramat','Les ovelles ja busquen les herbes més tendres.'],['la vila','A la porta sud avui tot és tranquil.'],['la terrissa','No vull obrir el forn abans que es refredi.'],['la música','Estic assajant una tonada per a la festa.']];
export function writeConversation(a,b,hour,meeting=0){
  const rng=random((a.id+1)*1789+(b.id+1)*31+meeting*709),greeting=hour<12?'Bon dia':hour<18?'Bona tarda':'Bon vespre',topic=Math.floor(rng()*6),familiar=a.social.met[b.id]>0;
  const turns=[{speakerId:a.id,text:`${greeting}, ${b.name.split(' ')[0]}.${familiar?' Com va tot des de l’última vegada?':''}`}];
  if(a.familyId===b.familyId){turns.push({speakerId:b.id,text:hour>=18?'Ens retrobem a casa. Com t’ha anat el dia?':hour>=12.5&&hour<13.5?'Ja som a casa per dinar. Tinc gana!':`Som els ${a.surname}. Avui voldria ${b.story.wish}.`},{speakerId:a.id,text:a.age<16?'Després voldria jugar amb la família a la plaça.':`Parlem-ne amb la família quan siguem tots a la casa ${a.family.household}.`},{speakerId:b.id,text:'D’acord. Ens esperarem per anar plegats.'});return turns;}
  if(a.age<16||b.age<16){const child=a.age<16?a:b;turns.push({speakerId:b.id,text:child===b?`Avui voldria ${child.story.wish}. M’hi ajudaràs?`:`Com va això de ${child.story.wish}?`},{speakerId:a.id,text:a.age<16?'M’agrada aprendre, però també tinc ganes de jugar a la plaça.':'Quan acabi, podem anar fins a la plaça amb la gent de casa.'},{speakerId:b.id,text:'Ens hi veurem. I vigilem els carros del carrer!'});return turns;}
  if(topic===0){turns.push({speakerId:b.id,text:`Encara penso en ${b.story.wish}. Em té ben ocupat el cap.`},{speakerId:a.id,text:`Potser ${a.name===b.name?'el veí':a.story.temperament==='generós'?'jo et puc donar un cop de mà':'ens en podem tornar a parlar després de la feina'}.`},{speakerId:b.id,text:`Gràcies. A canvi, t’ajudaré amb ${chores[a.jobId][0]}.`});}
  else if(topic===1){turns.push({speakerId:b.id,text:chores[b.jobId][1]},{speakerId:a.id,text:`Jo avui tinc molta feina amb ${chores[a.jobId][0]}. Ens veurem a la plaça?`},{speakerId:b.id,text:`Sí, quan acabi la feina. No vull marxar sense parlar amb tu.`});}
  else if(topic===2){turns.push({speakerId:b.id,text:`Em ronda pel cap una preocupació: ${b.story.worry}. No sé si ho tindrem resolt abans del fred.`},{speakerId:a.id,text:`Quan ${a.story.past.replace(/^va /,'vaig ')}, vaig aprendre a demanar ajuda.`},{speakerId:b.id,text:`Ho tindré present. Demanaré ajuda a la gent de casa.`});}
  else if(topic===3){turns.push({speakerId:b.id,text:`Encara guardes allò que vas portar ${('de '+a.story.origin).replace(/^de el /,'del ')}?`},{speakerId:a.id,text:`Sí, ${a.story.keepsake}. Em recorda que l’any ${a.story.year} ${a.story.past.replace(/^va /,'vaig ')}.`},{speakerId:b.id,text:`Aquestes coses valen més que unes quantes monedes.`});}
  else if(topic===4){turns.push({speakerId:b.id,text:hour<12?'Quin matí de feina. Ja has passat pel mercat?':hour<17?'Si el temps aguanta, avui acabarem la feina amb llum.':'Aviat serà hora de recollir les eines i tornar a casa.'},{speakerId:a.id,text:`Sí. Després voldria ${a.story.wish}.`},{speakerId:b.id,text:`No t’hi capfiquis sense ajuda; demà encara hi serem.`});}
  else {turns.push({speakerId:b.id,text:`Com et trobes a la casa ${a.story.household}?`},{speakerId:a.id,text:`Hi estem bé, però encara he de ${a.story.wish}.`},{speakerId:b.id,text:`Si necessites ajuda amb ${chores[b.jobId][0]}, ja saps on trobar-me.`});}
  turns.push({speakerId:a.id,text:hour>18?'Que descansis. Demà ens tornem a veure.':'Bona feina. Ens veurem després!'});
  return turns;
}
export function createSocialSystem(population){
  const active=[],journal=[];let elapsed=0,scan=0,nextId=0,scanCursor=0;
  const byId=new Map(population.map(p=>[p.id,p]));
  function begin(a,b,hour){
    if(a===b||a.assembly||b.assembly||a.social.conversation!==null||b.social.conversation!==null||a.social.cooldown>0||b.social.cooldown>0)return false;
    const id=nextId++,turns=writeConversation(a,b,hour,a.social.met[b.id]||0);
    const conversation={id,a:a.id,b:b.id,turns,index:0,remaining:3.4,time:elapsed};
    active.push(conversation);a.social.conversation=b.social.conversation=id;a.state=b.state='talking';
    a.heading=Math.atan2(b.x-a.x,b.z-a.z);b.heading=Math.atan2(a.x-b.x,a.z-b.z);
    return true;
  }
  function finish(c){
    const a=byId.get(c.a),b=byId.get(c.b);
    for(const [p,other]of [[a,b],[b,a]]){p.social.conversation=null;p.social.cooldown=32+(p.id%23);p.social.meetings++;p.social.met[other.id]=(p.social.met[other.id]||0)+1;p.state=p.path.length?'walking':'working';const ids=Object.keys(p.social.met);if(ids.length>16)delete p.social.met[ids[0]];}
    journal.unshift({id:c.id,time:c.time,a:a.id,b:b.id,turns:c.turns});if(journal.length>80)journal.length=80;
  }
  function interruptAll(){
    // A public gathering interrupts private chats without recording them as completed.
    for(const c of active)for(const id of [c.a,c.b]){const p=byId.get(id);p.social.conversation=null;p.state=p.path.length?'walking':'working';}
    active.length=0;
  }
  function update(dt,hour,{allowNew=true}={}){
    elapsed+=dt;scan+=dt;
    for(const p of population)p.social.cooldown=Math.max(0,p.social.cooldown-dt);
    for(let i=active.length-1;i>=0;i--){const c=active[i];c.remaining-=dt;if(c.remaining<=0){c.index++;if(c.index>=c.turns.length){finish(c);active.splice(i,1);}else c.remaining=Math.min(6,2.2+c.turns[c.index].text.length*.028);}}
    if(!allowNew||scan<.8)return;scan=0;
    // Spatial hash keeps neighbour discovery local instead of comparing 250,000 pairs.
    const grid=new Map();for(const p of population){const key=`${Math.floor(p.x/4)},${Math.floor(p.z/4)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p);}
    for(let offset=0;offset<population.length;offset++){const a=population[(scanCursor+offset)%population.length];if(active.length>=18)break;if(a.social.cooldown>0||a.social.conversation!==null)continue;const gx=Math.floor(a.x/4),gz=Math.floor(a.z/4);let found=false;
      for(let x=-1;x<=1&&!found;x++)for(let z=-1;z<=1&&!found;z++)for(const b of grid.get(`${gx+x},${gz+z}`)||[]){const distance=Math.hypot(a.x-b.x,a.z-b.z);if(b.id>a.id&&distance>.75&&distance<2.6&&begin(a,b,hour)){found=true;break;}}
    }
    scanCursor=(scanCursor+37)%population.length;
  }
  function bubbles(){return active.map(c=>{const turn=c.turns[c.index],p=byId.get(turn.speakerId);return{id:c.id,person:p,text:turn.text};});}
  function serialize(){return{version:1,journal,nextId,memories:population.map(p=>({id:p.id,meetings:p.social.meetings,met:p.social.met}))};}
  function restore(data){if(!data||data.version!==1)return;const memories=Array.isArray(data.memories)?data.memories:[];for(const m of memories){const p=byId.get(m?.id);if(!p||!Number.isFinite(m.meetings))continue;p.social.meetings=Math.min(1e6,Math.max(0,m.meetings));p.social.met={};for(const [id,count]of Object.entries(m.met||{}).slice(0,16))if(byId.has(Number(id))&&Number.isFinite(count)&&count>0)p.social.met[id]=Math.min(count,1e6);}if(Array.isArray(data.journal))for(const c of data.journal.slice(0,80))if(c&&byId.has(c.a)&&byId.has(c.b)&&Array.isArray(c.turns)&&c.turns.length<=8&&c.turns.every(t=>t&&byId.has(t.speakerId)&&typeof t.text==='string'&&t.text.length<500))journal.push(c);nextId=Number.isInteger(data.nextId)?Math.max(0,data.nextId):0;}
  return{update,bubbles,journal,active,begin,interruptAll,serialize,restore};
}
