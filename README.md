# Vallclara medieval

Exploració lliure en primera persona: https://skirep.github.io/vallclara-medieval/

## Vila compacta · novembre de 2026

- **100 personatges en total**: 50 veïns, 24 personatges amb nom propi, 9 artistes adults, 12 soldats reials i 5 ninjes. Es mantenen els 62 dissenys dibuixats, les famílies, les històries i les 512 entrades contextuals de diàleg per habitant.
- Els personatges nous mantenen els IDs 500–523. Les cerques d’identitat fan servir mapes, sense assumir que l’ID sigui una posició de l’array.
- Àrea transitable limitada a ±90 m, 25 cases explorables, església i castell. Els carrers se separen en dues ribes; l’únic enllaç de navegació és el pont de pedra central.
- **Castell de Rocafort**: sala del tron, biblioteca/cancelleria, cuines/rebost, armeria, cambra reial, menjador, capella i galeria. Portes, parets i mobiliari comparteixen coordenades amb les col·lisions.
- El rei i la reina caminen fins als seus trons entre les 8:30 i les 19:00, amb una representació asseguda de tors, genolls i botes. S’aixequen per assistir a la reunió de les dotze i tornen al castell. A la nit van a la cambra reial.
- Santa Maria té nau alta, arcs, bancs, altar, pica baptismal, vitralls, rosassa i campanar. Les cases incorporen carreus, sòcols, fusteria, ferratges, ràfecs i mobiliari interior.
- Menú de pausa amb accés directe al castell, el pont i l’església, a més de la tornada a la plaça.
- Ombres suaus de contacte i projectades, també en qualitat baixa. Alçada dels habitants adaptada al terreny i al pont.

## Vida i desaments

La reunió diària es fa a les 12:00 a la plaça de la riba oest. El sacerdot modera 50 torns rotatius i tots els veïns miren qui parla. Els oficis ordinaris consumeixen materials i lliuren productes al rebost; la cort segueix la seva pròpia rutina. Les converses, les memòries i el progrés són locals al navegador, sense API generativa.

El mapa nou fa servir `vallclara-compact-v2`. El desament de la vila anterior es conserva, però les seves coordenades i recorreguts no es carreguen sobre edificis que han canviat de lloc. La velocitat del temps continua sent configurable (0–8×).

## Desenvolupament i publicació

```bash
npm run prepare-assets
npm test
npm run dev
```

Three.js r180, recursos estàtics i GitHub Pages. Cada push a `main` executa les proves i publica el contingut amb GitHub Actions. La geometria estàtica es fusiona per material i els habitants fan servir InstancedMesh. No hi ha pisos superiors accessibles; els detalls del castell es distribueixen en una planta transitable. Els personatges són sprites dins d’un món 3D, no models humans volumètrics.

Les proves cobreixen les 100 identitats, la conservació dels dissenys, les rutes entre ribes, els accessos a totes les estances i el cicle dels monarques (tron → reunió → tron), a més de les regressions de la simulació.

## Crèdits

- Three.js, MIT: https://threejs.org/ — llicència distribuïda a `vendor/LICENSE-three.txt` després de preparar.
- Poly Haven, textures CC0: https://polyhaven.com/license
  - https://polyhaven.com/a/cobblestone_floor_08
  - https://polyhaven.com/a/plastered_wall_02
  - https://polyhaven.com/a/wood_planks_grey
  - https://polyhaven.com/a/medieval_blocks_03
  - https://polyhaven.com/a/clay_roof_tiles
  - https://polyhaven.com/a/sparse_grass
  - https://polyhaven.com/a/bark_brown_02
  - https://polyhaven.com/a/rough_linen
  - https://polyhaven.com/a/brown_leather
  - https://polyhaven.com/a/autumn_field_puresky
- Tipografies Cormorant Garamond i Manrope, Google Fonts, amb alternatives Georgia i Arial.
- Geometria, textures de reserva i codi de la simulació creats per a aquest projecte.

