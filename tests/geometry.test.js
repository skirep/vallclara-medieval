import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createWorld,roofVertices} from '../world.js';
import {createPeople,createAnimals} from '../actors.js';
import {createPopulation,nodes,blocked} from '../simulation.js';
// CPU geometry validation. This does not substitute for a WebGL rendering check.
const ctx={fillRect(){},strokeRect(){},beginPath(){},moveTo(){},bezierCurveTo(){},stroke(){}};
globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};},createElement(){return{width:256,height:256,getContext(){return ctx;}};}};
test('complete town geometry merges, citizen/animal animation matrices remain finite, and roads stay clear',()=>{
  const scene=new T.Scene(),world=createWorld(scene),citizens=createPopulation(),people=createPeople(scene,citizens),animals=createAnimals(scene,world.obstacles);
  for(const time of [0,1,10]){people.animate(time,new T.Vector3(0,1.7,10));animals.animate(.03,time);}
  scene.traverse(o=>{if(o.isMesh){for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n),'nonfinite vertex');if(o.isInstancedMesh)for(const n of o.instanceMatrix.array)assert.ok(Number.isFinite(n),'nonfinite actor transform');}});
  assert.equal(animals.count,74);
  for(const a of nodes)for(const j of a.links){const b=nodes[j];for(const offset of [-2.2,0,2.2])for(let step=0;step<=20;step++){const t=step/20,x=a.x+(b.x-a.x)*t+offset,z=a.z+(b.z-a.z)*t+offset;assert.equal(blocked(x,z,world.obstacles,.2),false,`street obstructed at ${x}, ${z}`);}}
});

test('gable roof faces point outwards so they remain visible with back-face culling',()=>{const v=roofVertices(8,10,3),center=new T.Vector3(0,1,0);for(let i=0;i<v.length;i+=9){const a=new T.Vector3().fromArray(v,i),b=new T.Vector3().fromArray(v,i+3),c=new T.Vector3().fromArray(v,i+6),normal=b.clone().sub(a).cross(c.clone().sub(a)),outward=a.clone().add(b).add(c).multiplyScalar(1/3).sub(center);assert.ok(normal.dot(outward)>0);}});
