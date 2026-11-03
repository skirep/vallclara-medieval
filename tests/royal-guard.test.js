import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createTownPopulation} from '../town-population.js';
import {createHistories} from '../stories.js';
import {createRoyalGuard} from '../royal-guard.js';
import {createWorld} from '../world.js';
import {createAssemblyNavigation} from '../assembly-navigation.js';
import {createAssemblies} from '../assemblies.js';
import {createVillageWork} from '../resident-work.js';
import {createDragonEmergency} from '../dragon-emergency.js';
import {blocked} from '../simulation.js';
import {royalGuardSheet} from '../royal-guard-art.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const world=createWorld(new T.Scene()),nav=createAssemblyNavigation(world.obstacles);
test('12 armed soldiers keep their castle posts during the daily meeting and ordinary work',()=>{
 const p=createHistories(createTownPopulation()),guards=p.filter(p=>p.royalGuard),routine=createRoyalGuard(p,{navigation:nav}),work=createVillageWork(p,{obstacles:world.obstacles}),meeting=createAssemblies(p,{obstacles:world.obstacles});
 assert.equal(guards.length,12);assert.equal(guards.filter(p=>p.royalGuard.weapon==='sword').length,6);assert.equal(guards.filter(p=>p.royalGuard.weapon==='spear').length,6);
 meeting.update(0,0,12);assert.ok(guards.every(p=>!p.assembly));
 for(let i=0;i<800;i++){work.update(.05,12);routine.update(.05,12);for(const p of guards){assert.ok(Math.hypot(p.x-p.royalGuard.post.x,p.z-p.royalGuard.post.z)<2.0);assert.equal(blocked(p.x,p.z,world.obstacles,.15),false);}}
});
test('soldiers mobilise across the bridge, attack with both weapon types and return to the castle twice a day',()=>{
 const p=createHistories(createTownPopulation()),guards=p.filter(p=>p.royalGuard),routine=createRoyalGuard(p,{navigation:nav}),raid=createDragonEmergency(p,{navigation:nav}),attacks=new Set();
 for(const at of [10,17]){
  for(let i=0;i<5500;i++){
   const hour=at+i*.05/180,old=new Map(guards.map(p=>[p.id,{x:p.x,z:p.z}]));raid.update(.05,hour);routine.update(.05,hour);
   for(const p of guards){assert.ok(Math.hypot(p.x-old.get(p.id).x,p.z-old.get(p.id).z)<.28);if(i%20===0)assert.equal(blocked(p.x,p.z,world.obstacles,.15),false);if(p.guardAttackTime!==undefined){attacks.add(p.id);assert.equal(p.dragonPunchTime,undefined);assert.equal(p.dragonEmergency.role,'defender');}}
  }
  assert.equal(raid.active,false);assert.ok(guards.every(p=>!p.dragonEmergency&&p.guardAttackTime===undefined&&Math.hypot(p.x-p.royalGuard.post.x,p.z-p.royalGuard.post.z)<2.0));
 }
 assert.equal(attacks.size,12);assert.equal(raid.completed,2);
});
test('each weapon has a self-contained transparent vector sheet with distinct walk, idle and combat poses',()=>{
 const sword=royalGuardSheet('sword'),spear=royalGuardSheet('spear');assert.notEqual(sword,spear);
 for(const sheet of [sword,spear]){assert.match(sheet,/viewBox="0 0 840 3072"/);assert.equal((sheet.match(/stroke-linejoin="round"/g)||[]).length,72);assert.doesNotMatch(sheet,/https?:\/\/(?!www.w3.org)/);}
 assert.throws(()=>royalGuardSheet('unknown'));
});
test('both guard render groups keep selectable identities and use the weapon attack rows',async()=>{
 const {createPeople}=await import('../people-sprites.js'),p=createHistories(createTownPopulation()),scene=new T.Scene(),people=createPeople(scene,p);
 for(const a of p.filter(p=>p.royalGuard))a.guardAttackTime=.4;
 people.animate(1,new T.Vector3(36,1.7,-54),200);
 for(const weapon of ['sword','spear']){
  const mesh=people.parts['royal-'+weapon];assert.ok(mesh);assert.equal(mesh.count,6);
  for(const index of mesh.userData.residentIndices)assert.equal(p[index].royalGuard.weapon,weapon);
  const frames=mesh.geometry.getAttribute('residentFrame');for(let i=0;i<6;i++){assert.equal(frames.getX(i),3);assert.ok(frames.getY(i)>=8&&frames.getY(i)<12);}
  for(const n of mesh.instanceMatrix.array)assert.ok(Number.isFinite(n));
  const shader={vertexShader:T.ShaderLib.basic.vertexShader,fragmentShader:T.ShaderLib.basic.fragmentShader};mesh.material.onBeforeCompile(shader);assert.match(shader.vertexShader,/11.0-residentFrame.y\)\/12.0/);
 }
});
