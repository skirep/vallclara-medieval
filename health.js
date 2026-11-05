export const maxResidentHealth=p=>p.spriteId==='king-berenguer'?200:p.royalGuard?140:p.ninja?(p.ninja.captain?120:80):p.age<16?60:p.dragonDefender?120:100;
export function markResidentDead(p){
 if(!p.dead)p.deathPosition={x:p.x,z:p.z,heading:p.heading??0};
 p.dead=p.missionDead=true;p.health=0;p.healthDelay=0;p.state='dead';p.path=[];p.seated=false;p.playerDuel=false;
 for(const key of ['duelPose','lifeAction','guardAttackTime','ninjaAttackTime','dragonPunchTime'])delete p[key];
 if(p.deathPosition){p.x=p.deathPosition.x;p.z=p.deathPosition.z;p.heading=p.deathPosition.heading;}
}
export function createHealthSystem(population){
 const byId=new Map(population.map(p=>[p.id,p]));
 for(const p of population){p.maxHealth=maxResidentHealth(p);p.health=p.maxHealth;p.healthDelay=0;if(p.dead||p.missionDead)markResidentDead(p);}
 function damage(p,amount){if(!p||p.dead||p.missionDead||!Number.isFinite(amount)||amount<=0)return 0;const dealt=Math.min(p.health,amount);p.health=Math.max(0,p.health-amount);p.healthDelay=20;if(p.health===0)markResidentDead(p);return dealt;}
 function update(dt){if(!Number.isFinite(dt)||dt<=0)return;for(const p of population){if(p.dead||p.missionDead||p.health===0){markResidentDead(p);continue;}p.healthDelay=Math.max(0,p.healthDelay-dt);if(p.healthDelay===0&&!p.missionCombat)p.health=Math.min(p.maxHealth,p.health+dt*2);}}
 function serialize(){return population.filter(p=>p.health<p.maxHealth||p.dead||p.missionDead).map(p=>({id:p.id,health:p.dead||p.missionDead?0:p.health,delay:p.healthDelay,dead:!!(p.dead||p.missionDead),...(p.dead||p.missionDead?{position:p.deathPosition??{x:p.x,z:p.z,heading:p.heading??0}}:{})}));}
 function restore(data){if(!Array.isArray(data))return;for(const r of data){const p=byId.get(r?.id);if(p&&Number.isFinite(r.health)&&r.health>=0&&r.health<=p.maxHealth&&Number.isFinite(r.delay)&&r.delay>=0&&r.delay<=20){if(p.dead||p.missionDead)continue;p.health=r.health;p.healthDelay=r.delay;if(r.dead===true||r.health===0){const q=r.position;if(q&&Number.isFinite(q.x)&&Number.isFinite(q.z)&&Math.abs(q.x)<=200&&Math.abs(q.z)<=200&&Number.isFinite(q.heading)){p.x=q.x;p.z=q.z;p.heading=q.heading;}markResidentDead(p);}}}}
 return{damage,update,serialize,restore};
}
