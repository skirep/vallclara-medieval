import {royalGuardSheetURL,ROYAL_GUARD_ART} from './royal-guard-art.js';
import {spriteDirection} from './sprite-directions.js';
import * as T from 'three';
import {appearanceFor} from './appearance.js';
import {residentRenderHeight,residentHeight} from './resident-scale.js';
import {createMotion,updateMotion,stableView} from './sprite-motion.js';
import {drawnFrame,WALK_TYPES} from './animation-frames.js';
import {loadPackedResident} from './resident-assets.js';
import {packWalkAtlas} from './sprite-atlas.js';
import {groundHeight} from './terrain.js';
import {createResidentShadows} from './resident-shadows.js';
import {hasResidentActions,actionFrame,startResidentAction,JUMP_LIFT,loadActionAtlas,combineResidentAtlases} from './resident-actions.js';
export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
export const FAMILY_ATLAS_URL=new URL('./assets/residents-families-v2.png',import.meta.url).href;
const load=url=>new Promise((resolve,reject)=>new T.ImageLoader().load(url,resolve,undefined,()=>reject(new Error('No s’ha pogut carregar l’animació dels habitants. Torna a carregar la pàgina.'))));
export function createPeople(scene,population,{onProgress,pixelHeight=128,heightAt=groundHeight}={}){
 const appearances=population.map(appearanceFor),states=population.map(createMotion),groups=[],dummy=new T.Object3D();
 const shadows=createResidentShadows(scene,population,heightAt);
 const geometry=new T.PlaneGeometry(1,1,1,16);geometry.translate(0,.5-12/256,0);
 for(let type=0;type<WALK_TYPES.length+(population.some(p=>p.royalGuard)?2:0);type++){
  const guardWeapon=type===WALK_TYPES.length?'sword':type===WALK_TYPES.length+1?'spear':null;
  const extended=hasResidentActions(WALK_TYPES[type]),rows=guardWeapon?12:extended?20:8;
  const indices=population.map((p,i)=>i).filter(i=>guardWeapon?population[i].royalGuard?.weapon===guardWeapon:!population[i].royalGuard&&appearances[i].row===type),g=geometry.clone(),n=indices.length;
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4);frames.setUsage(T.DynamicDrawUsage);g.setAttribute('residentFrame',frames);
  const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;texture.magFilter=texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
  const material=new T.MeshBasicMaterial({map:texture,alphaTest:.45,side:T.DoubleSide,fog:true});
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nattribute vec4 residentFrame; varying float vSeated; varying float vBodyY;`);
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nvMapUv = vec2((mix(uv.x,1.0-uv.x,residentFrame.w)+residentFrame.x)/6.0,(uv.y+${rows-1}.0-residentFrame.y)/${rows}.0);`);
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvSeated=residentFrame.z; vBodyY=uv.y; transformed.y=mix(transformed.y,max(0.0,transformed.y-.40),residentFrame.z);`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSeated; varying float vBodyY;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','if(vSeated>.5 && vBodyY<.447) discard;\n#include <alphatest_fragment>');
   // Painted skin and clothes remain intact; only seated lower legs are clipped.
  };
  material.customProgramCacheKey=()=> 'vallclara-directions-v8-'+rows;
  const mesh=new T.InstancedMesh(g,material,n);mesh.name='Habitants amb fotogrames · '+(guardWeapon?'royal-'+guardWeapon:WALK_TYPES[type]);mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.userData.spriteBillboard=true;mesh.userData.residentIndices=indices;scene.add(mesh);
  groups.push({indices,frames,texture,mesh,extended,guardWeapon});
 }
 geometry.dispose();
 // Four requests at a time. Normal startup decodes only the texture resolution
 // used on this device, instead of all eighty full-resolution source sheets.
 let next=0,completed=0;
 const ready=Promise.all(Array.from({length:4},async()=>{
  while(next<groups.length){const type=next++,group=groups[type];
   const height=group.extended?Math.min(pixelHeight,96):pixelHeight;
   let image=group.guardWeapon?await load(royalGuardSheetURL(group.guardWeapon,height)):await loadPackedResident(WALK_TYPES[type],height,load,
    images=>packWalkAtlas(images,WALK_TYPES[type],document.createElement('canvas'),height));
   if(group.extended){const actions=await loadActionAtlas(WALK_TYPES[type],height,load,()=>document.createElement('canvas'));image=combineResidentAtlases(image,actions,document.createElement('canvas'),height);}
   group.texture.image=image;
   group.texture.needsUpdate=true;onProgress?.(++completed,groups.length);
  }
 }));
 function animate(time,camera,range=100,dt=1/60,simulationRate=1,speakingIds=null){
  population.forEach((p,i)=>updateMotion(states[i],p,dt,simulationRate,speakingIds?speakingIds.has(p.id):undefined));
  for(const [type,group] of groups.entries()){
   group.indices.forEach((index,i)=>{
    const p=population[index],a=appearances[index],m=states[index],dx=camera.x-m.x,dz=camera.z-m.z,angle=Math.atan2(dx,dz);
    const logicalView=stableView(m,m.heading,angle),frame=drawnFrame(m),action=group.guardWeapon?(p.guardAttackTime===undefined?null:{action:'weapon',frame:Math.min(5,Math.floor(p.guardAttackTime/.8*6)),row:0}):actionFrame(m,WALK_TYPES[type]),direction=group.guardWeapon?{view:logicalView,flip:false}:spriteDirection(WALK_TYPES[type],logicalView,action?.action??(frame<6?'walk':'idle')),view=direction.view;group.frames.setXYZW(i,action?.frame??frame%6,action?8+action.row+view:view+(frame>=6?4:0),p.seated&&!p.assembly?1:0,direction.flip?1:0);
    const lift=p.seated?0:action?.action==='jump'?JUMP_LIFT[action.frame]*residentHeight(p):0,visible=dx*dx+dz*dz<range*range;
    dummy.position.set(m.x,heightAt(m.x,m.z)+.015+lift+(p.seated&&!p.assembly ? .52 : 0),m.z);if(p.duelPose?.punchTime<.66){const lunge=Math.sin(p.duelPose.punchTime/.66*Math.PI)*.18;dummy.position.x+=Math.sin(p.heading)*lunge;dummy.position.z+=Math.cos(p.heading)*lunge;}dummy.rotation.set(0,angle,p.duelPose?.hitTime<.5?Math.sin(p.duelPose.hitTime/.5*Math.PI)*.13:0);const h=visible?(group.guardWeapon?residentHeight(p)/ROYAL_GUARD_ART.bodyFraction:residentRenderHeight(p,WALK_TYPES[type],view,frame,action?.action)):0;
    dummy.scale.set(h*(group.guardWeapon?ROYAL_GUARD_ART.aspect:.875)*a.width,h,1);dummy.updateMatrix();group.mesh.setMatrixAt(i,dummy.matrix);
    shadows.update(index,p,m,lift,visible?1:0);
   });group.frames.needsUpdate=true;group.mesh.instanceMatrix.needsUpdate=true;
  }
  shadows.flush();
 }
 function setLighting(sun,target,daylight){
  shadows.setLight(sun,target,daylight);
  const light=T.MathUtils.clamp(daylight,0,1);
  // A restrained, uniform ambient tint preserves painted clothing and skin.
  for(const group of groups)group.mesh.material.color.setRGB(.78+.20*light,.77+.20*light,.75+.19*light);
 }
 function playAction(id,action){const index=population.findIndex(p=>p.id===id);return index>=0&&hasResidentActions(WALK_TYPES[appearances[index].row],action)&&startResidentAction(states[index],action);}
 return {animate,ready,playAction,setLighting,shadows,pixelHeight,parts:Object.fromEntries(groups.map((g,i)=>[g.guardWeapon?'royal-'+g.guardWeapon:i===0?'sprites':WALK_TYPES[i],g.mesh])),appearances,states};
}
