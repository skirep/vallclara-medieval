# Vallclara: character batch 02

Generated with the built-in image generation tool. Reference: `resident-baker.png`, used for rendering style and the 6-column by 8-row layout only.

## New character prompts

- `boy-baker`: a 10-year-old medieval Catalan baker's son, round face, short wavy brown hair, flour-dusted maroon tunic, short cream apron, beige leggings and brown shoes; child proportions, cheerful.
- `girl-baker`: an 11-year-old medieval Catalan baker's daughter, freckled face, auburn braided hair, ochre dress, small cream apron and brown shoes; child proportions, confident.
- `stonemason`: a tall muscular medieval Catalan stonemason man aged 42, square face, short salt-and-pepper beard, bald crown, gray linen shirt, russet sleeveless leather work jerkin, dark trousers, leather boots, no handheld tools.
- `potter-wife`: a medieval Catalan woman potter aged 35, olive skin, dark curly hair tied with a terracotta headband, sage-green dress, clay-stained terracotta apron, brown shoes, strong broad build, no handheld tools.

## Shared sheet specification

Production game sprites, detailed painterly retro-modern rendering. One consistent character per sheet, 48 full-body drawings arranged in six columns and eight rows. Rows 1–4: six consecutive walking frames, facing front, right, back, left. Rows 5–8: six distinct idle gestures for the same directions. Consistent clothing, identity, scale, torso anchor and foot baseline; clear gaps between cells. Portrait 1024 × 1536, true transparent background, no ground/shadows/text/lines/weapons/props. Idle gestures include breathing, glances, hand on hip, small greeting, scratching head and settling.

## Review

The initial stonemason sheet contained an idle gesture in the left-facing walking row. A targeted edit corrected that row before runtime activation. File presence alone is not proof of visual acceptance.

The roster contains 80 planned designs; only completed sheets belong in `RESIDENT_ROSTER`. Remaining designs must not trigger missing-asset requests during startup.

## Batch contents

Twelve additional designs: baker, baker-wife, fisherman, fishmonger, carpenter, weaver, shepherd, shepherdess, boy-baker, girl-baker, stonemason, potter-wife. The first eight continue the earlier pending batch; the last four were generated in this session. Total active roster: 28 designs / 1,344 painted frame regions. Remaining target: 52 designs.

Validation checks source frame uniqueness, source bounds, foot and torso alignment, packed texture dimensions and budget, PNG fallbacks, deterministic age/sex assignments and simulation behavior. Visual inspection covers source sheets; interactive WebGL rendering has not been verified in this batch.
