// A walkable keep: every room boundary and furnishing uses the same coordinates
// for the architectural mesh, collision and room labels.
export const CASTLE={x:36,z:-72,w:30,d:28,gate:{x:36,z:-58},thrones:[{spriteId:'king-berenguer',x:34.5,z:-82},{spriteId:'queen-almodis',x:37.5,z:-82}]};
export const CASTLE_ROOMS=[
 {name:'Sala del tron',x:36,z:-81.5,w:28,d:8.5},
 {name:'Biblioteca i cancelleria',x:26.5,z:-73.5,w:9.8,d:5.8},
 {name:'Cuines i rebost',x:26.5,z:-67.5,w:9.8,d:5.8},
 {name:'Armeria de la guàrdia',x:26.5,z:-61.5,w:9.8,d:5.8},
 {name:'Cambra del rei i la reina',x:45.5,z:-73.5,w:9.8,d:5.8},
 {name:'Gran menjador',x:45.5,z:-67.5,w:9.8,d:5.8},
 {name:'Capella reial',x:45.5,z:-61.5,w:9.8,d:5.8},
 {name:'Galeria i vestíbul',x:36,z:-67.5,w:7.5,d:18}
];
export function castlePlan(){
 const walls=[],furniture=[];
 const wall=(x,z,w,d,h=5.8)=>walls.push({x,z,w,d,h});
 wall(21,-72,.8,28);wall(51,-72,.8,28);wall(36,-86,30,.8);
 wall(26.75,-58,11.5,.8);wall(45.25,-58,11.5,.8);
 wall(26.75,-77,11.5,.38);wall(45.25,-77,11.5,.38);
 for(const x of [31.8,40.2]){
  let start=-77;
  for(const z of [-73.5,-67.5,-61.5]){const end=z-1.2;wall(x,(start+end)/2,.32,end-start);start=z+1.2;}
  wall(x,(start-58)/2,.32,-58-start);
 }
 for(const z of [-70.5,-64.5])for(const x of [26.5,45.5])wall(x,z,10.2,.32);
 const item=(kind,x,z,w,d,h=.8)=>furniture.push({kind,x,z,w,d,h});
 item('library',22.1,-73.5,.65,4.8,3.3);item('desk',26,-75.5,3.5,1.25);item('desk',29,-72,1.3,1.2);
 item('hearth',22.8,-67.5,2,3,2.7);item('kitchen-table',27,-68.5,3.3,1.4);item('shelves',29.7,-66,.7,2.1,2.5);
 item('weapons',22.3,-61.5,.55,4.2,2.4);item('chest',27,-59.3,3,.9,.7);
 item('bed',46,-74.4,3.3,2.9,.65);item('wardrobe',49.6,-73,.7,3,3);item('chest',43,-75.6,1.6,.7,.7);
 item('banquet',45.5,-67.5,5.4,1.55,.85);
 for(const x of [44,46.7])for(const z of [-69,-66])item('chair',x,z,.65,.65,.5);
 item('altar',46,-59.4,3.2,1.1,1.05);for(const x of [43.6,47.2])item('pew',x,-62.8,2,.6,.5);
 for(const t of CASTLE.thrones){wall(t.x,t.z-.8,1.45,.24,2.7);for(const side of [-1,1])wall(t.x+side*.62,t.z-.23,.16,.75,.85);}
 return {...CASTLE,kind:'castle',name:'Castell de Rocafort',rooms:CASTLE_ROOMS,walls,furniture,entrances:[CASTLE.gate]};
}
export function addCastle(scene,{B,C,S,add,mats,obstacles,buildings,interiors,lights,T}){
 const plan=castlePlan();buildings.push(plan);interiors.push(plan);obstacles.push(...plan.walls,...plan.furniture);
 B(mats.stone,36,-.06,-72,31,.2,29);B(mats.road,36,.035,-72,28.8,.07,27);
 for(const wall of plan.walls)B(mats.stone,wall.x,wall.h/2,wall.z,wall.w,wall.h,wall.d);
 // Deep stone plinths, cornices, buttresses, merlons and slit windows.
 for(const side of [-1,1]){
  for(const z of [-83,-77,-71,-65,-59]){
   B(mats.stone,36+side*15.5,2.25,z,1.4,4.5,1.2);
   B(mats.stone,36+side*15.8,.45,z,1.9,.9,1.8);
   B(mats.black,36+side*15.42,3.2,z,.025,1.4,.23);
  }
  B(mats.stone,36+side*15,5.8,-72,1.25,.32,29);
  for(let z=-86;z<=-58;z+=1.7)B(mats.stone,36+side*15,6.4,z,.9,1.1,.85);
  for(let x=21;x<=51;x+=1.7)B(mats.stone,x,6.4,-72+side*14,.85,1.1,.9);
  B(mats.stone,36,5.8,-72+side*14,31,.32,1.2);
 }
 for(const [x,z]of [[21,-86],[51,-86],[23,-59.5],[49,-59.5]]){
  C(mats.stone,x,4,z,2.35,8);C(mats.stone,x,7.9,z,2.65,.55);C(mats.stone,x,.4,z,2.65,.8);
  obstacles.push({x,z,w:4.5,d:4.5});
  for(let i=0;i<10;i++){const a=i*Math.PI/5;B(mats.stone,x+Math.cos(a)*2.3,8.55,z+Math.sin(a)*2.3,.65,1,.65,a);}
  for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const px=x+Math.sin(a)*2.36,pz=z+Math.cos(a)*2.36;B(mats.black,px,5,pz,.3,1.5,.06,a);}
 }
 // Open gate, stone arch, raised portcullis and heavy open oak leaves.
 B(mats.stone,36,4.95,-58,7,1.7,.9);
 for(const side of [-1,1]){B(mats.stone,36+side*3.35,2,-55.8,.65,4,1.4);B(mats.darkwood,36+side*3.6,1.9,-59.6,.18,3.8,3.1,side*.12);}
 for(let x=33;x<=39;x+=.45)B(mats.iron,x,4.25,-58.1,.06,1.2,.07);
 for(let i=0;i<13;i++){const a=i/12*Math.PI;B(mats.stone,36+Math.cos(a)*3.4,3.8+Math.sin(a)*1.2,-55.55,.5,.45,.45,-a);}
 B(mats.road,36,.025,-55,6,.06,4);
 // Coffered ceilings and a higher clerestory over the audience chamber.
 for(const room of CASTLE_ROOMS){
  const tall=room.name==='Sala del tron',top=tall?8:5.6;
  B(mats.darkwood,room.x,top,room.z,room.w,.18,room.d);
  for(let z=room.z-room.d/2+.8;z<room.z+room.d/2;z+=1.4)B(mats.wood,room.x,top-.22,z,room.w,.3,.2);
  for(const x of [room.x-room.w/2+.25,room.x+room.w/2-.25])B(mats.wood,x,top-.25,room.z,.18,.4,room.d);
 }
 B(mats.stone,36,6.75,-86,30,2.5,.8);
 for(const x of [21,51])B(mats.stone,x,6.8,-81.5,.8,2.5,9);
 for(let x=24;x<=48;x+=6){B(mats.darkwood,x,6.75,-85.53,1.2,1.9,.14);B(mats.gold,x,7.2,-85.4,.07,1.35,.03);}
 // Heraldic hangings, a long runner and two distinct oak-and-gold thrones.
 B(mats.red,36,.081,-79,4.3,.025,12);for(const x of [33.95,38.05])B(mats.gold,x,.096,-79,.09,.018,12);
 for(const [i,t]of CASTLE.thrones.entries()){
  B(mats.darkwood,t.x,.3,t.z-.25,1.4,.5,1.3);B(mats.red,t.x,.56,t.z-.2,1.15,.16,1.1);
  B(mats.darkwood,t.x,1.75,t.z-.82,1.5,2.5,.16);B(mats.red,t.x,1.7,t.z-.70,1.13,1.9,.05);
  for(const side of [-1,1]){C(mats.gold,t.x+side*.66,1.05,t.z+.13,.065,1.1);S(mats.gold,t.x+side*.66,1.63,t.z+.13,.13);B(mats.darkwood,t.x+side*.65,1.05,t.z-.2,.2,.16,1.15);}
  for(let n=0;n<5;n++){const xx=t.x+(n-2)*.24;B(mats.gold,xx,3.0+(.3-Math.abs(n-2)*.10),t.z-.82,.11,.45,.12);}
  B(mats.red,t.x,3.6,-85.5,2.1,3.2,.05);for(const xx of [-.7,.7])B(mats.gold,t.x+xx,3.6,-85.46,.07,2.8,.03);S(mats.gold,t.x,3.7,-85.4,.32,.45,.04);
 }
 // Furnished rooms, with objects above furniture kept clear of doorways.
 for(const f of plan.furniture){const{x,z,w,d,h,kind}=f;
  if(['desk','banquet','kitchen-table','altar'].includes(kind)){
   B(kind==='altar'?mats.stone:mats.wood,x,h,z,w,.16,d);
   for(const a of [-1,1])for(const b of [-1,1])B(mats.darkwood,x+a*w*.4,h/2,z+b*d*.35,.14,h,.14);
   B(mats.linen,x,h+.1,z,w*.8,.025,d*.7);
   if(kind==='desk'){B(mats.linen,x,h+.13,z,.55,.03,.65);B(mats.iron,x+.8,h+.2,z,.14,.18,.14);}
   if(kind==='banquet')for(let n=0;n<7;n++){S(mats.gold,x+(n-3)*.65,h+.16,z,.21,.035,.19);C(mats.gold,x+(n-3)*.65,h+.3,z+.3,.06,.26);}
   if(kind==='kitchen-table')for(let n=0;n<6;n++)S(n%2?mats.gold:mats.leaf,x+(n-2.5)*.4,h+.22,z,.16,.12,.15);
   if(kind==='altar'){B(mats.gold,x,1.85,z,.09,1.15,.07);B(mats.gold,x,2.05,z,.62,.08,.07);}
  }else if(kind==='library'||kind==='shelves'||kind==='wardrobe'){
   B(mats.darkwood,x,h/2,z,w,h,d);
   if(kind!=='wardrobe')for(let y=.5;y<h;y+=.55){B(mats.wood,x+w*.6,y,z,.16,.08,d);for(let zz=z-d*.4;zz<z+d*.42;zz+=.24)B(kind==='library'?(Math.round(zz*10)%2?mats.red:mats.gold):mats.linen,x+w*.6,y+.2,zz,.2,.33,.15);}
  }else if(kind==='bed'){
   B(mats.darkwood,x,.3,z,w,.5,d);B(mats.linen,x,.63,z,w*.94,.28,d*.94);B(mats.red,x,.82,z+.35,w*.96,.1,d*.65);
   for(const dx of [-w/2,w/2])for(const dz of [-d/2,d/2]){C(mats.darkwood,x+dx,1.8,z+dz,.07,3.6);S(mats.gold,x+dx,3.65,z+dz,.12);}
   B(mats.red,x,3.4,z,w+.2,.12,d+.2);B(mats.linen,x,.85,z-d*.31,w*.7,.18,.4);
  }else if(kind==='hearth'){
   B(mats.stone,x,h/2,z,w,h,d);B(mats.black,x+w*.52,.9,z,.04,1.5,d*.7);
   for(let k=0;k<7;k++)S(mats.ember,x+w*.55,.36,z+(k-3)*.22,.09,.06,.12);
   C(mats.iron,x+w*.7,.7,z,.36,.5);
  }else if(kind==='weapons'){
   B(mats.wood,x,1.2,z,w,2.4,d);for(let zz=z-d*.4;zz<z+d*.45;zz+=.7){B(mats.iron,x+.35,1.4,zz,.06,1.8,.08);B(mats.gold,x+.35,.95,zz,.1,.08,.4);S(mats.iron,x+.32,1.7,zz+.27,.06,.45,.3);}
  }else{B(mats.darkwood,x,h/2,z,w,h,d);if(kind==='chair'||kind==='pew')B(mats.wood,x,h+.4,z-d*.4,w,.8,.1);else for(const dx of [-w*.35,w*.35])B(mats.iron,x+dx,h/2,z,.06,h,d+.03);}
 }
 // Wall lights and chandeliers: nearby lights share the world's light budget.
 for(const [x,z]of [[34,-79],[38,-79],[36,-68],[27,-73],[46,-73],[46,-67],[27,-67],[46,-61],[27,-61]]){
  B(mats.iron,x,2.5,z,.08,.8,.08);S(mats.ember,x,2.98,z,.07,.14,.07);const light=new T.PointLight('#ffd096',18,12,2);light.position.set(x,2.8,z);light.visible=false;scene.add(light);lights.push(light);
 }
 return plan;
}
