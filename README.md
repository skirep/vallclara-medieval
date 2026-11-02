# Vallclara Medieval

Poble medieval explorable de Dejoco Arts, construït amb Three.js r180. Primera versió funcional d'observació ambientada lliurement al segle XIV.

## Actualització: fotogrames, riu, pont i interiors

- **192 dibuixos de caminar** generats amb imagegen: vuit figures base × quatre vistes × sis fotogrames. Les cames, els braços i la roba canvien de dibuix; s’ha eliminat la deformació de la malla. La fase segueix la velocitat i l’edat, amb transicions de moviment i interpolació de posició. En aturar-se es conserva un pas amb suport al terra del mateix full; encara no hi ha una postura neutra dibuixada pròpia. Les converses i els oficis no tenen encara seqüències pròpies dibuixades.
- Es conserven les 500 variants i les 100 famílies. Els PNG originals, els prompts i les caixes mesurades dels fotogrames són a `assets/walk-*.png`, `assets/walk-prompts.md` i `walk-layouts.js`. Els dibuixos generats poden tenir petites variacions de proporció entre passos; cal revisar el resultat animat en dispositius reals.
- **32 plantes baixes accessibles**, sense canvi de pantalla. Portes obertes amb passos reals, finestres amb obertures, parets de gruix físic, sostre, bigues, taules, llits o bancs, cofres, prestatges, terrissa i llars de foc. Els mobles principals i les parets tenen col·lisions; el passadís central connecta les dues portes. No hi ha escala a plantes superiors ni interacció amb portes o objectes.
- Més detall arquitectònic: llindes, brancals, porticons, ampits, entramat de fusta, careners, xemeneies, materials PBR fotogràfics i llum càlida interior. Només s’activen les tres llums interiors més pròximes.
- **Riu a l’est**, amb llera excavada al terreny, meandres suaus, aigua amb reflexos d’entorn i normals animades, còdols i canyissar. **Pont de pedra transitable** amb arc de dovelles, tauler corbat i parapets. El camí de l’est connecta la vila amb l’altra riba. Les col·lisions impedeixen entrar a l’aigua; no hi ha natació ni caigudes.
- El jugador segueix l’altura del tauler del pont i del terreny. El mapa mostra el riu i el pont i el límit d’exploració s’amplia a 165 m. La simulació dels habitants continua al traçat de carrers existent; no entren automàticament als interiors ni travessen el pont.
- Vuit InstancedMesh amb quads de quatre vèrtexs, un per figura, amb textures de 1568 × 1024, filtre de píxel i alpha test. Els elements estàtics es continuen agrupant per material. Les animacions es carreguen com a WebP sense pèrdua: 7,35 MB en lloc de 17,29 MB (57,5% menys), amb el mateix canal alfa i els mateixos píxels visibles. Els PNG originals es conserven com a alternativa si el navegador no pot carregar el WebP. El botó d’entrada mostra el progrés de les deu imatges. Per regenerar les còpies optimitzades: `python scripts/encode-walk-textures.py` (Pillow; no és necessari per executar el joc ni per desplegar).
- La direcció de l’escenari és més naturalista i detallada, però **no es dona per assolit el fotorealisme**. La revisió visual WebGL i la mesura de rendiment real continuen pendents: el navegador de prova obre la previsualització però no pot crear un context WebGL 2.

## Correcció de l’alineació dels habitants

Els fotogrames ara comparteixen un ancoratge del tors i una línia de terra mesurats individualment sobre el canal alfa. Això elimina el desplaçament causat per centrar la caixa completa de la silueta i per utilitzar el mateix retall vertical per a tot un cicle. El repòs reutilitza una postura del mateix full en lloc de canviar a la il·lustració antiga, que tenia altres proporcions.

La pàgina local `scripts/sprite-review.html` permet revisar els vuit personatges, les quatre orientacions i el pas entre caminar i aturar-se amb el mateix empaquetador del joc, sense WebGL. S’ha inspeccionat aquesta vista 2D; la revisió dins del joc WebGL continua pendent. `node scripts/measure-walk-anchors.mjs` regenera les mesures sense modificar els dibuixos.

## Materials i vida social

