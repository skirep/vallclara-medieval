import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeRGBA} from '../scripts/png-rgba.mjs';
import {ACTION_LAYOUTS,ACTION_SOURCES} from '../action-layouts.js';
import {ACTION_TYPES,ACTION_NAMES,ACTION_DURATIONS,actionFrame,startResidentAction,actionPlacement,combineResidentAtlases,loadActionAtlas} from '../resident-actions.js';
import {createMotion,updateMotion} from '../sprite-motion.js';
import {createPopulation} from '../simulation.js';
import {RESIDENT_ROSTER} from '../resident-roster.js';

test('new action designs have measured, distinct available frames and loadable packed files',()=>{
 assert.equal(ACTION_TYPES.length,7);
 assert.equal(ACTION_TYPES.filter(type=>ACTION_LAYOUTS[type].punch).length,6);
 const cache=new Map();
 for(const type of ACTION_TYPES){
  assert.ok(RESIDENT_ROSTER.some(r=>r.id===type));
  for(const action of Object.keys(ACTION_LAYOUTS[type])){
   assert.equal(ACTION_LAYOUTS[type][action].length,4);
   for(let view=0;view<4;view++){
    const file=ACTION_SOURCES[type][ACTION_LAYOUTS[type][action][view].source??action];
    if(!cache.has(file))cache.set(file,decodeRGBA(readFileSync(new URL('../assets/'+file,import.meta.url))));
    const image=cache.get(file);
    const hashes=[];
    for(let frame=0;frame<6;frame++){
     const p=actionPlacement(type,action,view,frame,96);
     assert.ok(p.sx>=0&&p.sy>=0&&p.sx+p.sw<=image.width&&p.sy+p.sh<=image.height);
     assert.ok(p.dx>=frame*84&&p.dx+p.dw<=(frame+1)*84+1e-6);
     assert.ok(p.dy>=((ACTION_NAMES.indexOf(action)*4+view)*96)-1e-6);
     const hash=createHash('sha256');for(let y=p.sy;y<p.sy+p.sh;y++)hash.update(image.pixels.subarray((y*image.width+p.sx)*4,(y*image.width+p.sx+p.sw)*4));hashes.push(hash.digest('hex'));
    }
    assert.equal(new Set(hashes).size,6,`${type}/${action}/${view}: duplicate frame`);
   }
  }
  for(const height of [64,96]){
   const file=readFileSync(new URL(`../assets/packed/actions-${type}-${height}.webp`,import.meta.url)),chunk=file.indexOf(Buffer.from('VP8L'));
   assert.ok(chunk>=0);const bits=file.readUInt32LE(chunk+9);
   assert.equal((bits&0x3fff)+1,height*.875*6);assert.equal(((bits>>>14)&0x3fff)+1,height*12);
  }
 }
});
test('conversation selects actual talk frames; one-shot actions recover and pause with village time',()=>{
 const person=createPopulation()[0],motion=createMotion(person),type=ACTION_TYPES[0];
 person.state='talking';for(let i=0;i<20;i++)updateMotion(motion,person,1/60,1);
 assert.equal(actionFrame(motion,type).action,'talk');
 for(let i=0;i<30;i++)updateMotion(motion,person,1/60,1,false);
 assert.equal(actionFrame(motion,type),null,'listener must not animate speech');
 for(let i=0;i<20;i++)updateMotion(motion,person,1/60,1,true);
 assert.equal(actionFrame(motion,'baker'),null);
 assert.equal(startResidentAction(motion,'jump'),true);
 const frames=new Set();for(let i=0;i<45;i++){updateMotion(motion,person,1/60,1);frames.add(actionFrame(motion,type).frame);}
 assert.ok(frames.size>=5);assert.equal(actionFrame(motion,type).action,'jump');
 const before=motion.actionTime;updateMotion(motion,person,.1,0);assert.equal(motion.actionTime,before);
 updateMotion(motion,person,.1,2);assert.equal(motion.action,null);assert.equal(actionFrame(motion,type).action,'talk');
 assert.equal(startResidentAction(motion,'punch'),true);
 for(let i=0;i<Math.ceil(ACTION_DURATIONS.punch*60)+1;i++)updateMotion(motion,person,1/60,1);
 assert.equal(motion.action,null);assert.equal(startResidentAction(motion,'attack-with-weapon'),false);
 motion.walk=1;assert.equal(startResidentAction(motion,'punch'),false);
});
test('action PNG fallback deduplicates source loads and combined atlas fits minimum WebGL texture size',async()=>{
 const type=ACTION_TYPES.find(type=>Object.keys(ACTION_LAYOUTS[type]).length===3),calls=[];
 const context={imageSmoothingEnabled:true,drawImage(){}},createCanvas=()=>({getContext:()=>context});
 const image=await loadActionAtlas(type,96,async url=>{calls.push(url);if(url.endsWith('.webp'))throw Error('packed texture missing');return {};},createCanvas);
 assert.equal(calls.length,1+new Set(Object.values(ACTION_SOURCES[type])).size);assert.equal(image.height,1152);
 const combined=combineResidentAtlases({},image,createCanvas(),96);
 assert.equal(combined.height,1920);assert.ok(combined.width<=2048&&combined.height<=2048);
});
