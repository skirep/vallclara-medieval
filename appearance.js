// Eight age/sex archetypes share family traits without cloning each resident.
export function appearanceFor(p){
  const category=(p.age<16?2:0)+(p.sex?1:0);
  const family=p.familyId??Math.floor(p.id/5);
  const atlas=p.age>=60||p.age<16&&family%2===1?1:0;
  const hue=((family*137.507764+(p.id%5)*13)%360)/360;
  return {row:category+atlas*4,hue,saturation:.28+(p.id%5)*.075,lightness:.32+(Math.floor(p.id/5)%5)*.045,
    width:.87+(p.id%13)*.021,hair:p.age>=60?.68:.10+(family%7)*.065,skin:.78+(family%9)*.027,
    signature:`${category+atlas*4}:${p.id}`};
}
export function spriteView(heading,observerAngle){
  const quarter=((Math.round((observerAngle-heading)/(Math.PI/2))%4)+4)%4;
  return [0,3,2,1][quarter];
}
