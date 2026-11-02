"""Pack existing painted frames at device resolutions; never invent animation frames.

Run after measuring source rectangles: python scripts/pack-resident-textures.py.
Source PNGs remain unchanged. Runtime sheets use the same 6 x 8 UV grid as the
browser packer, with alpha preserved and no runtime recoloring.
"""
from pathlib import Path
import argparse
import json
import subprocess
from PIL import Image

root = Path(__file__).resolve().parent.parent
spec = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    "import {WALK_TYPES} from './animation-frames.js';"
    "import {RESIDENT_ASSETS,RESIDENT_SOURCES} from './resident-assets.js';"
    "import {framePlacement} from './sprite-atlas.js';"
    "console.log(JSON.stringify(WALK_TYPES.map(type=>({type,files:Object.fromEntries(Object.entries(RESIDENT_SOURCES[type]).map(([state,i])=>[state,RESIDENT_ASSETS[i].fallback])),sizes:[64,96,128].map(height=>({height,frames:Array.from({length:48},(_,i)=>framePlacement(type,i%4,Math.floor(i/4),height))}))}))));"
], cwd=root, text=True))
target = root / 'assets' / 'packed'
target.mkdir(exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--only', nargs='+', help='Repack selected completed resident IDs')
args = parser.parse_args()
if args.only:
    unknown = set(args.only) - {r['type'] for r in spec}
    if unknown:
        parser.error(f'Unknown completed resident IDs: {sorted(unknown)}')
    spec = [r for r in spec if r['type'] in args.only]
total = 0
for resident in spec:
    images = {state: Image.open(root / 'assets' / path).convert('RGBA')
              for state, path in resident['files'].items()}
    for size in resident['sizes']:
        height = size['height']
        atlas = Image.new('RGBA', (int(height * .875 * 6), height * 8))
        for p in size['frames']:
            frame = images[p['state']].crop((p['sx'], p['sy'], p['sx'] + p['sw'], p['sy'] + p['sh']))
            # Round destination edges together to avoid one-pixel holes or drift.
            x, y = round(p['dx']), round(p['dy'])
            w, h = round(p['dx'] + p['dw']) - x, round(p['dy'] + p['dh']) - y
            frame = frame.resize((w, h), Image.Resampling.NEAREST)
            atlas.alpha_composite(frame, (x, y))
        path = target / f"{resident['type']}-{height}.webp"
        temporary = path.with_suffix('.webp.tmp')
        atlas.save(temporary, format='WEBP', lossless=True, method=6)
        decoded = Image.open(temporary).convert('RGBA')
        assert decoded.getchannel('A').tobytes() == atlas.getchannel('A').tobytes()
        temporary.replace(path)
        total += path.stat().st_size
    print(resident['type'])
print(f'Packed {len(spec)} residents at 3 resolutions: {total:,} bytes')
