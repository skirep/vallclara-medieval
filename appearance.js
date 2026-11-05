import {RESIDENT_CHOICES,RESIDENT_ROSTER,categoryFor} from './resident-roster.js';
// Each household has one child and one adult of each sex; elders alternate sex.
// This cycles through every matching design before repeating, deterministically.
export function appearanceFor(p){
 const family=p.familyId??Math.floor(p.id/5);
 const choices=RESIDENT_CHOICES[categoryFor(p)];
 const named=p.spriteId?RESIDENT_ROSTER.findIndex(r=>r.id===(p.royalGuard?'captain-ermessenda':p.ninja?'tunic-man':p.spriteId)):-1;
 const row=named>=0?named:choices[(p.age>=60?Math.floor(family/2):family)%choices.length];
 return {row,width:.87+(p.id%13)*.021,signature:`${row}:${p.id}`};
}
export function spriteView(heading,observerAngle){
  const quarter=((Math.round((observerAngle-heading)/(Math.PI/2))%4)+4)%4;
  return [0,3,2,1][quarter];
}
