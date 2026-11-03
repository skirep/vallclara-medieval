import {DRAGON_HOURS,DRAGON_DURATION,dragonFlight,DRAGON_PLAZA,DRAGON_RAID,dragonPhase} from './dragon-encounter.js';
import {createDragonFire,fireEnvelope} from './dragon-fire.js';
import {spriteDirection} from './sprite-directions.js';
import * as T from 'three';
import {stableView} from './sprite-motion.js';
export const DRAGON_ATLAS=new URL('./assets/dragon-flight-2d.webp',import.meta.url).href;
export const DRAGON_FRAMES=6,DRAGON_VIEWS=4,DRAGON_FPS=8;
export {DRAGON_HOURS,DRAGON_DURATION,dragonFlight,nextDragonHour} from './dragon-encounter.js';
export function createDragon(scene,buildings=[],{textureLoader=new T.TextureLoader()}={}){
 const root=new T.Group();root.name='Drac 2D de les dues ribes';root.visible=false;scene.add(root);
 const material=new T.MeshBasicMaterial({alphaTest:.45,side:T.DoubleSide,fog:true});
 const sprite=new T.Mesh(new T.PlaneGeometry(12,12),material);sprite.name='Drac dibuixat · 24 fotogrames';sprite.userData.spriteBillboard=true;root.add(sprite);
 const fire=createDragonFire(scene);let fireActive=false;
 let texture=null,current=null,frame=0,view=0;const viewState={view:null};
 const ready=new Promise((resolve,reject)=>textureLoader.load(DRAGON_ATLAS,image=>{
  texture=image;texture.colorSpace=T.SRGBColorSpace;texture.minFilter=texture.magFilter=T.LinearFilter;texture.generateMipmaps=false;
  // Inset half a texel so linear filtering never samples a neighbouring cell.
  texture.repeat.set((256-1)/1536,(256-1)/1024);material.map=texture;material.needsUpdate=true;resolve();
 },undefined,()=>reject(new Error('No s’ha pogut carregar el drac 2D. Torna a carregar la pàgina.'))));
 const waypoints=[new T.Vector3(-105,35,40)];
 for(let i=0;i<=48;i++){const a=Math.PI+i/16*Math.PI*2;waypoints.push(new T.Vector3(48*Math.cos(a),22+Math.sin(a*2)*3,-19+53*Math.sin(a)));}
 waypoints.push(new T.Vector3(-105,38,55));
 const route=new T.CatmullRomCurve3(waypoints);
 function clearRoofs(p,outer=14){for(const b of buildings){const d=Math.hypot(Math.max(0,Math.abs(p.x-b.x)-b.w/2),Math.max(0,Math.abs(p.z-b.z)-b.d/2)),roof=b.kind==='church'?19:b.kind==='castle'?10:b.h+b.w*.4;const influence=1-T.MathUtils.smoothstep(d,3,outer);p.y=Math.max(p.y,T.MathUtils.lerp(p.y,roof+6,influence));}return p;}
 function orbitPoint(t){return clearRoofs(route.getPoint(T.MathUtils.clamp(t,0,1)));}
 const plaza=new T.Vector3(DRAGON_PLAZA.x,DRAGON_PLAZA.y,DRAGON_PLAZA.z);
 function point(t){t=T.MathUtils.clamp(t,0,1);const r=DRAGON_RAID;
  if(t<r.descend)return orbitPoint(t/r.descend*.48);
  if(t<r.attack)return clearRoofs(orbitPoint(.48).lerp(plaza,T.MathUtils.smoothstep(t,r.descend,r.attack)),8);
  if(t<r.ascend)return plaza.clone().add(new T.Vector3(0,Math.sin((t-r.attack)*55)*.22*Math.sin((t-r.attack)/(r.ascend-r.attack)*Math.PI),0));
  if(t<r.leave)return clearRoofs(plaza.clone().lerp(orbitPoint(.52),T.MathUtils.smoothstep(t,r.ascend,r.leave)),8);
  return orbitPoint(.52+(t-r.leave)/(1-r.leave)*.48);
 }
 let phase=null,heading=0;

 function update(hours,observer={x:0,z:0},{target=null}={}){
  current=dragonFlight(hours);phase=current?dragonPhase(current.progress):null;root.visible=!!current;fireActive=false;if(!current){fire.update(root.position,0,observer,0,0);return;}
  const t=current.progress,p=point(t),ahead=point(Math.min(1,t+.001)),behind=point(Math.max(0,t-.001)),direction=ahead.sub(behind);
  heading=phase==='attacking'?Math.atan2((target?.x??p.x)-p.x,(target?.z??p.z+12)-p.z):Math.atan2(direction.x,direction.z);const angle=Math.atan2(observer.x-p.x,observer.z-p.z);
  view=spriteDirection('dragon',stableView(viewState,heading,angle)).view;frame=Math.floor(t*DRAGON_DURATION*180*DRAGON_FPS)%DRAGON_FRAMES;
  const low=phase==='attacking',aim=low?(target??{x:p.x,y:1,z:p.z+14}):null,strength=phase==='ascending'?0:fireEnvelope(t);fireActive=strength>0;fire.update(p,heading,observer,hours*180,strength,{target:aim});
  root.position.copy(p);root.rotation.set(0,angle,0);
  if(texture)texture.offset.set((frame*256+.5)/1536,((3-view)*256+.5)/1024);
 }
 return {root,sprite,fire,ready,update,point,orbitPoint,get phase(){return phase;},get heading(){return heading;},get fireActive(){return fireActive;},get flight(){return current;},get frame(){return frame;},get view(){return view;}};
}
