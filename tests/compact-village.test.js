import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createWorld} from '../world.js';
import {createTownPopulation} from '../town-population.js';
import {createHistories} from '../stories.js';
import {appearanceFor} from '../appearance.js';
import {RESIDENT_ROSTER} from '../resident-roster.js';
import {FEATURED_RESIDENTS} from '../featured-residents.js';
import {CASTLE,CASTLE_ROOMS} from '../castle.js';
import {createRoyalCourt} from '../royal-court.js';
import {createAssemblyNavigation} from '../assembly-navigation.js';
import {createAssemblies} from '../assemblies.js';
import {createVillageWork} from '../resident-work.js';
import {blocked,nodes,route} from '../simulation.js';
import {RIVER,BRIDGE,waterBlocked} from '../terrain.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const world=createWorld(new T.Scene());
test('compact town has exactly 200 identities and retains every completed design and the latest 24 named residents',()=>{
 const p=createHistories(createTownPopulation()),byId=new Map(p.map(p=>[p.id,p]));
 assert.equal(p.length,200);assert.equal(byId.size,200);
 assert.equal(p.filter(p=>!p.character).length,167);assert.deepEqual(p.filter(p=>p.character?.featured).map(p=>p.spriteId),FEATURED_RESIDENTS.map(c=>c.id));
 createAssemblies(p,{obstacles:world.obstacles});
 assert.equal(new Set(p.map(p=>RESIDENT_ROSTER[appearanceFor(p).row].id)).size,RESIDENT_ROSTER.length);
 for(const person of p){assert.equal(blocked(person.x,person.z,world.obstacles,.15),false,`unsafe spawn ${person.id} at ${person.x},${person.z}`);for(const id of [...person.parentIds,...person.childIds,person.story.friendId])assert.ok(byId.has(id));}
});
test('every cross-bank commute uses the stone bridge and the compact street graph stays connected',()=>{
 for(const from of nodes)for(const to of nodes){let previous=from;
  for(const id of route(from.index,to.index)){const next=nodes[id];
   for(let t=0;t<=1;t+=.05)assert.equal(waterBlocked(previous.x+(next.x-previous.x)*t,previous.z+(next.z-previous.z)*t,.8),false);
   if((previous.x<RIVER.x)!==(next.x<RIVER.x))assert.ok(Math.abs(previous.z)<BRIDGE.halfWidth&&Math.abs(next.z)<BRIDGE.halfWidth);
   previous=next;
  }
 }
 assert.ok(world.boundary<=90);
});
test('all eight castle rooms have a safe route through the gate and clear internal doorways',()=>{
 const nav=createAssemblyNavigation(world.obstacles),from={x:36,z:-54};
 for(const room of CASTLE_ROOMS){const target=room.name==='Sala del tron'?{x:36,z:room.z}:room.x<32?{x:30,z:room.z}:room.x>40?{x:42.2,z:room.z}:{x:36,z:room.z};
  const path=nav.path(from,target,{diversity:false});assert.deepEqual(path.at(-1),target,room.name);
  for(let i=0;i<path.length;i++)assert.ok(nav.segmentClear(i?path[i-1]:from,path[i]),room.name);
 }
});
test('king and queen walk into their own thrones, stand for noon, then return without crossing furniture',()=>{
 const p=createHistories(createTownPopulation()),assembly=createAssemblies(p,{obstacles:world.obstacles}),work=createVillageWork(p,{obstacles:world.obstacles}),court=createRoyalCourt(p,world.obstacles);
 for(let i=0;i<900;i++){work.update(.25,10);court.update(.25,10);for(const m of court.members)assert.equal(blocked(m.person.x,m.person.z,world.obstacles,.15),false);}
 for(const m of court.members){assert.equal(m.person.seated,true);assert.ok(Math.hypot(m.person.x-m.seat.x,m.person.z-m.seat.z)<.1);}
 assembly.update(0,0,12);court.update(.25,12);assert.ok(court.members.every(m=>!m.person.seated));
 for(let i=0;i<2000&&assembly.phase==='gathering';i++){assembly.update(.5,.5,12);court.update(.5,12);}
 assert.equal(assembly.phase,'daily');assert.equal(assembly.attending,200);
 while(assembly.phase==='daily')assembly.advanceTurn();
 for(let i=0;i<2000&&assembly.active;i++){assembly.update(.5,.5,13);court.update(.5,13);}
 assert.equal(assembly.active,false);
 for(let i=0;i<900;i++){assembly.update(.25,.25,14);court.update(.25,14);}
 assert.ok(court.members.every(m=>m.person.seated));
});
