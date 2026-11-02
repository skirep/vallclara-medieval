import {cellSize} from './sprite-atlas.js';
import {ACTION_LAYOUTS,ACTION_SOURCES} from './action-layouts.js';

export const ACTION_NAMES=['jump','punch','talk'];
export const ACTION_DURATIONS={jump:.84,punch:.66,talk:1.5};
export const ACTION_TYPES=Object.keys(ACTION_LAYOUTS);
export const hasResidentActions=(type,action)=>Object.hasOwn(ACTION_LAYOUTS,type)&&(!action||Object.hasOwn(ACTION_LAYOUTS[type],action));
export function startResidentAction(m,action){
 if(!['jump','punch'].includes(action)||m.walk>.16)return false;
 m.action=action;m.actionTime=0;return true;
}
export function actionFrame(m,type){
 if(!hasResidentActions(type))return null;
 const action=m.action??(m.talk>.25&&m.walk<=.16?'talk':null);
 if(!ACTION_NAMES.includes(action)||!hasResidentActions(type,action))return null;
 const elapsed=action==='talk'?(m.talkTime??0):(m.actionTime??0);
 const duration=ACTION_DURATIONS[action];
 const frame=Math.min(5,Math.floor((action==='talk'?elapsed%duration:elapsed)/duration*6));
 return {action,frame,row:ACTION_NAMES.indexOf(action)*4};
}
// The root follows the jump arc while the body uses six separately painted poses.
export const JUMP_LIFT=[0,.12,.3,.38,.18,0];
export function actionPlacement(type,action,view,frame,pixelHeight=96){
 const rows=ACTION_LAYOUTS[type]?.[action];
 if(!rows?.[view]||!Number.isInteger(frame)||frame<0||frame>5)throw Error(`Invalid action: ${type}/${action}/${view}/${frame}`);
 const b=rows[view].frames[frame],cell=cellSize(pixelHeight),row=ACTION_NAMES.indexOf(action)*4+view;
 const maxHeight=Math.max(...rows[view].frames.map(box=>box.footY-box.y));
 const radius=Math.max(...rows[view].frames.flatMap(box=>[box.anchorX-box.x,box.x+box.w-box.anchorX]));
 const scale=Math.min(cell.height*232/256/maxHeight,(cell.width/2-cell.height*4/256)/radius);
 return {state:rows[view].source??action,sx:b.x,sy:b.y,sw:b.w,sh:b.h,dx:frame*cell.width+cell.center+(b.x-b.anchorX)*scale,dy:row*cell.height+cell.baseline+(b.y-b.footY)*scale,dw:b.w*scale,dh:b.h*scale,scale};
}
export function packActionAtlas(images,type,canvas,pixelHeight=96){
 const cell=cellSize(pixelHeight);canvas.width=cell.width*6;canvas.height=cell.height*12;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 for(const action of Object.keys(ACTION_LAYOUTS[type]))for(let view=0;view<4;view++)for(let frame=0;frame<6;frame++){
  const p=actionPlacement(type,action,view,frame,pixelHeight);ctx.drawImage(images[p.state],p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);
 }
 return canvas;
}
export async function loadActionAtlas(type,height,load,createCanvas){
 try{return await load(new URL(`./assets/packed/actions-${type}-${height}.webp`,import.meta.url).href);}
 catch{const files=ACTION_SOURCES[type],loaded=Object.fromEntries(await Promise.all([...new Set(Object.values(files))].map(async file=>[file,await load(new URL('./assets/'+file,import.meta.url).href)])));return packActionAtlas(Object.fromEntries(Object.keys(files).map(action=>[action,loaded[files[action]]])),type,createCanvas(),height);}
}
export function combineResidentAtlases(base,actions,canvas,height){
 const cell=cellSize(height);canvas.width=cell.width*6;canvas.height=cell.height*20;
 const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
 ctx.drawImage(base,0,0);ctx.drawImage(actions,0,cell.height*8);return canvas;
}
