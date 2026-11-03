import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {dragonFlight,nextDragonHour,createDragon,DRAGON_HOURS} from '../dragon.js';
import {createResidentFollow,pickResident} from '../resident-follow.js';

test('dragon makes exactly two bounded flights per game day, including restored times and midnight',()=>{
 for(let day=0;day<4;day++){
  const starts=[];let previous=null;
  for(let minute=0;minute<1440;minute++){const flight=dragonFlight(day*24+minute/60);if(flight?.id!==previous&&flight)starts.push(flight.at);previous=flight?.id??null;}
  assert.deepEqual(starts,DRAGON_HOURS);
  for(const hour of DRAGON_HOURS){assert.equal(dragonFlight(day*24+hour).progress,0);assert.equal(dragonFlight(day*24+hour+.5),null);assert.deepEqual(dragonFlight(day*24+hour+.25),{day,at:hour,id:`${day}:${hour}`,progress:.5});}
 }
 assert.equal(dragonFlight(NaN),null);assert.equal(nextDragonHour(17.6),34);assert.equal(nextDragonHour(24),34);
});
test('2D dragon frame animation follows absolute game time, clears roofs and freezes with the clock',()=>{
 const scene=new T.Scene(),buildings=[{x:-9,z:-30,w:9,d:10,h:6.3},{kind:'church',x:-42,z:-6,w:12,d:13,h:19}],dragon=createDragon(scene,buildings,{textureLoader:{load(url,resolve){resolve(new T.Texture());}}});
 dragon.update(9);assert.equal(dragon.root.visible,false);
 dragon.update(10.15);assert.equal(dragon.root.visible,true);const before=dragon.root.position.clone(),frame=dragon.frame;
 dragon.update(10.15);assert.deepEqual(dragon.root.position,before);assert.equal(dragon.frame,frame);
 dragon.update(10.151);assert.notDeepEqual(dragon.root.position,before);assert.notEqual(dragon.frame,frame);
 for(let t=0;t<=1;t+=.005){const p=dragon.point(t);assert.ok(Number.isFinite(p.y));for(const b of buildings)if(Math.abs(p.x-b.x)<b.w/2&&Math.abs(p.z-b.z)<b.d/2){const top=b.kind==='church'?19:b.h+b.w*.4;assert.ok(p.y>=top+5.9);}}
 scene.traverse(o=>{if(o.isMesh)for(const value of o.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
 assert.ok(dragon.sprite.geometry instanceof T.PlaneGeometry);assert.equal(dragon.root.children.length,1);assert.equal(dragon.sprite.userData.spriteBillboard,true);
 dragon.update(10.5);assert.equal(dragon.root.visible,false);
});
test('following supports sparse person IDs, keeps the target in view and clips against walls',()=>{
 const p={id:608,age:30,sex:1,x:0,z:0},wall={x:0,z:2,w:6,d:.3,h:4},camera=new T.PerspectiveCamera(65,1,.1,100);
 const follow=createResidentFollow([p],{obstacles:[wall],heightAt:()=>0});assert.equal(follow.select(999),false);assert.equal(follow.select(608),true);
 follow.update(camera,1/60,{yaw:0});assert.ok(camera.position.z<1.7&&camera.position.z>0);assert.ok(camera.getWorldDirection(new T.Vector3()).dot(new T.Vector3(p.x,1.3,p.z).sub(camera.position).normalize())>.99);
 p.x=8;for(let i=0;i<120;i++)follow.update(camera,1/60,{yaw:0});assert.ok(Math.abs(camera.position.x-8)<.001);assert.ok(camera.position.z>6);
 assert.equal(follow.stop(),p);assert.equal(follow.active,false);assert.equal(follow.update(camera,1),false);
});
test('follow camera stays below interior ceilings and applies frame-rate independent easing',()=>{
 const p={id:2,age:45,sex:0,x:0,z:0},room={x:0,z:0,w:20,d:20,h:5},a=createResidentFollow([p],{buildings:[room]}),b=createResidentFollow([p],{buildings:[room]}),ca=new T.PerspectiveCamera(),cb=new T.PerspectiveCamera();a.select(2);b.select(2);a.update(ca,0);b.update(cb,0);p.x=1;
 for(let i=0;i<30;i++)a.update(ca,1/30);for(let i=0;i<120;i++)b.update(cb,1/120);
 assert.ok(ca.position.distanceTo(cb.position)<1e-10);assert.ok(ca.position.y<3);
});
test('click picking resolves the actual instance ID and refuses people behind solid geometry',()=>{
 const camera=new T.PerspectiveCamera(65,1,.1,100);camera.position.set(0,1,5);camera.lookAt(0,1,0);camera.updateMatrixWorld();
 const mesh=new T.InstancedMesh(new T.PlaneGeometry(1,2),new T.MeshBasicMaterial({side:T.DoubleSide}),1);mesh.userData.residentIndices=[199];mesh.setMatrixAt(0,new T.Matrix4().makeTranslation(0,1,0));mesh.updateMatrixWorld();
 assert.equal(pickResident({parts:{sprites:mesh}},camera,0,0),199);assert.equal(pickResident({parts:{sprites:mesh}},camera,.9,.9),null);
 const wall=new T.Mesh(new T.BoxGeometry(3,3,.3),new T.MeshBasicMaterial());wall.position.set(0,1,2);wall.updateMatrixWorld();assert.equal(pickResident({parts:{sprites:mesh}},camera,0,0,{occluders:[wall]}),null);
});
