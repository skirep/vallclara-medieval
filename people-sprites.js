import * as T from 'three';
import {appearanceFor} from './appearance.js';
import {createMotion,updateMotion,stableView} from './sprite-motion.js';
import {drawnFrame,WALK_TYPES} from './animation-frames.js';
import {loadResidentImages,sourcesFor} from './resident-assets.js';
import {packWalkAtlas} from './sprite-atlas.js';
export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
export const FAMILY_ATLAS_URL=new URL('./assets/residents-families-v2.png',import.meta.url).href;
const load=url=>new Promise((resolve,reject)=>new T.ImageLoader().load(url,resolve,undefined,()=>reject(new Error('No s’ha pogut carregar l’animació dels habitants. Torna a carregar la pàgina.'))));
export function createPeople(scene,population,{onProgress,pixelHeight=256}={}){
 const appearances=population.map(appearanceFor),states=population.map(createMotion),groups=[],dummy=new T.Object3D();
 const geometry=new T.PlaneGeometry(1,1);geometry.translate(0,.5-12/256,0);
 for(let type=0;type<WALK_TYPES.length;type++){
  const indices=population.map((p,i)=>i).filter(i=>appearances[i].row===type),g=geometry.clone(),n=indices.length;
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4);frames.setUsage(T.DynamicDrawUsage);g.setAttribute('residentFrame',frames);
  const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;texture.magFilter=texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
  const material=new T.MeshBasicMaterial({map:texture,alphaTest:.45,side:T.DoubleSide,fog:true});
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>\nattribute vec4 residentFrame;`);
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>\nvMapUv = vec2((uv.x+residentFrame.x)/6.0,(uv.y+7.0-residentFrame.y)/8.0);`);
   // Preserve every painted color. No height bands, skin/hair replacement or dye mask.
  };
  material.customProgramCacheKey=()=> 'vallclara-natural-living-sprites-v5';
  const mesh=new T.InstancedMesh(g,material,n);mesh.name='Habitants amb fotogrames · '+WALK_TYPES[type];mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.userData.spriteBillboard=true;scene.add(mesh);
  groups.push({indices,frames,texture,mesh});
 }
 geometry.dispose();
 const ready=loadResidentImages(load,onProgress).then(images=>{
  groups.forEach((group,type)=>{group.texture.image=packWalkAtlas(sourcesFor(images,WALK_TYPES[type]),WALK_TYPES[type],document.createElement('canvas'),pixelHeight);group.texture.needsUpdate=true;});
 });
 function animate(time,camera,range=100,dt=1/60,simulationRate=1){
  population.forEach((p,i)=>updateMotion(states[i],p,dt,simulationRate));
  for(const group of groups){
   group.indices.forEach((index,i)=>{
    const p=population[index],a=appearances[index],m=states[index],dx=camera.x-m.x,dz=camera.z-m.z,angle=Math.atan2(dx,dz);
    const view=stableView(m,m.heading,angle),frame=drawnFrame(m);group.frames.setXYZW(i,frame%6,view+(frame>=6?4:0),0,0);
    dummy.position.set(m.x,.015,m.z);dummy.rotation.set(0,angle,0);const h=dx*dx+dz*dz<range*range?p.height*1.96:0;
    dummy.scale.set(h*.875*a.width,h,1);dummy.updateMatrix();group.mesh.setMatrixAt(i,dummy.matrix);
   });group.frames.needsUpdate=true;group.mesh.instanceMatrix.needsUpdate=true;
  }
 }
 return {animate,ready,pixelHeight,parts:Object.fromEntries(groups.map((g,i)=>[i===0?'sprites':WALK_TYPES[i],g.mesh])),appearances,states};
}
