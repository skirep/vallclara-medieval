// Suggestive banter is a conversation between consenting adults, never a child
// dialogue or a replacement for family/work conversations involving children.
export function canFlirt(a,b){return a.age>=18&&b.age>=18&&(a.flirtatious===true||b.flirtatious===true);}
const exchanges=[
 ['Si em mires així mentre ballo, acabaré perdent el compàs.','El compàs no sé, però ja m’has fet perdre el fil de la conversa.','Em convides a recuperar-lo després de sopar?','A la plaça, amb música i sense presses. Això sí que em tempta.'],
 ['Avui fa calor, però sospito que no tota ve del sol.','Si segueixes acostant-te, haurem de buscar l’ombra.','Sota el porxo hi corre una mica d’aire.','Vinc, però no em prometis que deixaré de posar-me vermell.'],
 ['Tens una manera de somriure que hauria de pagar peatge.','Doncs tu ja fa estona que passes i encara no has demanat permís.','Et dec un compliment o una copa?','Comença per la copa i veurem com portes els compliments.'],
 ['He deixat un lloc al meu costat per al ball d’aquesta nit.','I com sabies que em vindria de gust ocupar-lo?','Perquè no has apartat la mirada ni una sola vegada.','Potser esperava que et decidissis a convidar-me.'],
 ['No sé si m’agrada més la música o la companyia.','La música encara no ha començat.','Aleshores ja tinc la resposta.','Guarda’m aquest somriure fins que soni el primer acord.'],
 ['Tinc una pregunta indiscreta: sempre encises així la gent?','Només quan algú em dona una bona excusa.','M’agradaria ser una excusa especialment bona.','Doncs acompanya’m a passejar per la riba i explica’m alguna cosa de tu.'],
 ['Si aquesta nit et busco entre la gent, em deixaràs trobar-te?','Depèn de si vens amb una invitació o amb una altra fanfarronada.','Una invitació. Sopar, conversa i el millor lloc sota els fanalets.','Això sona perillosament difícil de rebutjar.'],
 ['T’ho diré clar: m’atraus i m’agradaria conèixer-te millor.','M’agrada que ho diguis sense fer-me endevinar res.','Si no et ve de gust, no insistiré.','Una passejada em ve de gust. La resta ja ho decidirem amb calma.']
];
export function flirtConversation(a,b,hour,meeting=0){
 if(!canFlirt(a,b))return null;
 const first=a.flirtatious?a:b,second=first===a?b:a;
 const lines=exchanges[(Math.floor(meeting)+a.id+b.id)%exchanges.length];
 const greeting=hour<12?'Bon dia':hour<19?'Bona tarda':'Bon vespre';
 const tail=meeting%4===3?['Avui prefereixo quedar-me en una conversa agradable.','Entès. Cap pressa ni cap compromís; gràcies per dir-m’ho.']:['Aquesta conversa m’ha alegrat el dia.','A mi també. Quan acabem la feina, ens tornem a trobar si a tots dos ens ve de gust.'];
 return [...lines,`Per cert, ${second.name}, tens plans per després?`,'Primer compliré amb la feina; no penso deixar ningú penjat.',...tail].map((text,i)=>({speakerId:(i%2?second:first).id,text:i===0?`${greeting}, ${second.name}. ${text}`:text}));
}
