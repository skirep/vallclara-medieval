import * as T from 'three';
import {houseRoofPlan} from './house-geometry.js';
// These ornaments share the structural building coordinates. All pieces feed
// the world's material batches; they do not create a draw call per tile/stone.
export function addHouseDetails(plan,{B,C,S,add,mats}){
 const {x,z,w,d,h,variant=0}=plan,roof=houseRoofPlan(w,d,h),half=w/2+.65,pitch=Math.atan2(roof.rise+.18,half);
 const surface=variant%3===0?mats.roof2:mats.roof,stats={tiles:0,windows:0};
 // Curved overlapping clay tiles follow the actual pitch, from ridge to eave.
 const length=Math.hypot(half,roof.rise+.18),rows=Math.ceil(length/.82),cols=Math.ceil((d+1.2)/.46);
 for(const side of [-1,1]){
  const tile=new T.CylinderGeometry(1,1,1,6,1,true,side>0?Math.PI:0,Math.PI);
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const t=(row+.52)/rows,zz=z-(d+1.2)/2+(col+.5)*(d+1.2)/cols;
   add(tile,surface,x+side*half*t,h+roof.rise-(roof.rise+.18)*t+.14,zz,.235,length/rows+.11,.235,0,0,-side*(Math.PI/2+pitch));stats.tiles++;
  }tile.dispose();
 }
 // Deep fascia boards, dentils and rafter tails; gable sunburst carpentry.
 for(const side of [-1,1]){
  const face=z+side*(d/2+.24);
  for(const wing of [-1,1]){
   B(mats.darkwood,x+wing*w*.25,h+roof.rise*.49,face,.16,Math.hypot(w/2,roof.rise)+.12,.16,0,wing*Math.atan2(w/2,roof.rise));
   B(mats.wood,x+wing*(w/2+.35),h-.1,z,.14,.32,d+1.35);
  }
  B(mats.darkwood,x,h+roof.rise*.42,face,.17,roof.rise*.84,.18);
  for(const dx of [-w*.28,0,w*.28])B(mats.wood,x+dx,h+.25,face,.12,.60,.16);
  for(let zz=-d/2;zz<=d/2;zz+=.88)B(mats.darkwood,x+side*(w/2+.35),h-.21,z+zz,.6,.15,.13);
  // Fine timber framing avoids the ground-floor doors and window openings.
  for(const wing of [-1,1]){
   const bay=x+wing*w*.30;
   B(mats.darkwood,bay,h*.61,face,1.65,.13,.16);
   for(const offset of [-.76,.76])B(mats.darkwood,bay+offset,h*.77,face,.11,h*.27,.13);
   for(const diagonal of [-1,1])B(mats.wood,bay+diagonal*.3,h*.92,face,.10,.84,.11,0,diagonal*.62);
  }
  // Dressed door architraves, weathered threshold, iron straps and nail heads.
  B(mats.carved,x,2.84,face,2.65,.16,.40);
  for(const dx of [-1.12,1.12])for(let y=.3;y<2.6;y+=.43)B(mats.carved,x+dx,y,face,.29,.36,.40);
  B(mats.stone,x,.055,z+side*(d/2+.28),1.82,.035,.88);
  for(const win of [-w*.3,w*.3]){
   const wx=x+win,wy=h*.77,wz=face+side*.10;
   for(const dx of [-.48,.48])B(mats.carved,wx+dx,wy,wz,.13,1.16,.20);
   B(mats.carved,wx,wy+.55,wz,1.12,.14,.23);B(mats.carved,wx,wy-.53,wz,1.25,.16,.39);
   // Leaded panes have their own physical grid, set forward of the glazing.
   B(mats.iron,wx,wy,wz+side*.045,.032,.80,.035);
   for(const v of [-.24,0,.24])for(const turn of [-1,1])B(mats.iron,wx+v*.55,wy+v*.8,wz+side*.06,.022,.42,.025,0,turn*.63);
   // Window box and trailing ivy stay above pedestrian head height.
   if(variant%2===0){B(mats.darkwood,wx,wy-.72,wz+side*.13,1.1,.23,.35);for(let i=0;i<5;i++){const xx=wx+(i-2)*.19;S(mats.leaf,xx,wy-.53,wz+side*.17,.14,.12,.13);S(i%2?mats.red:mats.gold,xx,wy-.42,wz+side*.17,.05,.055,.05);}}
   stats.windows++;
  }
  // Upper-gable louvred vent and its carved surround.
  const vy=h+roof.rise*.4;
  B(mats.black,x,vy,face+side*.04,.65,.68,.035);
  for(let i=0;i<5;i++)B(mats.wood,x,vy-.25+i*.12,face+side*.08,.68,.045,.09);
 }
 // Side elevations gain timber bays and raised, bevelled-looking stone plinths.
 for(const side of [-1,1]){
  const xx=x+side*(w/2+.19);
  B(mats.carved,xx,.23,z,.20,.33,d+.18);B(mats.darkwood,xx,h*.60,z,.14,.16,d);
  for(let zz=-d/2+.8;zz<d/2;zz+=1.65){B(mats.darkwood,xx,h*.72,z+zz,.13,h*.51,.13);B(mats.wood,xx,h*.38,z+zz,.12,.85,.12,side*.55);}
  // Irregular lower masonry courses give the foundation real relief.
  for(let row=0;row<2;row++)for(let j=0;j<Math.floor(d/.8);j++)B((j+row)%3?mats.stone:mats.carved,xx,.22+row*.29,z-d/2+.45+j*.8+row*.08,.10,.24,.73);
 }
 // Chimney brick courses, lead flashing, double terracotta pots and hollow tops.
 const cx=x+w*.27,cz=z-d*.2,cy=h+roof.rise*.65;
 for(let y=-.5;y<1.18;y+=.28)for(const side of [-1,1])B(mats.carved,cx,cy+y,cz+side*.43,.80,.038,.055);
 for(const dx of [-.23,.23]){C(mats.red,cx+dx,cy+1.48,cz,.16,.45);C(mats.black,cx+dx,cy+1.715,cz,.115,.02);C(mats.carved,cx+dx,cy+1.67,cz,.19,.09);}
 // Floor board seams, chest panelling and iron lockplates enrich enterable rooms.
 for(let xx=-w/2+.32;xx<w/2;xx+=.40)B(mats.darkwood,x+xx,.065,z,.012,.005,d-.28);
 for(const f of plan.furniture)if(f.kind==='chest'){
  for(const side of [-1,1]){B(mats.darkwood,f.x,.28,f.z+side*(f.d/2+.015),f.w-.14,.36,.035);for(const xx of [-f.w*.28,f.w*.28])B(mats.iron,f.x+xx,.36,f.z+side*(f.d/2+.04),.045,.56,.035);}
  B(mats.iron,f.x,.4,f.z+f.d/2+.055,.16,.16,.045);B(mats.gold,f.x,.42,f.z+f.d/2+.082,.028,.055,.02);
 }
 return stats;
}
function archGeometry(rx,ry,thickness,depth){
 const shape=new T.Shape(),steps=18;shape.moveTo(rx,0);
 for(let i=1;i<=steps;i++){const a=i/steps*Math.PI;shape.lineTo(Math.cos(a)*rx,Math.sin(a)*ry);}
 for(let i=steps;i>=0;i--){const a=i/steps*Math.PI;shape.lineTo(Math.cos(a)*(rx-thickness),Math.sin(a)*(ry-thickness));}
 shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:false,curveSegments:steps});g.translate(0,0,-depth/2);return g;
}
export function addCastleDetails(plan,{B,C,S,add,mats,obstacles}){
 const stats={stones:0,arches:0,towers:4};plan.columns=[];
 // Individual staggered ashlar faces and small mortar setbacks catch sun/AO.
 const face=(axis,constant,start,end,normal,gate=false)=>{
  for(let row=0;row<10;row++)for(let u=start+.58+(row%2)*.57;u<end-.2;u+=1.16){const y=.32+row*.53;if(gate&&Math.abs(u-36)<4&&y<5.8)continue;
   const m=(row+Math.round(u*2))%4?mats.stone:mats.carved;
   axis==='x'?B(m,constant,y,u,.085,.45,1.07):B(m,u,y,constant,1.07,.45,.085);stats.stones++;
  }
  // Moulded water-table and wall-walk string courses, raised from the wall.
  for(const y of [.55,5.55]){
   if(gate){for(const side of [-1,1])B(mats.carved,36+side*9.6,y,constant,10.8,.17,.24);}
   else axis==='x'?B(mats.carved,constant,y,(start+end)/2,.24,.17,end-start):B(mats.carved,(start+end)/2,y,constant,end-start,.17,.24);
  }
 };
 face('x',20.55,-85.6,-58.4,-1);face('x',51.45,-85.6,-58.4,1);face('z',-86.45,21.4,50.6,-1);face('z',-57.55,21.4,50.6,1,true);
 // Deep arrow slits with stone jambs and splayed lintels on the flanks.
 for(const side of [-1,1])for(const z of [-81,-75,-69,-63]){
  const x=36+side*15.52;
  B(mats.black,x,3.75,z,.03,1.4,.28);
  for(const zz of [-.25,.25])B(mats.carved,x+side*.03,3.75,z+zz,.22,1.65,.20);
  for(const yy of [2.93,4.58])B(mats.carved,x+side*.04,yy,z,.25,.18,.72);
  B(mats.iron,x+side*.07,3.75,z,.05,1.27,.035);
 }
 // Layered gateway archivolts, separated voussoirs and sculpted keystone.
 for(const [rx,ry]of [[3.7,1.65],[3.95,1.89]]){const arch=archGeometry(rx,ry,.16,.22);add(arch,mats.carved,36,3.75,-55.31);arch.dispose();stats.arches++;}
 for(let i=0;i<=16;i++){const a=i/16*Math.PI;B(mats.stone,36+Math.cos(a)*3.84,3.75+Math.sin(a)*1.77,-55.14,.045,.23,.08,0,-a);}
 B(mats.carved,36,5.61,-55.16,.44,.64,.34);
 // Portcullis lattice and visible sockets stay entirely above the open passage.
 for(const y of [4.05,4.55,5.05])B(mats.iron,36,y,-58.03,6.2,.075,.08);
 for(const side of [-1,1]){B(mats.carved,36+side*3.2,2.4,-55.58,.23,4.8,.36);for(let y=.45;y<3.9;y+=.62)B(mats.iron,36+side*3.58,y,-58.13,.12,.12,.25);}
 // Heraldic shield above the gateway, on its own dressed stone relief.
 B(mats.carved,36,6.52,-57.30,2.55,1.55,.26);B(mats.red,36,6.55,-57.12,1.14,1.34,.09);
 B(mats.gold,36,6.55,-57.05,.075,1.15,.035);B(mats.gold,36,6.64,-57.04,.83,.075,.035);
 for(const side of [-1,1])B(mats.gold,36+side*.57,6.55,-57.04,.045,1.36,.035);
 // Tower drums gain distinct courses, corbels, coping and slate spires.
 const spire=new T.ConeGeometry(1,1,24,1),flag=new T.PlaneGeometry(1,1,12,8),fp=flag.attributes.position;
 for(let i=0;i<fp.count;i++){const xx=fp.getX(i),yy=fp.getY(i);fp.setZ(i,.07*Math.sin((xx+.5)*9+yy*3)*(xx+.5));}flag.computeVertexNormals();
 for(const [x,z]of [[21,-86],[51,-86],[23,-59.5],[49,-59.5]]){
  for(let row=0;row<13;row++)for(let j=0;j<14;j++){const a=(j+(row%2)*.5)/14*Math.PI*2;B((j+row)%5?mats.stone:mats.carved,x+Math.sin(a)*2.36,.45+row*.55,z+Math.cos(a)*2.36,.88,.43,.12,a);stats.stones++;}
  for(const y of [.8,4.05,7.48])C(mats.carved,x,y,z,2.47,.16);
  for(let j=0;j<14;j++){const a=j/14*Math.PI*2;B(mats.carved,x+Math.sin(a)*2.5,7.56,z+Math.cos(a)*2.5,.30,.46,.40,a);}
  C(mats.carved,x,8.05,z,2.76,.24);C(mats.darkwood,x,8.48,z,2.35,.12);
  add(spire,mats.slate,x,10.25,z,2.20,3.5,2.20);
  for(let j=0;j<6;j++){const y=8.65+j*.53,r=2.2*(1-(y-8.5)/3.5),ring=new T.TorusGeometry(r,.035,4,24);add(ring,mats.slate,x,y,z,1,1,1,Math.PI/2);ring.dispose();}
  C(mats.iron,x,12.35,z,.035,1.0);S(mats.gold,x,12.90,z,.095);
  // Solid cloth silhouettes with real folds and a royal stripe, below sky clearance.
  add(flag,mats.red,x+.65,12.25,z,1.25,.70,1,0,.12);B(mats.gold,x+.66,12.25,z+.075,1.17,.07,.028);
 }spire.dispose();flag.dispose();
 // Paired royal standards flank the portal without occupying the doorway.
 for(const side of [-1,1]){
  const x=36+side*6.9;B(mats.iron,x,4.65,-57.11,2,.065,.10);B(mats.red,x,3.5,-57.03,1.35,2.2,.065);
  for(const xx of [-.59,.59])B(mats.gold,x+xx,3.5,-56.98,.055,2.16,.025);
  B(mats.gold,x,3.7,-56.97,.07,.95,.025);B(mats.gold,x,3.89,-56.96,.62,.07,.025);
 }
 // Stone barrel ribs sit below existing ceilings, leaving doorways and aisles open.
 for(const room of plan.rooms){const royal=room.name==='Sala del tron',rx=room.w/2-.45,ry=royal?2.1:1.3,base=royal?5.45:4.05;
  const rib=archGeometry(rx,ry,.10,.16);
  for(const side of [-1,1]){add(rib,mats.carved,room.x,base,room.z+side*(room.d/2-.6));stats.arches++;
   for(const wing of [-1,1]){const xx=room.x+wing*rx,zz=room.z+side*(room.d/2-.6);const column={x:xx,z:zz,w:.48,d:.48};plan.columns.push(column);obstacles?.push(column);C(mats.carved,xx,2.08,zz,.13,4.1);C(mats.carved,xx,.18,zz,.23,.26);C(mats.carved,xx,4.05,zz,.24,.20);}
  }rib.dispose();
 }
 // Runner border, floor inlays and carved throne finials make the audience hall a landmark.
 for(let z=-84;z<-58;z+=1.2)for(const side of [-1,1])B(mats.carved,36+side*2.05,.082,z,.12,.012,.75);
 for(const throne of plan.thrones){for(let y=1;y<2.8;y+=.42)for(const side of [-1,1])S(mats.gold,throne.x+side*.61,y,throne.z-.61,.075);for(const side of [-1,1])C(mats.darkwood,throne.x+side*.60,1.8,throne.z-.74,.07,2.5);}
 return stats;
}