- Materials PBR fotogràfics CC0 amb color, normals OpenGL i rugositat per a pedra medieval, llambordes, arrebossat, teules de fang, fusta, escorça, terra, lli i cuir. Escala de textura en metres i mapes compartits per reduir memòria.
- Il·luminació d’entorn HDRI de tardor i llum solar recalibrada. Mode Alta amb oclusió ambiental SSAO i antialiàsing FXAA. Mode Baixa sense aquesta postproducció ni herba geomètrica.
- Arbres amb troncs, branques i fulles geomètriques mogudes suaument pel vent. Detall de fonaments, careners i frontons; personatges representats amb sprites 2D.
- **500 biografies úniques i reproduïbles**, amb nom, origen, passat, record, temperament, preocupació, aspiració i vincles familiars i d’amistat.
- Converses autònomes per proximitat, amb pauses, gestos, torns de paraula i referències a les històries. Bafarades visibles a prop del jugador. Fins a 18 converses simultànies; sense crides a una IA remota.
- Panell **Cròniques** per consultar els 500 habitants i les últimes 80 converses. Memòries de trobades desades en aquest navegador amb localStorage; no són compartides entre dispositius. Les històries provenen de combinacions de fragments escrits, no d’una biografia redactada a mà per a cadascú.
- Veus opcionals via SpeechSynthesis del navegador. La disponibilitat i la qualitat de la veu catalana depenen del navegador i del sistema.

## Què hi ha

- Vila de pedra i entramat de fusta, plaça amb pou i vuit parades, parròquia, carros, horts, camps de cereal, corrals i bosc de tardor.
- **500 habitants simulats**, amb identitat, aparença, alçada, velocitat, domicili, lloc de treball, horari i recorregut individual. Comparteixen 12 oficis i vuit conjunts de fotogrames de caminar; no són 500 activitats úniques ni una IA generativa.
- 74 animals: ovelles, porcs, cavalls, gallines, gossos, cabres i oques, amb moviment i pauses.
- Passeig en primera persona, col·lisions contra edificis i elements sòlids, mapa, hora del dia configurable, ombres i qualitat automàtica.
- Ratolí/teclat, controls tàctils i comandament estàndard. Sense interaccions amb habitants.
- Materials amb textures fotogràfiques CC0. Arquitectura procedural i habitants amb sprites 2D. **No és una reconstrucció fotorealista ni una producció AAA**. La direcció artística dels habitants és retro modern, amb sprites 2D.

## Executar

Requisits: Node 22, Bash i curl. No requereix npm install.

```sh
bash scripts/fetch-assets.sh
npm test
npm run dev
```

Obrir http://localhost:3000. Cal WebGL 2. Les llibreries i les textures es descarreguen durant la preparació i es serveixen des del mateix origen; no es carreguen llibreries des d'un CDN durant la partida. La font web és opcional i té alternativa local.

## Controls

WASD/fletxes per caminar, Majús per córrer, ratolí/arrossegar per mirar, Esc per pausar. Mòbil: joystick esquerre i arrossegar l'escena per mirar. Comandament: estic esquerre per caminar, dret per mirar, A per entrar/córrer, B o Start per pausar. Botó ⛶ per a pantalla completa si el navegador l'admet.

## Publicació

A Settings → Pages seleccionar **GitHub Actions** com a font. El workflow `pages.yml` verifica la simulació, descarrega Three.js r180 i materials, prepara un artefacte estàtic i publica cada push a `main`. No necessita secrets d'aplicació ni cap backend.

## Rendiment i limitacions

Geometria estàtica agrupada per material i sprites amb InstancedMesh. Tots els habitants continuen simulats a 30 Hz; els llunyans deixen de dibuixar-se . Els nodes de navegació connecten els carrers; els oficis són animacions ambientals, sense economia persistent. L'hora es pausa al menú i continua durant la pantalla inicial. Les bèsties comparteixen perfils per espècie. La vila té 32 plantes baixes explorables; no té plantes superiors accessibles. No s'han fet proves de rendiment en tots els dispositius físics. Les proves automàtiques validen geometria, materials, imports, navegació, biografies, converses i memòria. La comprovació visual WebGL no s’ha pogut completar: el navegador de prova no pot crear un context WebGL 2.

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
