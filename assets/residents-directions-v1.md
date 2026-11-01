# Art dels habitants — Vallclara

Creat per al projecte amb l’eina integrada imagegen, 1 de novembre de 2026. PNG RGBA transparent original, 1254 × 1254 píxels. Quatre personatges originals amb quatre vistes. No utilitza sprites extrets de Doom; la referència és la tècnica 2.5D de billboards.

## Prompt original

Use case: historical-scene. Asset type: production game sprite atlas for a medieval village FPS, Doom-like 2.5D with modern detailed pixel art. Create ONE transparent PNG atlas, square, EXACTLY 4 columns x 4 rows equal cells, no grid lines, no text, no ground, no shadows outside characters. Each cell shows ONE complete head-to-toe medieval Catalan villager, feet at same bottom baseline, centered with generous transparent padding. Rows 1 and 2: adult man then adult woman; row 3 young boy age 8; row 4 young girl age 8. Every row SAME character rotating across four columns: FRONT, LEFT SIDE PROFILE, BACK, RIGHT SIDE PROFILE. Front camera at chest height, orthographic, not isometric. Natural relaxed standing stance with separated feet, arms by sides. Man short brown hair beard, moss green linen tunic brown belt leggings boots. Woman cream coif, rust red dress cream apron brown shoes. Boy short brown hair ochre tunic leggings boots. Girl braided hair blue long dress shoes. Medieval 14th century peasant clothing, original characters no copyrighted characters. High detail textured cloth, readable face anatomy, carefully shaded retro modern pixel art like a premium remaster of a 1990s FPS sprite, dark outline edges, warm muted earth palette, neutral consistent illumination. All four views of a row must have identical outfit, size and proportions. Absolutely transparent background.

## Integració

L’atles generat té files espaiades irregularment. `people-sprites.js` el reempaqueta en un canvas de 1024 × 1536 amb cel·les de 256 × 384 i marges transparents abans d’utilitzar-lo com a textura. L’original no es modifica. Paletes i proporcions es calculen a `appearance.js`; la identitat no depèn de la qualitat gràfica ni del temps de partida.
