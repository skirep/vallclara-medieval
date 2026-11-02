// Small PNG reader for generated RGBA8, non-interlaced art QA (no dependency).
import {inflateSync} from 'node:zlib';
export function decodeRGBA(png){
 const data=[];let w,h;
 for(let i=8;i<png.length;){const n=png.readUInt32BE(i),type=png.toString('ascii',i+4,i+8),body=png.subarray(i+8,i+8+n);i+=12+n;
  if(type==='IHDR'){w=body.readUInt32BE(0);h=body.readUInt32BE(4);if(body[8]!==8||body[9]!==6||body[12]!==0)throw Error('Expected non-interlaced RGBA8 PNG');}
  if(type==='IDAT')data.push(body);
 }
 const raw=inflateSync(Buffer.concat(data)),stride=w*4,pixels=Buffer.alloc(w*h*4);
 const paeth=(a,b,c)=>{const p=a+b-c,da=Math.abs(p-a),db=Math.abs(p-b),dc=Math.abs(p-c);return da<=db&&da<=dc?a:db<=dc?b:c;};
 for(let y=0;y<h;y++){
  const filter=raw[y*(stride+1)];
  for(let x=0;x<stride;x++){
   const at=y*stride+x,a=x>=4?pixels[at-4]:0,b=y?pixels[at-stride]:0,c=y&&x>=4?pixels[at-stride-4]:0;
   const pred=filter===0?0:filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):NaN;
   if(!Number.isFinite(pred))throw Error('Unknown PNG filter');pixels[at]=(raw[y*(stride+1)+x+1]+pred)&255;
  }
 }
 return {width:w,height:h,pixels};
}
