import {wallPanels} from './interiors.js';
import {residentHeight} from './resident-scale.js';
const MAX_RANGE=65,EPS=1e-8;
export function rayBox(origin,dir,box,range=MAX_RANGE){let lo=0,hi=range;for(const [axis,half,center]of [['x',box.w/2,box.x],['y',box.h/2,box.y],['z',box.d/2,box.z]]){if(Math.abs(dir[axis])<EPS){if(origin[axis]<center-half||origin[axis]>center+half)return null;}else{const a=(center-half-origin[axis])/dir[axis],b=(center+half-origin[axis])/dir[axis];lo=Math.max(lo,Math.min(a,b));hi=Math.min(hi,Math.max(a,b));if(lo>hi)return null;}}return lo<=range?lo:null;}
function sphere(origin,dir,c,r){const x=origin.x-c.x,y=origin.y-c.y,z=origin.z-c.z,b=x*dir.x+y*dir.y+z*dir.z,c0=x*x+y*y+z*z-r*r,disc=b*b-c0;if(disc<0)return null;const a=-b-Math.sqrt(disc),d=-b+Math.sqrt(disc);return a>=0?a:d>=0?d:null;}
export function rayPerson(origin,dir,p,ground=0){const radius=.30,low=ground+radius,high=ground+residentHeight(p)-radius,x=origin.x-p.x,z=origin.z-p.z,a=dir.x*dir.x+dir.z*dir.z,b=2*(x*dir.x+z*dir.z),c=x*x+z*z-radius*radius,distances=[];
 if(a>EPS){const disc=b*b-4*a*c;if(disc>=0)for(const t of [(-b-Math.sqrt(disc))/(2*a),(-b+Math.sqrt(disc))/(2*a)])if(t>=0&&origin.y+dir.y*t>=low&&origin.y+dir.y*t<=high)distances.push(t);}
 for(const y of [low,high]){const t=sphere(origin,dir,{x:p.x,y,z:p.z},radius);if(t!==null)distances.push(t);}return distances.length?Math.min(...distances):null;
}
export function createShotWorld(world){
 const replaced=new Set(),heights=new Map(),boxes=[],roofs=[];
 for(const b of world.buildings){for(const wall of b.walls??[])heights.set(wall,wall.h??b.h??5.8);for(const item of b.furniture??[])heights.set(item,(item.h??1)+.15);
  if(b.kind==='house'){
   for(const wall of b.walls)replaced.add(wall);
   boxes.push({x:b.x-b.w/2,y:b.h/2,z:b.z,w:.32,h:b.h,d:b.d},{x:b.x+b.w/2,y:b.h/2,z:b.z,w:.32,h:b.h,d:b.d});
   for(const side of [-1,1])for(const p of wallPanels(b.w,b.h))boxes.push({x:b.x+p.x,y:p.y,z:b.z+side*b.d/2,w:p.w,h:p.h,d:.32});
   roofs.push(b);
  }
 }
 for(const b of world.obstacles)if(b.kind!=='river'&&!replaced.has(b)){const h=heights.get(b)??b.h??(b.w>=4&&b.d>=4?8:1.5);boxes.push({...b,y:h/2,h});}
 // Castle and church ceilings are solid above their walkable rooms.
 for(const b of world.buildings.filter(b=>b.kind!=='house'))for(const room of b.rooms??[{x:b.x,z:b.z,w:b.w,d:b.d,name:''}])boxes.push({x:room.x,z:room.z,y:room.name==='Sala del tron'?8: b.kind==='castle'?5.6:b.h+.1,w:room.w,h:.2,d:room.d});
 function wallDistance(origin,dir,range=MAX_RANGE){let nearest=range;
  for(const box of boxes){const t=rayBox(origin,dir,box,nearest);if(t!==null&&t<nearest)nearest=t;}
  for(const b of roofs){const half=b.w/2+.65,slope=(b.w*.4+.18)/half,top=b.h+b.w*.4;
   for(const side of [-1,1]){const den=dir.y+side*slope*dir.x;if(Math.abs(den)<EPS)continue;const t=(top-origin.y-side*slope*(origin.x-b.x))/den;if(t<0||t>=nearest)continue;const x=origin.x+dir.x*t-b.x,z=origin.z+dir.z*t-b.z;if(x*side>=0&&Math.abs(x)<=half&&Math.abs(z)<=b.d/2+.6)nearest=t;}
  }
  // Ground and floors stop downward shots; the river/bridge use world heights.
  if(dir.y<0)for(let t=.12;t<nearest;t+=.16){const x=origin.x+dir.x*t,z=origin.z+dir.z*t;if(origin.y+dir.y*t<=world.heightAt(x,z)+.08){let lo=Math.max(0,t-.16),hi=t;for(let i=0;i<8;i++){const mid=(lo+hi)/2,mx=origin.x+dir.x*mid,mz=origin.z+dir.z*mid;if(origin.y+dir.y*mid<=world.heightAt(mx,mz)+.08)hi=mid;else lo=mid;}nearest=hi;break;}}
  return nearest;
 }
 return{wallDistance,boxes};
}
export function createPistol({population,poses=null,shotWorld,heightAt=()=>0,onDamage=()=>{},onShot=()=>{},onHurt=()=>{},onDown=()=>{},initialData=null}={}){
 let ammo=6,reserve=30,cooldown=0,reloading=0,equipped=true,health=100,healDelay=0,notice='Pistola del rellotger · clic o X per disparar',lastShot=null,serial=0;
 function reload(){if(reloading||ammo===6||reserve===0)return false;reloading=1.5;notice='Recarregant…';return true;}
 function fire(origin,direction,{enabled=true}={}){
  if(!enabled||!equipped||reloading>0||cooldown>0)return null;
  if(ammo===0){reload();notice=reserve?'Recarregant…':'Sense munició. Torna a l’armeria del castell.';return null;}
  const len=Math.hypot(direction.x,direction.y,direction.z);if(!Number.isFinite(len)||len<EPS)return null;
  const dir={x:direction.x/len,y:direction.y/len,z:direction.z/len};if(![origin.x,origin.y,origin.z].every(Number.isFinite))return null;
  ammo--;cooldown=.34;let distance=shotWorld.wallDistance(origin,dir,MAX_RANGE),person=null;
  for(const [i,p]of population.entries()){if(p.missionDead||p.health<=0)continue;const pose=poses?.[i]??p,t=rayPerson(origin,dir,{...p,x:pose.x,z:pose.z},heightAt(pose.x,pose.z));if(t!==null&&t<distance){distance=t;person=p;}}
  const point={x:origin.x+dir.x*distance,y:origin.y+dir.y*distance,z:origin.z+dir.z*distance};
  if(person)onDamage(person,34);
  lastShot={id:++serial,origin:{...origin},direction:dir,point,person,distance};notice=person?`Impacte · ${person.name}`:distance<MAX_RANGE?'Impacte a l’entorn':'Tret';onShot(lastShot);return lastShot;
 }
 function update(dt){if(!Number.isFinite(dt)||dt<=0)return;cooldown=Math.max(0,cooldown-dt);if(reloading>0){reloading=Math.max(0,reloading-dt);if(!reloading){const n=Math.min(6-ammo,reserve);ammo+=n;reserve-=n;notice='Pistola preparada';}}healDelay=Math.max(0,healDelay-dt);if(!healDelay)health=Math.min(100,health+dt*4);}
 function hurt(amount){if(!Number.isFinite(amount)||amount<=0)return;health=Math.max(0,health-amount);healDelay=7;onHurt(amount);if(health===0){health=100;reloading=0;cooldown=.5;ammo=Math.max(ammo,3);notice='Has caigut. Et recuperes a la plaça; la trama es conserva.';onDown();}}
 function refill(){reserve=36;ammo=6;reloading=0;notice='Munició reposada a l’armeria';}
 function serialize(){return{version:1,ammo,reserve,equipped,health};}
 function restore(d){if(d?.version!==1||!Number.isInteger(d.ammo)||d.ammo<0||d.ammo>6||!Number.isInteger(d.reserve)||d.reserve<0||d.reserve>60||typeof d.equipped!=='boolean'||!Number.isFinite(d.health)||d.health<=0||d.health>100)return false;ammo=d.ammo;reserve=d.reserve;equipped=d.equipped;health=d.health;reloading=cooldown=0;return true;}
 restore(initialData);return{fire,reload,refill,update,hurt,serialize,restore,toggle(){equipped=!equipped;return equipped;},get ammo(){return ammo;},get reserve(){return reserve;},get equipped(){return equipped;},get reloading(){return reloading>0;},get health(){return health;},get notice(){return notice;},get lastShot(){return lastShot;}};
}
