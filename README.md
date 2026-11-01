# Vallclara Medieval

Poble medieval explorable de Dejoco Arts, construït amb Three.js r180. Primera versió funcional d'observació ambientada lliurement al segle XIV.

## Actualització: habitants 2D estil Doom

- Personatges representats amb sprites retro modern en un poble 3D: front, dos perfils i esquena segons la posició del jugador, mantenint els peus a terra.
- **150 homes, 150 dones, 100 nens i 100 nenes**. Els infants tenen entre 7 i 15 anys, proporcions més petites, històries i converses adaptades.
- **500 variants visuals deterministes** de roba, cabell, to facial i amplada. L’art parteix de **quatre personatges base amb quatre vistes cadascun**, generats amb imagegen; no són 500 il·lustracions dibuixades individualment. Les cares i siluetes comparteixen aquesta base.
- Animació procedural suau de caminar i repòs sobre el dibuix; no hi ha encara fotogrames de caminar dibuixats a mà ni sprites específics per a cada ofici.
- Un atles compartit, filtre de píxel, un únic InstancedMesh per als habitants, alpha test i profunditat per quedar ocults darrere dels edificis. La càrrega espera l’atles i mostra un error si no es pot descarregar.
- L’atles original transparent es distribueix a `assets/residents-directions-v1.png`. A la càrrega es reempaqueta per compensar l’espaiat irregular de la imatge generada i evitar retalls de caps o peus. El prompt i els crèdits són a `assets/residents-directions-v1.md`.
- Les rutines, les memòries i les converses es mantenen. El món i els animals continuen en 3D. Les proves CPU no substitueixen la revisió visual WebGL en dispositius reals.

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
