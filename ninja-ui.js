import * as T from 'three';
import {NINJA_STORY,NINJA_STEPS,ARMORY} from './ninja-story.js';
export function createNinjaUI({scene,camera,weapon,story,heightAt=()=>0,onPlay=()=>{},onSave=()=>{},onShotSound=()=>{}}){
 const $=s=>document.querySelector(s),view=$('#weaponView'),info=$('#weaponInfo'),tracker=$('#ninjaTracker'),flash=$('#weaponFlash'),fireButton=$('#fireButton');
 let ctx=null,held=false,seenShot=0,flashLeft=0,padReload=false;
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(new Float32Array(6),3));const tracer=new T.Line(geometry,new T.LineBasicMaterial({color:'#ffe4a3',transparent:true,opacity:.85}));tracer.visible=false;scene.add(tracer);
 const impact=new T.Mesh(new T.SphereGeometry(.045,6,4),new T.MeshBasicMaterial({color:'#ffcf70'}));impact.visible=false;scene.add(impact);
 const marker=new T.Mesh(new T.TorusGeometry(.58,.045,5,24),new T.MeshBasicMaterial({color:'#82c4e8'}));marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);
 const enabled=()=>!!ctx?.playing&&ctx.gameMode&&!ctx.following&&!ctx.busy&&!ctx.modal&&ctx.timeRate>0;
 function fire(){if(!enabled())return null;const dir=new T.Vector3();camera.getWorldDirection(dir);return weapon.fire(camera.position,dir,{enabled:true});}
 function reload(){if(!enabled())return false;if(Math.hypot(ctx.player.x-ARMORY.x,ctx.player.z-ARMORY.z)<4){weapon.refill();onSave();return true;}const result=weapon.reload();if(result)onSave();return result;}
 function interact(){if(!enabled())return false;const ok=story.interact(ctx.player);if(ok){if(story.stage===2||story.stage===3)weapon.refill();onSave();}return ok;}
 function toggle(){if(!ctx?.playing||!ctx.gameMode)return false;held=false;weapon.toggle();onSave();return true;}
 function key(code){if(!ctx?.playing||!ctx.gameMode)return false;if(code==='KeyX'){fire();return true;}if(code==='KeyC'){reload();return true;}if(code==='KeyG')return toggle();if(code==='KeyV'){interact();return true;}return false;}
 function setTrigger(value){held=value&&enabled()&&weapon.equipped;if(held)fire();}
 fireButton.onpointerdown=e=>{e.preventDefault();e.stopPropagation();fireButton.setPointerCapture(e.pointerId);setTrigger(true);};fireButton.onpointerup=fireButton.onpointercancel=()=>setTrigger(false);
 $('#reloadButton').onclick=reload;$('#holsterButton').onclick=toggle;$('#ninjaInteract').onclick=interact;$('#ninjaStoryStart').onclick=()=>{$('#missions').close();onPlay();};
 function pad(gamepad){if(enabled()&&gamepad.buttons[7]?.pressed)fire();const pressed=!!gamepad.buttons[3]?.pressed;if(pressed&&!padReload)reload();padReload=pressed;}
 function update(dt,context){ctx=context;const playing=ctx.playing&&ctx.gameMode&&!ctx.following;
  view.hidden=!playing||!weapon.equipped;info.hidden=!playing;fireButton.hidden=!playing;$('#reloadButton').hidden=!playing;$('#holsterButton').hidden=!playing;
  if(!enabled())held=false;if(held)fire();
  $('#ammoReadout').textContent=`${weapon.ammo}/6 · Reserva ${weapon.reserve} · Vida ${Math.ceil(weapon.health)}/100`;
  $('#weaponNotice').textContent=weapon.notice;view.classList.toggle('reloading',weapon.reloading);$('#holsterButton').textContent=weapon.equipped?'Guardar · G':'Pistola · G';fireButton.disabled=!enabled()||!weapon.equipped;
  const event=weapon.lastShot;if(event&&event.id!==seenShot){seenShot=event.id;flashLeft=.13;const p=geometry.attributes.position;p.setXYZ(0,event.origin.x+event.direction.x*.55,event.origin.y+event.direction.y*.55,event.origin.z+event.direction.z*.55);p.setXYZ(1,event.point.x,event.point.y,event.point.z);p.needsUpdate=true;geometry.computeBoundingSphere();impact.position.set(event.point.x,event.point.y,event.point.z);view.classList.remove('firing');void view.offsetWidth;view.classList.add('firing');$('#reticle').classList.toggle('pistol-hit',!!event.person);onShotSound();onSave();}
  flashLeft=Math.max(0,flashLeft-dt);flash.hidden=flashLeft===0;tracer.visible=impact.visible=flashLeft>0&&playing;if(!flashLeft)$('#reticle').classList.remove('pistol-hit');
  const target=story.target(),distance=target?Math.hypot(target.x-ctx.player.x,target.z-ctx.player.z):0;
  tracker.hidden=!playing||story.completed;$('#ninjaTitle').textContent=`🌘 ${NINJA_STORY.title} · ${Math.min(story.stage+1,NINJA_STEPS.length)}/${NINJA_STEPS.length}`;
  $('#ninjaObjective').textContent=target?`${target.title} · ${Math.ceil(distance)} m${target.combat?` · ${story.defeated}/4`:''}`:'Trama completada';$('#ninjaNotice').textContent=story.notice;
  const button=$('#ninjaInteract');button.hidden=!target||target.combat;button.disabled=!enabled()||distance>3.2;button.textContent='Interactuar · V';marker.visible=playing&&!!target;if(target)marker.position.set(target.x,heightAt(target.x,target.z)+.1,target.z);
  $('#ninjaStoryTitle').textContent=`🌘 ${NINJA_STORY.title}`;$('#ninjaStoryIntro').textContent=NINJA_STORY.intro;$('#ninjaStoryProgress').textContent=story.completed?NINJA_STORY.ending:target?.title??story.notice;
 }
 return{update,fire,reload,key,setTrigger,pad,interact,marker};
}
