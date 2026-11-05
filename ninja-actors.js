import {random,nodes} from './simulation.js';
export const NINJA_COUNT=20;
export const NINJA_DESIGNS=[['Aki de la Lluna',32,false,18,0],['Ren dels Joncs',28,true,36,18],['Sora del Vespre',29,true,54,0],['Haku de la Boira',35,true,36,-36],['Raiga, Lluna Trencada',42,true,36,-54],['Yori dels Pins',26,true,-54,18],['Mei del Vent',30,true,-36,36],['Kenzo de les Cendres',37,true,-54,-36],['Nao del Riu',25,true,18,36],['Riku de la Nit',33,true,54,36],['Yuna de la Pluja',29,true,-36,-54],['Daichi del Ferro',39,true,54,-54],['Rei de la Bruma',27,true,-18,54],['Kaori del Corb',31,true,36,54],['Isamu del Silenci',36,true,-54,54],['Hana de les Ombres',28,true,18,-36],['Taro de la Fulla',34,true,54,18],['Mika del Llamp',30,true,-36,0],['Shin de la Roca',40,true,18,-54],['Aya del Crepuscle',32,true,54,-36]];
export function addNinjas(population){
 for(const [i,[name,age,hostile,x,z]]of NINJA_DESIGNS.entries()){
  const id=800+i,family={id,surname:'de la Lluna Trencada',household:id+1,home:5,homeX:x,homeZ:z,memberIds:[id]},job=i===0?'infiltrada de la confraria':i===4?'cap de la Lluna Trencada':'ninja de la Lluna Trencada';
  population.push({id,name,character:{name,ninja:true},spriteId:'ninja-shadow',ninja:{index:i,hostile,captain:i===4,captured:false,alerted:false,home:{x,z}},job,jobId:9,workRole:9,home:5,work:5,node:nodes.reduce((a,b)=>Math.hypot(a.x-x,a.z-z)<Math.hypot(b.x-x,b.z-z)?a:b).index,path:[],x,z,lane:0,speed:1.1,phase:i*.8,height:1,sex:[0,2,6,10,13,15,17,19].includes(i)?1:0,age,state:'resting',wait:0,heading:Math.PI,walk:0,rng:random(id),familyId:id,surname:family.surname,family,familyRole:i===0?'infiltrada':'membre de la confraria',parentIds:[],childIds:[],partnerId:null});
 }return population;
}
