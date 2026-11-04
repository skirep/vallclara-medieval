import * as T from 'three';
// A small shared batch keeps passing leather balls visible during children's
// games. Actor positions come from the same smoothed poses as their sprites.
export function createLifeVisuals(scene,life,population,poses,heightAt=()=>0){
 const indices=new Map(population.map((p,i)=>[p.id,i])),dummy=new T.Object3D(),balls=new T.InstancedMesh(new T.SphereGeometry(.16,12,8),new T.MeshStandardMaterial({color:'#a87b4b',roughness:.95}),4),seams=new T.InstancedMesh(new T.TorusGeometry(.162,.009,4,16),new T.MeshStandardMaterial({color:'#453224',roughness:1}),8);
 balls.name='Pilotes dels jocs dels infants';seams.name='Costures de cuir de les pilotes';balls.frustumCulled=seams.frustumCulled=false;balls.castShadow=true;balls.receiveShadow=true;scene.add(balls,seams);
 function update(camera){const games=life.activities.filter(g=>g.phase==='acting'&&g.ball).slice(0,4);
  for(let i=0;i<4;i++){const game=games[i],ball=game?.ball,from=ball?poses[indices.get(ball.from)]:null,to=ball?poses[indices.get(ball.to)]:null,t=ball?.t??0,x=from?from.x+(to.x-from.x)*t:0,z=from?from.z+(to.z-from.z)*t:0,y=heightAt(x,z)+.18+Math.sin(t*Math.PI)*.7,visible=!!ball&&Math.hypot(x-camera.x,z-camera.z)<60;
   dummy.position.set(x,y,z);dummy.rotation.set(t*6,game?.age??0,0);dummy.scale.setScalar(visible?1:0);dummy.updateMatrix();balls.setMatrixAt(i,dummy.matrix);
   for(let j=0;j<2;j++){dummy.rotation.set(t*6,game?.age??0,j*Math.PI/2);dummy.updateMatrix();seams.setMatrixAt(i*2+j,dummy.matrix);}
  }balls.instanceMatrix.needsUpdate=true;seams.instanceMatrix.needsUpdate=true;
 }
 update({x:0,z:0});return{update,balls,seams};
}
