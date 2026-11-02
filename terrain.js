export const RIVER={x:126,halfWidth:10,length:340,waterY:-.55};
export const BRIDGE={start:108,end:144,halfWidth:3.2};
export const riverCenter=z=>RIVER.x+Math.sin(z*.018)*2.5;
export function bridgeHeight(x){const t=Math.max(0,Math.min(1,(x-BRIDGE.start)/(BRIDGE.end-BRIDGE.start)));return .08+.78*Math.sin(t*Math.PI)**2;}
export function waterBlocked(x,z,radius=.4){return Math.abs(x-riverCenter(z))<RIVER.halfWidth+radius&&Math.abs(z)>BRIDGE.halfWidth-radius;}
export function landscapeHeight(x,z){
 const distance=Math.abs(x-riverCenter(z));
 const smooth=(a,b,v)=>{const t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t);};
 const fade=smooth(105,280,Math.max(Math.abs(x),Math.abs(z)));
 const hills=-.1+fade*(Math.sin(x*.018)*Math.cos(z*.022)*12+Math.sin(z*.008)*21);
 const channel=-.1-1.8*(1-smooth(6,12,distance));
 return channel+(hills-channel)*smooth(14,22,distance);
}
export function groundHeight(x,z,buildings=[]){
 if(x>=BRIDGE.start&&x<=BRIDGE.end&&Math.abs(z)<BRIDGE.halfWidth)return bridgeHeight(x);
 if(x>100&&x<BRIDGE.start&&Math.abs(z)<3)return .08*(x-100)/(BRIDGE.start-100);
 if(x>BRIDGE.end&&x<152&&Math.abs(z)<3)return .08*(152-x)/8;
 if(buildings.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2))return .06;
 return landscapeHeight(x,z)+.1;
}
