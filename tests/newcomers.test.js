import test from 'node:test';
import assert from 'node:assert/strict';
import {createTownPopulation} from '../town-population.js';
import {createHistories} from '../stories.js';
import {canFlirt,flirtConversation} from '../flirt-dialogue.js';
import {writeConversation} from '../social.js';
import {createMotion,updateMotion} from '../sprite-motion.js';
import {hasResidentActions,actionFrame} from '../resident-actions.js';
import {houseRoofPlan,gableGeometry} from '../house-geometry.js';
import * as T from 'three';

test('three adult designs occur exactly three times, with unique identities alongside the royal guard',()=>{
 const p=createHistories(createTownPopulation()),artists=p.filter(p=>p.flirtatious);
 assert.equal(p.length,100);assert.equal(artists.length,9);assert.equal(new Set(p.map(p=>p.id)).size,100);
 for(const id of ['summer-dancer','summer-athlete','summer-blonde']){
  const copies=artists.filter(p=>p.spriteId===id);assert.equal(copies.length,3);assert.equal(new Set(copies.map(p=>p.name)).size,3);
  for(const person of copies){assert.ok(person.age>=27);assert.equal(person.character.category,person.sex?'adult-female':'adult-male');for(const action of ['jump','punch','talk'])assert.equal(hasResidentActions(id,action),true);}
 }
});
test('flirt exchanges stay adult-only; conversations with children use ordinary village dialogue',()=>{
 const p=createHistories(createTownPopulation()),artists=p.filter(p=>p.flirtatious),children=p.filter(p=>p.age<18),adult=p.find(p=>p.age>35);
 for(const a of artists){for(const c of children){assert.equal(canFlirt(a,c),false);assert.equal(canFlirt(c,a),false);assert.equal(flirtConversation(a,c,10),null);assert.deepEqual(writeConversation(a,c,10),writeConversation({...a,flirtatious:false},c,10));}
  const turns=flirtConversation(a,adult,19);assert.equal(turns.length,8);assert.ok(turns.every(t=>[a.id,adult.id].includes(t.speakerId)));assert.notDeepEqual(turns,flirtConversation(a,adult,19,1));
 }
});
test('artists actually perform both action types during work, pause with the clock and stand down for meetings',()=>{
 const p=createTownPopulation().find(p=>p.flirtatious);p.state='working';const m=createMotion(p),seen=new Set();
 for(let i=0;i<60*80;i++){updateMotion(m,p,1/60,1,false);const frame=actionFrame(m,p.spriteId);if(frame)seen.add(frame.action);}
 assert.ok(seen.has('jump'));assert.ok(seen.has('punch'));
 const before=m.practiceTime;updateMotion(m,p,.1,0,false);assert.equal(m.practiceTime,before);
 p.assembly=true;updateMotion(m,p,.1,1,false);assert.equal(m.action,null);
});
test('solid roof slabs cover wall crowns without detached gables, degenerate triangles or inverted faces',()=>{
 for(const w of [6.8,8,9])for(const d of [8,11.2])for(const h of [4.4,6.3]){
  const p=houseRoofPlan(w,d,h);assert.ok(p.eave<h);assert.ok(p.ridge>h);
  for(const slab of p.slabs){assert.ok(slab.h>0&&slab.d>d);const end=slab.y+Math.sin(Math.abs(slab.rz))*slab.w/2;assert.ok(Math.abs(end-p.ridge)<1e-10);}
  const g=gableGeometry(w,d,p.rise-.01),positions=g.attributes.position,normals=g.attributes.normal;
  g.computeBoundingBox();assert.ok(Math.abs(g.boundingBox.min.x+w/2)<1e-5);assert.ok(Math.abs(g.boundingBox.max.x-w/2)<1e-5);assert.ok(g.boundingBox.max.z>g.boundingBox.min.z);
  for(let i=0;i<positions.count;i+=3){const a=new T.Vector3().fromBufferAttribute(positions,i),b=new T.Vector3().fromBufferAttribute(positions,i+1),c=new T.Vector3().fromBufferAttribute(positions,i+2),normal=b.sub(a).cross(c.sub(a));assert.ok(normal.length()>1e-8);assert.ok(normal.dot(new T.Vector3().fromBufferAttribute(normals,i))>0);}
  g.dispose();
 }
});
