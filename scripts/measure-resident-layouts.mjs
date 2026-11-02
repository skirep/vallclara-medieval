// Measure the existing source artwork; this does not redraw or modify pixels.
import {readFileSync,writeFileSync} from 'node:fs';
import {decodeRGBA} from './png-rgba.mjs';
import {WALK_TYPES,LEGACY_TYPES} from '../animation-frames.js';
import {SEPARATE_TYPES} from '../resident-assets.js';
import {WALK_LAYOUTS} from '../walk-layouts.js';
function measure(file,count){
 const {pixels,width,height}=decodeRGBA(readFileSync(new URL('../assets/'+file,import.meta.url)));
 const seen=new Uint8Array(width*height),queue=new Int32Array(width*height),parts=[];
 for(let i=0;i<seen.length;i++){
  if(seen[i]||pixels[i*4+3]<115)continue;seen[i]=1;let head=0,tail=1;queue[0]=i;
  let x0=width,x1=0,y0=height,y1=0;
  while(head<tail){const a=queue[head++],x=a%width,y=Math.floor(a/width);
   x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const n of [x>0?a-1:-1,x<width-1?a+1:-1,y>0?a-width:-1,y<height-1?a+width:-1])if(n>=0&&!seen[n]&&pixels[n*4+3]>=115){seen[n]=1;queue[tail++]=n;}
  }
  if(tail>100)parts.push({x0,x1,y0,y1,area:tail});
 }
 if(parts.length!==count*6)throw Error(`${file}: expected ${count*6} figures, found ${parts.length}`);
 parts.sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1));
 return Array.from({length:count},(_,view)=>{
  const row=parts.slice(view*6,view*6+6).sort((a,b)=>a.x0-b.x0);
  const frames=row.map(b=>{
   const centers=[];
   for(let y=Math.ceil(b.y0+(b.y1-b.y0)*.3);y<b.y0+(b.y1-b.y0)*.55;y++){
    let left=Infinity,right=-1;for(let x=b.x0;x<=b.x1;x++)if(pixels[(y*width+x)*4+3]>=115){left=Math.min(left,x);right=Math.max(right,x);}
    if(right>=left)centers.push((left+right+1)/2);
   }
   centers.sort((a,b)=>a-b);
   if(b.y0<=0||b.y1>=height-1)console.warn(`${file}: frame at image edge ${b.y0}..${b.y1}/${height}`);
   return{x:b.x0,w:b.x1-b.x0+1,y:b.y0,h:b.y1-b.y0+1,anchorX:centers[Math.floor(centers.length/2)],footY:b.y1+1};
  });
  const top=Math.min(...frames.map(b=>b.y));return {top,height:Math.max(...frames.map(b=>b.y+b.h))-top,frames};
 });
}
const layouts={};
for(const type of WALK_TYPES){
 if(SEPARATE_TYPES.includes(type))layouts[type]={walk:LEGACY_TYPES.includes(type)?WALK_LAYOUTS[type]:measure(`walk-${type}.png`,4),idle:measure(`idle-${type}.png`,4)};
 else{const rows=measure(`resident-${type}.png`,8);layouts[type]={walk:rows.slice(0,4),idle:rows.slice(4)};}
 console.log(type,layouts[type].walk.length*6+layouts[type].idle.length*6,'frames');
}
writeFileSync(new URL('../resident-layouts.js',import.meta.url),'// Measured source rectangles, torso anchors and foot baselines.\nexport const RESIDENT_LAYOUTS='+JSON.stringify(layouts)+';\n');
