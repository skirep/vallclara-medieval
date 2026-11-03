import {residentHeight} from './resident-scale.js';
import {VILLAGE_LORE,THREADS} from './village-lore.js';
import {dialoguePage,DIALOGUE_COUNT} from './dialogue-catalogue.js';
import {ROLE_LABELS,RESOURCE_LABELS,phaseLabel} from './resident-tasks.js';
import {familiesOf,relationLabel} from './families.js';
import * as T from 'three';
export function createChronicles(population,social,{work=null,onOpen,onClose,onFollow}){
  const $=s=>document.querySelector(s),dialog=$('#chronicles'),list=$('#resident-list'),bio=$('#biography'),byId=new Map(population.map(p=>[p.id,p])),projected=new T.Vector3(),bubbles=new Map();let selected=0,lastSpoken='',lastSpokenAt=0,lastPublicKey='';
  const text=(tag,value,className='')=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
  const familyFilter=$('#familyFilter');
  for(const family of familiesOf(population)){const option=text('option',`${family.surname} · casa ${family.household}`);option.value=family.id;familyFilter.append(option);}
  familyFilter.onchange=()=>renderPeople();
  function showBio(id){selected=id;const p=byId.get(id);bio.replaceChildren(text('span',p.job.toUpperCase(),'eyebrow'),text('h3',p.name),text('p',p.story.biography));const dl=document.createElement('dl');for(const [label,value]of [['Objectiu',p.story.wish],['Preocupació',p.story.worry],['Record estimat',p.story.keepsake],['Amistat',byId.get(p.story.friendId).name],['Vincle familiar',byId.get(p.story.kinId).name],['Trobades',String(p.social.meetings)],['Davant del pacte',p.story.narrative.stance],['Desacord amb',byId.get(p.story.narrative.rivalId).name],['Paper al poble',p.story.narrative.role||'Veu de la família'],['Pista personal',p.story.narrative.secret],['Repertori',`${DIALOGUE_COUNT} línies contextuals`]]){dl.append(text('dt',label),text('dd',value));}bio.append(dl);
    if(onFollow){const follow=text('button','Seguir amb la càmera','follow-resident');follow.type='button';follow.onclick=()=>{dialog.close();onFollow(p);};bio.insertBefore(follow,dl);}

    if(p.duty){const d=p.duty,job=document.createElement('section');job.className='resident-duty';job.append(text('h4',`Funció · ${ROLE_LABELS[d.role]}`),text('p',`Avui ${d.plan}.`),text('p',phaseLabel(d)),text('p',`Tasques lliurades avui: ${d.today.completed}. Lloc: ${work?.sites[d.station]?.name||ROLE_LABELS[d.role]}.`));if(d.phase==='working'){const progress=document.createElement('progress');progress.max=d.task.duration;progress.value=d.elapsed;progress.setAttribute('aria-label','Progrés de la feina');job.append(progress);}if(d.lastCompleted)job.append(text('p',`Darrera tasca: ${d.lastCompleted.label}.`));bio.append(job);}

    const familyBox=document.createElement('section');familyBox.className='family-members';familyBox.append(text('h4',`Família ${p.surname} · casa ${p.family.household}`));
    for(const memberId of p.family.memberIds){const member=byId.get(memberId);if(member===p)continue;const button=text('button',`${member.name} · ${relationLabel(p,member)} · ${member.age} anys`);button.type='button';button.onclick=()=>showBio(memberId);familyBox.append(button);}bio.append(familyBox);renderCatalogue(p);
    list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.id)===id)));}
  function renderCatalogue(p){
    const box=document.createElement('section');box.className='dialogue-catalogue';box.append(text('h4',`Veu de ${p.name} · ${DIALOGUE_COUNT} línies`),text('p','16 fils × 4 etapes × 8 rèpliques. Els textos s’adapten a cada habitant. Les etapes futures poden avançar detalls de la història.'));
    const topic=document.createElement('select'),chapter=document.createElement('select'),lines=document.createElement('ol');topic.setAttribute('aria-label','Fil de diàleg');chapter.setAttribute('aria-label','Etapa del diàleg');
    for(const [i,t]of THREADS.entries()){const o=text('option',t.title);o.value=i;topic.append(o);}
    for(const [i,c]of VILLAGE_LORE.chapters.entries()){const o=text('option',c.title);o.value=i;chapter.append(o);}
    topic.value=p.story.narrative.thread;chapter.value=social.narrative.summary().chapter;
    function render(){lines.replaceChildren();for(const line of dialoguePage(p,{topic:Number(topic.value),chapter:Number(chapter.value),other:byId.get(p.story.friendId)}))lines.append(text('li',line.text));}
    topic.onchange=chapter.onchange=render;box.append(topic,chapter,lines);bio.append(box);render();
  }
  function renderStory(){
    const panel=$('#storyPanel'),state=social.narrative.summary();panel.replaceChildren(text('h3',VILLAGE_LORE.title),text('p',VILLAGE_LORE.premise),text('p',VILLAGE_LORE.conflict),text('h4',`Etapa ${state.chapter+1} · ${state.title}`),text('p',state.description));
    if(state.chapter<3)panel.append(text('p',`Progrés: ${state.exchanges}/${state.target} intercanvis contrastats · ${state.witnesses}/12 habitants · ${state.topics}/6 qüestions. Repetir la mateixa parella i tema no suma; les converses interrompudes tampoc.`));
    else panel.append(text('p',VILLAGE_LORE.ending));
    panel.append(text('p','Cada veí té família, amistat i un desacord. Les retrobades promeses augmenten la confiança quan es compleixen. El sacerdot explica l’etapa actual durant la reunió diària. El progrés es recorda en aquest navegador.'));
    for(const event of state.events)panel.append(text('p',event.text,'story-event'));
  }
  function renderWork(){
    const panel=$('#workPanel');panel.replaceChildren(text('h3','Les mans que fan viure Vallclara'));
    if(!work){panel.append(text('p','El registre de feines encara no està disponible.'));return;}
    const state=work.summary();panel.append(text('p',`${population.length} habitants amb funció · ${state.working} treballant · ${state.blocked} esperant material · ${state.delivered} tasques lliurades.`),text('p','Els veïns caminen fins al seu lloc, treballen i porten el resultat al punt de lliurament. Les pauses, les converses i la reunió aturen la feina. Si falta material, esperen que arribi un subministrament.'),text('h4','Rebost i serveis completats'));
    const dl=document.createElement('dl');for(const [key,value]of Object.entries(state.stock))dl.append(text('dt',RESOURCE_LABELS[key]),text('dd',String(value)));panel.append(dl);
    const roles=document.createElement('div');roles.className='work-roles';for(const [i,label]of ROLE_LABELS.entries())roles.append(text('p',`${label}: ${population.filter(p=>p.duty.role===i).length} habitants`));panel.append(roles,text('h4','Darrers lliuraments'));
    if(!state.journal.length)panel.append(text('p','Encara no ha arribat cap lliurament. Pots consultar la feina de cada habitant a la seva fitxa.'));
    for(const entry of state.journal.slice(0,25))panel.append(text('p',`${byId.get(entry.personId).name} · ${entry.label} · ${Object.entries(entry.outputs).map(([k,v])=>`${v} ${RESOURCE_LABELS[k]}`).join(', ')}`));
  }
  function renderPeople(){
    const query=$('#searchPerson').value.toLocaleLowerCase('ca');list.replaceChildren();
    const visible=population.filter(p=>(familyFilter.value===''||p.familyId===Number(familyFilter.value))&&[p.name,p.job,p.story.origin,p.familyRole,`casa ${p.family.household}`].join(' ').toLocaleLowerCase('ca').includes(query));
    let lastFamily=-1;
    for(const p of visible){
      if(p.familyId!==lastFamily){list.append(text('h4',`${p.surname} · casa ${p.family.household}`,'family-heading'));lastFamily=p.familyId;}
      const button=text('button','');button.type='button';button.dataset.id=p.id;button.setAttribute('aria-pressed',String(p.id===selected));
      button.append(text('strong',p.name),text('small',`${p.familyRole} · ${p.age} anys · ${p.job}`));button.onclick=()=>showBio(p.id);list.append(button);
    }
    if(!visible.length)list.append(text('p','No s’ha trobat cap habitant.'));
  }
  function renderLog(){const el=$('#conversation-log');el.replaceChildren();if(!social.journal.length){el.append(text('p','Els veïns encara no han acabat cap conversa. Passeja una estona per la plaça.'));return;}for(const c of social.journal){const card=document.createElement('article');card.append(text('h3',`${byId.get(c.a).name} i ${byId.get(c.b).name}`));for(const turn of c.turns){const line=document.createElement('p');line.append(text('strong',byId.get(turn.speakerId).name+': '),document.createTextNode(turn.text));card.append(line);}if(c.outcome)card.append(text('small',c.outcome));el.append(card);}}
  $('#chroniclesBtn').onclick=()=>{onOpen();renderPeople();showBio(selected);renderLog();renderStory();renderWork();dialog.showModal();window.speechSynthesis?.cancel();};$('#closeChronicles').onclick=()=>dialog.close();dialog.addEventListener('close',onClose);$('#searchPerson').oninput=renderPeople;
  function tab(which){$('#storyPanel').hidden=which!=='story';$('#workPanel').hidden=which!=='work';$('#storyTab').setAttribute('aria-pressed',String(which==='story'));$('#workTab').setAttribute('aria-pressed',String(which==='work'));if(which==='story')renderStory();if(which==='work')renderWork();$('#peoplePanel').hidden=which!=='people';$('#talkPanel').hidden=which!=='talk';$('#peopleTab').setAttribute('aria-pressed',String(which==='people'));$('#talkTab').setAttribute('aria-pressed',String(which==='talk'));if(which==='talk')renderLog();}
  $('#storyTab').onclick=()=>tab('story');$('#workTab').onclick=()=>tab('work');$('#peopleTab').onclick=()=>tab('people');$('#talkTab').onclick=()=>tab('talk');
  function updateBubbles(camera,enabled,voices,publicBubbles=[]){
    const publicKey=enabled&&voices?(publicBubbles[0]?.id||''):'';
    if(publicKey!==lastPublicKey){window.speechSynthesis?.cancel();lastSpoken='';lastSpokenAt=-Infinity;lastPublicKey=publicKey;}
    const candidates=enabled?[...publicBubbles,...social.bubbles()].map(b=>({...b,distance:Math.hypot(camera.position.x-b.person.x,camera.position.z-b.person.z)})).filter(b=>b.distance<(b.priority?45:22)).sort((a,b)=>(b.priority||0)-(a.priority||0)||a.distance-b.distance).slice(0,3):[];
    const used=new Set();
    for(const b of candidates){const p=b.person;projected.set(p.x,residentHeight(p)+.32,p.z).project(camera);if(projected.z< -1||projected.z>1||Math.abs(projected.x)>.92||Math.abs(projected.y)>.8)continue;used.add(b.id);let el=bubbles.get(b.id);if(!el){el=document.createElement('div');el.className='speech';el.append(text('strong',''),text('span',''));$('#speech-layer').append(el);bubbles.set(b.id,el);}el.firstChild.textContent=p.name;el.lastChild.textContent=b.text;el.style.left=`${(projected.x*.5+.5)*100}%`;el.style.top=`${(-projected.y*.5+.5)*100}%`;el.style.opacity=String(Math.max(0,Math.min(1,((b.priority?45:22)-b.distance)/6)));
      const now=performance.now(),key=`${b.id}:${b.text}`;if(voices&&b.distance<(b.priority?45:12)&&key!==lastSpoken&&now-lastSpokenAt>(b.priority?0:4000)&&window.speechSynthesis&&!window.speechSynthesis.speaking){const utterance=new SpeechSynthesisUtterance(b.text);utterance.lang='ca-ES';utterance.rate=.95;utterance.volume=.55;const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('ca'));if(voice)utterance.voice=voice;speechSynthesis.speak(utterance);lastSpoken=key;lastSpokenAt=now;}
    }
    for(const[id,el]of bubbles)if(!used.has(id)){el.remove();bubbles.delete(id);}if((!enabled||!voices)&&window.speechSynthesis?.speaking)window.speechSynthesis.cancel();
  }
  return{updateBubbles};
}
