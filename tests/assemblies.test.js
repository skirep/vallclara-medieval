import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createWorld} from '../world.js';
import {createPopulation,updatePerson,blocked} from '../simulation.js';
import {createHistories} from '../stories.js';
import {createSocialSystem} from '../social.js';
import {createAssemblies,nextAssemblyTime} from '../assemblies.js';
import {createVillageClock,formatHour,validTimeRate} from '../village-clock.js';
import {createAssemblyNavigation} from '../assembly-navigation.js';
import {lanes} from '../simulation.js';
import {createMotion,updateMotion} from '../sprite-motion.js';

const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{getContext(){return ctx;}};}};
const world=createWorld(new T.Scene());

test('clock covers midnight, respects assembly holds, and validates user speed settings',()=>{
 const clock=createVillageClock(23.9);clock.advance(36);assert.equal(formatHour(clock.hour),'00:06');
 const before=clock.hours;clock.advance(180,24.2);assert.equal(clock.hours,24.2);assert.ok(clock.hours>=before);
 clock.seek(6);assert.equal(clock.hour,6);assert.equal(nextAssemblyTime(clock.hours),36);
 assert.deepEqual([0,.25,1,4,8].map(validTimeRate),[0,.25,1,4,8]);
 for(const v of [-1,9,NaN,Infinity,'corrupt','',null,true])assert.equal(validTimeRate(v),1);
});

test('500 villagers gather without teleporting, listen together, disperse and repeat six game hours later',()=>{
 const people=createHistories(createPopulation()),social=createSocialSystem(people),clock=createVillageClock();
 const assembly=createAssemblies(people,{obstacles:world.obstacles,social});
 assert.match(assembly.priest.name,/^Mossèn /);assert.equal(people.filter(p=>p.role==='priest').length,1);
 const heard=[],dt=.5;let previousPhase='idle',steps=0;
 while(assembly.completed<4&&steps++<16000){
  const old=people.map(p=>({x:p.x,z:p.z}));
  clock.advance(dt,assembly.clockLimit);assembly.update(dt,dt/8,clock.hours);
  for(const [i,p] of people.entries()){
   if(!p.assembly&&!p.assemblyReleased)updatePerson(p,dt,clock.hour);
   assert.ok(Math.hypot(p.x-old[i].x,p.z-old[i].z)<=p.speed*dt+1e-7,`teleport ${p.id}`);
  }
  if(steps%100===0&&assembly.phase==='gathering')for(const p of people)assert.equal(blocked(p.x,p.z,world.obstacles,.34),false,`path crossed an obstacle for ${p.id}`);
  if(assembly.phase==='sermon'&&previousPhase!=='sermon'){
   heard.push(clock.hours);assert.equal(assembly.attending,500);
   assert.equal(new Set(people.map(p=>`${p.x.toFixed(5)}:${p.z.toFixed(5)}`)).size,500);
   for(const p of people){assert.ok(Math.abs(p.x)<20&&Math.abs(p.z)<20);assert.equal(blocked(p.x,p.z,world.obstacles,.34),false);}
   assert.equal(assembly.bubbles()[0].person,assembly.priest);assert.ok(assembly.bubbles()[0].text.length>10);
   assert.equal(social.begin(people[0],people[1],clock.hour),false);
  }
  if(assembly.phase==='sermon'){const h=clock.hours;clock.advance(1,assembly.clockLimit);assert.equal(clock.hours,h);}
  previousPhase=assembly.phase;
 }
 assert.equal(assembly.completed,4);assert.deepEqual(heard,[12,18,24,30]);
 assert.equal(social.journal.length,0);
});

test('private conversations are interrupted without inventing completed social memories',()=>{
 const p=createHistories(createPopulation(10)),social=createSocialSystem(p);p[0].social.cooldown=p[1].social.cooldown=0;
 assert.ok(social.begin(p[0],p[1],9));social.interruptAll();
 assert.equal(social.active.length,0);assert.equal(social.journal.length,0);assert.equal(p[0].social.conversation,null);
 social.update(1,9,{allowNew:false});assert.equal(social.active.length,0);
});

test('seeking the time during a gathering safely returns people before scheduling a new event',()=>{
 const people=createHistories(createPopulation()),clock=createVillageClock(),social=createSocialSystem(people);
 const assembly=createAssemblies(people,{obstacles:world.obstacles,social});
 const original=people.map(p=>({x:p.x,z:p.z}));
 for(let i=0;i<100;i++)assembly.update(.5,.5,9);
 assert.equal(assembly.phase,'gathering');clock.seek(1);assembly.seek(clock.hours);
 assert.equal(assembly.phase,'dispersing');assert.equal(assembly.nextAt,6);
 for(let i=0;i<1000&&assembly.active;i++)assembly.update(.5,.5,clock.hours);
 assert.equal(assembly.phase,'idle');assert.equal(assembly.completed,0);
 for(const [i,p] of people.entries()){
  assert.equal(p.assembly,false);assert.ok(Math.hypot(p.x-original[i].x,p.z-original[i].z)<1e-7);
 }
});

test('animation phase follows time speed while render smoothing stays independent',()=>{
 const p=createPopulation()[2];p.state='walking';const a=createMotion(p),b=createMotion(p),paused=createMotion(p);
 const phase=a.phase;updateMotion(a,p,1/60,1);updateMotion(b,p,1/60,4);updateMotion(paused,p,1/60,0);
 assert.ok(Math.abs((b.phase-phase)-4*(a.phase-phase))<1e-10);assert.equal(paused.phase,phase);assert.equal(a.walk,b.walk);
});


test('residents sharing a departure point choose different safe streets without excessive detours',()=>{
 const nav=createAssemblyNavigation(world.obstacles),from={x:-78,z:-78},to={x:0,z:0};
 const length=points=>points.reduce((sum,p,i)=>sum+Math.hypot(p.x-(i?points[i-1]:from).x,p.z-(i?points[i-1]:from).z),0);
 const shortest=length(nav.path(from,to,{diversity:false,recordTraffic:false}));
 const street=value=>lanes.reduce((best,lane)=>Math.abs(value-lane)<Math.abs(value-best)?lane:best,lanes[0]);
 const routes=[],streets=new Set();
 for(let seed=0;seed<24;seed++){
  const route=nav.path(from,to,{seed});routes.push(route);
  const signature=route.map(p=>`${street(p.x)}:${street(p.z)}`).filter((s,i,a)=>!i||s!==a[i-1]).join('/');streets.add(signature);
  assert.ok(length(route)<=shortest*1.45+1e-7,`unnecessary detour for ${seed}`);
  assert.deepEqual(route.at(-1),to);
  for(let i=0;i<route.length;i++)assert.ok(nav.segmentClear(i?route[i-1]:from,route[i]),`unsafe segment for ${seed}`);
 }
 assert.ok(streets.size>=3,`expected different street choices, got ${streets.size}`);
 assert.ok(new Set(routes.map(route=>JSON.stringify(route))).size>=12);
 nav.resetTraffic();
 assert.deepEqual(nav.path(from,to,{seed:0}),routes[0],'resetting a gathering must make route planning reproducible');
});
