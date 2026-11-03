import {housePlan,wallPanels} from './interiors.js';
import {addCastle} from './castle.js';
import {addChurch} from './church.js';
import {lanes} from './simulation.js';
import {RIVER,riverCenter,VILLAGE_BOUNDARY,landscapeHeight,groundHeight} from './terrain.js';
import {addRiverAndBridge} from './scenery.js';
import * as T from 'three';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {random} from './simulation.js';
import {applyPBR,worldUV} from './materials.js';
import {createNature} from './nature.js';
export function roofVertices(width,depth,rise){
 const a=width/2+.65,b=depth/2+.6;
 const vertices=new Float32Array([-a,0,-b,a,0,-b,0,rise,-b,-a,0,b,0,rise,b,a,0,b,-a,0,-b,0,rise,-b,0,rise,b,-a,0,-b,0,rise,b,-a,0,b,a,0,-b,a,0,b,0,rise,b,a,0,-b,0,rise,b,0,rise,-b]);
 // Outward winding is essential: an inward roof vanishes with back-face culling.
 for(let i=0;i<vertices.length;i+=9)for(let k=0;k<3;k++){const v=vertices[i+3+k];vertices[i+3+k]=vertices[i+6+k];vertices[i+6+k]=v;}
 return vertices;
}
export function createWorld(scene){
const rng=random(324),r=(a,b)=>a+rng()*(b-a),batches=new Map(),obstacles=[],buildings=[],smoke=[],waterMeshes=[],windThings=[],interiors=[],lights=[];
const box=new T.BoxGeometry(1,1,1),cyl=new T.CylinderGeometry(1,1,1,10),sphere=new T.SphereGeometry(1,10,7),cone=new T.ConeGeometry(1,1,8);
function canvasTexture(type){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.fillStyle=type==='stone'?'#6d7166':type==='roof'?'#604b39':type==='wood'?'#65513b':type==='grass'?'#6d7549':'#c2b79c';x.fillRect(0,0,256,256);for(let i=0;i<6500;i++){const n=Math.floor(r(0,255));x.fillStyle=`rgba(${n},${n},${n},.11)`;x.fillRect(r(0,256),r(0,256),r(1,5),r(1,4));}if(type==='stone'){for(let y=0;y<256;y+=32)for(let col=-1;col<5;col++){const a=col*64+(y%64?32:0);x.strokeStyle='#333a31';x.lineWidth=2;x.strokeRect(a+2,y+2,60,28);}}if(type==='wood'){for(let i=0;i<256;i+=16){x.strokeStyle='#33291e88';x.beginPath();x.moveTo(i,0);x.bezierCurveTo(i+9,80,i-8,170,i,256);x.stroke();}}if(type==='roof'){for(let y=0;y<256;y+=24)for(let k=-1;k<9;k++){x.strokeStyle='#352b2355';x.lineWidth=3;x.strokeRect(k*32+(y%48?16:0),y,30,22);}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t;}
const stoneTex=canvasTexture('stone'),plasterTex=canvasTexture('plaster'),woodTex=canvasTexture('wood'),roofTex=canvasTexture('roof'),grassTex=canvasTexture('grass');
function mat(color,map,roughness=1){return new T.MeshStandardMaterial({color,...(map?{map,bumpMap:map,bumpScale:.055}:{}),roughness});}
const mats={stone:mat('#afa58d',stoneTex),plaster:mat('#e1d3b4',plasterTex),wood:mat('#77604a',woodTex),darkwood:mat('#54422e',woodTex),roof:mat('#82634b',roofTex),roof2:mat('#786e58',roofTex),grass:mat('#8c985f',grassTex),road:mat('#a9a592',stoneTex),black:mat('#282b20'),leaf:mat('#66753b'),leaf2:mat('#8b8c44'),leaf3:mat('#9b8040'),iron:mat('#46473c'),red:mat('#91594a'),linen:mat('#e4d7b4'),gold:mat('#bd9850'),hay:mat('#b6a16b'),water:mat('#608c82')};
// Photographic, metre-scaled PBR surfaces, including dedicated road/roof/ground maps.
for(const [key,asset,meters,tint,strength] of [
 ['stone','medieval_blocks_03',2,'#e7e3d9',.8],['road','cobblestone_floor_08',2,'#d1ccba',.85],
 ['plaster','plastered_wall_02',2,'#e0d5bd',.5],['wood','wood_planks_grey',2,'#ad9780',.6],
 ['darkwood','wood_planks_grey',2,'#75614d',.6],['roof','clay_roof_tiles',2,'#b79e88',.7],
 ['roof2','clay_roof_tiles',2,'#969186',.7],['grass','sparse_grass',3,'#b4b396',.8],
 ['linen','rough_linen',1,'#d9cfb6',.35],['red','rough_linen',1,'#8b5546',.35]
])applyPBR(mats[key],asset,{meters,tint,strength});
mats.bark=applyPBR(mat('#ffffff'), 'bark_brown_02',{meters:2,tint:'#a99c82',strength:.9});
mats.glass=new T.MeshPhysicalMaterial({color:'#1d261e',roughness:.24,metalness:0,clearcoat:.4,envMapIntensity:1});
mats.moss=mat('#535b3c');mats.dirt=mat('#75674e');mats.ember=new T.MeshStandardMaterial({color:'#d16c28',emissive:'#ff5313',emissiveIntensity:1.8,roughness:1});
function add(g,m,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const o=new T.Mesh(g,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();const geo=(g.index?g.toNonIndexed():g.clone()).applyMatrix4(o.matrix);if(m.userData.textureMeters)worldUV(geo,m.userData.textureMeters);if(!batches.has(m))batches.set(m,[]);batches.get(m).push(geo);return o;}
function B(m,x,y,z,w,h,d,ry=0,rz=0){return add(box,m,x,y,z,w,h,d,0,ry,rz);}function C(m,x,y,z,a,h,b=a,rx=0,rz=0){return add(cyl,m,x,y,z,a,h,b,rx,0,rz);}function S(m,x,y,z,a,b=a,c=a){return add(sphere,m,x,y,z,a,b,c);}
// A broad, softly rolling landscape, flat beneath the walkable settlement.
const terrain=new T.PlaneGeometry(700,700,350,350);terrain.rotateX(-Math.PI/2);const pos=terrain.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),fade=T.MathUtils.smoothstep(Math.max(Math.abs(x),Math.abs(z)),105,280);pos.setY(i,landscapeHeight(x,z));}terrain.computeVertexNormals();worldUV(terrain,3);const ground=new T.Mesh(terrain,mats.grass);ground.receiveShadow=true;scene.add(ground);
B(mats.road,-14,-.025,0,36,.13,39);
for(const k of lanes){
 B(mats.road,k,-.018,0,k===0?5.8:4.8,.08,119);
 if(k===0){B(mats.road,-28,-.02,k,64,.08,6);B(mats.road,38,-.02,k,44,.08,6);}
 else{B(mats.road,-28,-.02,k,64,.08,4.8);B(mats.road,38,-.02,k,44,.08,4.8);}
}
// Houses occupy blocks, leaving a connected pedestrian street grid.
function house(x,z,w,d,h,variant){
 const plan=housePlan(x,z,w,d,h,variant);plan.kind='house';buildings.push(plan);interiors.push(plan);obstacles.push(...plan.walls,...plan.furniture);
 const wall=variant%4===0?mats.stone:mats.plaster;
 B(mats.wood,x,.005,z,w,.11,d);
 for(const side of [-1,1]){
  B(wall,x+side*w/2,h/2,z,.32,h,d);
  for(const panel of wallPanels(w,h))B(wall,x+panel.x,panel.y,z+side*d/2,panel.w,panel.h,.32);
  // Open doors, worn stone jambs, and real openings rather than painted portals.
  for(const dx of [-1.05,1.05])B(mats.stone,x+dx,1.29,z+side*(d/2+.05),.18,2.58,.45);
  B(mats.wood,x,2.65,z+side*d/2,2.3,.2,.45);
  B(mats.wood,x-1.42,1.2,z+side*(d/2-.3),.72,2.4,.09,.35*side);
  for(const win of [-w*.3,w*.3]){
   B(mats.wood,x+win,1.25,z+side*d/2,1.12,.12,.47);
   B(mats.wood,x+win,2.35,z+side*d/2,1.12,.12,.47);
   for(const dx of [-.54,0,.54])B(mats.darkwood,x+win+dx,1.8,z+side*d/2,.07,1.1,.22);
   for(const shutter of [-1,1])B(mats.wood,x+win+shutter*.8,1.8,z+side*(d/2+.1),.45,1.05,.09,shutter*.25);
  }
  for(const wing of [-1,1])B(mats.moss,x+wing*(w+1.9)/4,.12,z+side*(d/2+.18),(w-1.9)/2,.16,.07);
 }
 // Exposed beams and a roof with visible undersides, rafters and ridge tiles.
 for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2])B(mats.darkwood,x+dx,h/2,z+dz,.22,h+.15,.22);
 for(let zz=-d/2+.7;zz<d/2;zz+=1.4)B(mats.darkwood,x,3.15,z+zz,w,.2,.18);
 B(mats.wood,x,3.28,z,w,.10,d);
 const roofHeight=w*.4,vertices=roofVertices(w,d,roofHeight),roofGeo=new T.BufferGeometry();
 roofGeo.setAttribute('position',new T.BufferAttribute(vertices.slice(18),3));roofGeo.computeVertexNormals();
 const roofMaterial=variant%3===0?mats.roof2:mats.roof;
 add(roofGeo,roofMaterial,x,h+.1,z);roofGeo.dispose();
 const gable=new T.BufferGeometry();gable.setAttribute('position',new T.BufferAttribute(vertices.slice(0,18),3));gable.computeVertexNormals();add(gable,wall,x,h+.1,z);gable.dispose();
 C(mats.roof,x,h+roofHeight+.1,z,.13,d+1.2,.13,Math.PI/2);
 for(const side of [-1,1]){
  B(mats.darkwood,x+side*(w/2+.4),h+.04,z,.18,.24,d+1.3);
  B(mats.darkwood,x,3.32,z+side*(d/2+.03),w,.20,.16);
  for(const xx of [-w*.26,w*.26]){
   B(mats.darkwood,x+xx,h*.77,z+side*(d/2+.17),.92,1.0,.16);
   B(mats.glass,x+xx,h*.77,z+side*(d/2+.27),.70,.8,.04);
   B(mats.wood,x+xx,h*.77,z+side*(d/2+.30),.05,.86,.07);
  }
 }
 // Individual dressed corner stones, plinths and timber bracing.
 for(const side of [-1,1]){
  for(const dx of [-w/2,w/2])for(let y=.35;y<h;y+=.55)B(mats.stone,x+dx,y,z+side*(d/2+.07),.45,.38,.43);
  for(const wing of [-1,1]){B(mats.stone,x+wing*(w+2.3)/4,.19,z+side*(d/2+.10),(w-2.3)/2,.3,.38);B(mats.darkwood,x+wing*w*.3,h*.66,z+side*(d/2+.18),.14,h*.58,.12,0,wing*.62);}
  for(const dx of [-.35,.2]){B(mats.iron,x-1.42,1.2+dx,z+side*(d/2-.34),.62,.06,.08,.35*side);}
  for(const win of [-w*.3,w*.3])for(const dz of [-.4,0,.4])B(mats.wood,x+win+dz,2.53,z+side*(d/2+.22),.08,.18,.48);
 }
 B(mats.red,x-w*.24,.075,z+d*.05,w*.35,.018,d*.27);
 for(let i=0;i<4;i++){C(mats.linen,x-w*.28+i*.24,.98,z+d*.15,.07,.20);}
 for(const side of [-1,1]){B(mats.darkwood,x+side*(w/2-.2),1.6,z-d*.35,.15,.12,.6);B(mats.iron,x+side*(w/2-.2),1.9,z-d*.35,.04,.5,.04);}
 // Small spaced ridge tiles, chimney cap and patched plaster add real depth.
 for(let zz=-d/2;zz<=d/2;zz+=.42)C(mats.roof,x,h+roofHeight+.16,z+zz,.16,.32,.16,Math.PI/2);
 B(mats.stone,x+w*.27,h+roofHeight*.65+1.23,z-d*.2,.95,.12,1.02);
 B(mats.stone,x+w*.27,h+roofHeight*.65,z-d*.2,.75,2.4,.8);smoke.push(new T.Vector3(x+w*.27,h+roofHeight*.65+1.2,z-d*.2));
 for(const item of plan.furniture){
  const {x:fx,z:fz,w:fw,d:fd,h:fh,kind}=item;
  if(kind==='table'||kind==='bench'){
   B(mats.wood,fx,fh,fz,fw,.12,fd);for(const dx of [-fw*.35,fw*.35])for(const dz of [-fd*.32,fd*.32])B(mats.darkwood,fx+dx,fh/2,fz+dz,.12,fh,.12);
   if(kind==='table'){C(mats.red,fx,.98,fz,.15,.26);S(mats.gold,fx+.38,.97,fz+.2,.22,.07,.16);B(mats.linen,fx-.35,.90,fz,.44,.015,.7);}
  }else if(kind==='bed'){
   B(mats.darkwood,fx,.27,fz,fw,.38,fd);B(mats.hay,fx,.49,fz,fw*.94,.18,fd*.93);B(variant%2?mats.linen:mats.red,fx,.60,fz+.2,fw*.96,.08,fd*.63);B(mats.linen,fx,.64,fz-.7,.78,.16,.42);
   for(const dx of [-fw/2,fw/2])B(mats.wood,fx+dx,.45,fz-fd/2,.1,.9,.12);
  }else if(kind==='hearth'){
   B(mats.stone,fx,.20,fz,fw,.35,fd);for(const side of [-1,1])B(mats.stone,fx+side*.5,.50,fz,.18,.6,fd);
   B(mats.black,fx,.4,fz,.65,.14,.65);for(let j=0;j<3;j++)B(mats.darkwood,fx+(j-1)*.17,.49,fz,.13,.12,.58, j*.4);
   for(let j=0;j<5;j++)S(mats.ember,fx+(j-2)*.1,.55,fz+.12,.065,.035,.06);
  }else{B(mats.wood,fx,.36,fz,fw,.64,fd);for(const dx of [-.4,.4])B(mats.iron,fx+dx,.38,fz,.06,.68,fd+.04);}
 }
 // Shelves, pottery, woven baskets, stools, wall patches and roof dripstones.
 for(let tier=0;tier<2;tier++){
  B(mats.wood,x-w*.40,1.25+tier*.55,z-d*.28,.4,.09,1.7);
  for(let j=0;j<3;j++)C(j%2?mats.red:mats.linen,x-w*.4,1.45+tier*.55,z-d*.28+(j-1)*.45,.11,.30);
 }
 for(let i=0;i<5;i++){const zz=z-d*.4+i*d*.19;B(mats.stone,x-w/2+.2,.14,zz,.30,.20,.22);}
 const light=new T.PointLight('#ffc786',16,11,2);light.position.set(x+w*.29,2.1,z+d*.22);light.visible=false;scene.add(light);lights.push(light);
 C(mats.red,x+w*.38,.3,z+d/2+.65,.26,.6);for(let j=0;j<5;j++)S(mats.leaf,x+w*.38+r(-.2,.2),.65+r(0,.2),z+d/2+.65+r(-.2,.2),.16);
 barrel(x-w*.38,z+d/2+.65);
}
function barrel(x,z){C(mats.wood,x,.5,z,.43,1);for(const h of [.13,.48,.86])C(mats.iron,x,h,z,.45,.055);}
const centers=[-45,-27,-9,9,27,45];
for(const x of centers)for(const z of centers){
 if(x===9||x>-36&&x<8&&Math.abs(z)<18||x===-27&&z===-27)continue;
 house(x+r(-.35,.35),z+r(-.35,.35),r(6.8,9),r(8,11.2),r(4.4,6.3),Math.floor(r(0,8)));
}
const church=addChurch({B,C,S,add,mats,obstacles,buildings,interiors,T});
const castle=addCastle(scene,{B,C,S,add,mats,obstacles,buildings,interiors,lights,T});
// Low stone walls, gate posts, fields and livestock enclosures.
for(const side of [-1,1])for(const v of [-33,33]){
 B(mats.stone,side*64,.6,v,1.2,1.2,58);obstacles.push({x:side*64,z:v,w:1.2,d:58});
 // Leave the river and northern royal road open.
 if(side===1){for(const [cx,width]of [[-28,64],[39,42]]){B(mats.stone,cx,.6,64,width,1.2,1.2);obstacles.push({x:cx,z:64,w:width,d:1.2});}}
}
for(const x of [-6,6]){C(mats.stone,x-18,2.6,64,1.5,5.2);C(mats.roof,x-18,5.5,64,1.8,.8);}
// Village well: hollow stone ring, posts, tiled canopy and wooden bucket.
const wx=-13,wz=6,well=new T.Mesh(new T.TorusGeometry(1.45,.3,8,24),mats.stone);well.rotation.x=Math.PI/2;well.position.set(wx,1.0,wz);well.castShadow=well.receiveShadow=true;scene.add(well);obstacles.push({x:wx,z:wz,w:3.8,d:3.8});C(mats.black,wx,.4,wz,1.3,.1);for(const dx of [-1.7,1.7])B(mats.wood,wx+dx,1.8,wz,.18,3.6,.18);B(mats.wood,wx,3.5,wz,4,.18,.18);B(mats.roof,wx,3.75,wz,4.5,.18,2.6);C(mats.wood,wx,2.1,wz,.24,.4);B(mats.wood,wx,2.8,wz,.035,1.2,.035);
// Market stalls, folded cloth, baskets, produce, trestles and awnings.
for(let i=0;i<8;i++){const x=i<4?-28:-8,z=(i%4)*8-12;for(const dx of [-2,2])for(const dz of [-1,1])B(mats.wood,x+dx,1.5,z+dz,.12,3,.12);B(mats.wood,x,1,z,4.5,.16,2.4);B(i%2?mats.linen:mats.red,x,3,z,5,.08,3,0,.08*(i%2?1:-1));obstacles.push({x,z,w:4.6,d:2.5});for(let j=0;j<14;j++){S(i%3?mats.gold:mats.red,x+r(-1.7,1.7),1.2,z+r(-.8,.8),.15,.12,.15);}for(let j=0;j<3;j++)C(mats.hay,x-1+j,.4,z+1.8,.28,.65);}
for(const z of [-14.5,14.5])for(const x of [-13,-6]){B(mats.wood,x,.55,z,2.5,.15,.5);for(const a of [-.9,.9])B(mats.wood,x+a,.25,z,.15,.5,.4);}
// Handcart with spoked wheels.
for(const[x,z]of [[-32,13],[55,3],[-30,-55]]){B(mats.wood,x,.85,z,1.5,.2,2.5);B(mats.wood,x- .7,1.2,z,.1,.8,2.5);B(mats.wood,x+.7,1.2,z,.1,.8,2.5);for(const s of [-1,1]){const wheel=new T.TorusGeometry(.7,.08,5,14);add(wheel,mats.wood,x+s*.95,.7,z,1,1,1,0,Math.PI/2);for(let k=0;k<6;k++)add(cyl,mats.wood,x+s*.95,.7,z,.035,1.4,.035,k*Math.PI/3,0,0);wheel.dispose();}for(const a of [-.5,.5])B(mats.wood,x+a,.6,z+2,.09,.09,2);}
// Fields beyond the houses: rows of grain, vegetable patches, haystacks.
for(let i=0;i<400;i++){const x=r(-58,-24),z=r(69,81);B(mats.hay,x,.6,z,.045,r(.7,1.5),.045);add(cone,mats.gold,x,1.15,z,.12,.4,.12);}for(let i=0;i<8;i++)S(mats.hay,-58+i*4,1.1,-70,2.1,1.8,2.1);
function fence(x,z,w,d){for(let a=-w/2;a<=w/2;a+=3)for(const s of [-1,1])B(mats.wood,x+a,.7,z+s*d/2,.13,1.4,.13);for(let a=-d/2;a<=d/2;a+=3)for(const s of [-1,1])B(mats.wood,x+s*w/2,.7,z+a,.13,1.4,.13);for(const h of [.45,1]){B(mats.wood,x,h,z-d/2,w,.13,.13);B(mats.wood,x,h,z+d/2,w,.13,.13);B(mats.wood,x-w/2,h,z,.13,.13,d);B(mats.wood,x+w/2,h,z,.13,.13,d);}}
fence(-76,-38,16,20);fence(76,34,16,20);
// Branch geometry and alpha-cutout foliage replace solid spherical tree crowns.
const nature=createNature(scene,mats,buildings);windThings.push(nature);
for(let i=0;i<70;i++){const a=r(0,6.28),rad=r(96,200);S(mats.stone,Math.cos(a)*rad,.2,Math.sin(a)*rad,r(.3,1.5),r(.3,.8),r(.3,1.4));}
// Distant hills frame the settlement rather than ending at a visible plane.
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;S(mat(i%2?'#6d7960':'#7d896d'),Math.cos(a)*450,-15,Math.sin(a)*450,r(80,140),r(65,120),r(90,170));}
// A carved river valley, open masonry arch and continuous walkable deck.
const riverside=addRiverAndBridge(scene,{B,C,S,add,mats,obstacles,waterMeshes,random:r});
// Bake all static architectural pieces by material, keeping draw calls bounded.
for(const[m,gs]of batches){const geo=mergeGeometries(gs,false);if(!geo)throw Error('Static geometry merge failed');const mesh=new T.Mesh(geo,m);mesh.castShadow=m!==mats.road&&m!==mats.grass;mesh.receiveShadow=true;scene.add(mesh);gs.forEach(g=>g.dispose());}box.dispose();cyl.dispose();sphere.dispose();cone.dispose();
function updateLights(position){const nearest=lights.map(l=>({l,d:l.position.distanceToSquared(position)})).sort((a,b)=>a.d-b.d).slice(0,3);for(const l of lights)l.visible=false;for(const {l,d}of nearest)l.visible=d<225;}
return{obstacles,buildings,smoke,waterMeshes,windThings,mats,interiors,riverside,castle,church,boundary:VILLAGE_BOUNDARY,heightAt:(x,z)=>groundHeight(x,z,buildings),updateLights};
}
