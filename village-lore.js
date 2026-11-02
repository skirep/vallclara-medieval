export const VILLAGE_LORE={
 title:'Vallclara i el pacte de les dues ribes',
 premise:'Tardor de 1348. Un aiguat ha descobert sota el pont una fita amb dues mans gravades. Fa trenta anys, les famílies de les dues ribes van acordar compartir l’aigua, el molí i les reparacions del pas. Ara el consell proposa un peatge, però a l’arca de la parròquia falta la pàgina que explica els drets de la riba petita.',
 conflict:'Les cases amb poca terra temen perdre el molí. Altres volen recuperar préstecs antics. Hi ha aportacions de feina anotades al costat de deutes, records que no coincideixen i rumors que fan mal. Cal comparar testimonis abans de culpar ningú.',
 ending:'El pacte obligava les dues ribes a mantenir juntes el pas i l’aigua. La còpia contrastada es llegeix davant de les famílies: compartir el pont també vol dir repartir-ne la feina. La festa no esborra els desacords, però torna a reunir les cases a la mateixa taula.',
 chapters:[
  {title:'La fita sota el fang',summary:'Recollim testimonis de l’aiguat i de la fita, sense convertir les sospites en acusacions.'},
  {title:'Els comptes de l’absència',summary:'Les cases comparen rebuts, mesures i records. Una còpia parcial del pacte ajuda a contrastar els testimonis.'},
  {title:'Un pont que no sigui de ningú',summary:'Es preparen torns i ajuda mútua. Els veïns es retroben per comprovar els compromisos i resoldre els desacords.'},
  {title:'La festa de les dues ribes',summary:'La còpia contrastada es llegeix a la plaça. El pacte queda obert a totes les cases; continuen les feines i les petites disputes de cada dia.'}
 ]
};
// Each evolving situation contains news, a concrete need, an offer and evidence.
export const THREADS=[
 ['pont','El pont i el peatge',[
 ['l’aiguat ha descobert la fita sota el pont','mesurar el tauló que balla','subjectar la corda de mesurar','la marca de les dues mans'],
 ['el rebut del peatge no diu qui va pagar les bigues','comparar el rebut amb els comptes de casa','portar el rebut a la plaça','la data ratllada del rebut'],
 ['es proposa un torn de reparació per cada riba','apuntar les hores disponibles de cada casa','compartir un torn amb una altra família','la llista de torns del pont'],
 ['es debat deixar lliure el pas de vianants','revisar els drets de les dues ribes','llegir les condicions del pas','la còpia pública del pacte']]],
 ['aigua','Els torns de l’aigua',[
 ['el rec de la riba petita baixa tèrbol','inspeccionar el rec abans de culpar ningú','acompanyar la inspecció','el nivell gravat al marge'],
 ['dos horts consten al mateix torn d’aigua','contrastar les tauletes dels torns','escoltar les dues cases','les dues marques del mateix torn'],
 ['es prepara un repartiment provisional','reservar aigua per als horts petits','cedir una estona del torn','el repartiment provisional dels horts'],
 ['els torns d’aigua es llegiran a la plaça','comprovar que cap casa quedi fora','avisar la riba petita de la lectura','el calendari nou del rec']]],
 ['moli','La mola aturada',[
 ['la mola ha quedat aturada després de l’aiguat','esbrinar si falla l’eix o falta cabal','portar llum sota la roda','el soroll irregular de l’eix'],
 ['un compte carrega dues vegades la mateixa molta','buscar qui va fer la segona anotació','recollir testimonis de la jornada','les dues entrades del llibre del molí'],
 ['es proposa prioritzar les cases sense reserves','organitzar la cua sense afavorir els parents','anotar els sacs davant dels veïns','la relació de sacs del magatzem'],
 ['es debat una reserva comunal de gra','acordar quan es farà servir la reserva','revisar les condicions amb les llars petites','el segell de la reserva comunal']]],
 ['pa','El pa de demà',[
 ['s’han mullat sacs guardats per a l’hivern','separar el gra humit del que es pot guardar','dur coves nets per fer la tria','l’olor dels sacs del racó baix'],
 ['hi ha llars que amaguen que no tenen farina','oferir ajuda sense exposar ningú','preparar una cistella discreta','la llista de fornades pendents'],
 ['el forn demana mans per a una fornada compartida','repartir massa i llenya amb una mesura clara','ajudar a pesar la farina','la mesura de fusta del forn'],
 ['es vol reservar pa per als torns comuns','comptar les racions necessàries','anotar les racions abans de començar','el recompte de pans dels torns']]],
 ['deutes','Els deutes heretats',[
 ['un cobrador pregunta pels deutes de l’antic aiguat','distingir préstecs i ajuda comunal','buscar qui recorda el tracte','la bossa antiga de comptes'],
 ['una casa guarda un rebut que no s’havia vist','comparar-lo sense prendre’l als seus amos','fer de testimoni durant la consulta','el revers del rebut antic'],
 ['es debat ajornar els deutes durant les reparacions','escoltar també qui va prestar monedes','organitzar una conversa sense crits','les condicions del préstec vell'],
 ['les cases volen deixar clars els nous acords','comprovar que una ajuda no es converteixi en deute','llegir les condicions abans d’acceptar-les','la ratlla entre ajuda i préstec']]],
 ['arca','La pàgina de l’arca',[
 ['a l’arca de la parròquia falta un full del pacte','saber qui va consultar l’arca','acompanyar el sacerdot a buscar-lo','el fil trencat de la relligadura'],
 ['un marge de llibre conté una còpia parcial','comparar les lletres amb el pacte','sostenir la llum per llegir','les paraules copiades al marge'],
 ['dos testimonis recorden la mateixa clàusula','distingir el record de la prova','portar els testimonis a parlar plegats','les correccions visibles de la còpia'],
 ['la còpia diu que cap riba pot tancar el pas','llegir també les obligacions de manteniment','preparar la lectura per a qui no sap llegir','la clàusula del pas compartit']]],
 ['rumors','El rumor i el testimoni',[
 ['es diu que algú ha amagat el full expressament','preguntar qui ho ha vist','aturar una acusació sense proves','l’origen del primer rumor'],
 ['dues versions confonen el dia de la consulta','separar allò vist d’allò sentit','escoltar les versions sense interrompre','les dates diferents dels testimonis'],
 ['una acusació ha fet mal a una família','demanar una rectificació pública','acompanyar la família a parlar-ne','les paraules exactes de l’acusació'],
 ['la plaça reclama contrastar els anuncis','acordar com es corregiran les notícies falses','explicar com contrastar una història','la rectificació pública']]],
 ['fusta','La fusta promesa',[
 ['les bigues guardades encara són humides','triar fusta segura per treballar','ordenar les peces sota cobert','la marca fosca de la biga baixa'],
 ['dues cases reclamen la mateixa pila de roure','comparar les marques abans de moure res','mesurar les peces amb les dues cases','els dos senyals tallats al roure'],
 ['els torns comuns necessiten fusta cedida','anotar què es presta i què es dona','portar una peça amb ajuda','el recompte de peces cedides'],
 ['es proposa plantar arbres per retornar la fusta','triar un lloc sense envair cap hort','guardar plançons per a la plantada','el dibuix del terreny de la plantada']]],
 ['eines','El martell que passa de mà',[
 ['falta una eina després de netejar el fang','repassar per quines mans ha passat','buscar sota els bancs del cobert','la marca del mànec de l’eina'],
 ['l’eina apareix en una casa que la creia prestada','aclarir qui va donar permís','tornar-la davant de qui la va deixar','el testimoni del préstec'],
 ['els torns necessiten eines compartides','registrar què surt del taller i què hi torna','fer una tauleta de préstecs','les marques de la tauleta del taller'],
 ['una eina ha tornat amb el mànec esquerdat','acordar qui l’adobarà','compartir la reparació del mànec','l’esquerda nova del mànec']]],
 ['roba','Les cintes de les cases',[
 ['l’aiguat ha barrejat la bugada de moltes cases','reconèixer la roba sense avergonyir ningú','estendre les peces sota el porxo','la cinta cosida a la camisa'],
 ['una cinta antiga té el signe de la fita','preguntar qui va cosir el senyal','ensenyar-la a una persona gran','els punts dobles de la cinta'],
 ['es preparen distintius dels torns de les ribes','evitar que els colors separin les famílies','cosir dues cintes en un distintiu','la costura que uneix les cintes'],
 ['els infants volen cintes per a la festa','repartir retalls sense deixar ningú fora','guardar els retalls aprofitables','el cove de retalls de la festa']]],
 ['ramat','La cabra i el marge',[
 ['una cabra ha sortit pel marge trencat','trobar el ramat abans que arribi al rec','vigilar el camí de la cerca','les petjades del marge'],
 ['hi ha brots menjats i versions diferents','comparar les petjades amb calma','acompanyar la casa afectada i el pastor','els brots mossegats vora el rec'],
 ['es proposa reparar el marge entre veïns','compensar el dany sense condemnar el ramat','dur brancatge per tancar el pas','el tram obert del marge'],
 ['el nou acord preveu un pas per als animals','evitar que el pas travessi sembrats','marcar el camí amb pedres','les pedres que delimiten el pas']]],
 ['infants','Els petits també ho veuen',[
 ['els infants han trobat una pedra amb dues mans','escoltar on la van trobar','acompanyar-los amb la família','el dibuix de les mans a la pedra'],
 ['un joc de plaça repeteix una dita del pacte','preguntar qui va ensenyar la dita','anotar les paraules que recorden','la tornada del joc de les ribes'],
 ['els petits volen ajudar prop de les obres','trobar una tasca segura lluny de la bastida','preparar aigua i cistells al porxo','la distància entre el porxo i les obres'],
 ['les famílies preparen un joc del pacte','deixar explicar una part a cada infant','escoltar l’assaig sense interrompre','les pedres que fan de ribes al joc']]],
 ['aprenents','Aprendre sense deure favors',[
 ['un aprenent vol entendre els comptes','trobar qui ensenyi sense cobrar favors','compartir una estona de lectura','les primeres marques de la tauleta'],
 ['hi ha gent que no coneix les mesures','comparar mesures i objectes quotidians','portar un cove de mida coneguda','la ratlla del cove de mesurar'],
 ['els tallers volen ensenyar durant els torns','reservar tasques segures per començar','explicar una feina pas a pas','l’esbós de tasques dels aprenents'],
 ['es proposa una lectura setmanal al porxo','triar un horari per a la gent del camp','guardar una tauleta per a qui no en té','la llista oberta de la lectura']]],
 ['cures','La casa que no arriba a tot',[
 ['una casa cuida una persona i no pot anar al rec','oferir relleu sense fer preguntes íntimes','portar aigua fins a la porta','el cistell que espera davant de casa'],
 ['una absència s’ha confós amb desinterès','reconèixer les cures com a feina','fer arribar una opinió amb permís','el missatge que la llar vol compartir'],
 ['els torns han de deixar espai per a les cures','comptar les cures com una aportació','fer una gestió per una llar que no surt','la casella de cures dels torns'],
 ['la festa vol arribar a qui es queda a casa','preguntar abans de portar res','acompanyar una visita amb permís','el torn de visites acordat']]],
 ['mercat','La balança de la plaça',[
 ['els preus del gra han canviat amb l’aiguat','comparar mesures abans dels preus','mirar la balança amb la venedora','el contrapès de la plaça'],
 ['un pes diferent pot explicar part dels comptes','comprovar el pes sense suposar un engany','buscar un contrapès de referència','la diferència entre contrapesos'],
 ['es proposa una mesura comuna per als sacs','acordar qui guarda la mesura pública','presenciar la primera pesada','la marca comuna de la mesura'],
 ['el mercat vol publicar preus al porxo','llegir els preus a qui no coneix les lletres','avisar de les mesures que no coincideixen','la tauleta pública del mercat']]],
 ['festa','Una festa amb lloc per a tothom',[
 ['es planteja suspendre la festa pel fang','celebrar sense gastar les reserves','proposar música i jocs senzills','el banc buit entre les ribes'],
 ['una cançó parla de la promesa del pas lliure','distingir la cançó del document','buscar qui recorda la segona estrofa','la lletra vella del pas'],
 ['es prepara una taula després dels torns','repartir la feina entre les cases','posar bancs al porxo','el repartiment de feines de la taula'],
 ['la festa acollirà la lectura del pacte','deixar parlar qui encara té objeccions','convidar una casa amb qui no es parla','el banc que unirà les dues ribes']]]
].map(([id,title,stages])=>({id,title,stages:stages.map(([news,need,offer,proof])=>({news,need,offer,proof}))}));
export const KEY_RESIDENTS=[
 [0,11,'El petit testimoni','vol que els grans escoltin els infants','Va veure les dues mans en una pedra mentre jugava amb la família. No va entrar tot sol al riu.'],
 [2,8,'Qui reconeix les eines','vol tornar a prestar eines sense perdre-les','Reconeix una reparació antiga al pany de l’arca. Això no demostra que algú el forcés.'],
 [3,9,'La memòria de les cintes','vol que cosir compti com a ajuda comunal','Guarda una cinta heretada amb dues mans, com les que duien les cases que cuidaven el pas.'],
 [4,5,'El custodi de l’arca','vol aclarir el destí del full','Va posar papers humits entre llibres per eixugar-los. Necessita ajuda per refer aquell ordre.'],
 [7,6,'La veu del safareig','vol reparar el mal del rumor','Va repetir una conversa sentida a mitges. Vol rectificar davant de qui la va escoltar.'],
 [8,10,'La defensa del ramat','vol compensar els brots sense perdre el ramat','Va veure el marge obert abans que sortissin els animals. Accepta parlar dels danys amb testimonis.'],
 [9,4,'La memòria del vell deute','vol distingir els préstecs dels favors','Conserva un rebut on una aportació de feina sembla anotada com un préstec. Pot ser un error de còpia.'],
 [12,1,'La defensa dels horts petits','vol que les llars petites tinguin veu','Té una tauleta que discrepa de la d’una altra casa. Vol comparar-les abans de reclamar més aigua.'],
 [13,3,'La fornada discreta','vol compartir sense exposar les necessitats dels altres','Reserva pa per a una llar que no pot anar al mercat. No en dirà el nom sense permís.'],
 [17,14,'La balança qüestionada','vol demostrar amb mesures clares que no enganya','Ha trobat dos contrapesos diferents i els vol comparar davant de tothom.'],
 [18,7,'La tria de les bigues','vol reparar el pas amb seguretat','Una biga té una esquerda amagada al costat de terra. No vol que s’utilitzi sense revisar-la.'],
 [22,12,'La mesura que s’ensenya','vol ensenyar a entendre els comptes','Ha preparat una mesura de terrissa que encara ha de contrastar amb la mesura pública.'],
 [23,15,'La cançó incompleta','vol reunir les famílies sense tapar les disputes','Recorda una tornada del pas lliure, però admet que una cançó no és una còpia del pacte.'],
 [24,2,'La memòria del molí','vol un torn just per a les cases sense reserves','Recorda que les aportacions de feina es registraven al mateix llibre que els sacs del molí.']
].map(([id,topic,role,motive,secret])=>({id,topic,role,motive,secret}));
