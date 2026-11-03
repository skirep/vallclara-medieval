export const VILLAGE_BOUNDARY=90;
export const RIVER={x:9,halfWidth:3.4,length:220,waterY:-.7};
export const BRIDGE={start:2,end:16,halfWidth:3.1};
export const riverCenter=z=>RIVER.x+Math.sin(z*.028)*.65;
export function bridgeHeight(x){const t=Math.max(0,Math.min(1,(x-BRIDGE.start)/(BRIDGE.end-BRIDGE.start)));return .06+.44*Math.sin(t*Math.PI)**2;}
export function waterBlocked(x,z,radius=.4){return Math.abs(x-riverCenter(z))<RIVER.halfWidth+radius&&Math.abs(z)>BRIDGE.halfWidth-radius;}
export function landscapeHeight(x,z){
 const distance=Math.abs(x-riverCenter(z));
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const fade=smooth(95,240,Math.max(Math.abs(x),Math.abs(z)));
 const hills=-.1+fade*(Math.sin(x*.018)*Math.cos(z*.022)*12+Math.sin(z*.008)*21);
 const channel=-1.9;
 return channel+(hills-channel)*smooth(2.7,5.4,distance);
}
export function groundHeight(x,z,buildings=[]){
 if(x>=BRIDGE.start&&x<=BRIDGE.end&&Math.abs(z)<BRIDGE.halfWidth)return bridgeHeight(x);
 if(x>0&&x<BRIDGE.start&&Math.abs(z)<3)return .06*x/BRIDGE.start;
 if(x>BRIDGE.end&&x<18&&Math.abs(z)<3)return .06*(18-x)/2;
 if(buildings.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2))return .06;
 return landscapeHeight(x,z)+.1;
}
