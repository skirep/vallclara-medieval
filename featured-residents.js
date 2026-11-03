// Unique named designs, never distributed randomly among ordinary households.
export const FEATURED_RESIDENTS=[
 ['king-berenguer','Rei Berenguer de Rocafort',54,0,'Rocafort','rei',13],
 ['queen-almodis','Reina Almodis de Rocafort',49,1,'Rocafort','reina',13],
 ['prince-arnau','Príncep Arnau de Rocafort',23,0,'Rocafort','príncep',9],
 ['princess-elionor','Princesa Elionor de Rocafort',19,1,'Rocafort','princesa',12],
 ['captain-ermessenda','Ermessenda de Queralt',38,1,'Queralt','capitana',9],
 ['squire-guillem','Guillem de Queralt',16,0,'Queralt','escuder',9],
 ['messenger-joana','Joana de Camins',27,1,'Camins','missatgera',4],
 ['falconer-bernat','Bernat d’Avellà',46,0,'Avellà','falconer',8],
 ['notary-pere','Pere de Bellpuig',61,0,'Bellpuig','notari',12],
 ['bailiff-caterina','Caterina de Bellpuig',43,1,'Bellpuig','batllessa',13],
 ['collector-dalmau','Dalmau Ferrer',47,0,'Ferrer · recaptació','recaptador',5],
 ['sister-agnes','Germana Agnès',57,1,'Hospital','religiosa hospitalera',13],
 ['midwife-margarida','Margarida de la Font',52,1,'Font · llevadoria','llevadora',13],
 ['apothecary-blanca','Blanca de la Font',29,1,'Font · llevadoria','apotecària',13],
 ['farrier-roc','Roc de Ferrera',41,0,'Ferrera','ferrador',2],
 ['stablehand-biel','Biel de Ferrera',14,0,'Ferrera','mosso de quadra',8],
 ['charcoal-esteve','Esteve de les Comes',50,0,'Comes','carboner',4],
 ['woodcutter-sibilla','Sibil·la de les Comes',31,1,'Comes','bosquerola',6],
 ['shepherd-sanca','Sança de Prat',34,1,'Prat · ramat','pastora',8],
 ['cheesemaker-ot','Ot de Prat',36,0,'Prat · ramat','formatger',5],
 ['beekeeper-dolca','Dolça de Mel',63,1,'Mel','apicultora',5],
 ['candlemaker-miquel','Miquel de Mel',26,0,'Mel','candeler',6],
 ['minstrel-beatriu','Beatriu de Vent',28,1,'Vent','joglaressa',11],
 ['pilgrim-mateu','Mateu del Camí',68,0,'Camí · pelegrinatge','pelegrí',13]
].map(([id,name,age,sex,household,job,workRole])=>({id,name,age,sex,household,job,workRole,category:age<16?(sex?'girl':'boy'):`${age>=60?'elder':'adult'}-${sex?'female':'male'}`,featured:true}));

// Existing 500 identities and saves retain their IDs. New residents start at 500.
export function addFeaturedResidents(population,nodes,random){
 const start=population.reduce((max,p)=>Math.max(max,p.id+1),0),homes=new Map();
 const familyStart=population.reduce((max,p)=>Math.max(max,p.familyId+1),0);
 for(const [i,c] of FEATURED_RESIDENTS.entries()){
  let family=homes.get(c.household);
  if(!family){const id=familyStart+homes.size,home=(homes.size*3+4)%nodes.length;family={id,surname:c.household,household:id+1,home,homeX:nodes[home].x,homeZ:nodes[home].z,memberIds:[]};homes.set(c.household,family);}
  const id=start+i,rng=random(721300+id),slot=family.memberIds.length,home=family.home;
  family.memberIds.push(id);
  population.push({id,name:c.name,character:c,spriteId:c.id,job:c.job,jobId:c.workRole,workRole:c.workRole,home,work:home,node:home,path:[],x:family.homeX+(slot-1.5)*.7,z:family.homeZ+1.3,lane:(slot-1.5)*.4,speed:.7+rng()*.35,phase:rng()*Math.PI*2,height:1,sex:c.sex,age:c.age,state:'resting',wait:rng()*15,heading:rng()*Math.PI*2,walk:0,rng,familyId:family.id,surname:family.surname,family,familyRole:'membre de la casa',parentIds:[],childIds:[],partnerId:null});
 }
 const p=population.slice(-FEATURED_RESIDENTS.length),parent=(a,b)=>{p[a].childIds.push(p[b].id);p[b].parentIds.push(p[a].id);},partners=(a,b)=>{p[a].partnerId=p[b].id;p[b].partnerId=p[a].id;};
 partners(0,1);for(const child of [2,3]){parent(0,child);parent(1,child);}
 parent(8,9);parent(12,13);parent(14,15);parent(16,17);partners(18,19);
 for(const i of [0,14,16])p[i].familyRole='pare';for(const i of [1,12])p[i].familyRole='mare';
 for(const i of [2,15])p[i].familyRole='fill';for(const i of [3,9,13,17])p[i].familyRole='filla';
 p[4].familyRole='tia';p[5].familyRole='nebot';p[20].familyRole='àvia';p[21].familyRole='net';
 return population;
}
