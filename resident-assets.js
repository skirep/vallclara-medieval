import {WALK_TYPES,LEGACY_TYPES} from './animation-frames.js';
export const SEPARATE_TYPES=[...LEGACY_TYPES,'red-boy','apprentice-boy'];
export const RESIDENT_ASSETS=[];
export const RESIDENT_SOURCES={};
for(const id of WALK_TYPES){
 if(SEPARATE_TYPES.includes(id)){
  const walk=RESIDENT_ASSETS.length;RESIDENT_ASSETS.push({source:`walk-${id}.webp`,fallback:`walk-${id}.png`});
  const idle=RESIDENT_ASSETS.length;RESIDENT_ASSETS.push({source:`idle-${id}.webp`,fallback:`idle-${id}.png`});
  RESIDENT_SOURCES[id]={walk,idle};
 }else{
  const index=RESIDENT_ASSETS.length;RESIDENT_ASSETS.push({source:`resident-${id}.webp`,fallback:`resident-${id}.png`});
  RESIDENT_SOURCES[id]={walk:index,idle:index};
 }
}
export function sourcesFor(images,type){const source=RESIDENT_SOURCES[type];return {walk:images[source.walk],idle:images[source.idle]};}
export function loadResidentImages(load,onProgress=()=>{}){
 let completed=0;
 return Promise.all(RESIDENT_ASSETS.map(async asset=>{
  let image;
  try{image=await load(new URL(`./assets/${asset.source}`,import.meta.url).href);}
  catch{image=await load(new URL(`./assets/${asset.fallback}`,import.meta.url).href);}
  onProgress(++completed,RESIDENT_ASSETS.length);return image;
 }));
}
