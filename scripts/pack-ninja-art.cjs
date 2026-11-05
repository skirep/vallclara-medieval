const fs=require('node:fs'),path=require('node:path');
let sharp;try{sharp=require('sharp')}catch{sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')}
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/packed');
async function cropFrame(source,f){
 const {data,info}=await sharp(source).extract({left:f.x,top:f.y,width:f.w,height:f.h}).ensureAlpha().raw().toBuffer({resolveWithObject:true}),seen=new Uint8Array(info.width*info.height),parts=[];
 for(let i=0;i<seen.length;i++){
  if(data[i*4+3]<115){data.fill(0,i*4,i*4+4);continue;}
  if(seen[i])continue;seen[i]=1;const queue=[i],pixels=[];let x0=info.width,y0=info.height,x1=0,y1=0;
  for(let k=0;k<queue.length;k++){const n=queue[k],x=n%info.width,y=Math.floor(n/info.width);pixels.push(n);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(let yy=Math.max(0,y-1);yy<=Math.min(info.height-1,y+1);yy++)for(let xx=Math.max(0,x-1);xx<=Math.min(info.width-1,x+1);xx++){const next=yy*info.width+xx;if(!seen[next]&&data[next*4+3]>=115){seen[next]=1;queue.push(next);}}
  }parts.push({pixels,x0,x1,y0,y1});
 }
 const main=parts.reduce((a,b)=>a.pixels.length>b.pixels.length?a:b);
 for(const part of parts){const gap=Math.hypot(Math.max(0,main.x0-part.x1,part.x0-main.x1),Math.max(0,main.y0-part.y1,part.y0-main.y1));
  // Discard only tiny detached specks far from the actual character. Preserve
  // separate plume, highlights and weapon parts close to the main silhouette.
  if(part.pixels.length<32&&gap>4)for(const i of part.pixels)data.fill(0,i*4,i*4+4);
 }
 return sharp(data,{raw:info});
}


if(process.argv.length<5)throw Error('Usage: node scripts/pack-ninja-art.cjs walk-idle.png attack.png pistol.png');
(async()=>{fs.mkdirSync(out,{recursive:true});const files=process.argv.slice(2),frames=[];
 for(let row=0;row<12;row++)for(let frame=0;frame<6;frame++){
  const attack=row>=8,source=files[attack?1:0],meta=await sharp(source).metadata(),sr=attack?row-8:row,rows=attack?4:8;
  const left=Math.floor(frame*meta.width/6),right=Math.floor((frame+1)*meta.width/6),top=Math.floor(sr*meta.height/rows),bottom=Math.floor((sr+1)*meta.height/rows);
  const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=right,x1=left,y0=bottom,y1=top;
  const a=(x,y)=>data[(y*info.width+x)*4+3]>=115;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(a(x,y)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x0>x1)throw Error(`Empty ninja frame ${row}/${frame}`);
  let sum=0,n=0;for(let y=Math.max(top,y1-18);y<=y1;y++)for(let x=left;x<right;x++)if(a(x,y)){sum+=x;n++;}
  frames.push({row,frame,source:attack?'attack':'walk-idle',x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,anchorX:sum/n,footY:y1+1});
 }
 for(const height of [64,96,128]){const width=height*2,items=[];
  for(const f of frames){const source=files[f.source==='attack'?1:0],scale=height*.75/(f.source==='attack'?182:170),w=Math.max(1,Math.round(f.w*scale)),h=Math.max(1,Math.round(f.h*scale)),left=Math.round(f.frame*width+width/2+(f.x-f.anchorX)*scale),top=Math.round(f.row*height+height*242/256+(f.y-f.footY)*scale);
   if(left<f.frame*width||left+w>(f.frame+1)*width||top<f.row*height||top+h>(f.row+1)*height)throw Error(`Ninja frame crosses UV cell ${f.row}/${f.frame}`);
   const image=await cropFrame(source,f);items.push({input:await image.resize(w,h,{kernel:'nearest'}).png().toBuffer(),left,top});
  }
  await sharp({create:{width:width*6,height:height*12,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(items).webp({lossless:true,effort:6}).toFile(path.join(out,`ninja-shadow-v1-${height}.webp`));
 }
 const pistol=await sharp(files[2]).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(let i=0;i<pistol.data.length;i+=4)if(pistol.data[i+3]<115)pistol.data.fill(0,i,i+4);
 await sharp(pistol.data,{raw:pistol.info}).resize(512,512,{kernel:'nearest'}).webp({lossless:true,effort:6}).toFile(path.join(root,'assets/pistol-clockwork-v1.webp'));
 fs.writeFileSync(path.join(root,'ninja-layouts.json'),JSON.stringify({version:1,columns:6,rows:12,aspect:2,bodyFraction:.75,frames},null,2)+'\n');console.log('Packed ninja animations and pistol sprite');
})().catch(e=>{console.error(e);process.exit(1)});
