import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createResidentShadows} from '../resident-shadows.js';
import {groundHeight} from '../terrain.js';
import {residentHeight} from '../resident-scale.js';

const person={id:1,age:34,sex:0},motion={x:126,z:0};
const position=(mesh)=>{const m=new T.Matrix4();mesh.getMatrixAt(0,m);return new T.Vector3().setFromMatrixPosition(m);};
test('resident contact shadow stays on the bridge deck and projection follows the sun, not the camera',()=>{
 const shadows=createResidentShadows(new T.Scene(),[person],groundHeight);
 shadows.setLight(new T.Vector3(-60,70,20),new T.Vector3(),1);
 shadows.update(0,person,motion,0,1);shadows.flush();
 const contact=position(shadows.contact),cast=position(shadows.projected);
 assert.ok(Math.abs(contact.y-groundHeight(126,0)-.012)<1e-6);
 assert.ok(cast.x>contact.x&&cast.z<contact.z);
 shadows.setLight(new T.Vector3(60,70,-20),new T.Vector3(),1);
 shadows.update(0,person,motion,0,1);
 const reversed=position(shadows.projected);assert.ok(reversed.x<contact.x&&reversed.z>contact.z);
 assert.equal(shadows.contact.material.depthWrite,false);
});
test('jump lifts the resident away from a fading ground shadow, and distance culling hides both layers',()=>{
 const shadows=createResidentShadows(new T.Scene(),[person],groundHeight);
 shadows.update(0,person,motion,0,1);
 const before=position(shadows.contact),strength=shadows.contact.geometry.attributes.shadowStrength.getX(0);
 shadows.update(0,person,motion,residentHeight(person)*.5,1);
 assert.equal(position(shadows.contact).y,before.y);
 assert.ok(shadows.contact.geometry.attributes.shadowStrength.getX(0)<strength);
 shadows.update(0,person,motion,0,0);
 for(const mesh of [shadows.contact,shadows.projected]){
  assert.equal(mesh.geometry.attributes.shadowStrength.getX(0),0);
  const m=new T.Matrix4();mesh.getMatrixAt(0,m);assert.equal(new T.Vector3().setFromMatrixScale(m).length(),0);
 }
});
test('soft shadow surface follows a slope and all instance transforms remain finite',()=>{
 const heightAt=(x,z)=>x*.1+z*.2,shadows=createResidentShadows(new T.Scene(),[person],heightAt);
 shadows.setLight(new T.Vector3(0,80,0),new T.Vector3(),.2);
 shadows.update(0,person,{x:3,z:5},0,1);shadows.flush();
 for(const mesh of [shadows.contact,shadows.projected]){
  const m=new T.Matrix4();mesh.getMatrixAt(0,m);const p=position(mesh);
  assert.ok(Math.abs(p.y-heightAt(p.x,p.z)-.012)<1e-6);
  const normal=new T.Vector3(0,0,1).transformDirection(m);
  assert.ok(normal.dot(new T.Vector3(-.1,1,-.2).normalize())>.9999);
  for(const n of mesh.instanceMatrix.array)assert.ok(Number.isFinite(n));
 }
});
