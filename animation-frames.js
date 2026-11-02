export const WALK_FRAMES=6;
import {RESIDENT_ROSTER} from './resident-roster.js';
export const WALK_TYPES=RESIDENT_ROSTER.map(r=>r.id);
export const LEGACY_TYPES=WALK_TYPES.slice(0,8);
export const IDLE_FRAMES=6;
export const IDLE_DURATIONS=[.7,.55,.14,.7,.65,.75];
export const IDLE_CYCLE=IDLE_DURATIONS.reduce((a,b)=>a+b,0);
export function idleFrame(seconds=0){let t=((seconds%IDLE_CYCLE)+IDLE_CYCLE)%IDLE_CYCLE;for(let i=0;i<IDLE_DURATIONS.length;i++){if(t<IDLE_DURATIONS[i])return i;t-=IDLE_DURATIONS[i];}return 0;}
export function drawnFrame(motion){return motion.walk>.16?Math.floor((((motion.phase%(Math.PI*2))+Math.PI*2)%(Math.PI*2))/(Math.PI*2)*WALK_FRAMES)%WALK_FRAMES:WALK_FRAMES+idleFrame(motion.idleTime);}
