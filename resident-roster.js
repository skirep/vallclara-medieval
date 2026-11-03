import {FEATURED_RESIDENTS} from './featured-residents.js';
// Distinct painted characters; no runtime skin, hair or clothing recoloring.
const groups={
 'adult-male':'baker fisherman carpenter stonemason potter tanner merchant scribe guard innkeeper farmer monk',
 'adult-female':'baker-wife fishmonger weaver potter-wife seamstress innkeeper-wife merchant-wife washerwoman beekeeper noblewoman farmer-wife musician-woman',
 'elder-male':'shepherd elder-mason elder-scribe elder-farmer elder-merchant elder-fisher elder-carpenter elder-monk',
 'elder-female':'shepherdess elder-weaver elder-baker elder-noblewoman elder-herbalist elder-seamstress elder-washerwoman elder-widow',
 boy:'boy-baker boy-fisher boy-carpenter boy-weaver boy-shepherd boy-miller boy-merchant boy-potter boy-stable boy-school boy-orchard boy-tanner',
 girl:'girl-baker girl-fisher girl-carpenter girl-weaver girl-shepherd girl-miller girl-merchant girl-potter girl-stable girl-school girl-orchard girl-tanner'
};
export const NEW_RESIDENTS=Object.entries(groups).flatMap(([category,ids])=>ids.split(' ').map(id=>({id,category})));
export const ORIGINAL_RESIDENTS=[
 ['tunic-man','adult-male'],['dress-woman','adult-female'],['boy','boy'],['girl','girl'],
 ['smith','adult-male'],['elder-woman','elder-female'],['hood-boy','boy'],['cap-girl','girl'],
 ['miller','adult-male'],['herbalist','adult-female'],['red-boy','boy'],['curly-girl','girl'],
 ['priest','priest'],['midwife','elder-female'],['apprentice-boy','boy'],['freckled-girl','girl']
].map(([id,category])=>({id,category}));
// Activate a design only after its painted sheet passes frame and alpha checks.
export const READY_RESIDENT_IDS=new Set('baker baker-wife fisherman fishmonger carpenter weaver shepherd shepherdess boy-baker girl-baker stonemason potter-wife potter seamstress elder-mason elder-weaver boy-fisher girl-fisher girl-carpenter'.split(' '));
export const PLANNED_RESIDENT_ROSTER=[...ORIGINAL_RESIDENTS,...NEW_RESIDENTS,...FEATURED_RESIDENTS];
export const RESIDENT_ROSTER=[...ORIGINAL_RESIDENTS,...NEW_RESIDENTS.filter(r=>READY_RESIDENT_IDS.has(r.id)),...FEATURED_RESIDENTS];
export const RESIDENT_CHOICES=Object.fromEntries([...Object.keys(groups),'priest'].map(category=>[category,RESIDENT_ROSTER.flatMap((r,i)=>r.category===category&&!r.featured?[i]:[])]));
export function categoryFor(p){return p.role==='priest'?'priest':p.age<16?(p.sex?'girl':'boy'):`${p.age>=60?'elder':'adult'}-${p.sex?'female':'male'}`;}
