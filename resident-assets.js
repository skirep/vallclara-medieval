import {WALK_TYPES} from './animation-frames.js';

export const RESIDENT_ASSETS=[
 {source:'residents-directions-v1.png'},
 {source:'residents-families-v2.png'},
 ...WALK_TYPES.map(id=>({source:`walk-${id}.webp`,fallback:`walk-${id}.png`}))
];

// Keep source order: the first two sheets contain idle poses, followed by walks.
export function loadResidentImages(load,onProgress=()=>{}){
 let completed=0;
 return Promise.all(RESIDENT_ASSETS.map(async asset=>{
  let image;
  try{image=await load(new URL(`./assets/${asset.source}`,import.meta.url).href);}
  catch(error){
   if(!asset.fallback)throw error;
   image=await load(new URL(`./assets/${asset.fallback}`,import.meta.url).href);
  }
  onProgress(++completed,RESIDENT_ASSETS.length);
  return image;
 }));
}
