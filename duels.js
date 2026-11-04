// Original comic exchanges: a sharp reply earns a stylised punch, never a wound.
export const DUEL_ROUNDS=[
 {insult:'Tens menys gràcia que una porta rovellada!',replies:['I tu encara no has trobat la clau.','Doncs avui fa bon dia.','La porta és de roure.'],correct:0},
 {insult:'Els teus punys fan riure fins i tot les gallines!',replies:['Les gallines no saben llegir.','Normal: ja han vist com et defenses.','Jo prefereixo els ànecs.'],correct:1},
 {insult:'Quan arribes al ball, tothom fuig!',replies:['El ball comença a les vuit.','Deu ser que falta música.','Només perquè tu ja els has trepitjat els peus.'],correct:2},
 {insult:'Et guanyaria amb una mà lligada!',replies:['Lliga’t també la llengua i serà un vespre perfecte.','Jo tinc dues mans.','Quina corda faràs servir?'],correct:0},
 {insult:'El teu encant és tan sec com el pa d’ahir!',replies:['El forn ja està tancat.','I tot i així encara vens a buscar-ne engrunes.','A mi m’agrada la sopa.'],correct:1},
 {insult:'Fins i tot el drac badalla quan parles!',replies:['És molt gros, el drac.','Potser té son.','Obre la boca perquè vol aprendre a respondre’t.'],correct:2}
];
export function duelRound(index,seed=0){return DUEL_ROUNDS[((index+seed)%DUEL_ROUNDS.length+DUEL_ROUNDS.length)%DUEL_ROUNDS.length];}
export function createPlayerDuel({onPunch=()=>{},onFinish=()=>{}}={}){
 let current=null,serial=0;
 function release(result){if(!current)return;const c=current;c.target.playerDuel=false;delete c.target.duelPose;c.target.state=c.target.path.length?'walking':'working';c.target.social.cooldown=Math.max(c.target.social.cooldown,25);current=null;onFinish(c,result);}
 function start(target){if(current||!target||target.missionJob||target.health===0||target.age<18||target.assembly||target.dragonEmergency||target.courtSeat||target.playerDuel||target.social.conversation!==null)return false;
  current={id:++serial,target,round:0,wins:0,losses:0,phase:'question',remaining:0,elapsed:0,last:'Tria la rèplica més esmolada.',result:null};target.playerDuel=true;target.state='talking';return true;}
 function answer(choice){const c=current;if(!c||c.phase!=='question'||!Number.isInteger(choice)||choice<0||choice>2)return false;
  const round=duelRound(c.round,c.target.id),won=choice===round.correct;c[won?'wins':'losses']++;c.last=won?'Bona rèplica! El teu cop entra.':'La rèplica no convenç. El veí et torna el cop.';c.wonLast=won;c.phase='response';c.remaining=1.5;c.elapsed=0;c.result=c.wins>=2?'win':c.losses>=2?'lose':null;onPunch(c.target,won);return true;}
 function update(dt,{interrupted=false}={}){const c=current;if(!c)return;if(interrupted){release('interrupted');return;}c.target.state='talking';c.elapsed+=dt;if(c.phase==='response')c.target.duelPose=c.wonLast?{hitTime:c.elapsed}:{punchTime:c.elapsed};else delete c.target.duelPose;if(c.phase==='response'){c.remaining-=dt;if(c.remaining<=0){if(c.result){release(c.result);return;}c.round++;c.phase='question';}}}
 return{start,answer,update,cancel:()=>release('interrupted'),get current(){return current;},get round(){return current?duelRound(current.round,current.target.id):null;}};
}
