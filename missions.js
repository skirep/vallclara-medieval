// Story state is independent of Three.js and advances only through nearby actions.
const step=(title,x,z,text,extra={})=>({title,x,z,text,...extra});
export const MISSIONS=[
 {id:'crown',title:'La corona de cendra',icon:'♜',intro:'El rei Berenguer ha requisat el gra de l’hivern i empresonat els qui protestaven. La ferrera prepara una rebel·lió. Pots ajudar-la a conquerir Rocafort i matar el rei, però el poble haurà de conviure amb aquesta decisió.',reward:'El castell passa al consell de la vila.',steps:[
 step('Escolta la rebel·lió',-18,18,'Ferrera: «No volem una altra corona. Volem tornar a decidir què fem amb el nostre pa. Porta el manifest als revoltats del pont.»',{item:'Manifest del consell'}),
 step('Reuneix els revoltats al pont',0,0,'Els revoltats llegeixen el manifest i prometen protegir els civils. Et lliuren una espasa i un escut abans de marxar cap a Rocafort.',{item:'Espasa de la rebel·lió'}),
 step('Trenca la defensa del portal',36,-54,'Capità: «Encara pots girar cua. Si travesses aquest portal, la corona et considerarà rebel.»',{combat:'guard',enemy:'Guàrdia del portal',hp:3}),
 step('Guanya la sala del tron',36,-76,'La segona línia de soldats tanca el pas al tron. Els revoltats mantenen el portal mentre tu avances.',{combat:'guard',enemy:'Defensors del tron',hp:4}),
 step('Enfronta’t al rei Berenguer',34.5,-80,'Berenguer: «La vila és meva!» El rei desembeina l’espasa. Aquesta lluita acabarà amb la seva mort si guanyes.',{actor:'king',combat:'king',enemy:'Rei Berenguer',hp:6})],ending:'Berenguer cau mort al peu del tron. La reina sobreviu i exigeix que es respectin els presoners. Les campanes anuncien un consell obert: Rocafort ja no pertany a un rei.'},
 {id:'child',title:'La llum de l’altra riba',icon:'🏮',intro:'Una família busca el seu infant, que ha sortit darrere unes llums vora el riu. El pont és l’únic pas segur entre les dues ribes.',reward:'L’infant torna a casa amb la família.',steps:[
 step('Recull el fanal de la família',-18,0,'La mare: «Duia una cinta blava. No cridis des de l’aigua: acosta-t’hi amb aquest fanal perquè et reconegui.»',{item:'Fanal encès'}),
 step('Busca l’infant i parla-hi',18,0,'Infant: «Volia veure les cuques de llum… i ara no sé tornar. Em portaràs fins a l’església?»',{actor:'child',escort:true}),
 step('Acompanya l’infant a Santa Maria',-27,-22,'La família corre a abraçar l’infant. El fanal queda encès a la porta, perquè ningú més torni a perdre el camí.',{requireEscort:true})],ending:'Aquell vespre, els veïns pengen fanals al pont. La llum ja no és un misteri, sinó una manera de cuidar-se.'},
 {id:'water',title:'El pou que callava',icon:'💧',intro:'L’aigua fa una olor estranya i el pa surt amarg. Algú vol culpar la remeiera; ella et demana proves abans que el rumor es converteixi en condemna.',reward:'El pou es neteja i la remeiera recupera el bon nom.',steps:[
 step('Escolta la remeiera',-36,0,'Remeiera: «L’herba amarga no és verí. Recull una mostra al pou i busca d’on baixa la brutícia.»',{item:'Flascó buit'}),
 step('Recull aigua al pou de la plaça',-13,0,'El flascó conté una pel·lícula oliosa. A la pedra hi ha restes de serradures fosques.',{item:'Mostra d’aigua'}),
 step('Investiga els barrils de la riba est',18,18,'Sota uns barrils esquerdats trobes oli de les eines. Un aprenent admet que els va abocar al desguàs per amagar una errada.',{item:'Prova dels barrils'}),
 step('Presenta les proves a Santa Maria',-27,-22,'Mossèn: «Primer reparem el dany; després parlarem de la culpa.» Els veïns organitzen la neteja i l’aprenent s’hi queda a treballar.')],ending:'La remeiera no era culpable. El poble segella el desguàs i acorda investigar abans d’assenyalar ningú.'},
 {id:'letters',title:'Dues cartes i un mentider',icon:'✉',intro:'Dues famílies es barallen per unes cartes d’amor. Les signatures coincideixen, però les paraules semblen escrites per algú que vol provocar un duel.',reward:'La plaça celebra un ball sense una baralla.',steps:[
 step('Recull la carta a la plaça',-18,18,'Una jove et dona una carta: «Jo no he promès casar-me amb ningú. Algú ha escrit en nom meu.»',{item:'Carta falsificada'}),
 step('Compara la tinta al pont',0,0,'L’altra carta té el mateix segell tort i la mateixa taca de tinta. No són dues promeses: són dues falsificacions.',{item:'Segona carta'}),
 step('Troba la confessió a la cancelleria',28,-73.5,'Un escrivent confessa que venia cartes inventades per pagar deutes. Et suplica que no exposis les persones enganyades.',{item:'Confessió de l’escrivent'}),
 step('Decideix com aturar el duel',-13,0,'Les famílies esperen una explicació. Pots revelar el frau en públic o reunir-les en privat.',{choices:[{label:'Explicar el frau en públic',value:'public',text:'El frau queda denunciat davant la plaça. Les famílies aturen el duel; l’escrivent haurà de reparar el mal.'},{label:'Parlar-ne en privat',value:'private',text:'Les famílies coneixen la veritat sense exposar les cartes. L’escrivent demana perdó i retorna els diners.'}]})],ending:'Les persones que havien rebut les cartes decideixen amb qui volen ballar. Ningú ha de guanyar un duel per poder triar.'},
 {id:'dragon',title:'El pacte de l’ou maragda',icon:'🐉',intro:'El drac busca alguna cosa entre les teulades. La pastora ha trobat una closca maragda dins d’un sac que venia del castell.',reward:'El drac deixa de cremar el poble en aquesta partida.',steps:[
 step('Escolta la pastora',-54,-36,'Pastora: «No ataca per gana. Crida com una mare que ha perdut la cria. Mira què he trobat dins del sac.»',{item:'Closca maragda'}),
 step('Recupera l’ou al rebost reial',28,-67.5,'Entre les provisions reials hi ha un ou calent embolicat amb una manta. Una nota ordenava vendre’l lluny de Vallclara.',{item:'Ou del drac'}),
 step('Porta l’ou al clar de la riba est',54,-36,'El drac s’acosta i olora la manta. Mantens l’ou a terra i fas un pas enrere.',{choices:[{label:'Tornar l’ou i oferir un pacte',value:'pact',text:'El drac recull l’ou amb cura. Abaixa el cap i s’allunya del poble: ja no hi haurà flames contra els veïns.'},{label:'Deixar l’ou i retirar-te en silenci',value:'quiet',text:'El drac recupera la cria i marxa. Els veïns acorden no tornar a prendre ous del seu niu.'}]})],ending:'El cel continua tenint ales, però les campanes ja no han d’anunciar por. La vila aprèn que abans de lluitar cal entendre què defensa l’altre.'}
];
export function createMissions({population=[],sharedProgress=null,owner='player',onChange=()=>{},onComplete=()=>{},onEnemyHit=()=>{},onActorHit=()=>{}}={}){
 const progress=sharedProgress??Object.fromEntries(MISSIONS.map(m=>[m.id,{stage:0,accepted:false,choice:null,owner:null}]));
 let selected=null,combat=null,notice='';
 const king=population.find(p=>p.spriteId==='king-berenguer'),child=population.find(p=>p.age<16&&!p.royalGuard);
 const mission=()=>MISSIONS.find(m=>m.id===selected),record=()=>progress[selected];
 const owns=r=>r?.owner===owner,escort=()=>progress.child.stage===2&&owns(progress.child)?child:null;
 const validOwner=value=>value==='player'||typeof value==='string'&&population.some(p=>`npc:${p.id}`===value&&p.age>=18&&!p.royalGuard&&!p.courtSeat);
 function changed(){onChange(serialize());}
 function effects(){if(king){king.missionDead=progress.crown.stage===MISSIONS[0].steps.length;if(king.missionDead){king.seated=false;king.health=0;king.path=[];}}if(child)child.missionEscort=progress.child.stage===2;}
 function target(){const r=record(),s=mission()?.steps[r?.stage];if(!s||!owns(r))return null;const p=s.actor==='king'?king:s.actor==='child'?child:null;return {...s,x:p?.x??s.x,z:p?.z??s.z,person:p};}
 function advance(choice=null){const m=mission(),r=record();if(!owns(r)||r.stage>=m.steps.length)return false;r.stage++;if(choice)r.choice=choice;combat=null;notice=r.stage===m.steps.length?m.ending:m.steps[r.stage-1].text;effects();if(r.stage===m.steps.length)onComplete(m,r);changed();return true;}
 function accept(id,{silent=false}={}){if(combat||escort()&&id!=='child')return false;const m=MISSIONS.find(m=>m.id===id),r=progress[id];if(!m||r.owner&&!owns(r)&&r.stage<m.steps.length)return false;selected=id;r.accepted=true;r.owner??=owner;notice=r.stage===m.steps.length?m.ending:m.intro;if(!silent)changed();return true;}
 function transfer(id,to){const m=MISSIONS.find(m=>m.id===id),r=progress[id];if(!m||combat||!validOwner(to)||r.stage>=m.steps.length||r.owner&&!owns(r))return false;r.owner=to;r.accepted=true;if(selected===id)selected=null;effects();changed();return true;}
 function interact(position,{busy=false,choice=null}={}){const s=target();if(!s||busy||combat||!position||Math.hypot(s.x-position.x,s.z-position.z)>3.2)return false;
  if(s.requireEscort&&(!child||Math.hypot(child.x-s.x,child.z-s.z)>4)){notice='Espera l’infant: ha d’arribar amb tu fins a la porta.';return false;}
  if(s.choices){const c=s.choices.find(c=>c.value===choice);if(!c)return false;advance(choice);notice=c.text+' '+mission().ending;return true;}
  if(s.combat){combat={enemy:s.enemy,hp:s.hp,maxHp:s.hp,health:6,beat:0,elapsed:0,phase:'warning',defense:null,acted:false,origin:{x:s.x,z:s.z},heavy:false};notice=s.text;return true;}
  return advance();
 }
 function hurt(c,amount){c.health-=amount;onActorHit(c,amount);}
 function act(action){const c=combat;if(!c||!owns(record())||!['attack','block','dodge'].includes(action))return false;
  if(c.phase==='warning'){if(action==='attack'){if(c.acted)return false;c.acted=true;hurt(c,1);notice='T’has precipitat: l’enemic et colpeja durant la preparació.';}else c.defense=action;}
  else if(c.phase==='opening'&&action==='attack'&&!c.acted){c.acted=true;c.hp--;onEnemyHit(c);notice='Has aprofitat l’obertura!';}
  if(c.health<=0){combat=null;notice='Has perdut l’assalt. Pots tornar-ho a intentar; els objectius anteriors es conserven.';}
  else if(c.hp<=0)advance();return true;
 }
 function update(dt,position,{busy=false}={}){const c=combat;if(!c)return;if(!owns(record())||busy||Math.hypot(position.x-c.origin.x,position.z-c.origin.z)>6){combat=null;notice='Combat interromput. Torna a l’objectiu per reprendre l’assalt.';return;}c.elapsed+=Math.min(Math.max(dt,0),.1);
  if(c.phase==='warning'&&c.elapsed>=1.8){const safe=c.defense===(c.heavy?'dodge':'block');if(!safe)hurt(c,2);c.phase='opening';c.elapsed=0;c.acted=false;notice=safe?'Defensa correcta! Ara tens una obertura per atacar.':'Has rebut el cop. Aprofita l’obertura per respondre.';if(c.health<=0){combat=null;notice='Has caigut. Reprèn l’assalt des d’aquest objectiu.';}}
  else if(c.phase==='opening'&&c.elapsed>=1.2){c.phase='warning';c.elapsed=0;c.beat++;c.heavy=c.beat%2===1;c.defense=null;c.acted=false;}
 }
 function serialize(){return{version:1,selected,progress:Object.fromEntries(Object.entries(progress).map(([id,r])=>[id,{...r}]))};}
 function restore(data){if(data?.version!==1||!data.progress)return false;const cleaned={};for(const m of MISSIONS){const r=data.progress[m.id],who=r?.owner??(r?.accepted?'player':null);if(!r||!Number.isInteger(r.stage)||r.stage<0||r.stage>m.steps.length||typeof r.accepted!=='boolean'||r.stage>0&&!r.accepted||who!==null&&!validOwner(who)||r.accepted!==(who!==null)||r.choice!==null&&!m.steps.some(s=>s.choices?.some(c=>c.value===r.choice)))return false;cleaned[m.id]={stage:r.stage,accepted:r.accepted,choice:r.choice,owner:who};}for(const m of MISSIONS)Object.assign(progress[m.id],cleaned[m.id]);selected=MISSIONS.some(m=>m.id===data.selected)&&owns(progress[data.selected])?data.selected:null;if(escort())selected='child';combat=null;effects();return true;}
 return{accept,transfer,notify:changed,interact,act,update,target,serialize,restore,progress,owner,get selected(){return selected;},get mission(){return mission();},get combat(){return combat;},get notice(){return notice;},get escort(){return escort();},get inventory(){return MISSIONS.flatMap(m=>progress[m.id].owner===owner?m.steps.slice(0,progress[m.id].stage).filter(s=>s.item).map(s=>s.item):[]);},get kingDead(){return !!king?.missionDead;},get dragonPact(){return progress.dragon.stage===MISSIONS[4].steps.length;}};
}
