import {blocked,lanes} from './simulation.js';
const STEP=1.1,EXTENT=82,SIZE=EXTENT*2+1;
const hash=(seed,a,b)=>{let n=Math.imul(seed^Math.imul(a,374761393),668265263)^Math.imul(b,1274126177);n=Math.imul(n^(n>>>13),2246822519);return ((n^(n>>>16))>>>0)/4294967296;};
class Frontier{
 constructor(){this.items=[];}
 push(item){const a=this.items;let i=a.length;a.push(item);while(i){const p=(i-1)>>1;if(a[p].priority<=item.priority)break;a[i]=a[p];i=p;}a[i]=item;}
 pop(){const a=this.items,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].priority<a[c].priority)c++;if(a[c].priority>=last.priority)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
}
export function createAssemblyNavigation(obstacles){
 const total=SIZE*SIZE,parent=new Int32Array(total).fill(-1),free=new Uint8Array(total),queue=new Int32Array(total);
 const links=new Int32Array(total*4).fill(-1),traffic=new Float32Array(total);
 const point=id=>({x:(id%SIZE-EXTENT)*STEP,z:(Math.floor(id/SIZE)-EXTENT)*STEP});
 const idFor=(x,z)=>(Math.round(z/STEP)+EXTENT)*SIZE+Math.round(x/STEP)+EXTENT;
 const isClear=(x,z)=>!blocked(x,z,obstacles,.34,91);
 const segmentClear=(a,b)=>{const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.25));for(let i=0;i<=steps;i++)if(!isClear(a.x+(b.x-a.x)*i/steps,a.z+(b.z-a.z)*i/steps))return false;return true;};
 for(let id=0;id<total;id++){
  const p=point(id),inSquare=Math.abs(p.x+12)<=20.9&&Math.abs(p.z)<=20.9;
  const inStreet=lanes.some(l=>Math.abs(p.x-l)<=2.2||Math.abs(p.z-l)<=2.2);
  // Include the exterior patrol ring; walls and towers still block edges.
  const inCastle=p.x>16&&p.x<56&&p.z> -90&&p.z< -52;
  free[id]=(inSquare||inStreet||inCastle)&&isClear(p.x,p.z)?1:0;
 }
 // Validate each undirected edge once; every resident reuses this collision graph.
 for(let id=0;id<total;id++)if(free[id]){
  const x=id%SIZE,z=Math.floor(id/SIZE);
  for(const [next,direction,reverse] of [[x<SIZE-1?id+1:-1,1,0],[z<SIZE-1?id+SIZE:-1,3,2]]){
   if(next>=0&&free[next]&&segmentClear(point(id),point(next))){links[id*4+direction]=next;links[next*4+reverse]=id;}
  }
 }
 const root=idFor(0,0);if(!free[root])throw Error('La plaça no té cap accés lliure');
 let head=0,tail=1;queue[0]=root;parent[root]=root;
 while(head<tail){const id=queue[head++];for(let d=0;d<4;d++){const next=links[id*4+d];if(next>=0&&parent[next]===-1){parent[next]=id;queue[tail++]=next;}}}
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
 const costs=new Float64Array(total),seen=new Uint32Array(total),previous=new Int32Array(total),frontier=new Frontier();let search=0;
 const nearestLane=value=>lanes.reduce((best,lane)=>Math.abs(value-lane)<Math.abs(value-best)?lane:best,lanes[0]);
 function path(from,to,{seed=0,diversity=true,recordTraffic=true}={}){
  const start=nearest(from),goal=nearest(to),gx=goal%SIZE,gz=Math.floor(goal/SIZE);
  const heuristic=id=>Math.abs(id%SIZE-gx)+Math.abs(Math.floor(id/SIZE)-gz);
  const preferredX=(Math.floor(hash(seed,17,29)*3)-1)*STEP,preferredZ=(Math.floor(hash(seed,31,43)*3)-1)*STEP;
  if(++search===4294967296){seen.fill(0);search=1;}
  frontier.items.length=0;costs[start]=0;seen[start]=search;previous[start]=-1;frontier.push({id:start,priority:heuristic(start),cost:0});
  while(frontier.items.length){
   const current=frontier.pop(),id=current.id;if(current.cost!==costs[id])continue;if(id===goal)break;
   const p=point(id);
   for(let d=0;d<4;d++){
    const next=links[id*4+d];if(next<0)continue;
    const q=point(next),horizontal=d<2,inSquare=Math.abs(q.x+12)<=20.9&&Math.abs(q.z)<=20.9;
    // Coarse street preferences select different blocks; lateral preferences
    // spread people across street width rather than adding cell-by-cell noise.
    const road=horizontal?hash(seed,Math.floor((p.x+q.x)/52),Math.round(nearestLane(q.z))*2):hash(seed,Math.round(nearestLane(q.x))*2+1,Math.floor((p.z+q.z)/52));
    const lateral=inSquare?0:Math.min(1,Math.abs(horizontal?q.z-nearestLane(q.z)-preferredZ:q.x-nearestLane(q.x)-preferredX)/(STEP*3));
    const weight=diversity?1+.2*road+.14*lateral+.11*Math.min(1,traffic[next]/8):1;
    const cost=current.cost+weight;
    if(seen[next]!==search||cost<costs[next]-1e-10){seen[next]=search;costs[next]=cost;previous[next]=id;frontier.push({id:next,cost,priority:cost+heuristic(next)});}
   }
  }
  if(seen[goal]!==search)throw Error('No hi ha ruta fins a la plaça');
  const ids=[];for(let id=goal;id>=0;id=previous[id])ids.push(id);ids.reverse();
  if(recordTraffic)for(const id of ids)traffic[id]++;
  // Removing only collinear points preserves every chosen street and safe edge.
  const points=ids.filter((id,i)=>!i||i===ids.length-1||id-ids[i-1]!==ids[i+1]-id).map(point);
  if(segmentClear(points.at(-1),to))points.push({...to});return points;
 }
 const priest=point(nearest({x:-12,z:-17.6}));
 const seats=Array.from(queue.slice(0,tail),id=>point(id)).filter(p=>p.x>=-29&&p.x<=1.5&&Math.abs(p.z)<=18.7&&!(Math.abs(p.x+12)<3.3&&p.z< -14.3));
 seats.sort((a,b)=>a.z-b.z||a.x-b.x);
 return {path,seats,priest,segmentClear,resetTraffic(){traffic.fill(0);}};
}
