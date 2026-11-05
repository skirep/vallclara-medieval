import * as T from 'three';
import {residentHeight} from './resident-scale.js';
export function createResidentFollow(population,{obstacles=[],buildings=[],heightAt=()=>0}={}){
 const byId=new Map(population.map(p=>[p.id,p])),eye=new T.Vector3(),desired=new T.Vector3(),next=new T.Vector3();let target=null,initialized=false;
 const colliders=obstacles.filter(b=>b.kind!=='river').map(b=>{const building=buildings.find(h=>Math.abs(b.x-h.x)<=h.w/2+.5&&Math.abs(b.z-h.z)<=h.d/2+.5),base=heightAt(b.x,b.z),top=b.h??building?.h??3;return {min:new T.Vector3(b.x-b.w/2-.16,base-.2,b.z-b.d/2-.16),max:new T.Vector3(b.x+b.w/2+.16,base+top+.15,b.z+b.d/2+.16)};});
 // Camera collision ignores water; a view can cross the river while remaining
 // clear of walls, furniture and ceilings. The walking avatar stays separate.
 function clip(from,to){
  const delta=to.clone().sub(from),length=delta.length();let hit=1;
  for(const b of colliders){let enter=0,leave=1;
   for(let axis=0;axis<3;axis++){const origin=from.getComponent(axis),speed=delta.getComponent(axis),min=b.min.getComponent(axis),max=b.max.getComponent(axis);if(Math.abs(speed)<1e-9){if(origin<min||origin>max){enter=2;break;}continue;}let a=(min-origin)/speed,c=(max-origin)/speed;if(a>c)[a,c]=[c,a];enter=Math.max(enter,a);leave=Math.min(leave,c);if(enter>leave)break;}
   if(enter<=leave&&leave>0&&enter>=0&&enter<hit)hit=Math.max(0,enter-.12/Math.max(length,.001));
  }
  return from.clone().addScaledVector(delta,hit);
 }
 function select(id){const p=byId.get(id);if(!p||p.missionDead)return false;target=p;initialized=false;return true;}
 function stop(){const p=target;target=null;initialized=false;return p;}
 function update(camera,dt,{yaw=0,pitch=0,position=target}={}){
  if(!target)return false;if(target.missionDead){stop();return false;}const p=position??target,ground=heightAt(p.x,p.z),room=buildings.find(b=>Math.abs(p.x-b.x)<b.w/2&&Math.abs(p.z-b.z)<b.d/2);
  eye.set(p.x,ground+residentHeight(target)*.73-(target.seated ? .25 : 0),p.z);
  const distance=room?3.2:6.5,height=room?2.45:T.MathUtils.clamp(3.8-Math.sin(pitch)*3,1.7,6.2);
  desired.set(p.x+Math.sin(yaw)*distance,ground+height,p.z+Math.cos(yaw)*distance);next.copy(clip(eye,desired));
  if(initialized)next.lerp(camera.position,Math.exp(-7*Math.max(0,dt)));
  next.copy(clip(eye,next));camera.position.copy(next);camera.lookAt(eye);initialized=true;return true;
 }
 return {select,stop,update,clip,get target(){return target;},get active(){return target!==null;}};
}
export function pickResident(people,camera,x,y,{occluders=[]}={}){
 const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x,y),camera);const meshes=Object.values(people.parts);
 for(const mesh of meshes)mesh.boundingSphere=null;
 for(const hit of ray.intersectObjects(meshes,false)){
  const index=hit.object.userData.residentIndices?.[hit.instanceId];if(index!==undefined){const blocker=ray.intersectObjects(occluders,false)[0];return blocker&&blocker.distance<hit.distance-.05?null:index;}
 }
 return null;
}
