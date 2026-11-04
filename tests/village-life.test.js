import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createVillageLife,LIFE_SCENES} from '../village-life.js';
import {createLifeVisuals} from '../life-visuals.js';
import {createTownPopulation} from '../town-population.js';
import {createHistories} from '../stories.js';
import {createHealthSystem} from '../health.js';
import {createVillageWork} from '../resident-work.js';
import {createSocialSystem} from '../social.js';
import {createAssemblies} from '../assemblies.js';
import {createRoyalCourt} from '../royal-court.js';
import {createWorld} from '../world.js';
import {createAssemblyNavigation} from '../assembly-navigation.js';
import {createDragonEmergency} from '../dragon-emergency.js';
import {blocked} from '../simulation.js';
import {appearanceFor} from '../appearance.js';
import {WALK_TYPES} from '../animation-frames.js';
import {hasResidentActions} from '../resident-actions.js';
import {residentThought} from '../resident-thoughts.js';
import {createMotion,updateMotion} from '../sprite-motion.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const world=createWorld(new T.Scene()),navigation=createAssemblyNavigation(world.obstacles);
const can=(p,action)=>hasResidentActions(WALK_TYPES[appearanceFor(p).row],action);
function setup(){const p=createHistories(createTownPopulation()),health=createHealthSystem(p),social=createSocialSystem(p),assembly=createAssemblies(p,{navigation,obstacles:world.obstacles,social}),work=createVillageWork(p,{obstacles:world.obstacles});createRoyalCourt(p,world.obstacles);const life=createVillageLife(p,{navigation,social,canPunch:p=>can(p,'punch'),canJump:p=>can(p,'jump'),onDamage:health.damage});return{p,health,social,assembly,work,life};}
function advance(s,{autonomous=false,hour=9,busy=false,dt=.2}={}){s.life.update(dt,hour,{autonomous,busy});s.health.update(dt);s.social.update(dt,hour,{allowNew:false});s.work.update(dt,hour);}
for(const kind of Object.keys(LIFE_SCENES))test(`${kind}: participants walk to a real scene, interact and return without losing paid work`,()=>{
 const s=setup();assert.ok(s.life.start(kind),`cannot start ${kind}`);const group=s.life.activities[0],ids=group.members.map(m=>m.p.id),origins=new Map(group.members.map(m=>[m.p.id,{...m.origin,node:m.p.node,path:[...m.p.path],remaining:m.p.duty.remaining,paid:m.p.duty.inputPaid}]));let acting=false,visible=false,punch=false;
 for(let i=0;i<1600&&s.life.activities.length;i++){
  const old=new Map(group.members.map(m=>[m.p.id,{x:m.p.x,z:m.p.z}]));s.life.update(.2,9,{autonomous:false});acting||=group.phase==='acting';visible||=s.life.bubbles().length>0;
  for(const m of group.members){const p=m.p,o=origins.get(p.id);assert.ok(Math.hypot(p.x-old.get(p.id).x,p.z-old.get(p.id).z)<=.49);assert.equal(blocked(p.x,p.z,world.obstacles,.15),false);assert.equal(p.duty.remaining,o.remaining);assert.equal(p.duty.inputPaid,o.paid);assert.equal(p.node,o.node);assert.deepEqual(p.path,o.path);punch||=p.duelPose?.punchTime!==undefined;if(LIFE_SCENES[kind].children)assert.ok(p.age<16);else assert.ok(p.age>=18);}
  s.health.update(.2);s.work.update(.2,9);
 }
 assert.equal(s.life.activities.length,0);assert.ok(acting);assert.ok(visible);assert.equal(s.life.summary().completed,1);assert.equal(s.social.journal.length,1);if(kind==='quarrel')assert.ok(punch);
 for(const id of ids){const p=s.p.find(p=>p.id===id);assert.equal(p.lifeActivity,undefined);assert.ok(s.life.relationships(id).length);}
});
test('autonomous scenes include romance, affairs, quarrels, games and consequences while work continues',()=>{
 const s=setup(),seen=new Set();let tagged=false,damaged=false;
 for(let i=0;i<6000;i++){advance(s,{autonomous:true});for(const g of s.life.activities){seen.add(g.kind);tagged||=g.tags>0;for(const m of g.members)damaged||=m.p.health<m.p.maxHealth;assert.ok(s.life.activities.length<=4);} }
 for(const kind of ['romance','affair','quarrel','tag','hide','ball','dance','jealousy','apology'])assert.ok(seen.has(kind),`missing ${kind}: ${[...seen]}`);
 assert.ok(tagged);assert.ok(damaged);assert.ok(s.work.summary().delivered>25);assert.ok(s.life.summary().completed>10);assert.ok(s.p.filter(p=>p.royalGuard||p.courtSeat).every(p=>!p.lifeActivity));
});
test('romance rejects minors and kin; existing partners and unrelated adults can meet',()=>{
 const s=setup(),child=s.p.find(p=>p.age<16),adult=s.p.find(p=>p.age>=18&&!p.royalGuard&&!p.courtSeat),partner=s.p.find(p=>p.id===adult.partnerId);
 assert.equal(s.life.start('romance',[child.id,adult.id]),false);assert.equal(s.life.start('affair',[child.id,adult.id]),false);assert.equal(s.life.start('romance',[adult.id,999999]),false);
 if(partner)assert.equal(s.life.start('affair',[adult.id,partner.id]),false);
 const siblings=s.p.filter(p=>p.familyId===adult.familyId&&p.age>=18&&p.id!==adult.id&&p.id!==adult.partnerId);if(siblings.length)assert.equal(s.life.start('dance',[adult.id,siblings[0].id]),false);
});
test('a dragon alarm interrupts games, owns movement and returns everyone before work resumes',()=>{
 const s=setup();assert.ok(s.life.start('tag'));const group=s.life.activities[0],origins=new Map(group.members.map(m=>[m.p.id,{...m.origin}]));for(let i=0;i<100;i++)advance(s);
 const raid=createDragonEmergency(s.p,{navigation,social:s.social,onDamage:s.health.damage});let alerted=false;
 for(let i=0;i<4500;i++){const hour=10.13+i*.1/180;raid.update(.1,hour);alerted||=raid.active;const pos=new Map(group.members.map(m=>[m.p.id,{x:m.p.x,z:m.p.z}]));s.life.update(.1,hour,{busy:raid.active,autonomous:false});if(raid.active)for(const m of group.members)assert.deepEqual({x:m.p.x,z:m.p.z},pos.get(m.p.id));s.health.update(.1);s.work.update(.1,hour);if(alerted&&!raid.active&&!s.life.activities.length)break;}
 assert.equal(raid.active,false);assert.equal(s.life.activities.length,0);assert.equal(s.life.summary().completed,0);for(const [id]of origins)assert.equal(s.p.find(p=>p.id===id).lifeActivity,undefined);
});
test('save/reload keeps original work locations and relationships without persisting actor locks',()=>{
 const s=setup();assert.ok(s.life.start('friendship'));for(let i=0;i<1500&&s.life.activities.length;i++)advance(s);assert.equal(s.life.summary().completed,1);
 const data=JSON.parse(JSON.stringify(s.life.serialize())),restored=setup();assert.ok(restored.life.restore(data));assert.equal(restored.life.summary().completed,1);assert.equal(restored.life.journal.length,1);assert.equal(restored.life.summary().bonds,s.life.summary().bonds);assert.ok(restored.p.every(p=>!p.lifeActivity));
 assert.ok(s.life.start('ball'));for(let i=0;i<50;i++)advance(s);const saved=s.work.serialize();for(const m of s.life.activities[0].members){const r=saved.residents.find(r=>r.id===m.p.id);assert.equal(r.x,m.origin.x);assert.equal(r.z,m.origin.z);}
 const bad={...data,bonds:[{a:s.p[0].id,b:s.p.find(p=>p.age>=18).id,affinity:100,trust:100,meetings:3,lastKind:'affair'}]};assert.ok(restored.life.restore(bad));assert.ok(restored.life.relationships(s.p[0].id).every(b=>b.lastKind!=='affair'));
});
test('ball batches and social jump poses are finite and active thoughts describe the real scene',()=>{
 const s=setup();assert.ok(s.life.start('ball'));for(let i=0;i<1000&&s.life.activities[0].phase!=='acting';i++)advance(s);advance(s);
 const poses=s.p.map(createMotion),visuals=createLifeVisuals(new T.Scene(),s.life,s.p,poses,world.heightAt);visuals.update({x:-18,z:0});for(const mesh of [visuals.balls,visuals.seams])for(const n of mesh.instanceMatrix.array)assert.ok(Number.isFinite(n));
 const p=s.life.activities[0].members[0].p;assert.equal(residentThought(p).label,LIFE_SCENES.ball.title);p.lifeAction={action:'jump',time:.2};const m=createMotion(p);updateMotion(m,p,.05);assert.equal(m.action,'jump');delete p.lifeAction;updateMotion(m,p,.05);assert.equal(m.action,null);
});
test('a noon gathering interrupts a scene and releases everyone after the public meeting',()=>{
 const s=setup();assert.ok(s.life.start('dance'));for(let i=0;i<50;i++)advance(s);s.assembly.update(0,0,12);let met=false;
 for(let i=0;i<4000;i++){s.assembly.update(.25,.25,12);if(s.assembly.phase==='daily'){met=true;s.assembly.advanceTurn();}s.life.update(.25,12,{busy:s.assembly.active,autonomous:false});s.work.update(.25,12);if(met&&!s.assembly.active&&!s.life.activities.length)break;}
 assert.ok(met);assert.equal(s.life.activities.length,0);assert.equal(s.life.summary().completed,0);assert.ok(s.p.every(p=>!p.lifeActivity&&!p.assembly));
});
test('NPCs still complete all five missions while social scenes run autonomously',async()=>{
 const {createMissions}=await import('../missions.js'),{createNPCMissions}=await import('../npc-missions.js'),s=setup(),campaign=createMissions({population:s.p}),completed=new Set(),npcs=createNPCMissions(s.p,{campaign,navigation,health:s.health,onComplete:m=>completed.add(m.id)});let sawSocial=false;
 for(let i=0;i<36000&&(completed.size<5||npcs.jobs.length);i++){
  s.life.update(.1,9,{autonomous:true});npcs.update(.1,{hour:9});s.health.update(.1);s.work.update(.1,9);sawSocial||=s.life.summary().completed>0;
  for(const job of npcs.jobs)assert.equal(job.person.lifeActivity,undefined,'a quest actor cannot be owned by a social scene');
 }
 assert.equal(completed.size,5);assert.ok(sawSocial);assert.ok(campaign.dragonPact);assert.ok(campaign.kingDead);
});
