import * as T from 'three';
const textureCache=new Map();
export const materialAssets = ['medieval_blocks_03','cobblestone_floor_08','plastered_wall_02','wood_planks_grey','clay_roof_tiles','sparse_grass','bark_brown_02','rough_linen','brown_leather'];
// Only diffuse photographs contain sRGB color. Normal and roughness maps stay linear.
export function applyPBR(material,asset,{meters=2,tint=null,strength=.65,loader=new T.TextureLoader()}={}){
  if(!materialAssets.includes(asset))throw new Error('Unknown PBR asset: '+asset);
  material.userData.textureMeters=meters;
  material.userData.pbrAsset=asset;
  if(tint!==null)material.color.set(tint);
  for(const [channel,slot] of [['diff','map'],['nor_gl','normalMap'],['rough','roughnessMap']]){
    const key=asset+':'+channel;
    let texture=textureCache.get(key);
    if(!texture){
      texture=loader.load(`./assets/${asset}_${channel}.jpg`,()=>{material.needsUpdate=true;},undefined,()=>{});
      texture.colorSpace=channel==='diff'?T.SRGBColorSpace:T.NoColorSpace;
      texture.wrapS=texture.wrapT=T.RepeatWrapping;
      texture.anisotropy=8;
      textureCache.set(key,texture);
    }
    material[slot]=texture;
    if(slot==='normalMap'){material.normalScale.setScalar(strength);material.bumpMap=null;}
    material.needsUpdate=true;
  }
  return material;
}
// Project world units onto the dominant surface plane: no stretched single tile per house.
export function worldUV(geometry,meters=2){
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){
    const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i)),nz=Math.abs(n.getZ(i));
    uv[i*2]=(ny>nx&&ny>nz?p.getX(i):nx>nz?p.getZ(i):p.getX(i))/meters;
    uv[i*2+1]=(ny>nx&&ny>nz?p.getZ(i):p.getY(i))/meters;
  }
  geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
  return geometry;
}
