# Ninjes i pistola del rellotger — art v1

Generated using the built-in image-generation tool; packed losslessly with `scripts/pack-ninja-art.cjs`. The original generated PNGs are source inputs, while the runtime uses the four WebP files below.

## Runtime files

- `assets/packed/ninja-shadow-v1-64.webp`
- `assets/packed/ninja-shadow-v1-96.webp`
- `assets/packed/ninja-shadow-v1-128.webp`
- `assets/pistol-clockwork-v1.webp`

The ninja atlas has six columns and twelve rows: four walking directions, four idle directions and four attack directions. Feet share a fixed baseline, scale stays constant across poses, and nearest-neighbour sampling keeps pixel edges crisp. The pistol is a transparent first-person view sprite.

## Source inputs

1. `exec-7fbcb4df-8882-4098-9927-48e13c5a4a26.png` — walking and idle
2. `exec-953c0143-c28a-4ed0-a229-08576f7e06cb.png` — attack
3. `exec-d140a98a-637f-4a07-a47b-1685a15e16b0.png` — pistol

## Walking / idle prompt

Use case: stylized-concept. Production animation sprite atlas for a videogame. Modern realistic PIXEL ART ninja, normal adult human proportions, detailed indigo/charcoal cloth and wrapped forearms/calves, dark fabric mask leaving only eyes visible, dark red waist sash, short sheathed sword on back. Premium crisp hand placed pixel clusters, subtle cool rimlight and cloth highlights, no cartoon outlines, no chibi, no smooth vector shapes. Ground-level orthographic character views for billboard sprites in a 3D game, NOT isometric top-down. Fully transparent background. EXACTLY SIX columns and EIGHT rows in an even regular grid, 48 full-body sprites. Portrait 3:4 canvas, preferably1536x2048. Each sprite takes about70 percent of cell height, ample transparent gutters, entire head, feet and all equipment inside its own cell, never overlapping neighbours. ALL48 sprites same identity, scale and equipment. Row1: six consecutive walking frames facing FRONT. Row2: six walking frames facing LEFT. Row3: six walking frames BACK. Row4: six walking frames RIGHT. Row5: six subtle breathing/weight-shift idle frames FRONT. Row6: idle LEFT. Row7: idle BACK. Row8: idle RIGHT. Actually alternate feet and bend knees in walk cycle, flowing fabric, stable head heights. Feet aligned across frames. No lettering, labels, grid lines, ground, cast shadows, glow, scenery, extra characters or cropped body parts.

## Attack prompt

STYLE AND IDENTITY reference: the indigo ninja in the supplied sheet. Create a new WIDE LANDSCAPE 3:2 animation atlas, preferably1536x1024. EXACTLY SIX equal columns and FOUR equal rows, 24 full-body sprites. Modern realistic crisp PIXEL ART with natural human proportions matching the reference. Same masked adult ninja, dark indigo cloth, charcoal wraps, dark red sash. Ninja draws a short curved sword and attacks with it. Row1 FRONT, row2 LEFT facing left, row3 BACK, row4 RIGHT facingright. Each row contains six consecutive stages: ready, draw/windup, lifted blade, full slash/lunge, recovery, ready. Full sword must be visible in every attack stage, no disappearing blades or detached weapon pieces. A SMALL full-body character occupying only60 percent of each square cell height with ample padding on all sides for sword swings. All figures and weapons isolated inside their own cells without overlap. Same scale and foot baseline throughout. Fully transparent background, no shadows, no gradients, no floor, no text, no gridlines, no extra characters. Preserve the reference's cloth details, hooded mask and pixel-art material shading. WIDE canvas 6 sprites across, 4 rows down.

## Pistol prompt

Use case: stylized-concept. A single first-person videogame weapon HUD sprite on fully transparent background: a fantasy clockwork PISTOL held in one gloved right hand, seen from the player's point of view looking forward down the barrel, an unmistakable pistol silhouette with compact dark steel barrel and mechanism, aged brass fittings and carved dark walnut grip. Fictional magical design for a medieval fantasy game, no real-world make, branding, text, diagrams or separated parts. Modern realistic PIXEL ART, crisp detailed pixel clusters, natural proportions and strong readable silhouette; premium retro-modern game sprite matching detailed medieval pixel characters. The wrist/forearm enters from the bottom right corner and the pistol muzzle points toward the upper centre, in an aiming-ready FPS pose. Whole muzzle, gun and gloved hand inside frame with transparent margin, forearm may continue off the bottom edge. Square768x768 preferred. No muzzle flash, smoke, background, ground or cast shadow, no extra weapons or extra hands.

