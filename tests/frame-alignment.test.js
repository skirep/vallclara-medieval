import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {decodeRGBA} from '../scripts/png-rgba.mjs';
import {WALK_TYPES} from '../animation-frames.js';
import {WALK_LAYOUTS} from '../walk-layouts.js';
import {CELL,REST_FRAME,framePlacement,packWalkAtlas} from '../sprite-atlas.js';

test('actual visible foot pixels stay at the ground baseline across every frame and orientation',()=>{
 for(const type of WALK_TYPES){
  const {pixels,width}=decodeRGBA(readFileSync(new URL(`../assets/walk-${type}.png`,import.meta.url)));
  for(let view=0;view<4;view++)for(let frame=0;frame<7;frame++){
   const p=framePlacement(type,view,frame);
   let bottom=-Infinity;
   for(let y=p.sy;y<p.sy+p.sh;y++)for(let x=p.sx;x<p.sx+p.sw;x++)if(pixels[(y*width+x)*4+3]>=115)bottom=Math.max(bottom,y+1);
   const ground=p.dy+(bottom-p.sy)*p.scale;
   assert.ok(Math.abs(ground-(view*256+244))<.00001,`${type}/${view}/${frame}: feet moved to ${ground}`);
   assert.ok(p.dx>=frame*224&&p.dx+p.dw<=(frame+1)*224,`${type}: clipped horizontally`);
   assert.ok(p.dy>=view*256&&p.dy+p.dh<=(view+1)*256,`${type}: clipped vertically`);
  }
 }
});

test('packing uses the matching walking source for rest, preserving identity and scale on stop',()=>{
 for(const type of WALK_TYPES){
  const calls=[],image={type},context={drawImage(...args){calls.push(args);}};
  const canvas={getContext(){return context;}};
  packWalkAtlas(image,type,canvas);
  assert.equal(calls.length,28);assert.equal(canvas.width,1568);assert.equal(canvas.height,1024);
  for(let view=0;view<4;view++){
   const walking=calls[view*7+REST_FRAME],rest=calls[view*7+6];
   assert.equal(rest[0],image);assert.deepEqual(rest.slice(1,5),walking.slice(1,5));
   assert.deepEqual(rest.slice(6),walking.slice(6));
   assert.equal(rest[5]-walking[5],(6-REST_FRAME)*CELL.width);
   for(let frame=0;frame<6;frame++){
    const box=WALK_LAYOUTS[type][view].frames[frame],p=framePlacement(type,view,frame);
    const anchor=p.dx+(box.anchorX-p.sx)*p.scale;
    assert.ok(Math.abs(anchor-(frame*CELL.width+CELL.center))<.00001);
   }
  }
 }
});
