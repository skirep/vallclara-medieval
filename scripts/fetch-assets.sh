#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p vendor assets
base=https://cdn.jsdelivr.net/npm/three@0.180.0
curl -fsSL --retry 2 "$base/build/three.module.js" -o vendor/three.module.js
curl -fsSL --retry 2 "$base/build/three.core.js" -o vendor/three.core.js
curl -fsSL --retry 2 "$base/examples/jsm/utils/BufferGeometryUtils.js" -o vendor/BufferGeometryUtils.js
curl -fsSL --retry 2 "$base/LICENSE" -o vendor/LICENSE-three.txt
for material in cobblestone_floor_08 plastered_wall_02 wood_planks_grey; do
  curl -fsSL --retry 2 "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/$material/${material}_diff_1k.jpg" -o "assets/$material.jpg" || rm -f "assets/$material.jpg"
done
