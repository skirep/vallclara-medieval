import {DRAGON_PLAZA} from './dragon-encounter.js';
export function guardCombatPost(p,nav){
 const g=p.royalGuard,angle=g.index/12*Math.PI*2,radius=g.weapon==='sword'?5.2:7.2;
 const desired={x:DRAGON_PLAZA.x+Math.sin(angle)*radius,z:DRAGON_PLAZA.z+Math.cos(angle)*radius};
 // The prevalidated plaza graph keeps weapon formations away from stalls.
 return nav.seats.filter(q=>Math.hypot(q.x-DRAGON_PLAZA.x,q.z-DRAGON_PLAZA.z)>4.8).sort((a,b)=>Math.hypot(a.x-desired.x,a.z-desired.z)-Math.hypot(b.x-desired.x,b.z-desired.z))[0];
}
