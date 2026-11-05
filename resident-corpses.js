import * as T from 'three';
import {residentHeight} from './resident-scale.js';
export const CORPSE_ATLAS_URL=new URL('./assets/packed/resident-corpses-v1.webp',import.meta.url).href;
export function corpseVariant(p){return p.ninja?5:p.royalGuard?4:p.spriteId==='king-berenguer'?6:/queen|princess/.test(p.spriteId??'')?7:p.age<16?3:p.age>=60?2:!!p.sex?1:0;}
// Authored prone bodies are ground decals, never rotated standing sprites.
export function createResidentCorpses(scene,population,heightAt,load){
 const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;texture.minFilter=texture.magFilter=T.NearestFilter;texture.generateMipmaps=false;
 const g=new T.PlaneGeometry(1,1),cells=new T.InstancedBufferAttribute(new Float32Array(population.map(corpseVariant)),1);g.setAttribute('corpseCell',cells);
 const material=new T.MeshBasicMaterial({map:texture,alphaTest:.4,side:T.DoubleSide,fog:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 material.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nattribute float corpseCell;').replace('#include <uv_vertex>','#include <uv_vertex>\nvMapUv=vec2((uv.x+mod(corpseCell,4.0))/4.0,(uv.y+1.0-floor(corpseCell/4.0))/2.0);');};
 material.customProgramCacheKey=()=> 'vallclara-prone-bodies-v1';
 const mesh=new T.InstancedMesh(g,material,population.length);mesh.name='Cossos estirats a terra';mesh.frustumCulled=false;mesh.userData.spriteBillboard=true;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(mesh);
 const dummy=new T.Object3D(),normal=new T.Vector3(),axis=new T.Vector3(),cross=new T.Vector3(),basis=new T.Matrix4();
 const ready=load(CORPSE_ATLAS_URL).then(image=>{texture.image=image;texture.needsUpdate=true;});
 function update(camera,range){for(const [i,p]of population.entries()){
  const q=p.deathPosition??p,visible=(p.dead||p.missionDead)&&Math.hypot(q.x-camera.x,q.z-camera.z)<range;
  const e=.12;normal.set(-(heightAt(q.x+e,q.z)-heightAt(q.x-e,q.z))/(2*e),1,-(heightAt(q.x,q.z+e)-heightAt(q.x,q.z-e))/(2*e)).normalize();
  axis.set(Math.sin(q.heading??0),0,Math.cos(q.heading??0));axis.addScaledVector(normal,-axis.dot(normal)).normalize();cross.crossVectors(normal,axis).normalize();basis.makeBasis(axis,cross,normal);dummy.quaternion.setFromRotationMatrix(basis);
  dummy.position.set(q.x,heightAt(q.x,q.z)+.035,q.z);const size=visible?residentHeight(p)/.875:0;dummy.scale.set(size,size*.5,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
 }mesh.instanceMatrix.needsUpdate=true;}
 return{mesh,ready,update,setLighting(color){material.color.copy(color);}};
}
