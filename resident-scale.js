// Heights are measured at the painted crown, rather than the transparent cell.
// The slight variety is stable; clothing width must not change visible height.
import {RESIDENT_LAYOUTS} from './resident-layouts.js';
import {ACTION_LAYOUTS} from './action-layouts.js';
import {framePlacement} from './sprite-atlas.js';
import {actionPlacement} from './resident-actions.js';
const corrections=new Map();
export function residentHeight(person){
 const variant=((person.id*7)%11)/10;
 if(person.age<16)return 1.12+(Math.max(7,person.age)-7)*.045;
 if(person.age<18)return 1.65+variant*.1;
 return (person.sex?1.72:1.79)+variant*.12-(person.age>=68?.025:0);
}
export const PAINTED_HEIGHT_FRACTION=232/256;
export function artHeightCorrection(type,view=0,frame=0,action=null){
 if(!type)return 1;
 const state=action??(frame<6?'walk':'idle'),key=`${type}/${view}/${state}`;
 if(!corrections.has(key)){
  const row=(action?ACTION_LAYOUTS[type]?.[action]:RESIDENT_LAYOUTS[type]?.[state])?.[view];
  if(!row)return 1;
  const p=action?actionPlacement(type,action,view,0,96):framePlacement(type,view,state==='idle'?6:0,96);
  const drawnHeight=Math.max(...row.frames.map(b=>b.footY-b.y))*p.scale;
  corrections.set(key,(96*PAINTED_HEIGHT_FRACTION)/drawnHeight);
 }
 return corrections.get(key);
}
export function residentRenderHeight(person,type,view,frame,action){return residentHeight(person)/PAINTED_HEIGHT_FRACTION*artHeightCorrection(type,view,frame,action);}
