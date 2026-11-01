import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from 'three';
import {createPopulation} from '../simulation.js';
import {appearanceFor,spriteView} from '../appearance.js';
import {createHistories} from '../stories.js';
import {writeConversation} from '../social.js';
import {createPeople} from '../people-sprites.js';

test('500 stable visual variants include men, women, boys and girls with age-appropriate scale',()=>{
 const p=createPopulation(),a=p.map(appearanceFor);
 assert.equal(new Set(a.map(x=>x.signature)).size,500);
 assert.equal(new Set(a.map(x=>`${x.row}:${x.hue}:${x.width}:${x.hair}`)).size,500);
 for(let row=0;row<4;row++)assert.ok(a.filter(x=>x.row%4===row).length>=100);
 assert.deepEqual(a,createPopulation().map(appearanceFor));
 for(const person of p){assert.ok(person.age>=7);assert.ok(person.age<16?person.height<.8:person.height>=.82);}
});
test('observer angle selects front, correct profiles and back across wraparound and headings',()=>{
 for(const heading of [0,.71,-2,Math.PI*2]){
 assert.equal(spriteView(heading,heading),0);
 assert.equal(spriteView(heading,heading+Math.PI/2),3);
 assert.equal(spriteView(heading,heading+Math.PI),2);
 assert.equal(spriteView(heading,heading-Math.PI/2),1);
 assert.equal(spriteView(heading,heading+Math.PI*4),0);
 }
});
test('children have recent memories and conversations without adult work histories',()=>{
 const p=createHistories(createPopulation());
 for(const c of p.filter(x=>x.age<16)){
 assert.ok(c.story.year>=1348-c.age+3&&c.story.year<1348);
 assert.doesNotMatch(c.story.biography,/va heretar|després d’anys treballant|treballa de/);
 const turns=writeConversation(c,p.find(x=>x.age>=18),10);
 assert.ok(turns.some(x=>x.text.includes('jugar')));
 }
});
test('directional source PNG with transparency is packaged and sprite shader matches Three chunks',()=>{
 const png=readFileSync(new URL('../assets/residents-directions-v1.png',import.meta.url));
 assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png[25],6);
 const shader={vertexShader:T.ShaderLib.basic.vertexShader,fragmentShader:T.ShaderLib.basic.fragmentShader};
 // CPU scene smoke test exercises the actual material transformation, not WebGL.
 globalThis.document={createElementNS(){return{addEventListener(){},removeEventListener(){},set src(v){}};}};
 const scene=new T.Scene(),people=createPeople(scene,createPopulation());
 people.parts.sprites.material.onBeforeCompile(shader);
 assert.match(shader.vertexShader,/residentFrame/);assert.match(shader.vertexShader,/vMapUv = vec2/);
 assert.match(shader.fragmentShader,/dyeMask/);
 people.animate(1,new T.Vector3(0,1.7,0),65);
 for(const n of people.parts.sprites.instanceMatrix.array)assert.ok(Number.isFinite(n));
 assert.equal(people.parts.sprites.material.alphaTest,.45);
 assert.equal(people.parts.sprites.material.depthWrite,true);
 assert.equal(scene.children.length,1);
 const next=readFileSync(new URL('../assets/residents-families-v2.png',import.meta.url));assert.equal(next[25],6);
 assert.equal(new Set(createPopulation().map(appearanceFor).map(a=>a.row)).size,8);
});
