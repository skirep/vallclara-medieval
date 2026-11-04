import {blocked} from './simulation.js';
export function movePlayer(player,dx,dz,{obstacles=[],boundary=111,heightAt=()=>0,dt=1/60}={}){
 const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.12));for(let s=0;s<steps;s++){if(!blocked(player.x+dx/steps,player.z,obstacles,.4,boundary))player.x+=dx/steps;if(!blocked(player.x,player.z+dz/steps,obstacles,.4,boundary))player.z+=dz/steps;}
 player.y+=(heightAt(player.x,player.z)+1.72-player.y)*(1-Math.exp(-18*dt));return player;
}
export function createPlayerJump(){let height=0,velocity=0;return{start(){if(height>0||velocity>0)return false;velocity=4.2;return true;},update(dt){if(height||velocity){height+=velocity*dt;velocity-=12*dt;if(height<=0){height=velocity=0;}}return height;},reset(){height=velocity=0;},get height(){return height;}};}
export function nearbyDuelTarget(population,player,yaw,{canPunch=()=>true,visible=()=>true}={}){
 return population.map(p=>({p,d:Math.hypot(p.x-player.x,p.z-player.z)})).filter(({p,d})=>!p.missionJob&&d<2.8&&d>.2&&p.health!==0&&p.age>=18&&!p.assembly&&!p.dragonEmergency&&!p.courtSeat&&!p.playerDuel&&p.social.conversation===null&&canPunch(p)&&visible(p)&&(-(p.x-player.x)*Math.sin(yaw)-(p.z-player.z)*Math.cos(yaw))/d>.45).sort((a,b)=>a.d-b.d)[0]?.p??null;
}
