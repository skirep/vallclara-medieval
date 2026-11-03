import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {decodeRGBA} from '../scripts/png-rgba.mjs';
import * as T from 'three';import {createDragon,DRAGON_FRAMES,DRAGON_VIEWS} from '../dragon.js';
test('dragon has 24 distinct painted flight frames on a transparent bounded atlas',()=>{
 const image=decodeRGBA(readFileSync(new URL('../assets/dragon-flight-2d.png',import.meta.url)));assert.equal(image.width,1536);assert.equal(image.height,1024);
 for(let row=0;row<DRAGON_VIEWS;row++){
  const hashes=[];
  for(let col=0;col<DRAGON_FRAMES;col++){let solid=0,clear=0;const hash=createHash('sha256');for(let y=row*256;y<(row+1)*256;y++){const line=Buffer.from(image.pixels.subarray((y*1536+col*256)*4,(y*1536+(col+1)*256)*4));for(let i=0;i<line.length;i+=4){if(line[i+3]<115){clear++;line.fill(0,i,i+4);}else solid++;}hash.update(line);}assert.ok(solid>3000&&clear>15000);hashes.push(hash.digest('hex'));}
  assert.equal(new Set(hashes).size,6);
 }
 const webp=readFileSync(new URL('../assets/dragon-flight-2d.webp',import.meta.url));assert.ok(webp.includes(Buffer.from('VP8L')));
});
test('dragon selects all four drawn views and keeps each texture frame inside its cell',async()=>{
 const texture=new T.Texture(),dragon=createDragon(new T.Scene(),[],{textureLoader:{load(url,done){done(texture);}}});await dragon.ready;
 const views=new Set();for(let i=0;i<8;i++){const a=i*Math.PI/4,p=dragon.point(.4);dragon.update(10.2,{x:p.x+Math.sin(a)*30,z:p.z+Math.cos(a)*30});views.add(dragon.view);assert.ok(texture.offset.x>=0&&texture.offset.x+texture.repeat.x<=1);assert.ok(texture.offset.y>=0&&texture.offset.y+texture.repeat.y<=1);}
 assert.equal(views.size,4);assert.equal(dragon.sprite.material.alphaTest,.45);assert.equal(dragon.sprite.material.depthWrite,true);
});
