# Vallclara Medieval

Poble medieval explorable de Dejoco Arts, construït amb Three.js r180. Primera versió funcional d'observació ambientada lliurement al segle XIV.

## Actualització: animació fluida, varietat i famílies

- Sprites 2D retro modern dins del poble 3D, amb front, dos perfils i esquena. **Vuit figures base amb 32 vistes**, en dos atles transparents: adults, gent gran i infants amb siluetes, cabells, davantals, caputxes i vestits diferents. Les 500 aparences són variants de paletes i proporcions, no 500 il·lustracions independents.
- Animació contínua de cames alternades, braços, tronc, respiració i gestos de conversa sobre una malla 2D subdividida. Transicions progressives entre caminar, parlar, treballar i repòs, cadència segons velocitat i edat, interpolació visual independent de la simulació a 30 Hz i girs pel camí curt. Una banda d’histèresi evita parpelleig entre vistes als límits de 45 graus.
- Les animacions són una articulació procedural del dibuix: **no són fotogrames dibuixats a mà ni moviment capturat**. Només hi ha quatre orientacions discretes. Cal comprovar visualment possibles deformacions de roba i extremitats en dispositius reals.
- **100 famílies de cinc membres**: dos infants, dos progenitors i un avi o àvia. Cognoms compartits i noms únics; parelles, filiació recíproca i edats coherents, amb 18 anys de diferència mínima entre pares i fills. No es fan servir vincles familiars arbitraris entre IDs consecutius.
- Les famílies comencen agrupades, comparteixen punt de casa i tornen al seu node de carrer abans de les 8.15 h, entre les 12.30 i les 13.30 h i des de les 18 h, quan acaba el recorregut i la pausa que tinguin en curs. Durant el dia mantenen recorreguts individuals. Les 100 llars són unitats lògiques sobre la navegació existent; no s’han creat 100 interiors o edificis nous ni seguiment físic permanent d’un progenitor.
- Cròniques agrupades per família, selector de les 100 llars i fitxa amb familiars clicables, parentiu i edats. Converses familiars diferenciades.
- Un únic InstancedMesh amb textura compartida de 768 × 2048, filtre de píxel, alpha test i profunditat. Es corregeix el marge dels peus i s’exclouen els billboards del pas de normals SSAO per evitar halos rectangulars.
- Art i prompts: `assets/residents-directions-v1.png`, `assets/residents-directions-v1.md`, `assets/residents-families-v2.png` i `assets/residents-families-v2.md`. Generats amb imagegen; els originals es reempaqueten al navegador perquè les files no són una graella exacta.
- Les proves CPU validen identitats, filiació, retrobament, suavització, orientacions, simulació, geometria i materials. **La revisió visual WebGL continua pendent** perquè el navegador de la sessió no pot accedir al servidor local.

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
- **500 habitants simulats**, amb identitat, aparença, alçada, velocitat, domicili, lloc de treball, horari i recorregut individual. Comparteixen 12 oficis i animacions procedurals; no són 500 activitats úniques ni una IA generativa.
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

Geometria estàtica agrupada per material i sprites amb InstancedMesh. Tots els habitants continuen simulats a 30 Hz; els llunyans deixen de dibuixar-se i el detall facial només s'aplica a prop. Els nodes de navegació connecten els carrers; els oficis són animacions ambientals, sense economia persistent. L'hora es pausa al menú i continua durant la pantalla inicial. Les bèsties comparteixen perfils per espècie. La vila no té interiors explorables. No s'han fet proves de rendiment en tots els dispositius físics. Les proves automàtiques validen geometria, materials, imports, navegació, biografies, converses i memòria. La comprovació visual WebGL no s'ha pogut fer en el navegador de la sessió de desenvolupament.

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
