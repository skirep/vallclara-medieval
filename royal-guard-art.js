// Authored realistic pixel-art animation, packed at the device's resolution.
// Body and foot anchors share a fixed scale across walk, idle and attacks.
export const ROYAL_GUARD_ART={version:2,columns:6,rows:12,aspect:2,bodyFraction:195/256};
export function royalGuardSheetURL(weapon,pixelHeight=128){
 if(!['sword','spear'].includes(weapon))throw Error('Unknown royal weapon');
 if(![64,96,128].includes(pixelHeight))throw Error('Unknown guard resolution');
 return new URL(`./assets/packed/royal-guard-${weapon}-v2-${pixelHeight}.webp`,import.meta.url).href;
}
