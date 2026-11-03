import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {DRAGON_RAID,DRAGON_PLAZA,dragonAlarm,dragonPhase} from '../dragon-encounter.js';
import {createDragonEmergency,isDragonDefender} from '../dragon-emergency.js';
import {createDragon} from '../dragon.js';import {createWorld} from '../world.js';
import {createAssemblyNavigation} from '../assembly-navigation.js';
import {createTownPopulation} from '../town-population.js';import {createHistories} from '../stories.js';
import {createSocialSystem} from '../social.js';import {createVillageWork} from '../resident-work.js';
import {createRoyalCourt} from '../royal-court.js';import {blocked} from '../simulation.js';
import {residentThought} from '../resident-thoughts.js';import {createMotion,updateMotion} from '../sprite-motion.js';
import {createPlayerDuel} from '../duels.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const world=createWorld(new T.Scene()),nav=createAssemblyNavigation(world.obstacles);
const town=()=>createHistories(createTownPopulation());
test('dragon descends, spends over 30 seconds at low plaza altitude, then climbs and leaves twice a day',()=>{
 const d=createDragon(new T.Scene(),world.buildings,{textureLoader:{load(url,done){done(new T.Texture());}}});assert.equal(dragonAlarm(9),null);assert.equal(dragonPhase(.26),'descending');assert.equal(dragonPhase(.4),'attacking');assert.equal(dragonPhase(.73),'ascending');assert.equal(dragonPhase(.9),'departing');assert.ok((DRAGON_RAID.ascend-DRAGON_RAID.attack)*90>30);
 for(const t of [.35,.45,.6,.68]){const p=d.point(t);assert.ok(Math.hypot(p.x-DRAGON_PLAZA.x,p.z-DRAGON_PLAZA.z)<.001);assert.ok(p.y>6&&p.y<7);}
 for(let t=0;t<=1;t+=.002){const p=d.point(t);for(const b of world.buildings)if(Math.abs(p.x-b.x)<b.w/2&&Math.abs(p.z-b.z)<b.d/2)assert.ok(p.y>=(b.kind==='church'?19:b.kind==='castle'?10:b.h+b.w*.4)+5.9);}
 assert.ok(dragonAlarm(10.2));assert.ok(dragonAlarm(17.2));assert.equal(dragonAlarm(10.4),null);
});
test('low dragon aims its fire down at a resident, and the plume stops at ground level',()=>{
 const d=createDragon(new T.Scene(),[],{textureLoader:{load(url,done){done(new T.Texture());}}}),target={x:-3,y:1.1,z:1},observer={x:-25,y:1.72,z:10};let t=.35;while(t<.65){d.update(10+t*.5,observer,{target});if(d.fireActive&&d.fire.mesh.material.uniforms.uStrength.value>.9)break;t+=.001;}assert.ok(t<.65);assert.equal(d.phase,'attacking');assert.ok(Math.abs(d.heading-Math.atan2(target.x-DRAGON_PLAZA.x,target.z-DRAGON_PLAZA.z))<1e-10);
 const pos=d.fire.mesh.geometry.attributes.position,uv=d.fire.mesh.geometry.attributes.uv,centers=[new T.Vector3(),new T.Vector3()],counts=[0,0];for(let i=0;i<pos.count;i++){const u=uv.getX(i);if(u===0||u===1){const k=u===0?0:1;centers[k].add(new T.Vector3().fromBufferAttribute(pos,i));counts[k]++;}}centers.forEach((p,i)=>p.divideScalar(counts[i]));assert.ok(centers[1].y<centers[0].y);assert.ok(centers[1].y>=.119);assert.ok(centers[1].clone().sub(centers[0]).normalize().dot(new T.Vector3(target.x,target.y,target.z).sub(centers[0]).normalize())>.999);const before=Array.from(pos.array);d.update(10+t*.5,observer,{target});assert.deepEqual(Array.from(pos.array),before);
});
test('all 200 residents react: 197 flee safely, three strongmen confront the dragon, and paid work survives',()=>{
 const p=town(),social=createSocialSystem(p),work=createVillageWork(p,{obstacles:world.obstacles}),court=createRoyalCourt(p,world.obstacles);for(let i=0;i<400;i++){work.update(.1,9.9);court.update(.1,9.9);}const origins=new Map(p.map(p=>[p.id,{x:p.x,z:p.z,path:[...p.path],node:p.node,remaining:p.duty.remaining,paid:p.duty.inputPaid,cargo:JSON.stringify(p.duty.cargo)}]));let alarms=0;const raid=createDragonEmergency(p,{obstacles:world.obstacles,navigation:nav,social,onAlarm:()=>alarms++});raid.update(.05,10.13);assert.equal(alarms,1);assert.equal(raid.members.size,200);assert.equal(raid.summary().defenders,3);assert.equal(raid.summary().fleeing,197);assert.ok(p.every(p=>p.emergencySpeed>p.speed));assert.equal(new Set(p.filter(isDragonDefender).map(p=>p.spriteId)).size,1);assert.equal(social.begin(p[1],p[2],10),false);assert.equal(createPlayerDuel().start(p.find(isDragonDefender)),false);
 const saved=work.serialize();for(const entry of saved.residents){const o=origins.get(entry.id);assert.equal(entry.x,o.x);assert.equal(entry.z,o.z);}let mostSafe=0,mostBrave=0,punches=0,cries=0,releaseCount=0;
 for(let i=1;i<4000&&raid.active;i++){const old=new Map(p.filter(p=>p.dragonEmergency).map(p=>[p.id,{x:p.x,z:p.z}]));const hour=10.13+i*.05/180;raid.update(.05,hour);const summary=raid.summary();mostSafe=Math.max(mostSafe,summary.safe);mostBrave=Math.max(mostBrave,summary.confronting);cries+=raid.bubbles({x:-13,z:-3}).length;
  for(const a of p){if(a.dragonEmergency){const o=origins.get(a.id);assert.equal(a.duty.remaining,o.remaining);assert.equal(a.duty.inputPaid,o.paid);assert.equal(JSON.stringify(a.duty.cargo),o.cargo);assert.equal(a.node,o.node);assert.deepEqual(a.path,o.path);const prior=old.get(a.id);assert.ok(Math.hypot(a.x-prior.x,a.z-prior.z)<=a.emergencySpeed*.05+1e-7);if(i%15===0)assert.equal(blocked(a.x,a.z,world.obstacles,.15),false,`unsafe ${a.id} at ${a.x},${a.z}`);if(a.dragonPunchTime!==undefined){const m=createMotion(a);updateMotion(m,a,.05);assert.equal(m.action,'punch');punches++;assert.equal(residentThought(a).icon,'🥊');}}
   else if(old.has(a.id)){releaseCount++;assert.ok(Math.hypot(a.x-origins.get(a.id).x,a.z-origins.get(a.id).z)<1e-6);}
  }
  work.update(.05,hour);court.update(.05,hour);
 }
 assert.equal(raid.active,false);assert.equal(raid.completed,1);assert.equal(releaseCount,200);assert.ok(mostSafe>150);assert.equal(mostBrave,3);assert.ok(punches>0);assert.ok(cries>0);assert.ok(p.every(p=>!p.dragonEmergency&&p.dragonPunchTime===undefined&&p.emergencySpeed===undefined));assert.ok(Object.values(work.stock).every(n=>n>=0));
 const loaded=town(),restored=createVillageWork(loaded,{obstacles:world.obstacles});assert.ok(restored.restore(JSON.parse(JSON.stringify(saved)),10.2));for(const a of loaded)assert.equal(a.duty.inputPaid,origins.get(a.id).paid);const rerun=createDragonEmergency(loaded,{navigation:nav,social:createSocialSystem(loaded)});rerun.update(.05,10.2);assert.equal(rerun.members.size,200);
});
test('pausing, seeking away and returning to the same raid preserves origins and does not duplicate alarms each tick',()=>{
 const p=town(),raid=createDragonEmergency(p,{navigation:nav,social:createSocialSystem(p)});raid.update(.1,10.2);const original=raid.members.get(p[0].id).origin,pos=p.map(p=>[p.x,p.z]);raid.update(0,10.2);assert.deepEqual(p.map(p=>[p.x,p.z]),pos);raid.update(.1,11);assert.equal(raid.phase,'returning');raid.update(.1,10.2);assert.equal(raid.phase,'alarm');assert.deepEqual(raid.members.get(p[0].id).origin,original);assert.equal(raid.members.size,200);assert.equal(residentThought(p[0]).icon,'😱');
});