Les cases tenen cobertes sòlides, frontons amb gruix, ràfecs encaixats amb els murs, reforços curts i porticons separats dels brancals. Els tres dissenys nous tenen 120 fotogrames propis de caminar, repòs, salt, cop de puny i conversa. Els artistes tenen converses suggeridores no explícites només amb altres adults; amb menors mantenen les converses ordinàries de la vila.

Durant la feina artística, els nou visitants alternen salts i cops de puny a l’aire com a exercicis d’actuació. Les accions s’aturen quan caminen o van a la reunió i respecten la pausa del rellotge.

## Drac i càmera de seguiment

El drac 2D amb 24 fotogrames dibuixats passa cada dia del joc a les **10:00 i les 17:00**, durant mitja hora del rellotge (90 segons a 1×). Vola prop de les cases i ajusta l’alçada a les teulades i al campanar. La batuda de les ales s’anima amb l’hora absoluta: la pausa, la velocitat i la restauració del desament conserven la posició del vol. Canviar l’hora mostra la fase corresponent, sense programar vols addicionals.

Toca un habitant visible o obre **Cròniques → fitxa → Seguir amb la càmera**. La càmera el segueix, el ratolí permet orbitar i es comproven parets i mobles per reduir travessaments. **F**, el botó **Deixar de seguir** o començar a caminar recuperen el control a peu a prop del personatge. La marca daurada identifica el veí seguit.

El drac és un sprite pla orientat cap a la càmera, amb sis dibuixos de vol per cadascuna de les quatre vistes. L’atles manté la transparència i no fa servir el model volumètric anterior. Previsualització: [drac 2D](drac.html).

Els perfils dels tres artistes d’estiu i del drac s’adapten a l’ordre de cada atles: no comparteixen l’ordre esquerra/dreta de les figures anteriors. Les excepcions de repòs/conversa es corregeixen només en les animacions afectades. Als canvis de sentit, l’orientació de caminar no queda oposada al desplaçament visible.

### Picabaralles, pensaments i mode joc

Les topades noves entre habitants que es mouen desencadenen una breu conversa de disculpes. De tant en tant, dos adults propers que disposen de fotogrames de puny discuteixen per una invitació al ball: s’intercanvien insults originals, contrarèpliques i cops còmics. No hi ha ferides. La persona convidada conserva la seva decisió; el guanyador no obté una parella com a premi. Les disputes acabades queden al registre de converses i es desen amb les altres cròniques. Les converses, la feina pagada i els lliuraments continuen utilitzant les mateixes reserves. La reunió de les dotze interromp les baralles.

A la portada, «Entrar en mode joc» activa el control lliure en primera persona. També es pot canviar entre Passeig i Joc des del HUD o les opcions. WASD/fletxes per caminar, Majús per córrer, Espai per saltar i E per reptar un adult proper que tingui animació de puny. Cal mirar-lo i tenir un camí visual lliure. Tria entre tres respostes amb 1–3 o amb els botons; dues respostes encertades guanyen el duel. Allunyar-se, la reunió diària o «Deixar el duel» alliberen el veí. Al mòbil hi ha joystick, salt i repte tàctils. Amb comandament, A salta, X repta i X/Y/A trien les respostes.

Les icones dels caps mostren la feina actual, els materials pendents, les converses, els lliuraments, el repòs, la gelosia i les reaccions al drac. T llegeix el pensament del veí que mires; també es poden tocar les icones o consultar qualsevol habitant a Cròniques. Les icones es limiten als veïns visibles i propers, amb ocultació per murs i separació per evitar superposicions. Es poden desactivar a les opcions.

El drac continua sent un sprite 2D i apareix dues vegades al dia, a les 10:00 i les 17:00. Cada aparició inclou voltes, un descens a la plaça, uns 31 segons de baixa alçada, l’ascens i la sortida de la vila. Les flames són cintes animades de fins a 19 metres: a la plaça apunten cap als habitants i s’aturen a terra; tant el vol com els episodis de foc depenen del rellotge del joc i es congelen en pausar-lo.


### Alarma del drac

