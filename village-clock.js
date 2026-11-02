export const TIME_RATE={min:0,max:8,step:.25};
export function validTimeRate(value){
 if(value===null||typeof value==='boolean'||typeof value==='string'&&value.trim()==='')return 1;
 const rate=Number(value);
 return Number.isFinite(rate)&&rate>=TIME_RATE.min&&rate<=TIME_RATE.max?Math.round(rate/TIME_RATE.step)*TIME_RATE.step:1;
}
export const formatHour=hours=>{
 const minutes=Math.floor(((hours%24+24)%24)*60+1e-7);
 return `${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
};
export function createVillageClock(initial=9){
 let hours=initial;
 return {get hours(){return hours;},get hour(){return (hours%24+24)%24;},
  advance(seconds,limit=Infinity){hours=Math.min(hours+Math.max(0,seconds)/180,Math.max(hours,limit));return hours;},
  restoreHours(value){if(Number.isFinite(value)&&value>=0&&value<1e7)hours=value;return hours;},
  seek(hour){hours=Math.floor(hours/24)*24+((hour%24+24)%24);return hours;}};
}
