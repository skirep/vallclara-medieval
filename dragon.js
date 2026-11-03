import * as T from 'three';
import {stableView} from './sprite-motion.js';
export const DRAGON_ATLAS=new URL('./assets/dragon-flight-2d.webp',import.meta.url).href;
export const DRAGON_FRAMES=6,DRAGON_VIEWS=4,DRAGON_FPS=8;
export const DRAGON_HOURS=[10,17],DRAGON_DURATION=.5;
export function dragonFlight(hours){
 if(!Number.isFinite(hours)||hours<0)return null;
 const day=Math.floor(hours/24),hour=hours-day*24;
 for(const at of DRAGON_HOURS)if(hour>=at&&hour<at+DRAGON_DURATION)return {day,at,id:`${day}:${at}`,progress:(hour-at)/DRAGON_DURATION};
 return null;
}
export function nextDragonHour(hours){const day=Math.floor(hours/24);return DRAGON_HOURS.map(h=>day*24+h).find(h=>h>hours)??(day+1)*24+DRAGON_HOURS[0];}
export function createDragon(scene,buildings=[],{textureLoader=new T.TextureLoader()}={}){
 const root=new T.Group();root.name='Drac 2D de les dues ribes';root.visible=false;scene.add(root);
 const material=new T.MeshBasicMaterial({alphaTest:.45,side:T.DoubleSide,fog:true});
 const sprite=new T.Mesh(new T.PlaneGeometry(12,12),material);sprite.name='Drac dibuixat · 24 fotogrames';sprite.userData.spriteBillboard=true;root.add(sprite);
 let texture=null,current=null,frame=0,view=0;const viewState={view:null};
 const ready=new Promise((resolve,reject)=>textureLoader.load(DRAGON_ATLAS,image=>{
  texture=image;texture.colorSpace=T.SRGBColorSpace;texture.minFilter=texture.magFilter=T.LinearFilter;texture.generateMipmaps=false;
  // Inset half a texel so linear filtering never samples a neighbouring cell.
  texture.repeat.set((256-1)/1536,(256-1)/1024);material.map=texture;material.needsUpdate=true;resolve();
 },undefined,()=>reject(new Error('No s’ha pogut carregar el drac 2D. Torna a carregar la pàgina.'))));
 const route=new T.CatmullRomCurve3([[-105,35,30],[-47,15,28],[-42,15,-6],[-9,15,-30],[29,16,-42],[48,15,-4],[28,15,28],[-8,15,43],[-46,16,24],[-105,35,55]].map(p=>new T.Vector3(...p)));
 function point(t){const p=route.getPoint(T.MathUtils.clamp(t,0,1));for(const b of buildings){const d=Math.hypot(Math.max(0,Math.abs(p.x-b.x)-b.w/2),Math.max(0,Math.abs(p.z-b.z)-b.d/2)),roof=b.kind==='church'?19:b.kind==='castle'?10:b.h+b.w*.4;const influence=1-T.MathUtils.smoothstep(d,3,14);p.y=Math.max(p.y,T.MathUtils.lerp(p.y,roof+6,influence));}return p;}
 function update(hours,observer={x:0,z:0}){
  current=dragonFlight(hours);root.visible=!!current;if(!current)return;
  const t=current.progress,p=point(t),ahead=point(Math.min(1,t+.001)),behind=point(Math.max(0,t-.001)),direction=ahead.sub(behind);
  const heading=Math.atan2(direction.x,direction.z),angle=Math.atan2(observer.x-p.x,observer.z-p.z);
  view=stableView(viewState,heading,angle);frame=Math.floor(t*DRAGON_DURATION*180*DRAGON_FPS)%DRAGON_FRAMES;
  root.position.copy(p);root.rotation.set(0,angle,0);
  if(texture)texture.offset.set((frame*256+.5)/1536,((3-view)*256+.5)/1024);
 }
 return {root,sprite,ready,update,point,get flight(){return current;},get frame(){return frame;},get view(){return view;}};
}