Durant el descens del drac, s’interrompen els diàlegs i els duels. Els 85 veïns que no són forçuts corren cap a refugis repartits pels carrers, mantenint-se a la seva riba quan és possible. Els tres acròbates musculats (`summer-athlete`) van fins a posicions accessibles al voltant del drac i el desafien amb crits i cops de puny mentre la resta s’allunya. Les rutes fan servir el mateix graf segur de la reunió diària; no hi ha teletransports, passos a través de murs ni travesses del riu fora del pont.

El drac intenta dirigir les flames cap als veïns propers; quan la gent ja és lluny, apunta cap als forçuts. La plaça queda sota l’alarma durant el descens, l’estada i l’ascens. Les bafarades d’alarma i les icones de pànic es mostren també si s’han desactivat les converses ordinàries; els pensaments conserven el seu propi interruptor. Els crits s’escolten amb el so o les veus activats. El HUD mostra els refugiats, els forçuts arribats i el temps de retirada.

Quan s’enlaira, tothom torna caminant al lloc on era i reprèn l’activitat. Les reserves de treball, els materials pagats i els lliuraments pendents es conserven. Desar durant l’alarma manté les posicions i les rutes de feina prèvies, de manera que recarregar a mitja emergència no desquadra les tasques. El rellotge i la pausa també controlen la fugida, els crits i les accions dels defensors.

### Missions jugables i vida dels habitants

El botó 📜 (tecla **Q**) obre cinc històries: **La corona de cendra**, **La llum de l’altra riba**, **El pou que callava**, **Dues cartes i un mentider** i **El pacte de l’ou maragda**. Acceptar-les activa el mode joc. El marcador daurat al món i al mapa indica l’objectiu actual; cal ser a menys de 3,2 metres i prémer **R** o el botó tàctil. Les reunions i emergències interrompen els combats i bloquegen les interaccions. El rescat requereix acompanyar físicament l’infant fins a Santa Maria.

Als assalts, **K** bloqueja el cop directe, **L** esquiva el cop fort i **J** ataca durant l’obertura. Els botons a pantalla fan les mateixes accions; al comandament són X/Y/A. Perdre o allunyar-se conserva els objectius anteriors. La rebel·lió acaba amb la mort de Berenguer; el rei deixa de participar en rutines, reunions i emergències. Recuperar l’ou atura les flames i les alarmes futures, mantenint el vol del drac. La resta d’històries tenen desenllaços i reaccions dels veïns, inclosa una decisió pública o privada sobre les cartes falsificades.

Tots els habitants tenen vida: infants 60, adults 100, defensors 120, soldats 140 i rei 200. Les barres properes mostren vida actual/màxima i canvien de color; la fitxa de Cròniques també la mostra. Els cops i les cremades fan mal. A zero, un habitant queda inconscient i reprèn la recuperació després de 20 segons, a 2 punts per segon de simulació; la mort del rei és permanent en aquesta partida. Les barres es poden desactivar a Opcions o amagar amb la icona de l’ull. Missions i vida es desen localment en aquest navegador.

### Missions autònomes dels NPC

Els adults també poden acceptar i resoldre les cinc missions. Després d’entrar al poble, un veí assumeix una història disponible al cap d’uns 35 segons de simulació; se’n poden fer dues simultàniament. Els habitants prioritzen missions segons el seu ofici i la família, van als objectius per camins transitables, recullen pistes, escullen entre les opcions del diàleg, escorten l’infant i poden combatre els soldats i el rei. Les defenses i els atacs infligeixen dany real: un NPC ferit descansa abans de tornar-ho a intentar.

El jugador i els NPC comparteixen una única campanya. Les missions acceptades pel jugador queden reservades; el botó **Encarregar a un NPC** les pot delegar, inclosa una escorta començada. No hi ha recompenses ni conseqüències duplicades: si un veí derrota Berenguer, el rei mor per a tota la partida; si recupera l’ou, el pacte amb el drac també és compartit.

