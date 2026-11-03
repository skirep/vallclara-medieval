# Vallclara: el pacte de les dues ribes i la feina de cada dia

## Història

Tardor de 1348. Un aiguat descobreix sota el pont una fita amb dues mans. Fa trenta anys les famílies van prometre compartir l’aigua, el molí i la cura del pas. Ara es proposa un peatge, però falta el full del pacte que descrivia els drets de la riba petita.

El conflicte no té un únic malvat: algunes aportacions de feina es van escriure al costat dels préstecs, hi ha records contradictoris i les cases tenen por de perdre l’accés al molí. Mossèn Guillem recorda haver separat papers humits entre llibres. Arnau reconeix el signe de la pedra; Agnès guarda una cinta semblant; Bernat reconeix una reparació al pany, que no demostra cap robatori. Les altres cases aporten rebuts, mesures i testimonis.

Hi ha catorze veus principals amb pistes i motius propis, connectades als habitants existents. Els altres veïns també tenen família, amistat, un desacord, un testimoni i una postura sobre el pacte. La xarxa d’amistats inclou els 200 habitants.

Les quatre etapes són **La fita sota el fang**, **Els comptes de l’absència**, **Un pont que no sigui de ningú** i **La festa de les dues ribes**. La còpia contrastada reconeix el pas compartit i les obligacions de manteniment. Les cases poden tornar a seure juntes sense haver resolt tots els desacords.

Els setze fils inclouen pont, aigua, molí, pa, deutes, arca, rumors, fusta, eines, roba, ramat, infants, aprenents, cures, mercat i festa. Cada fil té quatre situacions evolutives i vuit rèpliques: **512 entrades contextuals per habitant**, consultables a Cròniques. Són escenes escrites adaptades a les dades dels habitants, no 102.400 frases escrites individualment, ni una connexió a un servei d’IA.

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

Les proves recorren les 102.400 entrades, comproven identitats i relacions, simulen una jornada amb 200 habitants, validen costos i lliuraments, bloquejos, continuïtat després de desar, converses interrompudes, informes del dia anterior i rutes amb obstacles durant una reunió completa. La validació de geometria no substitueix una comprovació visual de WebGL.

La vila compacta inclou 167 veïns ordinaris, 24 identitats amb nom propi i 9 artistes adults. El rei i la reina segueixen una rutina de cort pròpia i assisteixen a la reunió; no produeixen els béns dels oficis ordinaris. El castell, la parròquia i el pont són accessibles des del menú de llocs de la vila.

## Guàrdia reial

La vila conserva els seus 200 habitants i afegeix 12 soldats amb identitats estables: sis amb espasa i escut i sis amb llança. Els seus fotogrames vectorials tenen quatre orientacions, sis poses per animació i tres estats: caminar, respirar mentre vigilen i atacar amb l’arma.

Patrullen els accessos i el perímetre exterior del castell durant tot el dia. No abandonen la guàrdia per treballar als tallers, discutir amb els veïns o assistir a la reunió del migdia. Quan el drac comença a sobrevolar la vila, es mobilitzen per camins transitables i travessen el riu pel pont. A la plaça formen dues línies, ataquen amb les armes mentre els forçuts distreuen el drac i els veïns es refugien. Quan acaba l’alarma tornen caminant als seus llocs al castell. Els pensaments i els crits reflecteixen cada fase de la defensa.
