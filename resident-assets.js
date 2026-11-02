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
export async function loadPackedResident(type,pixelHeight,load,packFallback){
 try{return await load(new URL(`./assets/packed/${type}-${pixelHeight}.webp`,import.meta.url).href);}
 catch{
  const source=RESIDENT_SOURCES[type],images=new Map();
  for(const index of new Set([source.walk,source.idle])){
   const asset=RESIDENT_ASSETS[index];let image;
   try{image=await load(new URL(`./assets/${asset.source}`,import.meta.url).href);}
   catch{image=await load(new URL(`./assets/${asset.fallback}`,import.meta.url).href);}
   images.set(index,image);
  }
  return packFallback({walk:images.get(source.walk),idle:images.get(source.idle)});
 }
}
export function loadResidentImages(load,onProgress=()=>{}){
 let completed=0;
 return Promise.all(RESIDENT_ASSETS.map(async asset=>{
  let image;
  try{image=await load(new URL(`./assets/${asset.source}`,import.meta.url).href);}
  catch{image=await load(new URL(`./assets/${asset.fallback}`,import.meta.url).href);}
  onProgress(++completed,RESIDENT_ASSETS.length);return image;
 }));
}
