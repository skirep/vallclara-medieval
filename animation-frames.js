export const WALK_FRAMES=6;
export const WALK_TYPES=['tunic-man','dress-woman','boy','girl','smith','elder-woman','hood-boy','cap-girl'];
export function drawnFrame(motion){return motion.walk>.16?Math.floor((motion.phase%(Math.PI*2))/(Math.PI*2)*WALK_FRAMES)%WALK_FRAMES:WALK_FRAMES;}
