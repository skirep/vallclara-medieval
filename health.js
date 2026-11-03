export const maxResidentHealth=p=>p.spriteId==='king-berenguer'?200:p.royalGuard?140:p.age<16?60:p.dragonDefender?120:100;
export function createHealthSystem(population){
 const byId=new Map(population.map(p=>[p.id,p]));
 for(const p of population){p.maxHealth=maxResidentHealth(p);p.health=p.maxHealth;p.healthDelay=0;}
 function damage(p,amount){if(!p||p.missionDead||!Number.isFinite(amount)||amount<=0)return 0;const dealt=Math.min(p.health,amount);p.health=Math.max(0,p.health-amount);p.healthDelay=20;if(p.health===0){p.state='resting';p.path=[];}return dealt;}
 function update(dt){if(!Number.isFinite(dt)||dt<=0)return;for(const p of population){if(p.missionDead){p.health=0;continue;}p.healthDelay=Math.max(0,p.healthDelay-dt);if(p.healthDelay===0&&!p.missionCombat)p.health=Math.min(p.maxHealth,p.health+dt*2);}}
 function serialize(){return population.filter(p=>p.health<p.maxHealth).map(p=>({id:p.id,health:p.health,delay:p.healthDelay}));}
 function restore(data){if(!Array.isArray(data))return;for(const r of data){const p=byId.get(r?.id);if(p&&Number.isFinite(r.health)&&r.health>=0&&r.health<=p.maxHealth&&Number.isFinite(r.delay)&&r.delay>=0&&r.delay<=20){p.health=r.health;p.healthDelay=r.delay;}}}
 return{damage,update,serialize,restore};
}
