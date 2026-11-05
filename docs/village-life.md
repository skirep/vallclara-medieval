# Vallclara: el pacte de les dues ribes i la feina de cada dia

## Història

Tardor de 1348. Un aiguat descobreix sota el pont una fita amb dues mans. Fa trenta anys les famílies van prometre compartir l’aigua, el molí i la cura del pas. Ara es proposa un peatge, però falta el full del pacte que descrivia els drets de la riba petita.

El conflicte no té un únic malvat: algunes aportacions de feina es van escriure al costat dels préstecs, hi ha records contradictoris i les cases tenen por de perdre l’accés al molí. Mossèn Guillem recorda haver separat papers humits entre llibres. Arnau reconeix el signe de la pedra; Agnès guarda una cinta semblant; Bernat reconeix una reparació al pany, que no demostra cap robatori. Les altres cases aporten rebuts, mesures i testimonis.

Hi ha catorze veus principals amb pistes i motius propis, connectades als habitants existents. Els altres veïns també tenen família, amistat, un desacord, un testimoni i una postura sobre el pacte. La xarxa d’amistats inclou els 100 personatges.

Les quatre etapes són **La fita sota el fang**, **Els comptes de l’absència**, **Un pont que no sigui de ningú** i **La festa de les dues ribes**. La còpia contrastada reconeix el pas compartit i les obligacions de manteniment. Les cases poden tornar a seure juntes sense haver resolt tots els desacords.

Els setze fils inclouen pont, aigua, molí, pa, deutes, arca, rumors, fusta, eines, roba, ramat, infants, aprenents, cures, mercat i festa. Cada fil té quatre situacions evolutives i vuit rèpliques: **512 entrades contextuals per habitant**, consultables a Cròniques. Són escenes escrites adaptades a les dades dels habitants, no 51.200 frases escrites individualment, ni una connexió a un servei d’IA.

Les converses acabades contrasten testimonis i deixen memòria. Les retrobades acordades augmenten la confiança quan realment es produeixen. Les interrompudes no compten. Cada etapa necessita 24 intercanvis de parella/tema diferents, almenys dotze habitants i sis temes. Les converses començades en una etapa anterior no fan saltar la següent.

## Feina executada a la simulació

Cada habitant té una funció individual, un lloc assignat i una tasca diària reproduïble. Les funcions compartides són camp, forn, ferreria, teler, transport, mercat, fusteria, safareig, ramat, guàrdia, terrissa, música, aprenentatge i parròquia. Els infants fan lectura, nusos, mesures, classificació de llavors i cançons, sense processos industrials ni consum d’eines pesades. La gent gran té menys lliuraments diaris i més temps per tasca.

El cicle és **caminar al lloc → reservar ingredients → treballar → transportar el resultat → lliurar**. Exemples:

- El camp aporta gra; el forn consumeix gra i aigua i produeix pa.
- Els traginers porten aigua i fusta des dels punts de càrrega.
- El ramat aporta llana; els telers la converteixen en teixits.
- La ferreria i la fusteria consumeixen fusta per preparar eines i peces de reparació.
- El safareig necessita aigua; les parades consumeixen pa per preparar lots.
- Les rondes, lliçons, actuacions i visites de suport són comptadors de serveis acabats, no objectes físics.

Els ingredients es reserven en arribar al lloc, una sola vegada. El resultat no s’afegeix al rebost fins que l’habitant arriba al punt de lliurament. Si falta material, la feina queda bloquejada i es reprèn quan arriba el subministrament. La quota diària limita la producció; els recursos es mantenen dins de límits numèrics.

A l’escena hi ha punts de feina identificables, eines en moviment durant el treball i càrregues durant el transport. Els punts de servei i els recursos són una simulació simplificada: no es talla cada arbre ni es reconstrueix físicament el pont quan augmenten les peces de reparació. Els objectes de feina són decoratius i no introdueixen barreres noves als carrers.

Les rutes fan servir els carrers connectats del poble. No es teletransporten els habitants. Les pauses, les converses i la reunió suspenen el treball. La tornada a casa conserva el material reservat i la càrrega pendent. El dia següent canvien les tasques previstes; els dies saltats amb el rellotge no creen feina retrospectiva.

## Reunió i consulta

Es conserva una sola reunió al dia, a les **12:00**, amb tots els habitants presents i **50 torns rotatius**. La gent mira qui parla; el sacerdot modera i anuncia l’etapa del pacte. Els informes de feina fan servir els lliuraments realment completats el dia anterior. Si no n’hi ha cap, ho diuen. El pla d’avui coincideix amb la tasca assignada. Els bloquejos per falta de material també poden aparèixer a les converses.

