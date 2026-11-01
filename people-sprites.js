import * as T from 'three';
import {appearanceFor} from './appearance.js';
import {createMotion,updateMotion,stableView} from './sprite-motion.js';

export const FAMILY_ATLAS_URL=new URL('./assets/residents-families-v2.png',import.meta.url).href;
export const ATLAS_URL=new URL('./assets/residents-directions-v1.png',import.meta.url).href;
// Camera-facing, upright, alpha-cutout quads. Shared geometry/texture and a single
// instanced draw keep the cost independent of the 500 residents' clothing palettes.
export function createPeople(scene,population){
  const n=population.length,geometry=new T.PlaneGeometry(1,1,16,24);
  geometry.translate(0,.5-12/256,0);
  const frames=new T.InstancedBufferAttribute(new Float32Array(n*4),4);
  const motions=new T.InstancedBufferAttribute(new Float32Array(n*4),4);motions.setUsage(T.DynamicDrawUsage);geometry.setAttribute('residentMotion',motions);
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
attribute vec4 residentMotion;
attribute vec3 residentDye;
attribute vec3 residentFeatures;
varying vec3 vDye;
varying vec3 vFeatures;
varying vec2 vResidentUV;`);
    shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
vMapUv = vec2((uv.x + residentFrame.x) * .25, (uv.y + 7.0 - residentFrame.y) * .125);
vDye = residentDye; vFeatures = residentFeatures; vResidentUV = uv;`);
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
// Continuous soft cutout rig. Weights separate the two legs, outer arms,
// breathing torso and head; state envelopes avoid abrupt pose changes.
float phase = residentMotion.x;
float moving = residentMotion.y;
float talking = residentMotion.z;
float working = residentMotion.w;
float clock = residentFrame.z;
float side = sign(position.x);
float profile = mod(residentFrame.x,2.0)>.5 ? .45 : 1.0;
float leg = 1.0-smoothstep(.12,.46,uv.y);
float arm = smoothstep(.13,.23,abs(position.x))*smoothstep(.40,.53,uv.y)*(1.0-smoothstep(.72,.80,uv.y));
float upper = smoothstep(.40,.68,uv.y);
float head = smoothstep(.75,.87,uv.y);
float stepWave = sin(phase)*side;
// Alternating lift and knee bend. Planted foot stays at the ground baseline.
transformed.y += max(0.0,stepWave)*.060*moving*leg;
transformed.x += sin(phase)*side*.027*moving*leg*profile;
float gesture = sin(clock*2.4+side*.9)*talking*.045;
float chore = sin(clock*3.1)*working*.018;
transformed.x += (-sin(phase)*side*.038*moving*profile+gesture+chore)*arm;
transformed.y += (cos(phase)*.013*moving+abs(gesture)*.5)*arm;
transformed.y += (sin(clock*1.7)*.003+sin(phase*2.0)*.006*moving)*upper;
transformed.x += sin(clock*1.1)*.003*upper*(1.0-moving);
transformed.x += sin(clock*2.4)*.009*talking*head;
transformed.y += sin(clock*2.4+.7)*.004*talking*head;
// Small hem motion, with reduced amplitude in profile to protect silhouettes.
transformed.x += sin(phase+uv.y*5.0)*.008*moving*smoothstep(.18,.3,uv.y)*(1.0-smoothstep(.5,.6,uv.y));`);
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
diffuseColor.rgb = mix(diffuseColor.rgb,mix(vec3(vFeatures.x*.8,vFeatures.x*.57,vFeatures.x*.37),vec3(vFeatures.x),step(.66,vFeatures.x))*max(.28,luminance*4.0),hair*.72);
diffuseColor.rgb *= mix(1.0,vFeatures.y,head*.5);
// Tiny woven hem variation is stable for each resident, never frame-random.
float hem = step(.30,vResidentUV.y)*(1.0-step(.32,vResidentUV.y));
diffuseColor.rgb *= 1.0-hem*vFeatures.z*.23;`);
  };
  material.customProgramCacheKey=()=> 'vallclara-directional-sprites-v2';
  const mesh=new T.InstancedMesh(geometry,material,n);mesh.name='Habitants 2D';
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;
  // Alpha test + depth write lets architecture and other residents occlude sprites.
  mesh.castShadow=false;mesh.receiveShadow=false;mesh.userData.spriteBillboard=true;scene.add(mesh);
  const dummy=new T.Object3D(),color=new T.Color(),appearances=population.map(appearanceFor);
  for(let i=0;i<n;i++){const a=appearances[i];color.setHSL(a.hue,a.saturation,a.lightness);dyes.setXYZ(i,color.r,color.g,color.b);features.setXYZ(i,a.hair,a.skin,(population[i].id%13)/12);}
  const load=url=>new Promise((resolve,reject)=>new T.ImageLoader().load(url,resolve,undefined,()=>reject(new Error('No s’ha pogut carregar l’atles dels habitants 2D. Torna a carregar la pàgina.'))));
  const ready=Promise.all([load(ATLAS_URL),load(FAMILY_ATLAS_URL)]).then(images=>{
    // Compact power-of-two height fits WebGL 2 devices with a 2048px limit.
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=2048;
    const ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas 2D no disponible');ctx.imageSmoothingEnabled=false;
    const layouts=[
      {centers:[234,503,764,1043],rows:[[2,326],[330,682],[685,972],[975,1253]],half:100},
      {centers:[207,496,775,1070],rows:[[8,319],[331,631],[638,928],[934,1236]],half:110}
    ];
    for(let sheet=0;sheet<2;sheet++)for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const layout=layouts[sheet],[top,bottom]=layout.rows[row],height=bottom-top,scale=232/height;
      ctx.drawImage(images[sheet],layout.centers[col]-layout.half,top,layout.half*2,height,col*192+96-layout.half*scale,(row+sheet*4)*256+12,layout.half*2*scale,232);
    }
    texture.image=canvas;texture.needsUpdate=true;
  });
  const states=population.map(createMotion);
  function animate(time,camera,range=100,dt=1/60){
    for(let i=0;i<n;i++){
      const p=population[i],a=appearances[i],m=updateMotion(states[i],p,dt),dx=camera.x-m.x,dz=camera.z-m.z;
      const visible=dx*dx+dz*dz<range*range,angle=Math.atan2(dx,dz);
      frames.setXYZW(i,stableView(m,m.heading,angle),a.row,time+p.phase,p.id);
      motions.setXYZW(i,m.phase,m.walk,m.talk,m.work);
      dummy.position.set(m.x,.015,m.z);dummy.rotation.set(0,angle,0);
      // p.height is the original 1.8 m model's scale, shared by speech bubbles.
      const h=visible?p.height*1.96:0;
      dummy.scale.set(h*.75*a.width,h,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
    }
    frames.needsUpdate=true;motions.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;
  }
  return {animate,ready,parts:{sprites:mesh},appearances,states};
}
