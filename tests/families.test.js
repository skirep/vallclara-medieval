import test from 'node:test';import assert from 'node:assert/strict';
import {createPopulation,updatePerson,nodes} from '../simulation.js';
import {familiesOf,relationLabel} from '../families.js';
import {createHistories} from '../stories.js';
import {createMotion,updateMotion,stableView,angleDelta} from '../sprite-motion.js';

test('500 residents form 100 named households with reciprocal coherent relationships',()=>{
 const p=createHistories(createPopulation()),families=familiesOf(p);
 assert.equal(families.length,100);assert.equal(new Set(families.map(f=>f.surname)).size,100);
 assert.equal(new Set(p.map(x=>x.name)).size,500);
 assert.equal(new Set(families.map(f=>`${f.homeX}:${f.homeZ}`)).size,100);
 assert.equal(new Set(p.map(m=>`${m.x}:${m.z}`)).size,500);
 for(const family of families){
  const members=family.memberIds.map(id=>p[id]);assert.equal(members.length,5);
  assert.equal(members.filter(m=>m.age<16).length,2);
  assert.equal(members.filter(m=>m.age>=60).length,1);
  for(const m of members){
   assert.equal(m.home,family.home);assert.equal(m.surname,family.surname);assert.equal(m.story.household,family.household);
   assert.ok(m.story.biography.includes(family.surname));
   for(const id of m.parentIds){assert.ok(p[id].childIds.includes(m.id));assert.ok(p[id].age-m.age>=18);}
   for(const id of m.childIds)assert.ok(p[id].parentIds.includes(m.id));
   if(m.partnerId!==null){assert.equal(p[m.partnerId].partnerId,m.id);assert.ok(!m.parentIds.some(id=>p[m.partnerId].parentIds.includes(id)));}
  }
  assert.match(relationLabel(members[0],members[4]),/avi|àvia/);
  assert.match(relationLabel(members[4],members[0]),/net/);
 }
});
test('families gather at shared home nodes in the evening without teleporting',()=>{
 const p=createPopulation();
 for(let tick=0;tick<1200;tick++)for(const m of p)updatePerson(m,.5,10);
 assert.ok(p.filter(m=>m.node!==m.home).length>100,'daytime routines must leave home before testing return');
 for(let tick=0;tick<3600;tick++)for(const m of p){const x=m.x,z=m.z;updatePerson(m,.5,19);assert.ok(Math.hypot(m.x-x,m.z-z)<=m.speed*.5+.00001);}
 for(const m of p){assert.equal(m.node,m.home);assert.ok(Math.hypot(m.x-m.family.homeX,m.z-m.family.homeZ)<3);}
});
test('motion blends start/stop and follows simulation without snapping; turning uses shortest arc',()=>{
 const p=createPopulation()[2],m=createMotion(p);p.state='walking';p.x+=1;p.heading=Math.PI*2-.05;m.heading=.05;
 const oldX=m.x;updateMotion(m,p,1/120);
 assert.ok(m.x>oldX&&m.x<p.x);assert.ok(m.walk>0&&m.walk<.1);assert.ok(Math.abs(angleDelta(.05,m.heading))<.05);
 for(let i=0;i<240;i++)updateMotion(m,p,1/120);
 assert.ok(m.walk>.999);p.state='talking';const phase=m.phase;updateMotion(m,p,1/120);
 assert.ok(m.walk>.9);assert.ok(m.talk>0&&m.talk<.1);assert.notEqual(m.phase,phase);
 for(let i=0;i<240;i++)updateMotion(m,p,1/120);assert.ok(m.walk<.0001&&m.talk>.999);
});
test('render envelopes are independent of 30 versus 120 fps and directional seams have hysteresis',()=>{
 const p=createPopulation()[2];p.state='walking';const a=createMotion(p),b=createMotion(p);
 for(let i=0;i<30;i++)updateMotion(a,p,1/30);for(let i=0;i<120;i++)updateMotion(b,p,1/120);
 assert.ok(Math.abs(a.walk-b.walk)<.00001);
 const m=createMotion(p);assert.equal(stableView(m,0,.70),0);
 for(const angle of [.76,.80,.79,.82,.77])assert.equal(stableView(m,0,angle),0);
 assert.equal(stableView(m,0,1.1),3);assert.equal(stableView(m,0,.8),3);
});
