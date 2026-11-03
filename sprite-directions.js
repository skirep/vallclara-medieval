// Canonical atlas order: front, right-facing profile, back, left-facing profile.
// These source sheets were painted with their profiles in the opposite order.
const REVERSED_PROFILES=new Set(['summer-dancer','summer-athlete','summer-blonde','dragon']);
// Some original rows repeat the right-facing drawing instead of a left view.
// Mirror only the affected animation; their walking artwork is already correct.
const MIRRORED_LEFT={
 'curly-girl':new Set(['idle']),
 'freckled-girl':new Set(['idle']),
 fishmonger:new Set(['idle']),
 'elder-mason':new Set(['talk'])
};
export function spriteDirection(type,view,state='walk'){
 const sourceView=REVERSED_PROFILES.has(type)&&view%2?4-view:view;
 return {view:sourceView,flip:view===3&&!!MIRRORED_LEFT[type]?.has(state)};
}
