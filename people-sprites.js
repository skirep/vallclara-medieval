import * as T from 'three';
import {appearanceFor} from './appearance.js';
import {createMotion,updateMotion,stableView} from './sprite-motion.js';
import {drawnFrame,WALK_TYPES} from './animation-frames.js';
import {loadResidentImages} from './resident-assets.js';
import {packWalkAtlas} from './sprite-atlas.js';
export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
export const FAMILY_ATLAS_URL=new URL('./assets/residents-families-v2.png',import.meta.url).href;
const load=url=>new Promise((resolve,reject)=>new T.ImageLoader().load(url,resolve,undefined,()=>reject(new Error('No s’ha pogut carregar l’animació dels habitants. Torna a carregar la pàgina.'))));
export function createPeople(scene,population,{onProgress}={}){
 const appearances=population.map(appearanceFor),states=population.map(createMotion),groups=[],dummy=new T.Object3D(),color=new T.Color();
 const geometry=new T.PlaneGeometry(1,1);geometry.translate(0,.5-12/256,0);
 for(let type=0;type<8;type++){
  const indices=population.map((p,i)=>i).filter(i=>appearances[i].row===type),g=geometry.clone(),n=indices.length;
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4),dyes=new T.InstancedBufferAttribute(new Float32Array(n*3),3),features=new T.InstancedBufferAttribute(new Float32Array(n*3),3);
  frames.setUsage(T.DynamicDrawUsage);g.setAttribute('residentFrame',frames);g.setAttribute('residentDye',dyes);g.setAttribute('residentFeatures',features);
  const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;texture.magFilter=texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
  const material=new T.MeshBasicMaterial({map:texture,alphaTest:.45,side:T.DoubleSide,fog:true});
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 residentFrame;
attribute vec3 residentDye;
attribute vec3 residentFeatures;
varying vec3 vDye;
varying vec3 vFeatures;
varying vec2 vResidentUV;`);
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
vMapUv = vec2((uv.x+residentFrame.x)/7.0,(uv.y+3.0-residentFrame.y)/4.0);
vDye=residentDye;vFeatures=residentFeatures;vResidentUV=uv;`);
   // No vertex deformation: limbs and clothing move only through drawn frames.
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vDye;
varying vec3 vFeatures;
varying vec2 vResidentUV;`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
float hi=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
float lo=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
float chroma=(hi-lo)/max(hi,.001);
float luminance=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
float garment=step(.26,vResidentUV.y)*(1.0-step(.73,vResidentUV.y));
float dyeMask=garment*smoothstep(.16,.46,chroma);
diffuseColor.rgb=mix(diffuseColor.rgb,vDye*clamp(luminance*3.0,.15,1.6),dyeMask*.87);
float head=smoothstep(.74,.82,vResidentUV.y);
float hair=head*(1.0-smoothstep(.08,.3,luminance));
vec3 hairColor=mix(vec3(vFeatures.x*.8,vFeatures.x*.57,vFeatures.x*.37),vec3(vFeatures.x),step(.66,vFeatures.x));
diffuseColor.rgb=mix(diffuseColor.rgb,hairColor*max(.28,luminance*4.0),hair*.72);
diffuseColor.rgb*=mix(1.0,vFeatures.y,head*.5);`);
  };
  material.customProgramCacheKey=()=> 'vallclara-drawn-frames-v4';
  const mesh=new T.InstancedMesh(g,material,n);mesh.name='Habitants amb fotogrames · '+WALK_TYPES[type];mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.userData.spriteBillboard=true;scene.add(mesh);
  indices.forEach((index,i)=>{const a=appearances[index];color.setHSL(a.hue,a.saturation,a.lightness);dyes.setXYZ(i,color.r,color.g,color.b);features.setXYZ(i,a.hair,a.skin,0);});
  groups.push({indices,frames,texture,mesh});
 }
 geometry.dispose();
 const ready=loadResidentImages(load,onProgress).then(images=>{
  groups.forEach((group,type)=>{
   group.texture.image=packWalkAtlas(images[type+2],WALK_TYPES[type],document.createElement('canvas'));group.texture.needsUpdate=true;
  });
 });
 function animate(time,camera,range=100,dt=1/60){
  population.forEach((p,i)=>updateMotion(states[i],p,dt));
  for(const group of groups){
   group.indices.forEach((index,i)=>{
    const p=population[index],a=appearances[index],m=states[index],dx=camera.x-m.x,dz=camera.z-m.z,angle=Math.atan2(dx,dz);
    const view=stableView(m,m.heading,angle);group.frames.setXYZW(i,drawnFrame(m),view,0,0);
    dummy.position.set(m.x,.015,m.z);dummy.rotation.set(0,angle,0);const h=dx*dx+dz*dz<range*range?p.height*1.96:0;
    dummy.scale.set(h*.875*a.width,h,1);dummy.updateMatrix();group.mesh.setMatrixAt(i,dummy.matrix);
   });group.frames.needsUpdate=true;group.mesh.instanceMatrix.needsUpdate=true;
  }
 }
 return {animate,ready,parts:Object.fromEntries(groups.map((g,i)=>[i===0?'sprites':WALK_TYPES[i],g.mesh])),appearances,states};
}
