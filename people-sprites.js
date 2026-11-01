import * as T from 'three';
import {appearanceFor,spriteView} from './appearance.js';

export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
// Camera-facing, upright, alpha-cutout quads. Shared geometry/texture and a single
// instanced draw keep the cost independent of the 500 residents' clothing palettes.
export function createPeople(scene,population){
  const n=population.length,geometry=new T.PlaneGeometry(1,1,6,12);
  geometry.translate(0,.5-16/384,0);
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4);
  const dyes=new T.InstancedBufferAttribute(new Float32Array(n*3),3);
  const features=new T.InstancedBufferAttribute(new Float32Array(n*3),3);
  frames.setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('residentFrame',frames);geometry.setAttribute('residentDye',dyes);geometry.setAttribute('residentFeatures',features);
  const texture=new T.Texture();texture.colorSpace=T.SRGBColorSpace;
  texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestFilter;texture.generateMipmaps=false;
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
vMapUv = vec2((uv.x + residentFrame.x) * .25, (uv.y + 3.0 - residentFrame.y) * .25);
vDye = residentDye; vFeatures = residentFeatures; vResidentUV = uv;`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
// Vertex deformation gives the drawn limbs a restrained stepping motion.
float stride = residentFrame.z;
float moving = residentFrame.w;
float leg = 1.0 - smoothstep(.04,.47,uv.y);
transformed.y += abs(stride) * .014 * moving * smoothstep(0.0,.25,uv.y);
transformed.x += stride * .025 * moving * leg;
transformed.y += stride * sign(position.x) * .035 * moving * leg;
transformed.x += stride * .009 * (1.0-moving) * smoothstep(.5,1.0,uv.y);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
varying vec3 vDye;
varying vec3 vFeatures;
varying vec2 vResidentUV;`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
float hi = max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b));
float lo = min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
float chroma = (hi-lo)/max(hi,.001);
float luminance = dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
// Dye saturated garments; preserve linen, belts, faces and source shading.
float garment = step(.26,vResidentUV.y)*(1.0-step(.73,vResidentUV.y));
float dyeMask = garment*smoothstep(.16,.46,chroma);
diffuseColor.rgb = mix(diffuseColor.rgb,vDye*clamp(luminance*3.0,.15,1.6),dyeMask*.87);
float head = smoothstep(.74,.82,vResidentUV.y);
float hair = head*(1.0-smoothstep(.08,.3,luminance));
diffuseColor.rgb = mix(diffuseColor.rgb,vec3(vFeatures.x*.8,vFeatures.x*.57,vFeatures.x*.37)*max(.28,luminance*4.0),hair*.72);
diffuseColor.rgb *= mix(1.0,vFeatures.y,head*.5);
// Tiny woven hem variation is stable for each resident, never frame-random.
float hem = step(.30,vResidentUV.y)*(1.0-step(.32,vResidentUV.y));
diffuseColor.rgb *= 1.0-hem*vFeatures.z*.23;`);
  };
  material.customProgramCacheKey=()=> 'vallclara-directional-sprites-v1';
  const mesh=new T.InstancedMesh(geometry,material,n);mesh.name='Habitants 2D';
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;
  // Alpha test + depth write lets architecture and other residents occlude sprites.
  mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.spriteBillboard=true;scene.add(mesh);
  const dummy=new T.Object3D(),color=new T.Color(),appearances=population.map(appearanceFor);
  for(let i=0;i<n;i++){const a=appearances[i];color.setHSL(a.hue,a.saturation,a.lightness);dyes.setXYZ(i,color.r,color.g,color.b);features.setXYZ(i,a.hair,a.skin,(population[i].id%13)/12);}
  const ready=new Promise((resolve,reject)=>{
    new T.ImageLoader().load(ATLAS_URL,image=>{try{
      // Generated art has hand-spaced rows, not a machine-perfect grid. Repack
      // the measured cutouts once, on load, so heads/feet never cross UV cells.
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1536;
      const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas 2D no disponible');
      ctx.imageSmoothingEnabled=false;
      const centers=[234,503,764,1043],rows=[[0,328],[329,683],[684,974],[974,1254]];
      for(let row=0;row<4;row++)for(let col=0;col<4;col++){
        const [top,bottom]=rows[row],height=bottom-top,scale=352/height;
        ctx.drawImage(image,centers[col]-100,top,200,height,col*256+128-100*scale,row*384+16,200*scale,352);
      }
      texture.image=canvas;texture.needsUpdate=true;resolve();
    }catch(error){reject(error);}},undefined,()=>reject(new Error('No s’ha pogut carregar l’atles dels habitants 2D. Torna a carregar la pàgina.')));
  });
  function animate(time,camera,range=100){
    for(let i=0;i<n;i++){
      const p=population[i],a=appearances[i],dx=camera.x-p.x,dz=camera.z-p.z;
      const visible=dx*dx+dz*dz<range*range,angle=Math.atan2(dx,dz);
      const walking=p.state==='walking',stride=Math.sin(walking?p.walk:time*1.5+p.phase);
      frames.setXYZW(i,spriteView(p.heading,angle),a.row,stride,walking?1:0);
      dummy.position.set(p.x,.015,p.z);dummy.rotation.set(0,angle,0);
      // p.height is the original 1.8 m model's scale, shared by speech bubbles.
      const h=visible?p.height*1.96:0;
      dummy.scale.set(h*.69*a.width,h,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    frames.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;
  }
  return {animate,ready,parts:{sprites:mesh},appearances};
}
