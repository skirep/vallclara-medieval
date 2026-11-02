// Render-only smoothing: simulation remains deterministic at 30 Hz.
const tau=Math.PI*2;
export const angleDelta=(from,to)=>Math.atan2(Math.sin(to-from),Math.cos(to-from));
export function createMotion(p){return{x:p.x,z:p.z,heading:p.heading,walk:0,talk:0,work:0,phase:p.phase,view:null};}
export function updateMotion(m,p,dt,simulationRate=1){
  dt=Math.max(0,Math.min(dt,.1));
  const follow=1-Math.exp(-24*dt),blend=1-Math.exp(-9*dt);
  m.x+=(p.x-m.x)*follow;m.z+=(p.z-m.z)*follow;
  m.heading+=angleDelta(m.heading,p.heading)*(1-Math.exp(-10*dt));
  m.walk+=((p.state==='walking'?1:0)-m.walk)*blend;
  m.talk+=((p.state==='talking'?1:0)-m.talk)*blend;
  m.work+=((p.state==='working'?1:0)-m.work)*blend;
  // Continuous phase survives state switches; faster/shorter child steps and
  // slower elderly gait, with no quantisation to the simulation tick.
  const stride=p.age<16?.48:p.age>60?.69:.77;
  m.phase=(m.phase+dt*p.speed/stride*tau*m.walk*simulationRate)%tau;
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
