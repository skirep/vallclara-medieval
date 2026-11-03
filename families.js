const surnames=['Rovira','Vidal','Ferrer','Serra','Bosch','Soler','Puig','Fuster','Oliver','Riera','Font','Pujol','Vila','Mas','Garriga','Roig','Costa','Torres','Prat','Vall','Casals','Clot','Sastre','Teixidor','Carbonell','Amat','Guasch','Roure','Pons','Alzina','Mir','Sala'];
export const familyTime=hour=>hour<8.25||hour>=12.5&&hour<13.5||hour>=18;
export function groupFamilies(population,nodes){
  const families=[];
  for(let start=0;start<population.length;start+=5){
    const id=families.length,members=population.slice(start,start+5);
    const surname=surnames[id%surnames.length]+' '+surnames[(Math.floor(id/surnames.length)+11)%surnames.length];
    const home=(id*13+4)%nodes.length,parentIds=members.slice(2,4).map(p=>p.id),childIds=members.slice(0,2).map(p=>p.id);
    const cluster=Math.floor(id/nodes.length),homeOffsetX=(cluster-1)*.45;
    const family={id,surname,household:id+1,home,homeX:nodes[home].x+homeOffsetX,homeZ:nodes[home].z,memberIds:members.map(p=>p.id)};families.push(family);
    for(let slot=0;slot<members.length;slot++){
      const p=members[slot];p.familyId=id;p.surname=surname;p.family=family;
      p.familyRole=slot<2?(p.sex?'filla':'fill'):slot<4?(p.sex?'mare':'pare'):(p.sex?'àvia':'avi');
      p.age=slot<2?7+(id*7+slot*3)%9:slot<4?36+(id*3+p.sex*5)%12:68+id%7;
      p.parentIds=slot<2?[...parentIds]:slot<4?members.slice(4).filter(m=>m.sex===p.sex).map(m=>m.id):[];
      p.childIds=slot<2?[]:slot<4?[...childIds]:members.slice(2,4).filter(m=>m.sex===p.sex).map(m=>m.id);
      p.partnerId=slot===2?(members[3]?.id??null):slot===3?members[2].id:null;
      p.home=home;p.homeOffsetX=homeOffsetX;p.node=home;p.path=[];p.lane=(slot-2)*.65;
      p.x=family.homeX+p.lane;p.z=nodes[home].z+(slot%2?1:-1)*.65;
      if(slot<2){p.height=.53+(p.age-7)*.025;p.job=p.sex?'nena · aprenenta':'nen · aprenent';}
      if(slot===4)p.speed*=.82;
      if(members.length<3){p.age=34+slot*7;p.familyRole=p.sex?'germana':'germà';p.parentIds=[];p.childIds=[];p.job=p.sex?'artesana':'artesà';p.height=.95;}
    }
  }
  return families;
}
export function familiesOf(population){return [...new Map(population.filter(p=>p.family).map(p=>[p.familyId,p.family])).values()];}
export function relationLabel(person,other){
  if(person.partnerId===other.id)return other.sex?'parella · mare':'parella · pare';
  if(person.parentIds.includes(other.id))return other.sex?'mare':'pare';
  if(person.childIds.includes(other.id))return other.sex?'filla':'fill';
  if(person.age<16&&other.age>=60)return other.sex?'àvia':'avi';
  if(other.age<16&&person.age>=60)return other.sex?'neta':'net';
  if(other.age>=60&&person.age>=16)return other.sex?'sogra':'sogre';
  if(person.age>=60&&other.age>=16)return other.sex?'nora':'gendre';
  return other.age<16?(other.sex?'germana':'germà'):other.familyRole;
}
