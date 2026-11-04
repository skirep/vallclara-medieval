// Render-only smoothing: simulation remains deterministic at 30 Hz.
import {ACTION_DURATIONS,startResidentAction} from './resident-actions.js';
const tau=Math.PI*2;
export const angleDelta=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
export function createMotion(p){return{x:p.x,z:p.z,heading:p.heading,walk:0,talk:0,work:0,action:null,actionTime:0,talkTime:0,practiceTime:0,practiceCount:0,phase:p.phase,idleTime:(p.id*.61803398875)%3.49,view:null};}
export function updateMotion(m,p,dt,simulationRate=1,speaking=p.state==='talking'){
  dt=Math.max(0,Math.min(dt,.1));
  const follow=1-Math.exp(-24*dt),blend=1-Math.exp(-9*dt);
  const previousX=m.x,previousZ=m.z;
  m.x+=(p.x-m.x)*follow;m.z+=(p.z-m.z)*follow;
  m.heading+=angleDelta(m.heading,p.heading)*(1-Math.exp(-10*dt));
  const dx=m.x-previousX,dz=m.z-previousZ;
  // A U-turn must never leave a walking sprite facing against its visible
  // displacement while the render heading catches up with the simulation.
  if(p.state==='walking'&&Math.hypot(dx,dz)>1e-5&&Math.sin(m.heading)*dx+Math.cos(m.heading)*dz< -1e-7)m.heading=Math.atan2(dx,dz);
  m.walk+=((p.state==='walking'?1:0)-m.walk)*blend;
  m.talk+=((speaking?1:0)-m.talk)*blend;
  m.work+=((p.state==='working'?1:0)-m.work)*blend;
  // Continuous phase survives state switches; faster/shorter child steps and
  // slower elderly gait, with no quantisation to the simulation tick.
  const stride=p.age<16?.48:p.age>60?.69:.77;
  m.phase=(m.phase+dt*(p.emergencySpeed??p.lifeSpeed??p.speed)/stride*tau*m.walk*simulationRate)%tau;
  m.idleTime+=dt*simulationRate*(.88+(p.id%11)*.025+m.talk*.55+m.work*.18);
  const forcedPunchTime=p.dragonPunchTime??p.duelPose?.punchTime;
  if(m.forcedPunch&&forcedPunchTime===undefined){m.action=null;m.actionTime=0;}
  m.forcedPunch=forcedPunchTime!==undefined;
  if(m.action){m.actionTime+=dt*simulationRate;if(m.actionTime>=ACTION_DURATIONS[m.action]){m.action=null;m.actionTime=0;}}
  if(p.flirtatious){
    if(p.assembly||p.state==='walking'){m.action=null;m.actionTime=0;}
    if(!p.assembly&&p.state==='working'&&m.walk<.05&&m.talk<.05&&!m.action){
      m.practiceTime+=dt*simulationRate;
      if(m.practiceTime>=10+p.id%6){startResidentAction(m,m.practiceCount++%2?'punch':'jump');m.practiceTime=0;}
    }
  }
  if(m.forcedLife&&!p.lifeAction){m.action=null;m.actionTime=0;}
  m.forcedLife=!!p.lifeAction;
  if(p.lifeAction&&forcedPunchTime===undefined){m.action=p.lifeAction.action;m.actionTime=p.lifeAction.time;}
  if(forcedPunchTime!==undefined){m.action=forcedPunchTime<ACTION_DURATIONS.punch?'punch':null;m.actionTime=forcedPunchTime;}
  m.talkTime=m.talk>.05?m.talkTime+dt*simulationRate:0;
  return m;
}
export function stableView(m,heading,observerAngle){
  const relative=observerAngle-heading;
  const sector=((Math.round(relative/(Math.PI/2))%4)+4)%4;
  if(m.view===null)m.view=sector;
  // 8 degrees of hysteresis prevent profile flicker at a 45-degree boundary.
  if(Math.abs(angleDelta(m.view*Math.PI/2,relative))>Math.PI/4+.14)m.view=sector;
  return [0,3,2,1][m.view];
}
