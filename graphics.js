import * as T from 'three';
import {HDRLoader} from './vendor/addons/loaders/HDRLoader.js';
import {EffectComposer} from './vendor/addons/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/addons/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/addons/postprocessing/SSAOPass.js';
import {ShaderPass} from './vendor/addons/postprocessing/ShaderPass.js';
import {OutputPass} from './vendor/addons/postprocessing/OutputPass.js';
import {FXAAShader} from './vendor/addons/shaders/FXAAShader.js';
export function createGraphics(renderer,scene,camera){
  let composer=null,ao=null,fxaa=null,hdriReady=false;
  const pmrem=new T.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  new HDRLoader().load('./assets/autumn_field_puresky.hdr',texture=>{
    try{scene.environment=pmrem.fromEquirectangular(texture).texture;hdriReady=true;}finally{texture.dispose();pmrem.dispose();}
  },undefined,()=>pmrem.dispose());
  const size=new T.Vector2();
  function resize(){if(!composer)return;renderer.getSize(size);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(size.x,size.y);const d=renderer.getPixelRatio();fxaa.material.uniforms.resolution.value.set(1/(size.x*d),1/(size.y*d));}
  function quality(level){
    if(level==='high'&&!composer){
      renderer.getSize(size);
      composer=new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene,camera));
      ao=new SSAOPass(scene,camera,size.x,size.y,16);
      // A normal override material ignores a sprite's cutout and would create
      // rectangular AO ghosts. Keep billboards out of the normal/depth prepass;
      // they are already present in RenderPass with proper alpha and occlusion.
      const overrideVisibility=ao._overrideVisibility.bind(ao);
      ao._overrideVisibility=()=>{overrideVisibility();scene.traverse(o=>{if(o.userData.spriteBillboard&&o.visible){o.visible=false;ao._visibilityCache.push(o);}});};
      ao.kernelRadius=1.1;ao.minDistance=.0004;ao.maxDistance=.018;
      composer.addPass(ao);
      fxaa=new ShaderPass(FXAAShader);composer.addPass(fxaa);
      composer.addPass(new OutputPass());
      resize();
    }else if(level!=='high'&&composer){
      for(const pass of composer.passes)pass.dispose?.();
      composer.dispose();composer=null;ao=null;fxaa=null;
    }
  }
  function render(){if(composer)composer.render();else renderer.render(scene,camera);}
  return {quality,resize,render,get hdriReady(){return hdriReady;}};
}
