export const NINJA_ART={columns:6,rows:12,aspect:2,bodyFraction:.75};
export function ninjaSheetURL(height=128){if(![64,96,128].includes(height))throw Error('Unknown ninja resolution');return new URL(`./assets/packed/ninja-shadow-v1-${height}.webp`,import.meta.url).href;}
