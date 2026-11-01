import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {random} from './simulation.js';
export function createWorld(scene){
const rng=random(324),r=(a,b)=>a+rng()*(b-a),batches=new Map(),obstacles=[],buildings=[],smoke=[],waterMeshes=[],windThings=[];
const box=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,7),cone=new T.ConeGeometry(1,1,8);
function canvasTexture(type){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=type==='stone'?'#6d7166':type==='roof'?'#604b39':type==='wood'?'#65513b':type==='grass'?'#6d7549':'#c2b79c';x.fillRect(0,0,256,256);for(let i=0;i<6500;i++){const n=Math.floor(r(0,255));x.fillStyle=`rgba(${n},${n},${n},.11)`;x.fillRect(r(0,256),r(0,256),r(1,5),r(1,4));}if(type==='stone'){for(let y=0;y<256;y+=32)for(let col=-1;col<5;col++){const a=col*64+(y%64?32:0);x.strokeStyle='#333a31';x.lineWidth=2;x.strokeRect(a+2,y+2,60,28);}}if(type==='wood'){for(let i=0;i<256;i+=16){x.strokeStyle='#33291e88';x.beginPath();x.moveTo(i,0);x.bezierCurveTo(i+9,80,i-8,170,i,256);x.stroke();}}if(type==='roof'){for(let y=0;y<256;y+=24)for(let k=-1;k<9;k++){x.strokeStyle='#352b2355';x.lineWidth=3;x.strokeRect(k*32+(y%48?16:0),y,30,22);}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;}
const stoneTex=canvasTexture('stone'),plasterTex=canvasTexture('plaster'),woodTex=canvasTexture('wood'),roofTex=canvasTexture('roof'),grassTex=canvasTexture('grass');
function mat(color,map,roughness=1){return new T.MeshStandardMaterial({color,map,roughness});}
const mats={stone:mat('#afa58d',stoneTex),plaster:mat('#e1d3b4',plasterTex),wood:mat('#77604a',woodTex),darkwood:mat('#54422e',woodTex),roof:mat('#82634b',roofTex),roof2:mat('#786e58',roofTex),grass:mat('#8c985f',grassTex),road:mat('#a9a592',stoneTex),black:mat('#282b20'),leaf:mat('#66753b'),leaf2:mat('#8b8c44'),leaf3:mat('#9b8040'),iron:mat('#46473c'),red:mat('#91594a'),linen:mat('#e4d7b4'),gold:mat('#bd9850'),hay:mat('#b6a16b'),water:mat('#608c82')};
// Photographic CC0 textures progressively replace self-contained procedural fallbacks.
const loader=new T.TextureLoader();for(const[name,file]of [['stone','cobblestone_floor_08'],['plaster','plastered_wall_02'],['wood','wood_planks_grey']])loader.load(`./assets/${file}.jpg`,t=>{t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;mats[name].map=t;mats[name].needsUpdate=true;},undefined,()=>{});
function add(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();const geo=g.clone().applyMatrix4(o.matrix);if(!batches.has(m))batches.set(m,[]);batches.get(m).push(geo);return o;}
function B(m,x,y,z,w,h,d,ry=0,rz=0){return add(box,m,x,y,z,w,h,d,0,ry,rz);}function C(m,x,y,z,a,h,b=a,rx=0,rz=0){return add(cyl,m,x,y,z,a,h,b,rx,0,rz);}function S(m,x,y,z,a,b=a,c=a){return add(sphere,m,x,y,z,a,b,c);}
// A broad, softly rolling landscape, flat beneath the walkable settlement.
const terrain=new T.PlaneGeometry(1100,1100,100,100);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),fade=T.MathUtils.smoothstep(Math.max(Math.abs(x),Math.abs(z)),105,280);pos.setY(i,-.1+fade*(Math.sin(x*.018)*Math.cos(z*.022)*12+Math.sin(z*.008)*21));}terrain.computeVertexNormals();const ground=new T.Mesh(terrain,mats.grass);ground.receiveShadow=true;scene.add(ground);
B(mats.road,0,-.025,0,39,.13,39);
for(const k of [-78,-52,-28,0,28,52,78]){B(mats.road,k,-.018,0,k===0?8:5,.08,179);B(mats.road,0,-.02,k,179,.08,k===0?8:5);}
// Houses occupy blocks, leaving a connected pedestrian street grid.
function house(x,z,w,d,h,variant){buildings.push({x,z,w,d});obstacles.push({x,z,w,d});const wall=variant%4===0?mats.stone:mats.plaster;B(mats.stone,x,.38,z,w+.2,.76,d+.2);B(wall,x,h/2+.4,z,w,h,d);B(mats.wood,x,h*.52,z,w+.12,.2,d+.12);for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])B(mats.darkwood,x+dx,h/2+.4,z+dz,.22,h+.2,.22);
for(const dx of [-w/4,w/4]){B(mats.wood,x+dx,h*.73,z+d/2+.04,.16,h*.52,.18);B(mats.wood,x+dx,h*.73,z-d/2-.04,.16,h*.52,.18);}
const roofHeight=w*.4;const roofGeo=new T.BufferGeometry();const a=w/2+.65,b=d/2+.6;const vertices=new Float32Array([-a,0,-b,a,0,-b,0,roofHeight,-b,-a,0,b,0,roofHeight,b,a,0,b,-a,0,-b,0,roofHeight,-b,0,roofHeight,b,-a,0,-b,0,roofHeight,b,-a,0,b,a,0,-b,a,0,b,0,roofHeight,b,a,0,-b,0,roofHeight,b,0,roofHeight,-b]);roofGeo.setAttribute('position',new T.BufferAttribute(vertices,3));const uv=[];for(let i=0;i<vertices.length;i+=3)uv.push(vertices[i]/4,vertices[i+2]/4+vertices[i+1]/3);roofGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));roofGeo.computeVertexNormals();add(roofGeo,variant%3===0?mats.roof2:mats.roof,x,h+.35,z);roofGeo.dispose();
B(mats.stone,x+w*.27,h+roofHeight*.65,z-d*.2,.75,2.4,.8);smoke.push(new T.Vector3(x+w*.27,h+roofHeight*.65+1.2,z-d*.2));
// Real depth to door recesses, shutters, transoms and window frames.
for(const side of [-1,1]){const zz=z+side*(d/2+.05);for(const xx of [-w*.27,w*.27]){B(mats.darkwood,x+xx,h*.71,zz,1.05,1.45,.13);B(mats.black,x+xx,h*.71,zz+side*.08,.8,1.2,.05);B(mats.wood,x+xx,h*.71,zz+side*.12,.07,1.2,.07);B(mats.wood,x+xx,h*.71,zz+side*.12,.85,.07,.07);for(const shutter of [-1,1])B(mats.wood,x+xx+shutter*.65,h*.71,zz,.32,1.4,.1);B(mats.stone,x+xx,h*.71-.76,zz,.95,.13,.4);}
B(mats.darkwood,x,1.05,zz,1.35,2.1,.16);B(mats.wood,x,.98,zz+side*.1,1.1,1.95,.12);B(mats.iron,x,1.45,zz+side*.18,1.1,.09,.05);B(mats.iron,x,.5,zz+side*.18,1.1,.09,.05);S(mats.iron,x+.34,1.02,zz+side*.2,.07);}
// Flower pots and barrels outside the threshold.
C(mats.red,x+w*.4,.3,z+d/2+.7,.26,.6);for(let j=0;j<5;j++)S(mats.leaf,x+w*.4+r(-.2,.2),.65+r(0,.2),z+d/2+.7+r(-.2,.2),.16);barrel(x-w*.4,z+d/2+.7);}
function barrel(x,z){C(mats.wood,x,.5,z,.43,1);for(const h of [.13,.48,.86])C(mats.iron,x,h,z,.45,.055);}
const centers=[-65,-40,-14,14,40,65];for(const x of centers)for(const z of centers){if(Math.abs(x)<25&&Math.abs(z)<25)continue;if(x>29&&x<51&&z< -29&&z> -51)continue;house(x+r(-1.3,1.3),z+r(-1.3,1.3),r(7,10),r(8,12),r(4.4,7),Math.floor(r(0,8)));if(Math.abs(x)>50)house(x+9.5,z+3,5.3,7,r(3.5,5),2);}
// Parish church, square tower, belfry and small walled herb garden.
house(40,-40,12,19,8,0);B(mats.stone,49,7,-40,7,14,7);obstacles.push({x:49,z:-40,w:7,d:7});for(const yy of [4,9,13])B(mats.darkwood,49,yy,-36.44,1.2,2.1,.12);add(cone,mats.roof2,49,17,-40,6,7,6,0,Math.PI/4);B(mats.wood,49,21,-40,.18,2.2,.18);B(mats.wood,49,21.4,-40,1.1,.16,.18);
// Low stone walls, gate posts, fields and livestock enclosures.
for(const side of [-1,1])for(const v of [-48,48]){B(mats.stone,side*92,.75,v,1.3,1.5,78);B(mats.stone,v,.75,side*92,78,1.5,1.3);obstacles.push({x:side*92,z:v,w:1.3,d:78},{x:v,z:side*92,w:78,d:1.3});}
for(const x of [-6,6]){C(mats.stone,x,3.2,92,2,6.4);C(mats.roof,x,6.8,92,2.5,1.2);}
// Village well: hollow stone ring, posts, tiled canopy and wooden bucket.
const well=new T.Mesh(new T.TorusGeometry(1.8,.37,8,28),mats.stone);well.rotation.x=Math.PI/2;well.position.set(0,1.15,0);well.castShadow=well.receiveShadow=true;scene.add(well);obstacles.push({x:0,z:0,w:4.6,d:4.6});C(mats.black,0,.4,0,1.6,.1);for(const x of [-2,2])B(mats.wood,x,2,0,.22,4,.22);B(mats.wood,0,3.8,0,4.6,.22,.22);B(mats.roof,0,4.15,0,5,.18,3);C(mats.wood,0,2.2,0,.27,.45);B(mats.wood,0,3,0,.035,1.3,.035);
// Market stalls, folded cloth, baskets, produce, trestles and awnings.
for(let i=0;i<8;i++){const x=i<4?-12:12,z=(i%4)*8-12;for(const dx of [-2,2])for(const dz of [-1,1])B(mats.wood,x+dx,1.5,z+dz,.12,3,.12);B(mats.wood,x,1,z,4.5,.16,2.4);B(i%2?mats.linen:mats.red,x,3,z,5,.08,3,0,.08*(i%2?1:-1));obstacles.push({x,z,w:4.6,d:2.5});for(let j=0;j<14;j++){S(i%3?mats.gold:mats.red,x+r(-1.7,1.7),1.2,z+r(-.8,.8),.15,.12,.15);}for(let j=0;j<3;j++)C(mats.hay,x-1+j,.4,z+1.8,.28,.65);}
for(const z of [-17,17])for(const x of [-5,5]){B(mats.wood,x,.55,z,2.5,.15,.5);for(const a of [-.9,.9])B(mats.wood,x+a,.25,z,.15,.5,.4);}
// Handcart with spoked wheels.
for(const[x,z]of [[-22,13],[56,1],[-30,-56]]){B(mats.wood,x,.85,z,1.5,.2,2.5);B(mats.wood,x- .7,1.2,z,.1,.8,2.5);B(mats.wood,x+.7,1.2,z,.1,.8,2.5);for(const s of [-1,1]){const wheel=new T.TorusGeometry(.7,.08,5,14);add(wheel,mats.wood,x+s*.95,.7,z,1,1,1,0,Math.PI/2);for(let k=0;k<6;k++)add(cyl,mats.wood,x+s*.95,.7,z,.035,1.4,.035,k*Math.PI/3,0,0);wheel.dispose();}for(const a of [-.5,.5])B(mats.wood,x+a,.6,z+2,.09,.09,2);}
// Fields beyond the houses: rows of grain, vegetable patches, haystacks.
for(let i=0;i<1100;i++){const x=r(-90,-35),z=r(99,129);B(mats.hay,x,.6,z,.045,r(.7,1.5),.045);add(cone,mats.gold,x,1.15,z,.12,.4,.12);}for(let i=0;i<8;i++)S(mats.hay,-80+i*6,1.1,-102,2.1,1.8,2.1);
function fence(x,z,w,d){for(let a=-w/2;a<=w/2;a+=3)for(const s of [-1,1])B(mats.wood,x+a,.7,z+s*d/2,.13,1.4,.13);for(let a=-d/2;a<=d/2;a+=3)for(const s of [-1,1])B(mats.wood,x+s*w/2,.7,z+a,.13,1.4,.13);for(const h of [.45,1]){B(mats.wood,x,h,z-d/2,w,.13,.13);B(mats.wood,x,h,z+d/2,w,.13,.13);B(mats.wood,x-w/2,h,z,.13,.13,d);B(mats.wood,x+w/2,h,z,.13,.13,d);}}
fence(-108,-55,22,28);fence(106,42,23,28);
// Oaks, poplars, stones and a ring of autumn woodland.
for(let i=0;i<270;i++){const angle=r(0,Math.PI*2),radius=r(112,310),x=Math.cos(angle)*radius,z=Math.sin(angle)*radius;if(Math.abs(x)<7||Math.abs(z)<7)continue;const h=r(5,12);C(mats.wood,x,h*.4,z,.3,h*.8);const leaf=[mats.leaf,mats.leaf2,mats.leaf3][i%3];for(let j=0;j<4;j++)S(leaf,x+r(-2,2),h+r(-1,2),z+r(-2,2),r(2,4),r(2,4),r(2,4));}
for(const[x,z]of [[-20,22],[20,-21],[-50,22],[24,58],[56,-21]]){C(mats.wood,x,3,z,.35,6);for(let j=0;j<5;j++)S(mats.leaf2,x+r(-2,2),6+r(-1,2),z+r(-2,2),2.4);}
for(let i=0;i<160;i++){const a=r(0,6.28),rad=r(97,250);S(mats.stone,Math.cos(a)*rad,.2,Math.sin(a)*rad,r(.3,1.5),r(.3,.8),r(.3,1.4));}
// Distant hills frame the settlement rather than ending at a visible plane.
for(let i=0;i<24;i++){const a=i/24*Math.PI*2;S(mat(i%2?'#6d7960':'#7d896d'),Math.cos(a)*450,-15,Math.sin(a)*450,r(80,140),r(65,120),r(90,170));}
// Pond and stream outside the east wall; water ripples are animated in the shader.
const waterMat=new T.MeshPhysicalMaterial({color:'#526f60',metalness:.2,roughness:.23,transparent:true,opacity:.87});waterMat.onBeforeCompile=shader=>{shader.uniforms.uTime={value:0};waterMat.userData.shader=shader;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y += sin(position.x*1.7 + uTime)*0.045 + cos(position.z*2.1+uTime*.8)*.035;');};const pond=new T.Mesh(new T.CircleGeometry(25,48),waterMat);pond.rotation.x=-Math.PI/2;pond.scale.set(.65,1.7,1);pond.position.set(116,-.015,-9);scene.add(pond);waterMeshes.push(waterMat);
// Bake all static architectural pieces by material, keeping draw calls bounded.
for(const[m,gs]of batches){const geo=mergeGeometries(gs,false);if(!geo)throw Error('Static geometry merge failed');const mesh=new T.Mesh(geo,m);mesh.castShadow=m!==mats.road&&m!==mats.grass;mesh.receiveShadow=true;scene.add(mesh);gs.forEach(g=>g.dispose());}box.dispose();cyl.dispose();sphere.dispose();cone.dispose();
return{obstacles,buildings,smoke,waterMeshes,windThings,mats};
}
