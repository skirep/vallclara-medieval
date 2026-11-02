import {THREADS} from './village-lore.js';
export const DIALOGUE_COUNT=512;
// Eight authored speech acts in each of sixteen threads, with four distinct situations.
// The resident and interlocutor are resolved only when a page/conversation is needed.
const scripts=[
 [
 '{other}, {news}. A casa {home} no volem que una reparació es converteixi en una frontera.',
 'La família {family} també necessita el pas. Abans de discutir diners, cal {need}.',
 'Puc {offer}. Si hi anem plegats, ningú no haurà de creure només la meva paraula.',
 'Mirem {proof}. Una sospita, tota sola, no sosté un pont.',
 'Em preocupa {worry}. Per això cal {need} sense prometre més hores de les que tenim.',
 'Podem {offer} sense deixar la gent de casa sense ajuda. Millor un compromís que puguem complir.',
 'Quan ens retrobem, pregunta’m per {proof}. Recordem què hem comprovat i què falta.',
 'Portaré a casa {home} la proposta de {need}. També els preguntaré què en pensen.'
 ],[
 '{other}, {news}. El rec no s’hauria de repartir segons qui crida més fort.',
 'A casa {home} voldríem {need}. Les males cares d’un hort arriben a tota la plaça.',
 'Puc {offer}. No donaré per fet que cada casa pot cedir el mateix.',
 'Abans de moure cap torn, comprovem {proof}. La família {family} ha d’entendre l’acord.',
 'Voldria {wish}; per això em neguiteja haver de {need} amb presses.',
 'Podem {offer} i esperar la resposta de les altres cases abans de decidir.',
 'Si ens contradiuen, tornem a {proof}. El rec ja fa prou mal quan se’n surt.',
 'A casa {home} explicaré per què cal {need}. Que ningú no descobreixi el seu torn per un rumor.'
 ],[
 '{other}, {news}. A casa {home} ens demanem quan podrem confiar en la molta.',
 'Ens toca {need}. Una cua no s’arregla fent passar els amics davant.',
 'Puc {offer}. No en sé totes les respostes, però escoltaré qui coneix la roda.',
 'La família {family} vol veure {proof}. Els comptes han de poder-se contrastar.',
 'Penso en {worry}. No voldria equivocar-me quan ens posem a {need}.',
 'Podem {offer} a la vista de tothom. Si m’equivoco, que m’ho diguin abans de tancar el compte.',
 'Recordem {proof} a la propera conversa. No comencem la mateixa discussió cada matí.',
 'Portaré a casa {home} la idea de {need}. Voldria tornar amb una resposta, no una excusa.'
 ],[
 'A casa {home} parlem que {news}. Un sac menys pot canviar tot un hivern, {other}.',
 'Proposo {need}. Ningú no hauria de passar vergonya per demanar pa.',
 'Puc {offer}. Una ajuda no necessita públic.',
 'Mirem {proof}. La família {family} té dret a saber què s’ha comptat.',
 'Voldria {wish}, però també cal {need}. Haurem de repartir les forces.',
 'Podem començar per {offer}. Les bones intencions no omplen un cove.',
 'Quan ens tornem a veure, parlem de {proof}. Així podrem revisar la proposta.',
 'A casa {home} explicaré que cal {need}, i escoltar qui no s’atreveix a venir al forn.'
 ],[
 '{other}, {news}. A casa {home} no volem heretar una culpa que ningú no sap explicar.',
 'Abans d’acusar, cal {need}. Després podrem parlar de què és just.',
 'Puc {offer}. Escoltar no vol dir acceptar qualsevol condició.',
 'La família {family} vol contrastar {proof}. Fins i tot un record valuós pot errar la data.',
 'Em pesa {worry}. Em costa {need} sense pensar en qui acabarà pagant.',
 'Podem {offer} sense fer explicar tota una vida davant de la plaça.',
 'Tinguem a mà {proof} quan ens retrobem. No vull convertir una conversa en una cadena de favors.',
 'A casa {home} preguntaré com podem {need} sense humiliar cap veí.'
 ],[
 '{other}, {news}. A casa {home} volem saber què hi havia escrit.',
 'Cal {need}. Si barregem el que sabem i el que imaginem, inventarem un pacte fent veure que és vell.',
 'Puc {offer}. Si no entenc una paraula, ho diré abans de repetir-la.',
 'La família {family} em preguntarà per {proof}. Una pista no és encara una certesa.',
 'Voldria {wish}; ara tothom té pressa per {need}. La pressa no farà aparèixer cap lletra.',
 'Podem {offer}. Que també hi sigui algú que no pensi com nosaltres: ens farà veure els errors.',
 'Pregunta’m per {proof} quan ens retrobem. Si no ho he comprovat, no diré que està resolt.',
 'A casa {home} defensaré que cal {need}. El pacte s’ha de poder explicar a qui no sap llegir.'
 ],[
 '{other}, {news}. A casa {home} una frase a mitges ja ens ha fet discutir prou.',
 'Abans de repetir-ho, cal {need}. Una història possible no és necessàriament certa.',
 'Puc {offer}, encara que qui ho hagi dit sigui amic meu. L’amistat no obliga a donar sempre la raó.',
 'Expliquem a la família {family} què sabem de {proof}. La resta, deixem-la com a dubte.',
 'Em preocupa {worry}. Si volem {need}, escoltem sense jutjar abans d’hora.',
 'Podem {offer}, sense parlar en nom d’una casa sencera.',
 'Recordem {proof}. La rectificació hauria d’arribar tan lluny com el rumor.',
 'A casa {home} explicaré per què cal {need}. Si m’he equivocat, també em tocarà dir-ho.'
 ],[
 '{other}, {news}. A casa {home} sabem que una biga no s’asseca perquè faci falta.',
 'Primer cal {need}. No posarem algú sota una peça que s’ha triat per orgull.',
 'Puc {offer}. Si pesa massa, demanarem més mans.',
 'Ensenyem a la família {family} {proof}. Les marques serveixen si les entenem igual.',
 'Tinc pendent {wish}. Si també hem de {need}, pactem què pot esperar.',
 'Comencem per {offer}. Si no acabem avui, deixem la feina segura per demà.',
 'A la propera trobada compararem {proof}. Una peça prestada no s’ha de comptar com un regal.',
 'A casa {home} explicaré que cal {need}. També preguntaré què necessiten abans de cedir res.'
 ],[
 '{other}, {news}. A casa {home} volem que les eines tornin a un lloc conegut.',
 'Ens toca {need}. Un mànec gastat pot valer molt per a qui hi treballa cada dia.',
 'Puc {offer}. No remenarem les coses d’una casa sense permís.',
 'La família {family} vol comprovar {proof}. Aclarir-ho ens pot estalviar una enemistat.',
 'Em preocupa {worry}. No vull que haver de {need} es torni un retret per sempre.',
 'Podem {offer} i deixar clar l’acord. Així no dependrà de qui recordi més fort.',
 'Quan ens retrobem, tornem a {proof}. Una eina es repara més fàcilment que una confiança.',
 'A casa {home} preguntaré com podem {need}. Si el dany és nostre, caldrà assumir-lo.'
 ],[
 '{other}, {news}. A casa {home} una cinta petita encara ens recorda qui ens va ajudar.',
 'Podríem {need}. Una peça humil no hauria de provocar burles.',
 'Puc {offer}. Preguntarem abans de tocar res que tingui un valor per als altres.',
 'La família {family} sap el valor dels records; mirem {proof} amb cura.',
 'Voldria {wish}. Potser haver de {need} ens farà tornar a saludar qui havíem deixat de veure.',
 'Podem {offer}. Si no hi ha prou material, direm què falta.',
 'Recordem {proof} a la propera conversa. No totes les marques han de separar la gent.',
 'A casa {home} proposaré {need}. També escoltaré què els fa il·lusió.'
 ],[
 '{other}, {news}. A casa {home} no volem perdre un veí per una cabra.',
 'Cal {need}. Si no escoltem el dany de l’altre, cada marge serà una muralla.',
 'Puc {offer}. Els petits es quedaran lluny dels animals espantats.',
 'La família {family} vol veure {proof}. No donem per fet de qui era l’animal.',
 'Em preocupa {worry}. Mirem de {need} sense prometre una compensació impossible.',
 'Podem {offer}. Abans preguntarem a la casa afectada si els serveix.',
 'Recordem {proof} quan ens tornem a veure. L’acord d’avui s’ha de poder revisar demà.',
 'A casa {home} explicaré que cal {need}. Cap ramat es cuida millor a base de crits.'
 ],[
 '{other}, {news}. A casa {home} volem escoltar els petits abans que els grans canviïn la versió.',
 'Podem {need}. Escoltar no vol dir enviar els infants a una feina perillosa.',
 'Puc {offer}. Si la família no hi pot venir, esperarem.',
 'La família {family} pot mirar {proof}. Deixem explicar què han vist sense donar-los la resposta.',
 'Voldria {wish}. També cal {need}; els petits noten quan els escoltem de debò.',
 'Podem {offer}. Un joc inventat també té valor, sense fer-lo passar per prova.',
 'Quan ens retrobem, tornem a {proof}. Vull recordar les seves paraules.',
 'A casa {home} preguntaré com volen {need}. Ser petits no els fa invisibles.'
 ],[
 '{other}, {news}. A casa {home} voldríem que aprendre no fos un privilegi.',
 'Podríem {need}. Ningú no aprèn millor per la por d’equivocar-se.',
 'Puc {offer}. Si no en sé prou, buscarem qui en sàpiga més.',
 'Mostrem a la família {family} {proof}. Una cosa entesa val més que deu repetides de memòria.',
 'Tinc ganes de {wish}. Començar per {need} pot acostar-me a aquest desig.',
 'Podem {offer}, deixant clar quan comença i acaba el compromís.',
 'A la propera trobada ensenyem-nos {proof}. Si hi ha un error, tindrem alguna cosa concreta per aprendre.',
 'A casa {home} explicaré com volem {need}. Que ningú quedi fora per no tenir una tauleta.'
 ],[
 '{other}, {news}. A casa {home} sabem que no tota la feina es veu des del carrer.',
 'Cal {need}. Una absència no explica què passa darrere d’una porta.',
 'Puc {offer}. Preguntaré si els va bé; ajudar no és entrar sense avisar.',
 'La família {family} vol mirar {proof} amb respecte, sense fer xafarderia d’una necessitat.',
 'Em preocupa {worry}. Si volem {need}, haurem d’acceptar que algú ens digui que avui no.',
 'Podem {offer}. No cal que expliquin més del que vulguin compartir.',
 'Quan ens retrobem, parlem de {proof}, només amb el permís de qui correspon.',
 'A casa {home} proposaré {need}. Les cures també sostenen la vila, encara que no hi posin bigues.'
 ],[
 '{other}, {news}. A casa {home} volem entendre què paguem abans de discutir.',
 'Primer cal {need}. Una mesura confusa fa semblar un engany fins i tot un tracte honest.',
 'Puc {offer}, amb la persona que ven al davant i sense assenyalar-la d’amagat.',
 'La família {family} vol comparar {proof}. Millor trobar l’error abans de tornar a pesar.',
 'Encara voldria {wish}. Però si hem de {need}, prefereixo dedicar-hi temps i entendre-ho.',
 'Podem {offer}. També preguntarem si les altres cases han entès el mateix.',
 'Recordem {proof}. Publicar un número no serveix si ningú entén quina mesura hi ha al darrere.',
 'A casa {home} explicaré per què volem {need}. Un bon tracte s’ha de poder explicar sense abaixar la veu.'
 ],[
 '{other}, {news}. A casa {home} volem celebrar sense amagar les preocupacions.',
 'Podríem {need}. Una festa no hauria de deixar una altra casa endeutada.',
 'Puc {offer}. Si algú no vol venir, el convidarem sense retrets.',
 'La família {family} recorda {proof}. Potser una taula compartida ens farà escoltar-nos.',
 'Voldria {wish}. Si podem {need}, aquest any tindrem alguna cosa més que una festa.',
 'Podem {offer}. Repartim també la feina de recollir quan s’acabi la música.',
 'Quan ens retrobem, parlem de {proof}. No cal pensar igual per tornar a seure junts.',
 'A casa {home} proposaré {need}. Vull que tothom s’hi senti benvingut.'
 ]
];
export function dialogueEntry(person,index,other=null){
 if(!Number.isInteger(index)||index<0||index>=DIALOGUE_COUNT)throw new RangeError('Índex de diàleg desconegut');
 const topic=Math.floor(index/32),chapter=Math.floor(index%32/8),beat=index%8,thread=THREADS[topic];
 const values={...thread.stages[chapter],other:other?.name??'veí',home:person.family.household,family:person.surname,wish:person.story.wish,worry:person.story.worry};
 return {id:`${person.id}:${topic}:${chapter}:${beat}`,speakerId:person.id,topic:thread.id,chapter,beat,text:scripts[topic][beat].replace(/\{(\w+)\}/g,(_,key)=>values[key])};
}
export function dialoguePage(person,{topic=0,chapter=0,other=null}={}){
 if(!Number.isInteger(topic)||topic<0||topic>=16||!Number.isInteger(chapter)||chapter<0||chapter>3)throw new RangeError('Pàgina desconeguda');
 return Array.from({length:8},(_,beat)=>dialogueEntry(person,topic*32+chapter*8+beat,other));
}
export function *dialogueCatalogue(person,other=null){for(let i=0;i<DIALOGUE_COUNT;i++)yield dialogueEntry(person,i,other);}
