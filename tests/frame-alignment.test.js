import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {decodeRGBA} from '../scripts/png-rgba.mjs';
import {WALK_TYPES,IDLE_CYCLE,drawnFrame} from '../animation-frames.js';
import {RESIDENT_LAYOUTS} from '../resident-layouts.js';
import {RESIDENT_ASSETS,RESIDENT_SOURCES} from '../resident-assets.js';
import {cellSize,framePlacement,packWalkAtlas} from '../sprite-atlas.js';
import {createMotion,updateMotion} from '../sprite-motion.js';
import {createPopulation} from '../simulation.js';import {appearanceFor} from '../appearance.js';
const decoded=new Map();
function sourceFor(type,state){const file=RESIDENT_ASSETS[RESIDENT_SOURCES[type][state]].fallback;if(!decoded.has(file))decoded.set(file,decodeRGBA(readFileSync(new URL('../assets/'+file,import.meta.url))));return decoded.get(file);}
test('768 source frames include six distinct walking and idle drawings per orientation',()=>{
 let count=0;
 for(const type of WALK_TYPES)for(const state of ['walk','idle']){
  const {pixels,width,height}=sourceFor(type,state);
  for(const row of RESIDENT_LAYOUTS[type][state]){
   const hashes=row.frames.map(b=>{
    assert.ok(b.x>=0&&b.y>=0&&b.x+b.w<=width&&b.y+b.h<=height);count++;
    const hash=createHash('sha256');for(let y=b.y;y<b.y+b.h;y++)hash.update(pixels.subarray((y*width+b.x)*4,(y*width+b.x+b.w)*4));return hash.digest('hex');
   });assert.equal(new Set(hashes).size,6,`${type}/${state}: repeated drawing`);
  }
 }assert.equal(count,768);
});
test('visible feet and torso anchors remain aligned at all three texture resolutions, with no cell clipping',()=>{
 for(const type of WALK_TYPES)for(const state of ['walk','idle']){
  const {pixels,width}=sourceFor(type,state);
  for(let view=0;view<4;view++)for(let frame=0;frame<6;frame++){
   const slot=frame+(state==='idle'?6:0),b=RESIDENT_LAYOUTS[type][state][view].frames[frame];let bottom=-Infinity;
   for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)if(pixels[(y*width+x)*4+3]>=115)bottom=Math.max(bottom,y+1);
   for(const resolution of [128,192,256]){
    const p=framePlacement(type,view,slot,resolution),cell=cellSize(resolution),row=view+(state==='idle'?4:0);
    assert.ok(Math.abs(p.dy+(bottom-p.sy)*p.scale-(row*cell.height+cell.baseline))<1e-6);
    assert.ok(Math.abs(p.dx+(b.anchorX-p.sx)*p.scale-(frame*cell.width+cell.center))<1e-6);
    assert.ok(p.dx>=frame*cell.width&&p.dx+p.dw<=(frame+1)*cell.width,`${type}/${state}: horizontal clipping`);
    assert.ok(p.dy>=row*cell.height&&p.dy+p.dh<=(row+1)*cell.height+1e-6,`${type}/${state}: vertical clipping`);
   }
  }
 }
});
test('the runtime packs genuine idle artwork separately from walking and fits WebGL 2 minimum texture size',()=>{
 for(const type of WALK_TYPES){
  const calls=[],walk={},idle={},context={drawImage(...args){calls.push(args);}},canvas={getContext(){return context;}};
  packWalkAtlas({walk,idle},type,canvas);
  assert.equal(calls.length,48);assert.ok(canvas.width<=2048&&canvas.height<=2048);
  assert.equal(calls.filter(c=>c[0]===walk).length,24);assert.equal(calls.filter(c=>c[0]===idle).length,24);
 }
});
test('standing villagers continually advance drawn idle frames, remain asynchronous, and freeze only when time is paused',()=>{
 const people=createPopulation(),motion=people.slice(0,20).map(createMotion),seen=new Set();
 for(let i=0;i<Math.ceil(IDLE_CYCLE*180);i++){
  for(let j=0;j<motion.length;j++)updateMotion(motion[j],people[j],1/60,1);
  seen.add(drawnFrame(motion[0]));
 }
 assert.deepEqual([...seen].sort((a,b)=>a-b),[6,7,8,9,10,11]);assert.ok(new Set(motion.map(drawnFrame)).size>1);
 const before=motion.map(m=>m.idleTime);for(let j=0;j<motion.length;j++)updateMotion(motion[j],people[j],1/60,0);
 assert.deepEqual(motion.map(m=>m.idleTime),before);
 people[4].role='priest';assert.equal(appearanceFor(people[4]).row,12);
 assert.equal(new Set(people.map(p=>appearanceFor(p).row)).size,16);
});
