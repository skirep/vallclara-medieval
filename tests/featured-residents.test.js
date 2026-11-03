import test from 'node:test';
import assert from 'node:assert/strict';
import {createPopulation,nodes,random} from '../simulation.js';
import {addFeaturedResidents,FEATURED_RESIDENTS} from '../featured-residents.js';
import {createHistories} from '../stories.js';
import {appearanceFor} from '../appearance.js';
import {RESIDENT_ROSTER} from '../resident-roster.js';
import {residentHeight,residentRenderHeight} from '../resident-scale.js';
import {framePlacement} from '../sprite-atlas.js';
import {actionPlacement} from '../resident-actions.js';
import {RESIDENT_LAYOUTS} from '../resident-layouts.js';
import {ACTION_LAYOUTS} from '../action-layouts.js';
import {createAssemblies} from '../assemblies.js';
import {createVillageWork} from '../resident-work.js';

test('24 named residents retain unique portraits, family links and identities after histories and work initialize',()=>{
 const population=createHistories(addFeaturedResidents(createPopulation(),nodes,random));
 assert.equal(population.length,524);assert.equal(new Set(population.map(p=>p.id)).size,524);
 const named=population.filter(p=>p.character);assert.equal(named.length,24);
 createAssemblies(population);const work=createVillageWork(population);
 for(const p of named){
  assert.equal(p.name,p.character.name);assert.equal(RESIDENT_ROSTER[appearanceFor(p).row].id,p.spriteId);
  for(const id of p.parentIds){assert.ok(population[id].childIds.includes(p.id));assert.ok(population[id].age-p.age>=18);}
  if(p.partnerId!==null)assert.equal(population[p.partnerId].partnerId,p.id);
  assert.ok(p.duty&&p.story&&p.family.memberIds.includes(p.id));
 }
 assert.equal(new Set(named.map(p=>p.spriteId)).size,24);
 for(let i=0;i<1200;i++)work.update(.5,10);
 assert.ok(named.some(p=>p.duty.today.completed>0),'named residents join the actual work simulation');
});

test('visible adult height remains constant across source padding, orientations and wide arm gestures',()=>{
 const person={id:514,age:41,sex:0};
 for(const c of RESIDENT_ROSTER)for(let view=0;view<4;view++){
  for(const state of ['walk','idle']){
   const frames=RESIDENT_LAYOUTS[c.id][state][view].frames;
   const p=framePlacement(c.id,view,state==='walk'?0:6,96);
   const visible=Math.max(...frames.map(b=>b.footY-b.y))*p.scale/96;
   const h=residentRenderHeight(person,c.id,view,state==='walk'?0:6);
   assert.ok(Math.abs(h*visible-residentHeight(person))<1e-8,`${c.id}/${state}/${view}`);
  }
  for(const action of Object.keys(ACTION_LAYOUTS[c.id]??{})){
   const frames=ACTION_LAYOUTS[c.id][action][view].frames,p=actionPlacement(c.id,action,view,0,96);
   const visible=Math.max(...frames.map(b=>b.footY-b.y))*p.scale/96;
   const h=residentRenderHeight(person,c.id,view,0,action);
   assert.ok(Math.abs(h*visible-residentHeight(person))<1e-8,`${c.id}/${action}/${view}`);
  }
 }
 for(let id=0;id<500;id++){
  assert.ok(residentHeight({id,age:40,sex:0})>=1.79);
  assert.ok(residentHeight({id,age:40,sex:1})>=1.72);
  assert.ok(residentHeight({id,age:14,sex:0})<1.5);
 }
 assert.equal(FEATURED_RESIDENTS.length,24);
});

test('named standing animation crops retain the whole body in every frame',()=>{
 for(const c of FEATURED_RESIDENTS)for(const [state,rows] of Object.entries({...RESIDENT_LAYOUTS[c.id],...ACTION_LAYOUTS[c.id]})){
  if(state==='jump')continue;
  for(const row of rows){
   const heights=row.frames.map(b=>b.footY-b.y);
   assert.ok(Math.min(...heights)/Math.max(...heights)>.7,`${c.id}/${state}: unexpected head or foot crop`);
  }
 }
});
