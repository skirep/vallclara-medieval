import * as T from 'three';
import {residentHeight} from './resident-scale.js';
import {thoughtOccluded} from './resident-thoughts.js';
export function createHealthOverlay(population,{layer,poses,heightAt,obstacles}){
 const elements=new Map(),v=new T.Vector3();let wait=0;
 return{update(camera,dt,enabled){wait-=dt;if(wait>0&&enabled)return;wait=.1;const used=new Set();camera.updateMatrixWorld();if(enabled)for(let i=0;i<population.length;i++){const p=population[i],pose=poses[i]??p;if(p.missionDead||Math.hypot(pose.x-camera.position.x,pose.z-camera.position.z)>22)continue;v.set(pose.x,heightAt(pose.x,pose.z)+residentHeight(p)+.26,pose.z);if(thoughtOccluded(camera.position,v,obstacles))continue;v.project(camera);if(v.z< -1||v.z>1||Math.abs(v.x)>1||Math.abs(v.y)>1)continue;let el=elements.get(p.id);if(!el){el=document.createElement('div');el.className='resident-health';const fill=document.createElement('span'),label=document.createElement('small');el.append(fill,label);layer.append(el);elements.set(p.id,el);}used.add(p.id);const ratio=Math.max(0,p.health/p.maxHealth),label=`${p.name}: ${Math.ceil(p.health)}/${p.maxHealth} de vida${p.health===0?' · mort':''}`;el.style.left=`${(v.x*.5+.5)*innerWidth}px`;el.style.top=`${(-v.y*.5+.5)*innerHeight}px`;el.firstChild.style.width=`${ratio*100}%`;el.firstChild.style.background=ratio>.5?'#72d197':ratio>.25?'#edc262':'#ee7669';el.lastChild.textContent=`${Math.ceil(p.health)}/${p.maxHealth}`;el.setAttribute('aria-label',label);el.title=label;}for(const [id,el]of elements)if(!used.has(id)){el.remove();elements.delete(id);}}
 };
}
