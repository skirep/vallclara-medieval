export function addChurch({B,C,S,add,mats,obstacles,buildings,interiors,T}){
 const x=-27,z=-27,w=11.6,d=12.4,h=7.5,walls=[{x:x-w/2,z,w:.4,d},{x:x+w/2,z,w:.4,d}];
 for(const side of [-1,1])for(const wing of [-1,1])walls.push({x:x+wing*(w+2.6)/4,z:z+side*d/2,w:(w-2.6)/2,d:.4});
 const furniture=[{kind:'altar',x,z:z-4.6,w:3,d:1,h:1.1},{kind:'font',x:x+3.8,z:z+4,w:1.1,d:1.1,h:.9}];
 for(const zz of [-2.5,0,2.5])for(const side of [-1,1])furniture.push({kind:'pew',x:x+side*2.6,z:z+zz,w:2.8,d:.65,h:.5});
 const plan={kind:'church',name:'Església de Santa Maria',x,z,w,d,h,walls,furniture,entrances:[{x,z:z+d/2}]};buildings.push(plan);interiors.push(plan);obstacles.push(...walls,...furniture);
 B(mats.stone,x,-.01,z,w+.5,.15,d+.5);B(mats.road,x,.06,z,w-.4,.07,d-.4);
 for(const side of [-1,1]){
  const xx=x+side*w/2;
  B(mats.stone,xx,1.3,z,.4,2.6,d);B(mats.stone,xx,5.9,z,.4,3.2,d);
  for(const zz of [-5.6,-3,0,3,5.6])B(mats.stone,xx,3.5,z+zz,.4,2,zz===0?1.5:.9);
  for(const zz of [-4.2,-1.6,1.6,4.2]){
   B(mats.glass,xx,3.5,z+zz,.06,1.7,.9);
   for(const n of [-1,0,1])B(n===0?mats.gold:mats.red,xx+side*.05,3.5+n*.5,z+zz,.05,.38,.74);
   B(mats.iron,xx+side*.09,3.5,z+zz,.05,1.8,.05);
   for(const dz of [-.55,.55])B(mats.stone,xx,3.5,z+zz+dz,.62,2.1,.16);
  }
  for(const zz of [-5.7,-2.8,2.8,5.7]){B(mats.stone,xx+side*.45,2.8,z+zz,1,5.6,.8);B(mats.stone,xx+side*.6,.4,z+zz,1.5,.8,1.3);}
  for(const wing of [-1,1])B(mats.stone,x+wing*(w+2.6)/4,3.75,z+side*d/2,(w-2.6)/2,7.5,.5);
  B(mats.stone,x,5.65,z+side*d/2,2.6,3.7,.5);
  for(let i=0;i<15;i++){const a=i/14*Math.PI;B(mats.stone,x+Math.cos(a)*1.55,2.7+Math.sin(a)*1.55,z+side*(d/2+.18),.35,.35,.68,0,-a);}
  for(const xx of [-1.6,1.6])C(mats.stone,x+xx,1.5,z+side*(d/2+.18),.16,3);
  for(const zz of [-3.4,1.5]){C(mats.stone,x+side*3.9,3.1,z+zz,.28,6.2);C(mats.stone,x+side*3.9,5.9,z+zz,.43,.3);}
 }
 // A high nave and open arch ribs leave a clear processional aisle.
 for(const zz of [-3.4,1.5])for(let i=0;i<19;i++){const a=i/18*Math.PI;B(mats.stone,x+Math.cos(a)*3.9,5.8+Math.sin(a)*1.5,z+zz,.38,.32,.3,0,-a);}
 for(const side of [-1,1])B(mats.roof,x+side*3.15,9,z,7.1,.20,d+1.1,0,-side*Math.atan2(3,6.3));
 for(let zz=-6.5;zz<=6.5;zz+=.55)C(mats.roof,x,10.5,z+zz,.18,.48,.18,Math.PI/2);
 for(const f of furniture){
  if(f.kind==='pew'){B(mats.darkwood,f.x,.48,f.z,f.w,.16,f.d);B(mats.wood,f.x,.9,f.z-.28,f.w,.8,.1);for(const side of [-1,1])B(mats.wood,f.x+side*f.w*.4,.22,f.z,.15,.44,.5);}
  else if(f.kind==='altar'){B(mats.stone,f.x,.55,f.z,2.6,1.1,.8);B(mats.stone,f.x,1.15,f.z,3.3,.18,1.15);B(mats.linen,f.x,1.27,f.z,3.2,.03,1.1);B(mats.gold,f.x,2.1,f.z,.07,1.55,.07);B(mats.gold,f.x,2.4,f.z,.75,.07,.07);for(const side of [-1,1]){C(mats.gold,x+side*1.25,1.5,f.z,.06,.48);C(mats.linen,x+side*1.25,1.92,f.z,.055,.4);S(mats.ember,x+side*1.25,2.15,f.z,.04,.07,.04);}}
  else{C(mats.stone,f.x,.4,f.z,.28,.8);C(mats.stone,f.x,.85,f.z,.64,.25);C(mats.water,f.x,.99,f.z,.5,.02);}
 }
 // Belfry, bells, louvres, clock-face cross and carved cornices.
 const tx=-30.6,tz=-30.3;B(mats.stone,tx,6.4,tz,3.8,12.8,3.8);obstacles.push({x:tx,z:tz,w:3.8,d:3.8});
 for(const y of [1,5.5,10,12.4])B(mats.stone,tx,y,tz,4.2,.3,4.2);
 for(const side of [-1,1]){B(mats.black,tx,11.3,tz+side*1.92,1.6,1.8,.03);for(let y=10.6;y<12;y+=.24)B(mats.darkwood,tx,y,tz+side*1.95,1.5,.10,.15);}
 C(mats.gold,tx,11.1,tz,.5,.8);S(mats.gold,tx,11.6,tz,.35,.3,.35);
 const cone=new T.ConeGeometry(3.2,4.7,4);add(cone,mats.roof2,tx,15,tz,1,1,1,0,Math.PI/4);cone.dispose();B(mats.gold,tx,18,tz,.1,1.6,.1);B(mats.gold,tx,18.2,tz,.8,.1,.1);
 // The entry rose sits proud of the wall: radial stone tracery and coloured glass.
 const disc=new T.CircleGeometry(1.1,24);add(disc,mats.red,x,5.8,z+d/2+.29);disc.dispose();
 for(let i=0;i<12;i++){const a=i*Math.PI/6;B(mats.gold,x+Math.cos(a)*.55,5.8+Math.sin(a)*.55,z+d/2+.33,1.14,.055,.055,0,a);S(mats.stone,x+Math.cos(a)*1.14,5.8+Math.sin(a)*1.14,z+d/2+.34,.13,.13,.1);}
 return plan;
}
