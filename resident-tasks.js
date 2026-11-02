export const RESOURCE_LABELS={grain:'gra',water:'aigua',timber:'fusta',wool:'llana',bread:'pa',tools:'eines',cloth:'teixits',cleanLinen:'roba neta',repairs:'peces de reparació',safety:'rondes',pots:'recipients',morale:'actuacions',knowledge:'lliçons',care:'visites de suport',provisions:'lots de provisions'};
export const ROLE_LABELS=['Camp','Forn','Ferreria','Teler','Transport','Mercat','Fusteria','Safareig','Ramat','Guàrdia','Terrissa','Música','Aprenentatge','Parròquia'];
export const ROLE_COLORS=['#b9a25c','#dfad6b','#a8adb5','#a88fa8','#92714c','#bd9160','#b48d58','#80a9c0','#dfd6b8','#8f9d8e','#b57957','#bca16f','#93b69d','#9e94b3'];
const mod=(n,l)=>(n%l+l)%l;
// Each task has a visible work period and a real recipe. Service outputs count
// completed visits/lessons/rondas rather than pretending they are physical goods.
const roles=[
 [36,{}, {grain:4},[
  ['collita de gra','colliré gra per al rebost','vaig collir gra per al rebost'],
  ['tria de la collita','triaré la collita i separaré el gra aprofitable','vaig triar el gra aprofitable'],
  ['ensacat de gra','ensacaré gra per al forn','vaig ensacar gra per al forn']]],
 [40,{grain:2,water:1},{bread:4},[
  ['massa de pa','pastaré i couré pa per a les cases','vaig preparar pa per a les cases'],
  ['fornada comunal','faré una fornada per al rebost','vaig acabar una fornada comunal'],
  ['pa dels torns','couré pa per als torns de feina','vaig preparar pa per als torns de feina']]],
 [42,{timber:1},{tools:2},[
  ['eines reparades','repararé eines amb mànecs nous','vaig reparar eines dels veïns'],
  ['falçs revisades','adobaré falçs per a la collita','vaig adobar falçs per a la collita'],
  ['ferratges del taller','prepararé ferratges per als tallers','vaig preparar ferratges per als tallers']]],
 [38,{wool:1},{cloth:2},[
  ['peça de teixit','teixiré una peça per al mercat','vaig teixir una peça per al mercat'],
  ['tela per a les cases','prepararé tela per a les cases','vaig preparar tela per a les cases'],
  ['cintes compartides','teixiré cintes per als torns comuns','vaig teixir cintes per als torns comuns']]],
 [28,{}, {timber:5,water:4},[
  ['provisions transportades','portaré fusta i aigua al rebost','vaig transportar fusta i aigua'],
  ['càrrega del camí','recolliré provisions al punt de càrrega','vaig recollir provisions al punt de càrrega'],
  ['subministrament dels tallers','duré subministraments als tallers','vaig dur subministraments als tallers']]],
 [26,{bread:1},{provisions:2},[
  ['cistells del mercat','prepararé cistells de provisions','vaig preparar cistells de provisions'],
  ['repartiment de pa','repartiré pa entre les cases','vaig repartir pa entre les cases'],
  ['lots dels torns','organitzaré lots per als torns comuns','vaig preparar lots per als torns comuns']]],
 [44,{timber:2},{repairs:2},[
  ['peces de fusta','prepararé peces de reparació','vaig preparar peces de reparació'],
  ['taulons adobats','adobaré taulons per als torns comuns','vaig adobar taulons per als torns comuns'],
  ['banc reparat','repararé peces d’un banc de la vila','vaig reparar peces d’un banc de la vila']]],
 [32,{water:1},{cleanLinen:3},[
  ['bugada familiar','rentaré i estendré roba de les cases','vaig rentar roba de les cases'],
  ['roba dels torns','prepararé roba neta per als torns','vaig preparar roba neta per als torns'],
  ['farcells de roba','rentaré i plegaré farcells de roba','vaig rentar i plegar farcells de roba']]],
 [38,{}, {wool:3},[
  ['llana del ramat','recolliré i triaré llana del ramat','vaig recollir llana del ramat'],
  ['llana netejada','triaré la llana per als telers','vaig triar llana per als telers'],
  ['llana ensacada','ensacaré llana per a les cases','vaig ensacar llana per a les cases']]],
 [28,{}, {safety:1},[
  ['ronda de les portes','faré ronda per les portes de la vila','vaig completar una ronda per les portes'],
  ['ronda dels carrers','revisaré els camins entre els barris','vaig revisar els camins entre els barris'],
  ['ronda del pas','faré una ronda fins al camí del pont','vaig completar una ronda al camí del pont']]],
 [40,{water:1},{pots:2},[
  ['recipients de fang','modelaré recipients per al rebost','vaig modelar recipients per al rebost'],
  ['coves de terrissa','prepararé peces de terrissa per al mercat','vaig preparar peces de terrissa'],
  ['mesures de terrissa','modelaré mesures per als aprenents','vaig modelar mesures per als aprenents']]],
 [30,{}, {morale:1},[
  ['tonada de plaça','tocaré una tonada a la plaça','vaig tocar una tonada a la plaça'],
  ['assaig compartit','assajaré una cançó amb els veïns','vaig acabar un assaig compartit'],
  ['música dels torns','prepararé una peça per als torns comuns','vaig preparar música per als torns comuns']]],
 [24,{}, {knowledge:1},[
  ['lectura acompanyada','llegiré al porxo amb qui ensenya','vaig practicar la lectura al porxo'],
  ['nusos sense eines','practicaré nusos amb la família','vaig practicar nusos amb la família'],
  ['mesures del cove','aprendré a comparar mesures amb un cove','vaig aprendre a comparar mesures'],
  ['joc de les llavors','classificaré llavors amb la gent de casa','vaig classificar llavors amb la família'],
  ['cançó de la vila','aprendré una cançó amb la gent de casa','vaig aprendre una cançó de la vila']]],
 [30,{}, {care:1},[
  ['peticions de les cases','coordinaré les peticions de la vila','vaig recollir peticions dels veïns'],
  ['visita de suport','visitaré els veïns que necessiten ajuda','vaig completar una visita de suport'],
  ['preparació de la reunió','prepararé la reunió de demà','vaig preparar la reunió de la vila']]]
];
export const roleFor=p=>p.role==='priest'?13:p.age<16?12:mod(p.jobId||0,12);
export function taskFor(p,day=0){
 const role=roleFor(p),[duration,inputs,outputs,variants]=roles[role],variant=mod(p.id+Math.floor(p.id/5)+day,variants.length),[label,future,past]=variants[variant];
 return {id:`${role}:${variant}`,role,variant,label,future,past,inputs,outputs,duration:duration+(p.id%7)*1.5+(p.age>=68?12:0)};
}
export const phaseLabel=d=>({resting:'Descans a casa',home:'Tornada a casa',travel:'Camí del lloc de feina',working:'Feina en curs',delivery:'Lliurament del resultat',blocked:`Esperant ${d?.blocker||'material'}`}[d?.phase]||'Preparant el dia');
