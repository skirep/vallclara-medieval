// Measure existing alpha cutouts. This changes packing metadata, not the artwork.
import {readFileSync,writeFileSync} from 'node:fs';
import {decodeRGBA} from './png-rgba.mjs';
import {WALK_LAYOUTS} from '../walk-layouts.js';
for(const [type,rows] of Object.entries(WALK_LAYOUTS)){
 const {pixels,width}=decodeRGBA(readFileSync(new URL(`../assets/walk-${type}.png`,import.meta.url)));
 for(const row of rows)for(const box of row.frames){
  let left=Infinity,right=-1,top=Infinity,bottom=-1;
  const spans=[];
  for(let y=row.top;y<row.top+row.height;y++){
   let a=Infinity,b=-1;
   for(let x=box.x;x<box.x+box.w;x++)if(pixels[(y*width+x)*4+3]>=115){
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);a=Math.min(a,x);b=Math.max(b,x);
   }
   if(b>=a)spans.push({y,center:(a+b+1)/2});
  }
  if(bottom<top)throw Error(`Empty frame in ${type}`);
  const torso=spans.filter(s=>s.y>top+(bottom-top)*.3&&s.y<top+(bottom-top)*.55).map(s=>s.center).sort((a,b)=>a-b);
  box.anchorX=torso[Math.floor(torso.length/2)];box.footY=bottom+1;
  box.y=Math.max(row.top,top-1);box.h=Math.min(row.top+row.height,bottom+2)-box.y;
 }
}
writeFileSync(new URL('../walk-layouts.js',import.meta.url),'// Measured source cutouts, torso anchors and foot baselines; originals are unchanged.\nexport const WALK_LAYOUTS='+JSON.stringify(WALK_LAYOUTS)+';\n');
