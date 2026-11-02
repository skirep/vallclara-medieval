import test from 'node:test';import assert from 'node:assert/strict';
import * as T from 'three';
import {createWorld} from '../world.js';import {createPopulation,blocked} from '../simulation.js';import {createHistories} from '../stories.js';
import {createSocialSystem} from '../social.js';import {createAssemblies} from '../assemblies.js';import {createVillageClock} from '../village-clock.js';import {createVillageWork} from '../resident-work.js';import {createWorkVisuals} from '../work-visuals.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){},fillText(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
test('actual workplaces and delivery routes remain safe through a noon assembly and preserve paid work',()=>{
 const scene=new T.Scene(),world=createWorld(scene),p=createHistories(createPopulation()),social=createSocialSystem(p),clock=createVillageClock(),assembly=createAssemblies(p,{social,obstacles:world.obstacles}),work=createVillageWork(p,{obstacles:world.obstacles});
 let completedBefore=0,sawMeeting=false;
 for(let i=0;i<3000;i++){
  clock.advance(.5,assembly.clockLimit);assembly.update(.5,.5,clock.hours);social.update(.5,clock.hour,{allowNew:false});work.update(.5,clock.hours);
  if(assembly.phase==='daily'){
   sawMeeting=true;if(!completedBefore)completedBefore=work.summary().delivered;
   assert.equal(work.summary().delivered,completedBefore);
   assembly.advanceTurn();
  }
  if(i%50===0)for(const person of p)assert.equal(blocked(person.x,person.z,world.obstacles,.15),false,`blocked work route for ${person.id} at ${person.x},${person.z}`);
  if(sawMeeting&&!assembly.active&&clock.hour>13)break;
 }
 assert.ok(sawMeeting);assert.equal(assembly.completed,1);assert.ok(work.summary().delivered>completedBefore);assert.match(assembly.priest.name,/Mossèn/);
 const visuals=createWorkVisuals(scene,p,work.sites);visuals.update(new T.Vector3(0,1.7,0));
 scene.traverse(o=>{if(o.isInstancedMesh)for(const n of o.instanceMatrix.array)assert.ok(Number.isFinite(n));});
});
test('work interrupted across midnight restores the original paid recipe and survives seeking time',()=>{
 const p=createHistories(createPopulation()),work=createVillageWork(p);for(let i=0;i<300;i++)work.update(1,9+i/180);
 const candidate=p.find(p=>p.duty.inputPaid);assert.ok(candidate);const taskId=candidate.duty.task.id;
 work.update(0,24);const saved=JSON.parse(JSON.stringify(work.serialize())),p2=createHistories(createPopulation()),restored=createVillageWork(p2);assert.ok(restored.restore(saved,24));assert.equal(p2[candidate.id].duty.task.id,taskId);assert.equal(p2[candidate.id].duty.inputPaid,true);
 const clock=createVillageClock();clock.restoreHours(24);assert.equal(clock.hours,24);clock.seek(11);assert.equal(clock.hours,35);clock.restoreHours(NaN);assert.equal(clock.hours,35);
});
