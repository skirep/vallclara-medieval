import {WALK_LAYOUTS} from './walk-layouts.js';
export const CELL={width:224,height:256,baseline:244,center:112};
// Reuse a planted-foot pose from the same sheet when stopped. Mixing the older
// idle illustration into this sheet changed the resident's body on every stop.
export const REST_FRAME=1;
export function framePlacement(type,view,frame){
 const rows=WALK_LAYOUTS[type];
 if(!rows?.[view])throw Error(`Invalid resident view: ${type}/${view}`);
 const source=rows[view].frames[frame===6?REST_FRAME:frame];
 if(!source)throw Error(`Invalid resident frame: ${frame}`);
 const scale=232/Math.max(...rows.flatMap(row=>row.frames.map(box=>box.footY-box.y)));
 return {sx:source.x,sy:source.y,sw:source.w,sh:source.h,
  dx:frame*CELL.width+CELL.center+(source.x-source.anchorX)*scale,
  dy:view*CELL.height+CELL.baseline+(source.y-source.footY)*scale,
  dw:source.w*scale,dh:source.h*scale,scale};
}
export function packWalkAtlas(image,type,canvas){
 canvas.width=CELL.width*7;canvas.height=CELL.height*4;
 const ctx=canvas.getContext('2d');
 if(!ctx)throw Error('Canvas 2D no disponible');
 ctx.imageSmoothingEnabled=false;
 for(let view=0;view<4;view++)for(let frame=0;frame<7;frame++){
  const p=framePlacement(type,view,frame);
  ctx.drawImage(image,p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);
 }
 return canvas;
}
