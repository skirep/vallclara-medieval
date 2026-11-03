// Pack authored pixel-art frames. Crops, anchor alignment and lossless encoding
// only; never paint, recolour or synthesize missing character poses.
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

if(process.argv.length<6)throw Error('Usage: node scripts/pack-royal-guards.cjs sword.png spear.png sword-attack.png spear-attack.png');
const sources={sword:process.argv[2],spear:process.argv[3]},attackSources={sword:process.argv[4],spear:process.argv[5]};
(async()=>{fs.mkdirSync(out,{recursive:true});let spec={version:2,columns:6,rows:12,aspect:2,bodyFraction:{sword:195/256,spear:195/256},weapons:{}};
 for(const [weapon,source]of Object.entries(sources)){
  const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height;
  const alpha=(x,y)=>data[(y*w+x)*4+3]>=115,rows=[0];
  for(let r=1;r<12;r++){let best=Math.round(r*h/12),score=Infinity;for(let y=best-8;y<=Math.round(r*h/12)+8;y++){let n=0;for(let x=0;x<w;x++)if(alpha(x,y))n++;if(n<score){score=n;best=y;}}rows.push(best);}
  rows.push(h);const frames=[];
  for(let row=0;row<12;row++)for(let frame=0;frame<6;frame++){
   const count=weapon==='sword'&&row<8?5:6;
   // The sword walk/idle sheet has five authored poses; hold the first pose
   // for one extra frame. The six authored attack poses are kept individually.
   let sourceFrame=Math.floor(frame*count/6);
   // Last front idle spearman pose is a rear view: retain the preceding front.
   if(weapon==='spear'&&row===4&&sourceFrame===5)sourceFrame=4;
   const left=Math.floor(sourceFrame*w/count),right=Math.floor((sourceFrame+1)*w/count),top=rows[row],bottom=rows[row+1];
   let x0=right,x1=left,y0=bottom,y1=top;
   for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(alpha(x,y)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
   if(x0>x1)throw Error(`Empty ${weapon}/${row}/${frame}`);
   // Foot centroid anchors every pose to the same world position. The fixed
   // scale preserves body size when weapons rise or extend sideways.
   let sum=0,n=0;for(let y=Math.max(top,y1-20);y<=y1;y++)for(let x=left;x<right;x++)if(alpha(x,y)){sum+=x;n++;}
   frames.push({row,frame,sourceFrame,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,anchorX:n?sum/n:(x0+x1)/2,footY:y1+1});
  }
  const bodySpan=weapon==='sword'?170:156;
  const attackSource=attackSources[weapon],attack=await sharp(attackSource).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let row=8;row<12;row++)for(let frame=0;frame<6;frame++){const aw=attack.info.width,ah=attack.info.height,left=Math.floor(frame*aw/6),right=Math.floor((frame+1)*aw/6),top=Math.floor((row-8)*ah/4),bottom=Math.floor((row-7)*ah/4),aa=(x,y)=>attack.data[(y*aw+x)*4+3]>=115;let x0=right,x1=left,y0=bottom,y1=top;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++)if(aa(x,y)){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}let sum=0,n=0;for(let y=Math.max(top,y1-20);y<=y1;y++)for(let x=left;x<right;x++)if(aa(x,y)){sum+=x;n++;}frames[row*6+frame]={row,frame,sourceFrame:frame,source:'attack',x:x0,y:y0,w:x1-x0+1,h:y1-y0+1,anchorX:sum/n,footY:y1+1};}
  spec.weapons[weapon]={source:path.basename(source),attackSource:path.basename(attackSource),width:w,height:h,bodySpan,attackBodySpan:weapon==='sword'?190:156,frames};
  for(const height of [64,96,128]){
   const cellWidth=height*2,items=[];
   for(const f of frames){const scale=height*spec.bodyFraction[weapon]/(f.source==='attack'?spec.weapons[weapon].attackBodySpan:bodySpan);const width=Math.max(1,Math.round(f.w*scale)),fh=Math.max(1,Math.round(f.h*scale)),left=Math.round(f.frame*cellWidth+cellWidth/2+(f.x-f.anchorX)*scale),top=Math.round(f.row*height+height*242/256+(f.y-f.footY)*scale);
    const cropped=await cropFrame(f.source==='attack'?attackSource:source,f);const buffer=await cropped.resize(width,fh,{kernel:'nearest'}).png().toBuffer();
    // All frames must stay in their own UV cell, never bleed into neighbours.
    if(left<f.frame*cellWidth||left+width>(f.frame+1)*cellWidth||top<f.row*height||top+fh>(f.row+1)*height)throw Error(`Frame outside cell: ${weapon}/${f.row}/${f.frame}`);
    items.push({input:buffer,left,top});
   }
   await sharp({create:{width:cellWidth*6,height:height*12,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(items).webp({lossless:true,effort:6}).toFile(path.join(out,`royal-guard-${weapon}-v2-${height}.webp`));
  }
 }
 fs.writeFileSync(path.join(root,'royal-guard-layouts.json'),JSON.stringify(spec,null,2)+'\n');console.log('Packed both royal guards at 64, 96 and 128 pixels');
})().catch(e=>{console.error(e);process.exit(1)});
