import {landscapeHeight,riverCenter} from './terrain.js';
import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {random} from './simulation.js';
import {worldUV} from './materials.js';
export function createNature(scene,mats,buildings){
  const rng=random(3378),r=(a,b)=>a+rng()*(b-a),trees=[];
  for(let i=0;i<220;i++){const a=r(0,Math.PI*2),rad=r(115,305),x=Math.cos(a)*rad,z=Math.sin(a)*rad;if(Math.abs(x)<7||Math.abs(z)<7||Math.abs(x-riverCenter(z))<17)continue;trees.push({x,z,h:r(6,13)});}
  for(const [x,z] of [[-20,22],[20,-21],[-50,22],[24,58],[56,-21]])trees.push({x,z,h:r(7,10)});
  const trunks=[],cylinder=new T.CylinderGeometry(.68,1,1,7),dummy=new T.Object3D();
  function branch(a,b,radius){const direction=b.clone().sub(a),length=direction.length();dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());dummy.scale.set(radius,length,radius);dummy.updateMatrix();const g=cylinder.toNonIndexed().applyMatrix4(dummy.matrix);worldUV(g,2);trunks.push(g);}
  // Every canopy is an open branching structure, rather than a solid sphere.
  const positions=[],colors=[],normals=[],uv=[];
  const leafColor=new T.Color();
  for(let i=0;i<22;i++){
    const center=new T.Vector3(r(-1.1,1.1),r(-.7,.7),r(-1,1)),angle=r(0,6.28),tilt=r(-.9,.9),w=r(.12,.22),len=r(.25,.44);
    const outline=[[0,-len,0],[-w,-len*.25,0],[-w*.85,len*.35,0],[0,len,.03],[w*.85,len*.35,0],[w,-len*.25,0]];
    const q=new T.Quaternion().setFromEuler(new T.Euler(tilt,angle,r(-1,1)));
    leafColor.setHSL(r(.12,.22),r(.25,.5),r(.22,.45));
    for(let j=0;j<6;j++)for(const v of [[0,0,.045],outline[j],outline[(j+1)%6]]){
      const p=new T.Vector3(...v).applyQuaternion(q).add(center);positions.push(p.x,p.y,p.z);colors.push(leafColor.r,leafColor.g,leafColor.b);uv.push(.5,.5);
    }
  }
  const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));leafGeo.setAttribute('color',new T.Float32BufferAttribute(colors,3));leafGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));leafGeo.computeVertexNormals();
  const leafMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.88});
  const wind={value:0};leafMat.onBeforeCompile=shader=>{shader.uniforms.uWindTime=wind;shader.vertexShader='uniform float uWindTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uWindTime * .7 + instanceMatrix[3].x*.2 + position.y)*.075;');};
  const leaves=new T.InstancedMesh(leafGeo,leafMat,trees.length*26);leaves.castShadow=true;leaves.receiveShadow=true;let id=0;
  for(const tree of trees){const ground=landscapeHeight(tree.x,tree.z)+.1;const base=new T.Vector3(tree.x,ground,tree.z),top=new T.Vector3(tree.x+.3,ground+tree.h*.77,tree.z);branch(base,top,.25+tree.h*.016);
    for(let i=0;i<7;i++){const angle=i/7*Math.PI*2+r(-.3,.3),end=new T.Vector3(tree.x+Math.cos(angle)*r(1.8,3.4),ground+tree.h*r(.7,1),tree.z+Math.sin(angle)*r(1.8,3.4));branch(new T.Vector3(tree.x,ground+tree.h*r(.4,.65),tree.z),end,.11);}
    for(let i=0;i<26;i++){const a=r(0,6.28),rad=r(.4,3),height=ground+tree.h-r(0,3);dummy.position.set(tree.x+Math.cos(a)*rad,height,tree.z+Math.sin(a)*rad);dummy.rotation.set(r(-1,1),r(0,6.28),r(-.6,.6));dummy.scale.setScalar(r(.9,1.35));dummy.updateMatrix();leaves.setMatrixAt(id++,dummy.matrix);}
  }
  leaves.instanceMatrix.needsUpdate=true;leaves.computeBoundingSphere();scene.add(leaves);
  const merged=mergeGeometries(trunks,false),wood=new T.Mesh(merged,mats.bark);wood.castShadow=wood.receiveShadow=true;scene.add(wood);trunks.forEach(g=>g.dispose());cylinder.dispose();
  // Sparse tufts at house foundations and outside roads break up the flat terrain.
  const grassGeo=new T.BufferGeometry(),gp=[],gc=[];
  for(let i=0;i<4;i++){const angle=i*Math.PI/4,w=.032,h=.2+i*.045,x=Math.cos(angle)*w,z=Math.sin(angle)*w;gp.push(-x,0,-z,x,0,z,x*.8,h,z*.8);for(let k=0;k<3;k++)gc.push(.28+i*.02,.32+i*.015,.12);}
  grassGeo.setAttribute('position',new T.Float32BufferAttribute(gp,3));grassGeo.setAttribute('color',new T.Float32BufferAttribute(gc,3));grassGeo.computeVertexNormals();
  const grass=new T.InstancedMesh(grassGeo,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1}),7500);let gId=0;
  for(let attempt=0;attempt<45000&&gId<7500;attempt++){const x=r(-115,115),z=r(-115,115),nearRoad=[-78,-52,-28,0,28,52,78].some(v=>Math.abs(v-x)<(v===0?5:3.2)||Math.abs(v-z)<(v===0?5:3.2));if(nearRoad||Math.abs(x)<21&&Math.abs(z)<21)continue;if(buildings.some(b=>Math.abs(x-b.x)<b.w/2+.2&&Math.abs(z-b.z)<b.d/2+.2))continue;dummy.position.set(x,.02,z);dummy.rotation.set(0,r(0,6.28),0);dummy.scale.setScalar(r(.65,1.7));dummy.updateMatrix();grass.setMatrixAt(gId++,dummy.matrix);}
  grass.count=gId;grass.instanceMatrix.needsUpdate=true;grass.computeBoundingSphere();grass.receiveShadow=true;scene.add(grass);
  return{update(time){wind.value=time;},setQuality(q){leaves.castShadow=q==='high';grass.visible=q!=='low';},trees:trees.length};
}
