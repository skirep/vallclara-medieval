// Sixteen painted archetypes retain their natural skin, hair and textile colors.
export function appearanceFor(p){
 const family=p.familyId??Math.floor(p.id/5);
 const choices=p.age<16?(p.sex?[3,7,11,15]:[2,6,10,14]):p.age>=60?(p.sex?[5,13]:[4,8]):p.sex?[1,9]:[0,8,4];
 const row=p.role==='priest'?12:choices[(((Math.imul(p.id+17,2654435761)>>>0)>>>16)+family*13)%choices.length];
 return {row,width:.87+(p.id%13)*.021,signature:`${row}:${p.id}`};
}
export function spriteView(heading,observerAngle){
  const quarter=((Math.round((observerAngle-heading)/(Math.PI/2))%4)+4)%4;
  return [0,3,2,1][quarter];
}
