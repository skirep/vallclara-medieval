# Vallclara medieval

Exploració lliure en primera persona: https://skirep.github.io/vallclara-medieval/

## Vila compacta · novembre de 2026

- **200 habitants en total**: 167 veïns, els últims 24 personatges amb nom propi i 9 artistes adults (tres exemplars de cadascun dels tres nous dissenys). Es mantenen els 62 dissenys dibuixats, les famílies, les històries i les 512 entrades contextuals de diàleg per habitant.
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

Les proves cobreixen les 200 identitats, la conservació dels dissenys, les rutes entre ribes, els accessos a totes les estances i el cicle dels monarques (tron → reunió → tron), a més de les regressions de la simulació.

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
