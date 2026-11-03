import * as T from 'three';
import {residentHeight} from './resident-scale.js';

// Two shared draws for the whole village, including low quality. Analytic soft
// ellipses need no shadow map, canvas texture or extra image downloads.
export function createResidentShadows(scene,population,heightAt){
 const dummy=new T.Object3D(),normal=new T.Vector3(),tangent=new T.Vector3(),cross=new T.Vector3(),basis=new T.Matrix4();
 function layer(name,opacity){
  const geometry=new T.PlaneGeometry(2,2);
  geometry.setAttribute('shadowStrength',new T.InstancedBufferAttribute(new Float32Array(population.length),1).setUsage(T.DynamicDrawUsage));
  const material=new T.MeshBasicMaterial({color:'#252b32',transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,fog:true});
  material.onBeforeCompile=shader=>{
   shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute float shadowStrength; varying float vShadowStrength; varying vec2 vShadowUv;');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvShadowStrength=shadowStrength; vShadowUv=uv*2.0-1.0;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying float vShadowStrength; varying vec2 vShadowUv;');
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a *= vShadowStrength * (1.0-smoothstep(0.08,1.0,length(vShadowUv)));\n#include <alphatest_fragment>');
  };
  material.customProgramCacheKey=()=> 'vallclara-soft-resident-shadow-v1';
  const mesh=new T.InstancedMesh(geometry,material,population.length);mesh.name=name;mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;
  // Exclude transparent ground decals from the SSAO override prepass as well.
  mesh.userData.spriteBillboard=true;scene.add(mesh);return mesh;
 }
 const projected=layer('Ombres projectades dels habitants',.24),contact=layer('Ombres de contacte dels habitants',.42);
 let lightX=-50/65,lightZ=35/65,daylight=1;
 function setLight(sun,target,level=1){
  const elevation=Math.max(12,sun.y-target.y);
  lightX=T.MathUtils.clamp((sun.x-target.x)/elevation,-1.6,1.6);lightZ=T.MathUtils.clamp((sun.z-target.z)/elevation,-1.6,1.6);daylight=T.MathUtils.clamp(level,0,1);
 }
 function place(mesh,i,x,z,rx,rz,dx,dz,strength){
  const y=heightAt(x,z),e=.12;
  normal.set(-(heightAt(x+e,z)-heightAt(x-e,z))/(2*e),1,-(heightAt(x,z+e)-heightAt(x,z-e))/(2*e)).normalize();
  tangent.set(dx,0,dz);tangent.addScaledVector(normal,-tangent.dot(normal)).normalize();cross.crossVectors(normal,tangent).normalize();basis.makeBasis(tangent,cross,normal);
  dummy.quaternion.setFromRotationMatrix(basis);dummy.position.set(x,y+.012,z);dummy.scale.set(rx,rz,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);mesh.geometry.attributes.shadowStrength.setX(i,strength);
 }
 function update(i,person,motion,lift,visible){
  if(!visible){
   dummy.scale.set(0,0,0);dummy.updateMatrix();
   for(const mesh of [projected,contact]){mesh.setMatrixAt(i,dummy.matrix);mesh.geometry.attributes.shadowStrength.setX(i,0);}
   return;
  }
  const h=residentHeight(person),air=T.MathUtils.clamp(lift/h,0,1),direction=Math.hypot(lightX,lightZ),dx=direction>1e-5?-lightX/direction:1,dz=direction>1e-5?-lightZ/direction:0;
  const length=h*(.22+direction*.65),offset=length*.65+lift*direction;
  place(projected,i,motion.x+dx*offset,motion.z+dz*offset,length*.75,h*(.19+air*.08),dx,dz,visible*(.25+.75*daylight)*(1-air*.4));
  place(contact,i,motion.x,motion.z,h*(.20+air*.08),h*(.14+air*.05),1,0,visible*(1-air*.8));
 }
 function flush(){for(const mesh of [projected,contact]){mesh.instanceMatrix.needsUpdate=true;mesh.geometry.attributes.shadowStrength.needsUpdate=true;}}
 return {contact,projected,setLight,update,flush};
}
