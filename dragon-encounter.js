export const DRAGON_HOURS=[10,17],DRAGON_DURATION=.5;
export const DRAGON_PLAZA={x:-13,y:6.6,z:-3};
export const DRAGON_RAID={descend:.25,attack:.34,ascend:.69,leave:.78};
export function dragonFlight(hours){
 if(!Number.isFinite(hours)||hours<0)return null;
 const day=Math.floor(hours/24),hour=hours-day*24;
 for(const at of DRAGON_HOURS)if(hour>=at&&hour<at+DRAGON_DURATION)return {day,at,id:`${day}:${at}`,progress:(hour-at)/DRAGON_DURATION};
 return null;
}
export function nextDragonHour(hours){const day=Math.floor(hours/24);return DRAGON_HOURS.map(h=>day*24+h).find(h=>h>hours)??(day+1)*24+DRAGON_HOURS[0];}
export function dragonPhase(t){return t<DRAGON_RAID.descend?'circling':t<DRAGON_RAID.attack?'descending':t<DRAGON_RAID.ascend?'attacking':t<DRAGON_RAID.leave?'ascending':'departing';}
export function dragonAlarm(hours){const flight=dragonFlight(hours);if(!flight)return null;const phase=dragonPhase(flight.progress);return ['descending','attacking','ascending'].includes(phase)?{...flight,phase}:null;}
