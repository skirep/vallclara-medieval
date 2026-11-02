import {RESIDENT_LAYOUTS} from './resident-layouts.js';
export const CELL={width:224,height:256,baseline:244,center:112};
export function cellSize(pixelHeight=256){const height=[64,96,128,192,256].includes(pixelHeight)?pixelHeight:256;return {width:height*.875,height,baseline:height*244/256,center:height*.875/2};}
export function framePlacement(type,view,frame,pixelHeight=256){
 const state=frame<6?'walk':'idle',rows=RESIDENT_LAYOUTS[type]?.[state];
 if(!rows?.[view])throw Error(`Invalid resident view: ${type}/${view}/${state}`);
 const source=rows[view].frames[frame%6],cell=cellSize(pixelHeight),column=frame%6,row=view+(state==='idle'?4:0);
 if(!source)throw Error(`Invalid resident frame: ${frame}`);
 const maxHeight=Math.max(...rows[view].frames.map(box=>box.footY-box.y));
 const radius=Math.max(...rows[view].frames.flatMap(box=>[box.anchorX-box.x,box.x+box.w-box.anchorX]));
 const scale=Math.min((cell.height*232/256)/maxHeight,(cell.width/2-cell.height*4/256)/radius);
 return {state,sx:source.x,sy:source.y,sw:source.w,sh:source.h,
  dx:column*cell.width+cell.center+(source.x-source.anchorX)*scale,
  dy:row*cell.height+cell.baseline+(source.y-source.footY)*scale,
  dw:source.w*scale,dh:source.h*scale,scale};
}
export function packWalkAtlas(images,type,canvas,pixelHeight=256){
 const cell=cellSize(pixelHeight);canvas.width=cell.width*6;canvas.height=cell.height*8;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas 2D no disponible');ctx.imageSmoothingEnabled=false;
 for(let view=0;view<4;view++)for(let frame=0;frame<12;frame++){
  const p=framePlacement(type,view,frame,pixelHeight);
  ctx.drawImage(images[p.state],p.sx,p.sy,p.sw,p.sh,p.dx,p.dy,p.dw,p.dh);
 }
 return canvas;
}
