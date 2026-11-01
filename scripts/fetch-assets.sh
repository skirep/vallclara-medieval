#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p vendor assets
base=https://cdn.jsdelivr.net/npm/three@0.180.0
get() { local url="$1" target="$2"; if [[ -s "$target" ]]; then return; fi; mkdir -p "$(dirname "$target")"; curl -fsSL --connect-timeout 15 --max-time 100 --retry 2 "$url" -o "$target.tmp" && mv "$target.tmp" "$target"; }
get "$base/build/three.module.js" vendor/three.module.js
get "$base/build/three.core.js" vendor/three.core.js
get "$base/examples/jsm/utils/BufferGeometryUtils.js" vendor/BufferGeometryUtils.js
get "$base/LICENSE" vendor/LICENSE-three.txt
modules=(postprocessing/EffectComposer postprocessing/RenderPass postprocessing/ShaderPass postprocessing/MaskPass postprocessing/Pass postprocessing/SSAOPass postprocessing/OutputPass shaders/CopyShader shaders/SSAOShader shaders/OutputShader shaders/FXAAShader math/SimplexNoise loaders/HDRLoader)
for module in "${modules[@]}"; do get "$base/examples/jsm/$module.js" "vendor/addons/$module.js" & done
wait
materials=(medieval_blocks_03 cobblestone_floor_08 plastered_wall_02 wood_planks_grey clay_roof_tiles sparse_grass bark_brown_02 rough_linen brown_leather)
for material in "${materials[@]}"; do
  for channel in diff nor_gl rough; do
    source_channel="$channel"
    if [[ "$material" == brown_leather && "$channel" == diff ]]; then source_channel=albedo; fi
    get "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/$material/${material}_${source_channel}_1k.jpg" "assets/${material}_${channel}.jpg" &
  done
  wait
done
get "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/autumn_field_puresky_1k.hdr" assets/autumn_field_puresky.hdr
# Make an incomplete download fail CI instead of deploying missing imports/materials.
for module in "${modules[@]}"; do test -s "vendor/addons/$module.js"; done
for material in "${materials[@]}"; do for channel in diff nor_gl rough; do test -s "assets/${material}_${channel}.jpg"; done; done
