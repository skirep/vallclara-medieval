// Wall/furniture colliders are independent of rendering; doors share this plan.
export const DOOR_WIDTH=1.9;
export function housePlan(x,z,w,d,h,variant=0){
 const walls=[{x:x-w/2,z,w:.32,d},{x:x+w/2,z,w:.32,d}];
 for(const side of [-1,1])for(const wing of [-1,1])walls.push({x:x+wing*(w+DOOR_WIDTH)/4,z:z+side*d/2,w:(w-DOOR_WIDTH)/2,d:.32});
 const furniture=[
  {kind:'table',x:x-w*.27,z:z+d*.17,w:1.55,d:1.1,h:.82},
  {kind:variant===9?'bench':'bed',x:x+w*.27,z:z-d*.23,w:1.3,d:2.15,h:.5},
  {kind:'chest',x:x-w*.28,z:z-d*.32,w:1.3,d:.65,h:.62},
  {kind:'hearth',x:x+w*.3,z:z+d*.3,w:1.15,d:1.1,h:.65}
 ];
 return {x,z,w,d,h,variant,walls,furniture,doorWidth:DOOR_WIDTH,entrances:[{x,z:z-d/2},{x,z:z+d/2}]};
}
export function wallPanels(width,height){
 const windows=[-width*.30,width*.30].map(x=>({left:x-.5,right:x+.5,bottom:1.25,top:2.35}));
 const openings=[{left:-DOOR_WIDTH/2,right:DOOR_WIDTH/2,bottom:0,top:2.55},...windows];
 const xs=[-width/2,width/2,...openings.flatMap(o=>[o.left,o.right])].sort((a,b)=>a-b);
 const ys=[0,1.25,2.35,2.55,height];const panels=[];
 for(let i=1;i<xs.length;i++)for(let j=1;j<ys.length;j++){
  const x=(xs[i]+xs[i-1])/2,y=(ys[j]+ys[j-1])/2;
  if(xs[i]-xs[i-1]<.001||ys[j]-ys[j-1]<.001||openings.some(o=>x>o.left&&x<o.right&&y>o.bottom&&y<o.top))continue;
  panels.push({x,y,w:xs[i]-xs[i-1],h:ys[j]-ys[j-1]});
 }
 return panels;
}
