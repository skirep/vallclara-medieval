import {createVillageNarrative,narrativeConversation} from './village-narrative.js';
export const writeConversation=narrativeConversation;
export function createSocialSystem(population){
  const narrative=createVillageNarrative(population);
  const active=[],journal=[];let elapsed=0,scan=0,nextId=0,scanCursor=0;
  const byId=new Map(population.map(p=>[p.id,p]));
  function begin(a,b,hour,override=null){
    if(a.health===0||b.health===0||a.missionCombat||b.missionCombat||a.missionDead||b.missionDead||a.missionEscort||b.missionEscort||active.length>=18||a===b||a.royalGuard||b.royalGuard||a.dragonEmergency||b.dragonEmergency||a.playerDuel||b.playerDuel||a.assembly||b.assembly||a.social.conversation!==null||b.social.conversation!==null||a.social.cooldown>0||b.social.cooldown>0)return false;
    const id=nextId++,plan=override??narrative.plan(a,b,hour),turns=plan.turns;
    const conversation={...plan,id,a:a.id,b:b.id,turnElapsed:0,topic:plan.topic,chapter:plan.chapter,romantic:plan.romantic===true,turns,index:0,remaining:turns[0].duration??Math.min(8,2.2+turns[0].text.length*.028),time:elapsed};
    active.push(conversation);a.social.conversation=b.social.conversation=id;a.state=b.state='talking';
    a.heading=Math.atan2(b.x-a.x,b.z-a.z);b.heading=Math.atan2(a.x-b.x,a.z-b.z);
    return true;
  }
  function finish(c){
    const a=byId.get(c.a),b=byId.get(c.b);
    for(const [p,other]of [[a,b],[b,a]]){p.social.conversation=null;p.social.cooldown=32+(p.id%23);p.social.meetings++;p.social.met[other.id]=(p.social.met[other.id]||0)+1;p.state=p.path.length?'walking':'working';const ids=Object.keys(p.social.met);if(ids.length>16)delete p.social.met[ids[0]];}
    const outcome=c.kind?c.outcome:narrative.complete(a,b,c);
    if(c.kind==='love-duel')for(const p of [a,b])p.dramaMood={icon:'🤝',label:'Reconciliació',text:outcome,remaining:30};
    for(const p of [a,b])delete p.duelPose;
    journal.unshift({id:c.id,time:c.time,a:a.id,b:b.id,turns:c.turns,outcome});if(journal.length>80)journal.length=80;
  }
  function interruptAll(){
    // A public gathering interrupts private chats without recording them as completed.
    for(const c of active)for(const id of [c.a,c.b]){const p=byId.get(id);p.social.conversation=null;delete p.duelPose;delete p.dramaMood;p.state=p.path.length?'walking':'working';}
    active.length=0;
  }
  function update(dt,hour,{allowNew=true}={}){
    elapsed+=dt;scan+=dt;
    for(const p of population)p.social.cooldown=Math.max(0,p.social.cooldown-dt);
    for(let i=active.length-1;i>=0;i--){const c=active[i];c.remaining-=dt;c.turnElapsed+=dt;if(c.remaining<=0){c.index++;if(c.index>=c.turns.length){finish(c);active.splice(i,1);}else{c.turnElapsed=0;c.remaining=c.turns[c.index].duration??Math.min(8,2.2+c.turns[c.index].text.length*.028);}}}
    if(!allowNew||scan<.8)return;scan=0;
    // Spatial hash keeps neighbour discovery local instead of comparing 250,000 pairs.
    const grid=new Map();for(const p of population){const key=`${Math.floor(p.x/4)},${Math.floor(p.z/4)}`;if(!grid.has(key))grid.set(key,[]);grid.get(key).push(p);}
    for(let offset=0;offset<population.length;offset++){const a=population[(scanCursor+offset)%population.length];if(active.length>=18)break;if(a.social.cooldown>0||a.social.conversation!==null)continue;const gx=Math.floor(a.x/4),gz=Math.floor(a.z/4);
      const candidates=[];
      for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)for(const b of grid.get(`${gx+x},${gz+z}`)||[]){const distance=Math.hypot(a.x-b.x,a.z-b.z);if(b.id>a.id&&distance>.75&&distance<2.6&&b.social.conversation===null&&b.social.cooldown<=0)candidates.push(b);}
      const priority=b=>(a.story.narrative.friendId===b.id||b.story.narrative.friendId===a.id?5:0)+(a.story.narrative.rivalId===b.id||b.story.narrative.rivalId===a.id?4:0)+(a.familyId===b.familyId?2:0)+(a.social.met[b.id]?0:3);
      candidates.sort((b,c)=>priority(c)-priority(b));for(const b of candidates)if(begin(a,b,hour))break;
    }
    scanCursor=(scanCursor+37)%population.length;
  }
  function bubbles(){return active.map(c=>{const turn=c.turns[c.index],p=byId.get(turn.speakerId);return{id:c.id,person:p,text:turn.text};});}
  function serialize(){return{version:1,journal,nextId,narrative:narrative.serialize(),memories:population.map(p=>({id:p.id,meetings:p.social.meetings,met:p.social.met}))};}
  function restore(data){if(!data||data.version!==1)return;narrative.restore(data.narrative);const memories=Array.isArray(data.memories)?data.memories:[];for(const m of memories){const p=byId.get(m?.id);if(!p||!Number.isFinite(m.meetings))continue;p.social.meetings=Math.min(1e6,Math.max(0,m.meetings));p.social.met={};for(const [id,count]of Object.entries(m.met||{}).slice(0,16))if(byId.has(Number(id))&&Number.isFinite(count)&&count>0)p.social.met[id]=Math.min(count,1e6);}if(Array.isArray(data.journal))for(const c of data.journal.slice(0,80))if(c&&byId.has(c.a)&&byId.has(c.b)&&Array.isArray(c.turns)&&c.turns.length<=8&&c.turns.every(t=>t&&byId.has(t.speakerId)&&typeof t.text==='string'&&t.text.length<1000))journal.push(c);nextId=Number.isInteger(data.nextId)?Math.max(0,data.nextId):0;}
  return{populationById:byId,update,bubbles,journal,active,begin,interruptAll,serialize,restore,narrative};
}
