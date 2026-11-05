import * as T from 'three';
import {createAssemblyNavigation} from './assembly-navigation.js';
import {CASTLE} from './castle.js';
export function createRoyalCourt(population,obstacles){
 const nav=createAssemblyNavigation(obstacles),members=CASTLE.thrones.map(seat=>({seat,person:population.find(p=>p.spriteId===seat.spriteId),path:[],step:0,destination:null})).filter(m=>m.person);
 for(const m of members)m.person.courtSeat=m.seat;
 function update(dt,hours){
  const hour=(hours%24+24)%24;
  for(const m of members){const p=m.person;if(p.missionDead){p.seated=false;continue;}if(p.health===0||p.missionCombat)continue;if(p.dragonEmergency){p.seated=false;continue;}
   if(p.assembly||p.assemblyReleased){p.seated=false;m.destination=null;continue;}
   const audience=hour>=8.5&&hour<19,target=audience?m.seat:{x:43.2+(p.sex?4.7:0),z:-71.5};
   const key=`${target.x}:${target.z}`;
   if(m.destination!==key){m.path=nav.path(p,target,{seed:p.id,diversity:false,recordTraffic:false});m.step=0;m.destination=key;p.seated=false;p.path=[];}
   let budget=p.speed*dt;
   while(m.step<m.path.length&&budget>0){const q=m.path[m.step],dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz);if(d<1e-7){m.step++;continue;}const step=Math.min(d,budget);p.x+=dx/d*step;p.z+=dz/d*step;p.heading=Math.atan2(dx,dz);p.walk+=step*5;budget-=step;if(step===d)m.step++;}
   const arrived=m.step===m.path.length&&Math.hypot(p.x-target.x,p.z-target.z)<.15;
   p.seated=audience&&arrived;p.state=arrived?(p.social?.conversation!=null?'talking':'resting'):'walking';if(arrived)p.heading=0;
  }
 }
 return {update,members};
}
// Robes over bent knees and boots complete the cropped upper-body seated pose.
export function createSeatedRoyalLegs(scene,population){
 const groups=CASTLE.thrones.map((seat,i)=>{
  const person=population.find(p=>p.spriteId===seat.spriteId),group=new T.Group();group.position.set(seat.x,0,seat.z);group.visible=false;
  const robe=new T.MeshStandardMaterial({color:i?'#617c78':'#803e32',roughness:.95}),boot=new T.MeshStandardMaterial({color:'#362b22',roughness:1});
  function part(material,x,y,z,w,h,d){const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;group.add(mesh);}
  part(robe,0,.56,.20,.64,.17,.62);part(robe,0,.32,.48,.66,.48,.22);
  for(const dx of [-.19,.19])part(boot,dx,.10,.60,.20,.18,.34);
  scene.add(group);return {group,person};
 });
 return {update(){for(const {group,person}of groups)group.visible=!!person?.seated&&!person.missionDead&&!person.assembly;}};
}
