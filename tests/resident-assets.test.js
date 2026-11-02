import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadResidentImages,RESIDENT_ASSETS} from '../resident-assets.js';

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
 assert.equal(calls.length,18);
 assert.ok(images.every(url=>url.endsWith('.png')));
 await assert.rejects(loadResidentImages(async()=>{throw Error('offline');}),/offline/);
 await assert.rejects(loadResidentImages(async url=>{
  if(url.includes('walk-'))throw Error('walk sheet missing');
  return url;
 }),/walk sheet missing/);
});
