import * as T from 'three';
import {BRIDGE,RIVER,riverCenter,bridgeHeight} from './terrain.js';
// Static detail is merged through the world's existing batching functions.
export function addRiverAndBridge(scene,{B,C,S,add,mats,obstacles,waterMeshes,random}){
 const r=random,water=new T.MeshPhysicalMaterial({color:'#365a4e',roughness:.14,metalness:.22,transparent:true,opacity:.90,side:T.DoubleSide});
 water.onBeforeCompile=shader=>{
  shader.uniforms.uTime={value:0};water.userData.shader=shader;
  shader.vertexShader='uniform float uTime; varying vec2 vFlow;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.z += sin(position.y*.8+uTime*1.5+position.x)*.025; vFlow=(modelMatrix*vec4(transformed,1.0)).xz;');
  shader.fragmentShader='uniform float uTime; varying vec2 vFlow;\n'+shader.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(normal+mat3(viewMatrix)*vec3(sin(vFlow.x*2.0+vFlow.y*.7+uTime)*.13,0.0,cos(vFlow.y*1.7-uTime*1.4)*.08));');
  shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor *= .85+.15*sin(vFlow.y*.8+uTime);');
 };
 const geo=new T.PlaneGeometry(RIVER.halfWidth*2,RIVER.length,10,140),p=geo.attributes.position;
 for(let i=0;i<p.count;i++)p.setX(i,p.getX(i)+riverCenter(-p.getY(i)));
 const river=new T.Mesh(geo,water);river.rotation.x=-Math.PI/2;river.position.y=RIVER.waterY;river.name='Riu de Vallclara';scene.add(river);waterMeshes.push(water);
 obstacles.push({kind:'river',x:RIVER.x,z:0,w:16,d:RIVER.length});
 const segments=36,length=BRIDGE.end-BRIDGE.start;
 for(let i=0;i<segments;i++){
  const x=BRIDGE.start+(i+.5)*length/segments,y=bridgeHeight(x);
  B(mats.road,x,y-.13,0,length/segments+.015,.26,BRIDGE.halfWidth*2);
  for(const side of [-1,1])if(x>BRIDGE.start+2&&x<BRIDGE.end-2){
   B(mats.stone,x,y+.57,side*(BRIDGE.halfWidth+.28),length/segments+.02,1.14,.46);
   B(mats.stone,x,y+1.18,side*(BRIDGE.halfWidth+.28),length/segments+.04,.14,.62);
  }
 }
 for(const side of [-1,1])obstacles.push({x:RIVER.x,z:side*(BRIDGE.halfWidth+.28),w:length-4,d:.48});
 for(const x of [BRIDGE.start+1,BRIDGE.end-1])for(const side of [-1,1])B(mats.stone,x,-.3,side*2.8,1.4,2.2,1.2);
 // Elliptical masonry arch: individual voussoirs, with an open waterway beneath.
 for(const side of [-1,1])for(let i=0;i<24;i++){
  const a=i/24*Math.PI,b=(i+1)/24*Math.PI,vertices=[];
  const points=[];for(const z of [side*(BRIDGE.halfWidth+.1)-.26,side*(BRIDGE.halfWidth+.1)+.26])for(const [t,outer]of [[a,0],[b,0],[a,1],[b,1]])points.push([RIVER.x+Math.cos(t)*(5.4+outer*.4),-1.3+Math.sin(t)*(.95+outer*.30),z]);
  for(const tri of [[0,1,2],[1,3,2],[4,6,5],[5,6,7],[0,4,1],[1,4,5],[2,3,6],[3,7,6],[0,2,4],[2,6,4],[1,5,3],[3,5,7]])for(const n of tri)vertices.push(...points[n]);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();add(g,mats.stone,0,0,0);g.dispose();
 }
 for(const [x,w]of [[0,4],[18,4]])B(mats.road,x,.005,0,w,.07,6.3);
 for(const side of [-1,1])for(let z=-60;z<61;z+=2){
  if(Math.abs(z)<4)continue;const x=riverCenter(z)+side*5.0;
  B(mats.stone,x,-.45,z,.45,1.1,2.04);B(mats.stone,x,.13,z,.6,.18,2.04);
  if(z%8===0){C(mats.iron,x,.62,z,.045,1.05);B(mats.iron,x,.95,z,.055,.055,7.7);}
 }
 // Wet bank stones, reeds and riverbank boardwalk details.
 for(let i=0;i<140;i++){
  const z=r(-100,100);if(Math.abs(z)<7)continue;const side=i%2?1:-1,x=riverCenter(z)+side*r(3.7,5.1);
  S(i%3?mats.stone:mats.moss,x,r(-.22,.05),z,r(.18,.65),r(.13,.4),r(.2,.7));
  if(i%2===0)for(let j=0;j<4;j++){B(mats.leaf,x+r(-.25,.25),.25,z+r(-.25,.25),.025,r(.65,1.15),.025);C(mats.hay,x,.85+j*.06,z,.035,.18);}
 }
 return {river,bridge:{...BRIDGE},water};
}
