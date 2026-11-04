import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createWorld} from '../world.js';
import {blocked,nodes,random,createPopulation} from '../simulation.js';
import {createTownPopulation} from '../town-population.js';
import {createHistories} from '../stories.js';
import {addFeaturedResidents} from '../featured-residents.js';
import {addNewcomers} from '../newcomers.js';
import {addRoyalGuards} from '../royal-guard.js';
import {createMissions} from '../missions.js';
import {createVillageWork} from '../resident-work.js';
import {createDragon} from '../dragon.js';
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const scene=new T.Scene(),world=createWorld(scene);
test('high-detail architecture is real geometry batched into a bounded render budget',()=>{
 assert.equal(world.architecture.houses,25);assert.ok(world.architecture.tiles>8000);assert.equal(world.architecture.windows,100);assert.ok(world.architecture.castle.stones>1500);assert.equal(world.architecture.castle.towers,4);assert.ok(world.architecture.castle.arches>=18);
 const meshes=scene.children.filter(o=>o.isMesh),triangles=meshes.reduce((n,o)=>n+(o.geometry.index?.count??o.geometry.attributes.position.count)/3,0);
 assert.ok(meshes.length<=45,`${meshes.length} meshes`);assert.ok(triangles<850000,`${triangles} triangles`);
 assert.equal(world.mats.carved.map,world.mats.stone.map,'carved stone reuses the existing PBR atlas');
 for(const column of world.castle.columns)assert.equal(blocked(column.x,column.z,world.obstacles,.15),true);
 for(const house of world.buildings.filter(b=>b.kind==='house'))for(const entry of house.entrances)assert.equal(blocked(entry.x,entry.z,world.obstacles,.4),false);
});
test('reducing the town preserves surviving royal work saves and mission progress of a retired NPC',()=>{
 const old=createHistories(addRoyalGuards(addNewcomers(addFeaturedResidents(createPopulation(167),nodes,random)))),oldWork=createVillageWork(old,{obstacles:world.obstacles}),campaign=createMissions({population:old});
 const retired=old.find(p=>p.id>=55&&p.id<167&&p.age>=18),survivor=old.find(p=>p.spriteId==='king-berenguer');
 survivor.duty.today.completed=1;survivor.duty.today.tasks=['He rebut els missatgers del castell.'];
 assert.ok(campaign.transfer('water',`npc:${retired.id}`));campaign.progress.water.stage=2;
 const saved=oldWork.serialize(),population=createHistories(createTownPopulation()),work=createVillageWork(population,{obstacles:world.obstacles}),quests=createMissions({population});
 assert.equal(population.length,100);assert.ok(work.restore(saved,9));assert.ok(quests.restore(campaign.serialize()));assert.equal(quests.progress.water.stage,2);assert.equal(quests.progress.water.owner,'player');
 assert.equal(population.find(p=>p.id===survivor.id).duty.today.completed,1,'records beyond the smaller population length must still restore');
 const corrupt=quests.serialize();corrupt.progress.water.owner='npc:invalid';assert.equal(quests.restore(corrupt),false);
});
test('dragon flight clears the new tower roofs and royal standards',()=>{
 const dragon=createDragon(new T.Scene(),world.buildings,{textureLoader:{load(url,done){done(new T.Texture());}}});let overCastle=0;
 for(let t=0;t<1;t+=.001){const p=dragon.point(t),b=world.castle;if(Math.abs(p.x-b.x)<b.w/2&&Math.abs(p.z-b.z)<b.d/2){overCastle++;assert.ok(p.y>=b.skyHeight+5.9);}}
 assert.ok(overCastle>0);assert.ok(world.castle.skyHeight>=13);
});
