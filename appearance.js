// Stable visual identity, independent of social state and render quality.
export function appearanceFor(p){
  const row=(p.age<16?2:0)+(p.sex?1:0);
  const hue=((p.id*137.507764)%360)/360;
  return {row,hue,saturation:.28+(p.id%5)*.075,lightness:.32+(Math.floor(p.id/5)%5)*.045,
    width:.91+(p.id%11)*.018,hair:.12+(p.id%7)*.065,skin:.78+(p.id%9)*.027,
    signature:`${row}:${p.id}`};
}
// The atlas columns are front, left, back, right. Heading zero faces +Z.
export function spriteView(heading,observerAngle){
  const quarter=((Math.round((observerAngle-heading)/(Math.PI/2))%4)+4)%4;
  return [0,3,2,1][quarter];
}
