import {blocked,lanes} from './simulation.js';
const STEP=1.1,EXTENT=82,SIZE=EXTENT*2+1;
export function createAssemblyNavigation(obstacles){
 const total=SIZE*SIZE,parent=new Int32Array(total).fill(-1),free=new Uint8Array(total),queue=new Int32Array(total);
 const point=id=>({x:(id%SIZE-EXTENT)*STEP,z:(Math.floor(id/SIZE)-EXTENT)*STEP});
 const idFor=(x,z)=>(Math.round(z/STEP)+EXTENT)*SIZE+Math.round(x/STEP)+EXTENT;
 const isClear=(x,z)=>!blocked(x,z,obstacles,.34,91);
 const segmentClear=(a,b)=>{const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.25));for(let i=0;i<=steps;i++)if(!isClear(a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps))return false;return true;};
 for(let id=0;id<total;id++){
  const p=point(id),inSquare=Math.abs(p.x)<=20.9&&Math.abs(p.z)<=20.9;
  const inStreet=lanes.some(l=>Math.abs(p.x-l)<=2.2||Math.abs(p.z-l)<=2.2);
  free[id]=(inSquare||inStreet)&&isClear(p.x,p.z)?1:0;
 }
 const root=idFor(0,0);if(!free[root])throw Error('La plaça no té cap accés lliure');
 let head=0,tail=1;queue[0]=root;parent[root]=root;
 while(head<tail){const id=queue[head++],x=id%SIZE,z=Math.floor(id/SIZE);
  for(const next of [x? id-1:-1,x<SIZE-1?id+1:-1,z?id-SIZE:-1,z<SIZE-1?id+SIZE:-1]){
   if(next<0||!free[next]||parent[next]!==-1||!segmentClear(point(id),point(next)))continue;
   parent[next]=id;queue[tail++]=next;
  }
 }
 function nearest(p){
  const cx=Math.round(p.x/STEP)+EXTENT,cz=Math.round(p.z/STEP)+EXTENT;
  for(let radius=0;radius<12;radius++){
   const candidates=[];
   for(let z=Math.max(0,cz-radius);z<=Math.min(SIZE-1,cz+radius);z++)for(let x=Math.max(0,cx-radius);x<=Math.min(SIZE-1,cx+radius);x++){
    const id=z*SIZE+x;if(parent[id]<0)continue;const q=point(id);if(segmentClear(p,q))candidates.push({id,d:Math.hypot(p.x-q.x,p.z-q.z)});
   }
   if(candidates.length)return candidates.sort((a,b)=>a.d-b.d)[0].id;
  }
  throw Error(`No hi ha camí segur des de ${p.x.toFixed(1)}, ${p.z.toFixed(1)}`);
 }
 function path(from,to){
  const start=nearest(from),goal=nearest(to),a=[start],b=[goal];
  while(a.at(-1)!==root)a.push(parent[a.at(-1)]);
  while(b.at(-1)!==root)b.push(parent[b.at(-1)]);
  let i=a.length-1,j=b.length-1;while(i>=0&&j>=0&&a[i]===b[j]){i--;j--;}
  const ids=[...a.slice(0,i+2),...b.slice(0,j+1).reverse()];
  const points=ids.map(point);if(segmentClear(points.at(-1),to))points.push({...to});return points;
 }
 const priest=point(nearest({x:0,z:-17.6}));
 const seats=Array.from(queue.slice(0,tail),id=>point(id)).filter(p=>Math.abs(p.x)<=18.7&&Math.abs(p.z)<=18.7&&!(Math.abs(p.x)<3.3&&p.z< -14.3));
 seats.sort((a,b)=>a.z-b.z||a.x-b.x);
 return {path,seats,priest,segmentClear};
}