**Cròniques → Història del poble** mostra l’argument i el progrés. **Oficis i rebost** mostra recursos, serveis i lliuraments recents. La fitxa de cada habitant mostra funció, pla, estat, progrés, tasques acabades i repertori de diàleg. Les etapes futures del repertori poden avançar la història i s’indica a la pantalla.

## Desament i validació

El desament existent s’amplia amb el rellotge, els recursos, les tasques en curs, els ingredients reservats, les càrregues i la reunió acabada. Les memòries anteriors continuen carregant-se. No hi ha servidor compartit: el progrés és propi del navegador.

Les proves recorren les 51.200 entrades, comproven identitats i relacions, simulen una jornada amb 100 personatges, validen costos i lliuraments, bloquejos, continuïtat després de desar, converses interrompudes, informes del dia anterior i rutes amb obstacles durant una reunió completa. La validació de geometria no substitueix una comprovació visual de WebGL.

La vila compacta inclou 50 veïns ordinaris, 24 identitats amb nom propi, 9 artistes adults, 12 soldats reials i 5 ninjes. El rei i la reina segueixen una rutina de cort pròpia i assisteixen a la reunió; no produeixen els béns dels oficis ordinaris. El castell, la parròquia i el pont són accessibles des del menú de llocs de la vila.

## Guàrdia reial

La vila té 100 personatges en total, incloent-hi 12 soldats amb identitats estables: sis amb espasa i escut i sis amb llança. Els seus fotogrames de píxel art modern amb proporcions realistes tenen quatre orientacions, sis poses per animació i tres estats: caminar, respirar mentre vigilen i atacar amb l’arma.

Patrullen els accessos i el perímetre exterior del castell durant tot el dia. No abandonen la guàrdia per treballar als tallers, discutir amb els veïns o assistir a la reunió del migdia. Quan el drac comença a sobrevolar la vila, es mobilitzen per camins transitables i travessen el riu pel pont. A la plaça formen dues línies, ataquen amb les armes mentre els forçuts distreuen el drac i els veïns es refugien. Quan acaba l’alarma tornen caminant als seus llocs al castell. Els pensaments i els crits reflecteixen cada fase de la defensa.

La versió visual 2 substitueix els soldats vectorials per armadures detallades, metall amb reflexos i roba amb textura. Espasa i escut mantenen els colors bordeus de la corona; els llancers porten blau. Les seqüències de combat es dibuixen en fulls separats amb espai per a tota l’arma, i es reempaqueten amb ancoratge als peus i escala constant. Hi ha textures lossless a 64, 96 i 128 píxels segons el dispositiu.

## Arquitectura

Les cases inclouen teules corbes superposades, fusteria de les golfes, motllures, porticons, vidres emplomats, jardineres, sòcols de pedra i dobles pots de xemeneia. Rocafort té quatre cobertes de pissarra amb remats, carreus en relleu, motllures al portal, escut reial, espitlleres, estendards i arcs interiors amb columnes sòlides. Tots els detalls estàtics s’agrupen per material i reutilitzen els mapes PBR. Les portes, les missions i les rutes dels habitants continuen fent servir la geometria de col·lisió compartida. El vol del drac considera la nova alçada de les torres.

## Trobades autònomes

El sistema de vida social programa onze tipus d’escena: tocar i parar, fet i amagar, pilota, cites, trobades discretes, discussions, gelosia, disculpes, balls, safareig i compartir una estona entre amics. Els participants utilitzen el graf de navegació existent i conserven el punt d’origen, els camins de feina i els recursos pagats. Les alarmes i reunions els interrompen; després retornen abans de reprendre la rutina. Els participants en una escena no es poden assignar alhora a una missió o a una altra conversa.

El registre conserva fins a 40 escenes recents i els vincles guarden afecte, confiança i nombre de trobades. Les trobades discretes poden programar retrets de la parella, i els conflictes poden desembocar en disculpes. L’afecte influeix en la tria de futures trobades. Els jocs són només per a infants; les cites i els afers són només entre adults sense parentiu, excepte les parelles ja establertes. El primer infant del rescat queda reservat per a la missió d’escorta. No cal cap servei d’IA extern.

## La Lluna Trencada

La confraria arriba amb una caravana de seda i cerca el Segell de les Hores per controlar un mecanisme ocult al castell. Aki vol impedir-ho i deixa un missatge sota el pont. El jugador ja porta el prototip del rellotger, que explica l’arma anacrònica com a part de la fantasia del món. Ha de trobar Aki, recuperar el segell a la cancelleria, resistir l’emboscada de Raiga i tres infiltrats i retornar el segell al pou. Els ninjes tenen patrulles, persecució i seqüències d’atac en quatre direccions. Moren quan arriben a zero de vida i els cossos resten a terra. Les morts i la posició es conserven a la partida. Si mor l’Aki, es pot recuperar una nota i retornar igualment el segell al pou.
