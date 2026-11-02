# Vallclara: character batch 03

Generated with the built-in image generation tool, matching the existing painted sprites and preserving natural clothing colors.

## Accepted runtime designs

- Potter, seamstress, elder mason, elder weaver, fisher boy and carpenter girl: 48 walking/idle frames plus 72 jump/punch/talk frames each.
- Fisher girl: 48 walking/idle frames plus 48 jump/talk frames. Punch is unavailable after the image generator rejected the combined action sheet. The runtime and gallery expose only available actions.
- Total active roster: 35 of 80 planned designs. The previous 28 retain their walking/idle animations; expanded actions apply to this new batch only.

## Pending design

The carpenter boy is not active. Generation attempts returned incomplete direction rows, a non-walking pose in the left-facing walking sequence, and a right-facing jump row where a left profile was required. Further requests for idle and left-jump drawings were rejected by the image generator. Candidate source sheets are preserved under `docs/art/pending/boy-carpenter/`; they must not be activated until corrected and validated.

## Animation specification

Six genuinely drawn poses per orientation. Directions: front, right profile, back, left profile. Walking/idle sources contain eight rows. Jump/talk sources are measured separately from the reviewed 24-frame punch sheets; approved per-action replacements override malformed rows. Packing crops existing artwork and preserves alpha. The packer never invents frames, recolors characters or substitutes procedural limb animation.

Jump: crouch, push-off, rise, apex, descend, landing. The rendered root follows a small arc while the body uses the painted poses. Punch: ready, draw back, wind-up, extend, retract, recover. Conversation: listening, speech onset, open-palm explanation, another syllable, nod, settle. Only the current speaker animates speech in-game.

The gallery exposes all available actions and filters unsupported characters. Jump and punch can be triggered through `people.playAction(residentId, action)` for future gameplay events; no combat rules are introduced.

## Character prompts

- `potter`: a lean medieval Catalan potter man aged 38, long narrow face, dark beard, tied-back black hair, dusty teal tunic, clay-stained tan apron, dark trousers, leather shoes.
- `seamstress`: a medieval Catalan seamstress woman aged 29, narrow expressive face, straight chestnut hair under a linen coif, burgundy dress, charcoal sleeveless bodice, narrow ochre belt, brown shoes.
- `elder-mason`: a sturdy elderly medieval Catalan mason man aged 72, weathered square face, white moustache, sparse white hair, russet tunic, gray wool waistcoat, charcoal trousers, work boots; no cane.
- `elder-weaver`: an elderly medieval Catalan weaver woman aged 68, rounded wrinkled face, silver hair in a bun, dusty blue dress, cream shawl, rust apron, brown shoes; no cane.
- `boy-fisher`: a 9-year-old medieval Catalan fisher family's son, child proportions, narrow freckled face, straight sandy hair under a soft blue cap, faded blue tunic, ochre vest, brown leggings and ankle boots.
- `girl-fisher`: a 10-year-old medieval Catalan fisher family's daughter, child proportions, short dark curly hair held by a blue headscarf, blue-gray knee-length dress, small ochre apron, brown leggings and ankle boots.
- `boy-carpenter`: a 12-year-old medieval Catalan carpenter family's son, child proportions, stocky build, short curly black hair, moss-green tunic, brown leather work apron, tan leggings, dark shoes.
- `girl-carpenter`: a 12-year-old medieval Catalan carpenter family's daughter, child proportions, strong build, chestnut hair in a braid with green ribbon, cream blouse, green dress, brown leather work apron, sturdy shoes.

Shared prompts request true transparency, a fixed camera direction per row, consistent identity/outfit/scale, complete heads/hands/feet, clear gutters, and no labels, shadows, scenery, weapons or targets. Large sheets with missing rows were replaced with smaller per-action sheets where necessary. The carpenter boy remains a draft rather than substituting unrelated animations.

## Validation

All 42 automated tests pass, covering source frame uniqueness, atlas bounds and foot alignment, action timing/recovery, village-time pause, current-speaker animation, PNG fallbacks, packed texture dimensions and age/sex assignment. Source sheets were visually inspected. Interactive browser rendering could not be checked locally because the installed Playwright package lacks its Chromium executable.
