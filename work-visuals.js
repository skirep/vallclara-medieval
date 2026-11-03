import * as T from 'three';
import {ROLE_LABELS,ROLE_COLORS} from './resident-tasks.js';
export function createWorkVisuals(scene,population,sites){
 const dummy=new T.Object3D(),geometry=new T.BoxGeometry(1,1,1),wood=new T.MeshStandardMaterial({color:'#a1845b',roughness:.95}),material=new T.MeshStandardMaterial({roughness:.85});
 const bases=new T.InstancedMesh(geometry,wood,sites.length),goods=new T.InstancedMesh(geometry,material,sites.length),tools=new T.InstancedMesh(geometry,wood,population.length),heads=new T.InstancedMesh(geometry,material,population.length),parcels=new T.InstancedMesh(geometry,material,population.length);
 for(const mesh of [bases,goods,tools,heads,parcels]){mesh.frustumCulled=false;scene.add(mesh);}
 for(const mesh of [tools,heads,parcels])mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);
 const colors=ROLE_COLORS.map(c=>new T.Color(c));
 for(const [i,p]of population.entries()){heads.setColorAt(i,colors[p.duty?.role??0]);parcels.setColorAt(i,colors[p.duty?.role??0]);}
 const labels=[],labelMaterials=ROLE_LABELS.map((name,i)=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;const ctx=canvas.getContext('2d');ctx.fillStyle='#20332be6';ctx.fillRect(0,0,256,64);ctx.strokeStyle=ROLE_COLORS[i];ctx.strokeRect(1,1,254,62);ctx.font='bold 23px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#f2e5c5';ctx.fillText(name,128,32);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;return new T.SpriteMaterial({map:texture,transparent:true,depthWrite:false});
 });
 for(const site of sites){
  dummy.position.set(site.x+1.7,.35,site.z+1.7);dummy.rotation.set(0,0,0);dummy.scale.set(.85,.7,.7);dummy.updateMatrix();bases.setMatrixAt(site.id,dummy.matrix);
  dummy.position.y=.84;dummy.scale.set(.62,.28,.48);dummy.updateMatrix();goods.setMatrixAt(site.id,dummy.matrix);goods.setColorAt(site.id,colors[site.role]);
  const sprite=new T.Sprite(labelMaterials[site.role]);sprite.position.set(site.x+1.7,2.35,site.z+1.7);sprite.scale.set(4,1,1);sprite.visible=false;scene.add(sprite);labels.push(sprite);
 }
 function place(mesh,index,x,y,z,sx,sy,sz,ry=0,rz=0){dummy.position.set(x,y,z);dummy.rotation.set(0,ry,rz);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);}
 function update(camera,quality='medium'){
  for(const [i,p]of population.entries()){
   const d=p.duty,active=!p.courtSeat&&d?.phase==='working'&&p.state==='working'&&!p.assembly&&Math.hypot(camera.x-p.x,camera.z-p.z)<65;
   const swing=active?Math.sin(d.elapsed*5+p.id)*.45:0,dx=Math.cos(p.heading)*.33,dz=-Math.sin(p.heading)*.33;
   place(tools,i,p.x+dx,p.height*.98+swing*.08,p.z+dz,active?.055:0,active?.45:0,active?.055:0,p.heading,swing);
   place(heads,i,p.x+dx,p.height*1.18+swing*.08,p.z+dz,active?.18:0,active?.09:0,active?.12:0,p.heading,swing);
   const carrying=!p.courtSeat&&!!d?.cargo&&!p.assembly&&Math.hypot(camera.x-p.x,camera.z-p.z)<65;
   place(parcels,i,p.x+Math.sin(p.heading)*.25,p.height*.75,p.z+Math.cos(p.heading)*.25,carrying?.3:0,carrying?.3:0,carrying?.25:0,p.heading);
  }
  for(const m of [tools,heads,parcels]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}
  for(const label of labels)label.visible=quality!=='low'&&Math.hypot(camera.x-label.position.x,camera.z-label.position.z)<23;
 }
 return{update};
}
