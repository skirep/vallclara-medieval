import * as T from 'three';
// Solid roof slabs cover the wall crown and overlap at the ridge. Gables fit the
// wall footprint; the roof alone overhangs, so no floating triangular wings.
export function houseRoofPlan(w,d,h){
 const rise=w*.4,half=w/2+.65,drop=.18,pitch=Math.atan2(rise+drop,half);
 return {rise,ridge:h+rise,eave:h-drop,slabs:[-1,1].map(side=>({x:side*half/2,y:h+(rise-drop)/2,z:0,w:Math.hypot(half,rise+drop),h:.18,d:d+1.2,rz:-side*pitch})),
  gables:[-1,1].map(side=>({z:side*d/2,points:[[-w/2,h-.03],[w/2,h-.03],[0,h+rise-.04]]}))};
}
export function gableGeometry(w,d,rise){
 const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
 const geometry=new T.ExtrudeGeometry(shape,{depth:.20,bevelEnabled:false,steps:1});geometry.translate(0,0,-.10);return geometry;
}
