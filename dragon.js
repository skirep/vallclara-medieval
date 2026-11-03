import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
export const DRAGON_HOURS=[10,17],DRAGON_DURATION=.5;
export function dragonFlight(hours){
 if(!Number.isFinite(hours)||hours<0)return null;
 const day=Math.floor(hours/24),hour=hours-day*24;
 for(const at of DRAGON_HOURS)if(hour>=at&&hour<at+DRAGON_DURATION)return {day,at,id:`${day}:${at}`,progress:(hour-at)/DRAGON_DURATION};
 return null;
}
export function nextDragonHour(hours){const day=Math.floor(hours/24);return DRAGON_HOURS.map(h=>day*24+h).find(h=>h>hours)??(day+1)*24+DRAGON_HOURS[0];}
export function createDragon(scene,buildings=[]){
 const root=new T.Group();root.name='Drac de les dues ribes';root.visible=false;scene.add(root);
 const skin=new T.MeshStandardMaterial({color:'#386a59',roughness:.74,metalness:.12}),belly=new T.MeshStandardMaterial({color:'#b19b62',roughness:.83}),horn=new T.MeshStandardMaterial({color:'#dfcba0',roughness:.65}),dark=new T.MeshStandardMaterial({color:'#192e26',roughness:.8}),eye=new T.MeshStandardMaterial({color:'#ffc35a',emissive:'#cd6817',emissiveIntensity:.9}),membrane=new T.MeshStandardMaterial({color:'#875047',side:T.DoubleSide,roughness:.84});
 const body=new T.Group();root.add(body);const sphere=new T.SphereGeometry(1,12,8),cone=new T.ConeGeometry(1,1,8);
 function mesh(group,geometry,material,position,scale,rotation=[0,0,0]){const m=new T.Mesh(geometry,material);m.position.set(...position);m.scale.set(...scale);m.rotation.set(...rotation);m.castShadow=m.receiveShadow=true;group.add(m);return m;}
 const ell=(g,m,p,s)=>mesh(g,sphere,m,p,s);
 function bone(g,a,b,r=.08,material=skin){const d=new T.Vector3(...b).sub(new T.Vector3(...a)),m=mesh(g,new T.CylinderGeometry(r*.6,r,d.length(),7),material,new T.Vector3(...a).add(new T.Vector3(...b)).multiplyScalar(.5).toArray(),[1,1,1]);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function bake(g){const batches=new Map();for(const m of [...g.children])if(m.isMesh){m.updateMatrix();const geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrix);if(!batches.has(m.material))batches.set(m.material,[]);batches.get(m.material).push(geo);g.remove(m);}
  for(const [material,parts]of batches){const m=new T.Mesh(mergeGeometries(parts,false),material);m.castShadow=m.receiveShadow=true;g.add(m);for(const p of parts)p.dispose();}}
 ell(body,skin,[0,0,0],[.78,.8,1.65]);ell(body,belly,[0,-.32,.15],[.63,.56,1.37]);ell(body,skin,[0,.35,1.55],[.43,.53,.9]);ell(body,skin,[0,.67,2.3],[.58,.47,.7]);ell(body,skin,[0,.51,2.9],[.44,.24,.65]);ell(body,dark,[0,.34,3.08],[.42,.035,.48]);
 for(const side of [-1,1]){
  ell(body,eye,[side*.48,.79,2.65],[.13,.12,.12]);ell(body,dark,[side*.51,.79,2.73],[.045,.095,.035]);ell(body,dark,[side*.23,.63,3.39],[.065,.035,.045]);
  mesh(body,cone,horn,[side*.42,1.19,2.02],[.17,.82,.17],[-.55,0,-side*.35]);
  for(const z of [-.9,.85]){ell(body,skin,[side*.6,-.58,z],[.30,.5,.4]);bone(body,[side*.65,-.7,z],[side*.85,-1.15,z+.28],.18);for(let i=0;i<3;i++)mesh(body,cone,horn,[side*.85+(i-1)*.12,-1.18,z+.55],[.055,.26,.055],[Math.PI/2,0,0]);}
 }
 for(let z=-1.3;z<1.9;z+=.38)mesh(body,cone,horn,[0,.82,z],[.16,.45,.19],[.25,0,0]);
 // Small overlapping scales follow the torso rather than a flat painted plane.
 for(let row=0;row<7;row++)for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ell(body,row%3?skin:belly,[Math.cos(a)*.74,Math.sin(a)*.72,(row-3)*.39],[.16,.10,.23]);}
 bake(body);
 const wings=[];
 for(const side of [-1,1]){
  const pivot=new T.Group();pivot.position.set(side*.5,.45,.5);root.add(pivot);
  const points=[[0,0,.4],[side*1.8,.28,1],[side*4.5,.05,.3],[side*3.4,-.18,-1.1],[side*2.3,-.15,-1.6],[side*.7,-.1,-1.35]];
  const vertices=[];for(let i=1;i<points.length-1;i++)vertices.push(...points[0],...points[i],...points[i+1]);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();mesh(pivot,geometry,membrane,[0,0,0],[1,1,1]);
  for(const i of [1,2,3,4,5])bone(pivot,points[0],points[i],i===2?.11:.055);bone(pivot,points[1],points[2],.085);mesh(pivot,cone,horn,points[2],[.10,.42,.10],[0,0,-side*Math.PI/2]);bake(pivot);wings.push({pivot,side});
 }
 const tail=[];let parent=root;
 for(let i=0;i<8;i++){const pivot=new T.Group();pivot.position.set(0,i?0:.05,i?-.52:-1.35);parent.add(pivot);const radius=.45*(1-i/9);ell(pivot,skin,[0,0,-.22],[radius,radius*.8,.45]);mesh(pivot,cone,horn,[0,radius*.8,-.25],[radius*.3,.25,radius*.3],[.3,0,0]);bake(pivot);tail.push(pivot);parent=pivot;}
 const route=new T.CatmullRomCurve3([[-105,35,30],[-47,15,28],[-42,15,-6],[-9,15,-30],[29,16,-42],[48,15,-4],[28,15,28],[-8,15,43],[-46,16,24],[-105,35,55]].map(p=>new T.Vector3(...p)));
 function point(t){const p=route.getPoint(T.MathUtils.clamp(t,0,1));for(const b of buildings){const d=Math.hypot(Math.max(0,Math.abs(p.x-b.x)-b.w/2),Math.max(0,Math.abs(p.z-b.z)-b.d/2)),roof=b.kind==='church'?19:b.kind==='castle'?10:b.h+b.w*.4;const influence=1-T.MathUtils.smoothstep(d,3,14);p.y=Math.max(p.y,T.MathUtils.lerp(p.y,roof+6,influence));}return p;}
 let current=null;
 function update(hours){current=dragonFlight(hours);root.visible=!!current;if(!current)return;
  const t=current.progress,p=point(t),ahead=point(Math.min(1,t+.001)),behind=point(Math.max(0,t-.001)),direction=ahead.clone().sub(behind),phase=t*DRAGON_DURATION*180*3.6;
  root.position.copy(p);root.rotation.set(-Math.atan2(direction.y,Math.hypot(direction.x,direction.z)),Math.atan2(direction.x,direction.z),Math.sin(phase*.22)*.06);
  for(const {pivot,side}of wings)pivot.rotation.z=side*(.12+Math.sin(phase)*.40);
  for(const [i,pivot]of tail.entries()){pivot.rotation.y=Math.sin(phase*.45-i*.55)*.13;pivot.rotation.x=Math.sin(phase*.25-i*.4)*.035;}
 }
 sphere.dispose();cone.dispose();
 return {root,update,point,wings,tail,get flight(){return current;}};
}
