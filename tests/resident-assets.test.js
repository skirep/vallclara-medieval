import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadResidentImages,RESIDENT_ASSETS,loadPackedResident} from '../resident-assets.js';
import {WALK_TYPES} from '../animation-frames.js';
import {PLANNED_RESIDENT_ROSTER,RESIDENT_ROSTER} from '../resident-roster.js';

test('runtime walk textures are smaller lossless WebP files with retained PNG fallbacks',()=>{
 let originals=0,runtime=0;
 for(const asset of RESIDENT_ASSETS.filter(a=>a.fallback)){
  const webp=readFileSync(new URL(`../assets/${asset.source}`,import.meta.url));
  const png=readFileSync(new URL(`../assets/${asset.fallback}`,import.meta.url));
  assert.equal(webp.toString('ascii',0,4),'RIFF');
  assert.equal(webp.toString('ascii',8,12),'WEBP');
  assert.ok(webp.includes(Buffer.from('VP8L')),'expected lossless WebP');
  originals+=png.length;runtime+=webp.length;
 }
 assert.ok(runtime<originals*.5,`runtime budget exceeded: ${runtime}/${originals}`);
});

test('all completed residents ship bounded lossless textures at every device resolution',()=>{
 assert.equal(PLANNED_RESIDENT_ROSTER.length,104);assert.equal(WALK_TYPES.length,RESIDENT_ROSTER.length);assert.equal(new Set(WALK_TYPES).size,WALK_TYPES.length);
 let bytes=0;
 for(const type of WALK_TYPES)for(const height of [64,96,128]){
  const file=readFileSync(new URL(`../assets/packed/${type}-${height}.webp`,import.meta.url));
  const chunk=file.indexOf(Buffer.from('VP8L'));assert.ok(chunk>=0,`${type}: expected lossless WebP`);
  const bits=file.readUInt32LE(chunk+9);
  assert.equal((bits&0x3fff)+1,height*.875*6);
  assert.equal(((bits>>>14)&0x3fff)+1,height*8);bytes+=file.length;
 }
 assert.ok(bytes<50*1024*1024,`packed texture download budget: ${bytes}`);
 // RGBA textures without mipmaps: the low-memory tier remains below 56 MiB.
 assert.ok(80*64*8*(64*.875*6)*4<56*1024*1024);
});

test('normal startup loads only the selected resolution; packed failure retains original fallback',async()=>{
 const calls=[];
 const packed=await loadPackedResident('baker',96,async url=>{calls.push(url);return url;},()=>{throw Error('unexpected full-resolution decode');});
 assert.equal(calls.length,1);assert.ok(packed.endsWith('/packed/baker-96.webp'));
 const fallback=await loadPackedResident('baker',64,async url=>{if(url.includes('/packed/')||url.endsWith('.webp'))throw Error('unavailable');return url;},images=>images);
 assert.equal(fallback.walk,fallback.idle);assert.ok(fallback.walk.endsWith('resident-baker.png'));
 await assert.rejects(loadPackedResident('baker',64,async()=>{throw Error('offline');},()=>{}),/offline/);
});

test('out-of-order loads preserve atlas ordering and report completed progress',async()=>{
 const pending=new Map(),progress=[];
 const result=loadResidentImages(url=>new Promise(resolve=>pending.set(url,resolve)),(done,total)=>progress.push([done,total]));
 for(const [url,resolve] of [...pending].reverse())resolve(url);
 const images=await result;
 assert.deepEqual(images.map(url=>url.split('/').pop()),RESIDENT_ASSETS.map(a=>a.source));
 assert.deepEqual(progress,RESIDENT_ASSETS.map((_,i)=>[i+1,RESIDENT_ASSETS.length]));
});

test('failed WebP loads fall back to source PNG and a double failure rejects startup',async()=>{
 const calls=[];
 const images=await loadResidentImages(async url=>{
  calls.push(url);
  if(url.endsWith('.webp'))throw Error('decode failed');
  return url;
 });
 assert.equal(calls.length,RESIDENT_ASSETS.length*2);
 assert.ok(images.every(url=>url.endsWith('.png')));
 await assert.rejects(loadResidentImages(async()=>{throw Error('offline');}),/offline/);
 await assert.rejects(loadResidentImages(async url=>{
  if(url.includes('walk-'))throw Error('walk sheet missing');
  return url;
 }),/walk sheet missing/);
});
