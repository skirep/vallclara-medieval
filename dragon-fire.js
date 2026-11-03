import * as T from 'three';
export const FLAME_LENGTH=19;
export function fireEnvelope(progress){
 if(progress<.12||progress>.88)return 0;
 const beat=((progress-.12)*90)%9;return beat<2.8?Math.min(1,beat/.25,(2.8-beat)/.45):0;
}
export function createDragonFire(scene){
 const geometry=new T.PlaneGeometry(1,1,24,1),material=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{uTime:{value:0},uStrength:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 vUv;uniform float uTime;uniform float uStrength;
 void main(){float x=vUv.x,y=abs(vUv.y-.5)*2.;float flicker=.82+.12*sin(x*56.-uTime*24.)+.06*sin(x*111.+uTime*17.);float width=mix(.14,1.,pow(x,.7))*flicker;float edge=1.-smoothstep(width*.48,width,y);float tip=1.-smoothstep(.72,1.,x);float tongue=.75+.25*sin(x*73.-uTime*28.+vUv.y*15.);float a=edge*tip*tongue*uStrength;vec3 color=mix(vec3(1.,.11,.012),vec3(1.,.88,.37),pow(max(0.,1.-y/max(width,.01)),2.));gl_FragColor=vec4(color,a);}`});
 // The ribbon is drawn in the world and faces the observer along its length.
 const mesh=new T.Mesh(geometry,material);mesh.name='Flamarada llarga del drac';mesh.visible=false;mesh.frustumCulled=false;scene.add(mesh);
 const light=new T.PointLight('#ff8b26',0,25,2);scene.add(light);const direction=new T.Vector3(),side=new T.Vector3(),toCamera=new T.Vector3(),center=new T.Vector3(),mouth=new T.Vector3();
 function update(position,heading,observer,time,strength){mesh.visible=strength>0;light.intensity=strength*16;if(!mesh.visible)return;
  direction.set(Math.sin(heading),-.035,Math.cos(heading)).normalize();mouth.copy(position).addScaledVector(direction,3.4);mouth.y-=.55;toCamera.set(observer.x-mouth.x,(observer.y??mouth.y+2)-mouth.y,observer.z-mouth.z);side.crossVectors(direction,toCamera).normalize();if(side.lengthSq()<.01)side.set(0,1,0);
  const pos=geometry.attributes.position,uv=geometry.attributes.uv,length=FLAME_LENGTH*(.65+.35*strength);for(let i=0;i<pos.count;i++){const t=uv.getX(i),width=(uv.getY(i)-.5)*3.4;center.copy(mouth).addScaledVector(direction,t*length).addScaledVector(side,width);pos.setXYZ(i,center.x,center.y,center.z);}pos.needsUpdate=true;geometry.computeBoundingSphere();material.uniforms.uTime.value=time;material.uniforms.uStrength.value=strength;light.position.copy(mouth).addScaledVector(direction,4);
 }
 return{mesh,light,update};
}
