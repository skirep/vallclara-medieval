import test from 'node:test';import assert from 'node:assert/strict';
import {housePlan,wallPanels} from '../interiors.js';
import {blocked} from '../simulation.js';
import {BRIDGE,RIVER,bridgeHeight,groundHeight,landscapeHeight,riverCenter} from '../terrain.js';
import {drawnFrame,LEGACY_TYPES as WALK_TYPES,WALK_FRAMES} from '../animation-frames.js';
import {WALK_LAYOUTS} from '../walk-layouts.js';
import {readFileSync} from 'node:fs';

test('all house sizes have a clear continuous doorway/aisle and solid side walls and furniture',()=>{
 for(const w of [7,8.5,10,12])for(const d of [8,10,12,18.3]){
  const plan=housePlan(14,14,w,d,5),obstacles=[...plan.walls,...plan.furniture];
  for(let z=14-d/2-1;z<14+d/2+1;z+=.08)assert.equal(blocked(14,z,obstacles),false,`door/aisle blocked for ${w}x${d} at ${z}`);
  assert.ok(blocked(14+w/2,14,obstacles));assert.ok(blocked(plan.furniture[0].x,plan.furniture[0].z,obstacles));
  assert.ok(wallPanels(w,5).every(p=>!(Math.abs(p.x)<.95&&p.y<2.55)));
 }
});
test('bridge is continuously traversable; river and parapets prevent accidental entry into water',()=>{
 const obstacles=[{kind:'river'},...[-1,1].map(s=>({x:126,z:s*3.45,w:36,d:.48}))];
 for(let x=94;x<=160;x+=.1)assert.equal(blocked(x,0,obstacles,.4,165),false);
 for(const z of [-80,-20,10,70])assert.equal(blocked(riverCenter(z),z,obstacles,.4,165),true);
 for(const z of [-3.45,3.45])assert.ok(blocked(126,z,obstacles,.4,165));
 let previous=bridgeHeight(BRIDGE.start);
 for(let x=BRIDGE.start;x<=BRIDGE.end;x+=.1){const y=bridgeHeight(x);assert.ok(Math.abs(y-previous)<.02);assert.ok(y>RIVER.waterY+.5);previous=y;}
 assert.equal(groundHeight(126,0),bridgeHeight(126));assert.ok(landscapeHeight(126,0)<RIVER.waterY);assert.equal(blocked(166,0,[],.4,165),true);
});
test('8 transparent walking sheets contain 192 measured, different frame regions and frame selection cycles',()=>{
 assert.equal(WALK_TYPES.length*WALK_FRAMES*4,192);
 for(const id of WALK_TYPES){const png=readFileSync(new URL(`../assets/walk-${id}.png`,import.meta.url));assert.equal(png[25],6);assert.equal(WALK_LAYOUTS[id].length,4);for(const row of WALK_LAYOUTS[id]){assert.equal(row.frames.length,6);assert.ok(row.top>=0&&row.top+row.height<=1024);for(const box of row.frames)assert.ok(box.x>=0&&box.x+box.w<=1536);}}
 const seen=new Set();for(let i=0;i<60;i++)seen.add(drawnFrame({walk:1,phase:i/60*Math.PI*2}));assert.equal(seen.size,6);assert.equal(drawnFrame({walk:0,phase:3}),6);
});

test('walking frames have real transparent cutouts and six distinct pixel drawings in every orientation',async()=>{
 const {decodeRGBA}=await import('../scripts/png-rgba.mjs');const {createHash}=await import('node:crypto');
 for(const id of WALK_TYPES){
  const {width,height,pixels}=decodeRGBA(readFileSync(new URL(`../assets/walk-${id}.png`,import.meta.url)));
  let opaque=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)opaque++;
  assert.ok(opaque/(width*height)>.08&&opaque/(width*height)<.6,`missing alpha cutout for ${id}`);
  for(const row of WALK_LAYOUTS[id]){
   const hashes=row.frames.map(box=>{const hash=createHash('sha256');
    for(let y=row.top;y<row.top+row.height;y++){const line=Buffer.from(pixels.subarray((y*width+box.x)*4,(y*width+box.x+box.w)*4));for(let i=0;i<line.length;i+=4)if(line[i+3]<128)line.fill(0,i,i+4);hash.update(line);}return hash.digest('hex');});
   assert.equal(new Set(hashes).size,6,`duplicate drawn frames in ${id}`);
  }
 }
});
