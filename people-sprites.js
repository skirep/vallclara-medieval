import * as T from 'three';
import {appearanceFor} from './appearance.js';
import {createMotion,updateMotion,stableView} from './sprite-motion.js';
import {drawnFrame,WALK_TYPES} from './animation-frames.js';
import {loadPackedResident} from './resident-assets.js';
import {packWalkAtlas} from './sprite-atlas.js';
import {hasResidentActions,actionFrame,startResidentAction,JUMP_LIFT,loadActionAtlas,combineResidentAtlases} from './resident-actions.js';
export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
export const FAMILY_ATLAS_URL=new URL('./assets/residents-families-v2.png',import.meta.url).href;
const load=url=>new Promise((resolve,reject)=>new T.ImageLoader().load(url,resolve,undefined,()=>reject(new Error('No s’ha pogut carregar l’animació dels habitants. Torna a carregar la pàgina.'))));
export function createPeople(scene,population,{onProgress,pixelHeight=128}={}){
 const appearances=population.map(appearanceFor),states=population.map(createMotion),groups=[],dummy=new T.Object3D();
 const geometry=new T.PlaneGeometry(1,1);geometry.translate(0,.5-12/256,0);
 for(let type=0;type<WALK_TYPES.length;type++){
  const extended=hasResidentActions(WALK_TYPES[type]),rows=extended?20:8;
  const indices=population.map((p,i)=>i).filter(i=>appearances[i].row===type),g=geometry.clone(),n=indices.length;
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4);frames.setUsage(T.DynamicDrawUsage);g.setAttribute('residentFrame',frames);
  const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;texture.magFilter=texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
  const material=new T.MeshBasicMaterial({map:texture,alphaTest:.45,side:T.DoubleSide,fog:true});
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nattribute vec4 residentFrame;`);
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nvMapUv = vec2((uv.x+residentFrame.x)/6.0,(uv.y+${rows-1}.0-residentFrame.y)/${rows}.0);`);
   // Preserve every painted color. No height bands, skin/hair replacement or dye mask.
  };
  material.customProgramCacheKey=()=> 'vallclara-actions-v6-'+rows;
  const mesh=new T.InstancedMesh(g,material,n);mesh.name='Habitants amb fotogrames · '+WALK_TYPES[type];mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.userData.spriteBillboard=true;scene.add(mesh);
  groups.push({indices,frames,texture,mesh,extended});
 }
 geometry.dispose();
 // Four requests at a time. Normal startup decodes only the texture resolution
 // used on this device, instead of all eighty full-resolution source sheets.
 let next=0,completed=0;
 const ready=Promise.all(Array.from({length:4},async()=>{
  while(next<groups.length){const type=next++,group=groups[type];
   const height=group.extended?Math.min(pixelHeight,96):pixelHeight;
   let image=await loadPackedResident(WALK_TYPES[type],height,load,
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
    const view=stableView(m,m.heading,angle),frame=drawnFrame(m),action=actionFrame(m,WALK_TYPES[type]);group.frames.setXYZW(i,action?.frame??frame%6,action?8+action.row+view:view+(frame>=6?4:0),0,0);
    dummy.position.set(m.x,.015+(action?.action==='jump'?JUMP_LIFT[action.frame]*p.height:0),m.z);dummy.rotation.set(0,angle,0);const h=dx*dx+dz*dz<range*range?p.height*1.96:0;
    dummy.scale.set(h*.875*a.width,h,1);dummy.updateMatrix();group.mesh.setMatrixAt(i,dummy.matrix);
   });group.frames.needsUpdate=true;group.mesh.instanceMatrix.needsUpdate=true;
  }
 }
 function playAction(id,action){const index=population.findIndex(p=>p.id===id);return index>=0&&hasResidentActions(WALK_TYPES[appearances[index].row],action)&&startResidentAction(states[index],action);}
 return {animate,ready,playAction,pixelHeight,parts:Object.fromEntries(groups.map((g,i)=>[i===0?'sprites':WALK_TYPES[i],g.mesh])),appearances,states};
}
