import {nodes,random} from './simulation.js';
export const NEWCOMER_DESIGNS=[{id:'summer-dancer',name:'Ballarina d’estiu · adulta',category:'adult-female',special:true},{id:'summer-athlete',name:'Acròbata d’estiu · adult',category:'adult-male',special:true},{id:'summer-blonde',name:'Ballarina rossa d’estiu · adulta',category:'adult-female',special:true}];
const identities=[['Laia de les Roses',28,1],['Mireia del Vent',31,1],['Bruna de la Riera',27,1],['Adrià de les Comes',30,0],['Nil de la Costa',29,0],['Dídac del Sol',33,0],['Alba de la Font',30,1],['Clara de les Vinyes',28,1],['Núria del Prat',32,1]];
export function addNewcomers(population){
 const startFamily=Math.max(...population.map(p=>p.familyId))+1;
 for(const [i,[name,age,sex]]of identities.entries()){
  const id=600+i,home=[16,30,9,33,18,37,11,23,39][i],node=nodes[home],rng=random(8400+id),familyId=startFamily+i;
  const character={name,age,sex,category:sex?'adult-female':'adult-male',featured:false,newcomer:true};
  const family={id:familyId,surname:name.split(' ').slice(1).join(' '),household:familyId+1,home,homeX:node.x,homeZ:node.z,memberIds:[id]};
  population.push({id,name,age,sex,character,spriteId:i>=6?'summer-blonde':sex?'summer-dancer':'summer-athlete',flirtatious:true,job:sex?'ballarina itinerant':'acròbata itinerant',jobId:11,workRole:11,home,work:home,node:home,path:[],x:node.x+(i%2?.6:-.6),z:node.z+.6,lane:(i%3-1)*.5,speed:.8+rng()*.2,phase:rng()*6.28,height:1,heading:rng()*6.28,walk:0,wait:rng()*15,state:'resting',rng,familyId,surname:family.surname,family,familyRole:'artista que viu pel seu compte',parentIds:[],childIds:[],partnerId:null});
 }
 return population;
}
