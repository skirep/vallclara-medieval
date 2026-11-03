import test from 'node:test';import assert from 'node:assert/strict';
import {spriteDirection} from '../sprite-directions.js';
import {spriteView} from '../appearance.js';
import {stableView,createMotion,updateMotion} from '../sprite-motion.js';
import {createDragon} from '../dragon.js';import * as T from 'three';

test('drawn profiles face the actual screen-space travel direction from every camera side',()=>{
 // Facing signs observed in the original source sheets, independent of the
 // world-angle lookup: legacy row 1 faces right; new row 1 faces left.
 const raw={baker:{1:1,3:-1},'king-berenguer':{1:1,3:-1},'summer-dancer':{1:-1,3:1},'summer-athlete':{1:-1,3:1},'summer-blonde':{1:-1,3:1},dragon:{1:-1,3:1}};
 for(const [type,rows]of Object.entries(raw))for(let h=0;h<24;h++)for(let a=0;a<24;a++){
  const heading=h*Math.PI/12,observer=a*Math.PI/12,view=spriteView(heading,observer);
  if(view!==1&&view!==3)continue;
  const d=spriteDirection(type,view),facing=rows[d.view]*(d.flip?-1:1),screenTravel=Math.sin(heading-observer);
  assert.equal(facing,Math.sign(screenTravel),`${type}: heading ${h}, observer ${a}`);
  assert.equal(stableView({view:null},heading,observer),view);
 }
});
test('bad idle/talking profiles are mirrored without changing already-correct walking frames',()=>{
 for(const [type,state]of [['curly-girl','idle'],['freckled-girl','idle'],['fishmonger','idle'],['elder-mason','talk']]){
  const left=spriteDirection(type,3,state);assert.equal(left.flip,true);assert.equal(left.view,3);
  assert.deepEqual(spriteDirection(type,3,'walk'),{view:3,flip:false});assert.equal(spriteDirection(type,1,state).flip,false);
 }
 for(const type of ['summer-dancer','summer-athlete','summer-blonde'])for(const state of ['walk','idle','jump','punch','talk']){assert.deepEqual(spriteDirection(type,1,state),{view:3,flip:false});assert.deepEqual(spriteDirection(type,3,state),{view:1,flip:false});}
});
test('walkers do not face backwards during sharp turns or turn-around movement',()=>{
 const p={id:1,phase:0,speed:1,age:30,x:0,z:0,heading:0,state:'walking'},m=createMotion(p);
 for(const angle of [Math.PI,-Math.PI/2,0,Math.PI/2,Math.PI])for(let frame=0;frame<30;frame++){
  p.heading=angle;p.x+=Math.sin(angle)/30;p.z+=Math.cos(angle)/30;const x=m.x,z=m.z;
  updateMotion(m,p,1/30);const dx=m.x-x,dz=m.z-z;
  assert.ok(Math.sin(m.heading)*dx+Math.cos(m.heading)*dz>=-1e-7);
 }
});
test('dragon chooses the right-facing drawing when its flight projects to the right, and conversely',async()=>{
 const dragon=createDragon(new T.Scene(),[],{textureLoader:{load(url,done){done(new T.Texture());}}});await dragon.ready;
 for(const t of [.15,.3,.5,.7,.85]){
  const p=dragon.point(t),v=dragon.point(t+.001).sub(dragon.point(t-.001)),heading=Math.atan2(v.x,v.z);
  for(const side of [-1,1]){const angle=heading+side*Math.PI/2;dragon.update(10+t*.5,{x:p.x+Math.sin(angle)*30,z:p.z+Math.cos(angle)*30});
   const rawFacing=dragon.view===1?-1:dragon.view===3?1:0;assert.equal(rawFacing,Math.sign(Math.sin(heading-angle)));
  }
 }
});