El diari 📜 mostra el nom del responsable, l’objectiu actual i una crònica dels seus actes. **Seguir [nom]** permet observar-lo amb la càmera. Les icones de pensament i les bafarades expliquen què està fent. Durant les reunions i les emergències, els participants aturen la missió, compleixen la resposta del poble i després la reprenen. Al final tornen caminant al lloc on havien deixat la seva feina, conservant els materials i el progrés del seu ofici. El responsable de cada missió, les escortes i el retorn a la feina es desen amb la partida.

## Arquitectura detallada

Les 25 cases tenen més de 9.000 teules corbes modelades, entramats i ràfecs de fusta, marcs tallats, vidres emplomats, jardineres, ventilacions de les golfes, xemeneies amb dobles pots i detalls interiors. Rocafort incorpora més de 1.600 carreus en relleu, arxivoltes del portal, espitlleres, estendards, quatre cobertes de pissarra, arcs sota els sostres i columnes amb col·lisió. El drac respecta la nova alçada de les torres. La geometria està agrupada per material per contenir el nombre de crides de dibuix. Les partides amb missions d’un veí retirat conserven els objectius i passen la missió al jugador.

## Vida i relacions

Els veïns es busquen activament per participar en cites, trobades discretes, discussions, gelosia, reconciliacions, balls, safareig i estones entre amics. Els infants juguen a tocar i parar, a fet i amagar i a pilota; les pilotes es veuen a l’escena. Hi pot haver fins a quatre grups alhora, repartits per les dues ribes. Tothom arriba caminant i torna al seu lloc amb les rutes de col·lisió compartides.

Les relacions adultes queden separades dels jocs dels infants; els familiars no formen parelles romàntiques llevat que ja siguin parella. Una trobada discreta pot provocar una conversa de gelosia amb la parella, i una discussió pot portar a una disculpa posterior. Afecte, confiança i records de trobades es desen al navegador. Les Cròniques inclouen «Vida i relacions», seguiment de protagonistes i relacions a cada fitxa.

Les escenes aturen temporalment els oficis sense consumir feina ja pagada ni perdre la càrrega. Reunions, missions i alarmes tenen prioritat: una escena interrompuda no compta com a acabada. Les posicions d’origen dels participants es desen perquè una recàrrega no reprengui la feina des del mig d’un joc. Les baralles socials són còmiques, amb cops i dany limitat; les discussions de gelosia fan servir diàleg.

## La Lluna Trencada i la pistola del rellotger

Cinc ninjes en píxel art modern ocupen cinc places de la població existent: el total continua sent 100. Aki és una infiltrada aliada; Ren, Sora, Haku i el cap Raiga busquen el Segell de les Hores. El missatge del pont, la conversa amb Aki i la pista de la cancelleria desencadenen una emboscada. Els quatre infiltrats persegueixen el jugador amb rutes segures i ataquen a curta distància. Quan són derrotats es rendeixen. La trama acaba retornant el segell a Aki davant del pou.

La pistola fantàstica del rellotger està disponible en mode joc. Clic o X dispara des de la mira; C recarrega; G guarda o treu l’arma; V interactua amb les pistes de la trama. En tàctil hi ha botons dedicats. Amb comandament: gallet dret per disparar i Y per recarregar. Guardar la pistola permet tornar a seleccionar habitants amb un toc a l’escena.

La munició és de sis trets i trenta de reserva inicials. A l’armeria del castell, C reposa la munició. Els trets tenen cadència, recàrrega, retrocés visual, flaix, traç i impactes. Les col·lisions utilitzen cossos tridimensionals dels habitants, parets amb obertures reals de portes i finestres, sostres i terra; no hi ha autoapuntat. Els impactes redueixen la vida dels personatges i els ninjes poden fer mal al jugador. Si el jugador cau, torna a la plaça amb el progrés de la trama conservat. Trama, munició, vida i rendicions es desen localment.

La història apareix al diari de missions (Q) i es manté separada de les cinc missions originals perquè no les substitueixi ni impedeixi que els NPC les completin. Els ninjes no s’assignen als oficis ordinaris, a les trobades amoroses ni a missions alienes; les emergències del drac continuen tenint prioritat.
