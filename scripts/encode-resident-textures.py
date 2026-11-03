"""Optional authoring helper: python scripts/encode-walk-textures.py (Pillow).

Runtime copies are lossless WebP. PNG originals stay available as a fallback.
RGB values of fully transparent pixels may change. New featured runtime copies
also discard alpha below the renderer threshold; original PNGs stay untouched. No image generation or frame redrawing takes place here.
"""
from pathlib import Path
import argparse, json, subprocess
import numpy as np
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent.parent
before = after = 0
names = json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {RESIDENT_ASSETS} from './resident-assets.js'; console.log(JSON.stringify(RESIDENT_ASSETS.map(a=>a.fallback)))"],cwd=root,text=True))
parser = argparse.ArgumentParser()
parser.add_argument('--only', nargs='+', help='Encode selected resident source IDs')
args = parser.parse_args()
if args.only:
    names = [name for name in names if any(name in [f'resident-{resident}.png',f'walk-{resident}.png',f'idle-{resident}.png'] for resident in args.only)]
sources = [root / 'assets' / name for name in names]
featured = json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {FEATURED_RESIDENTS} from './featured-residents.js';console.log(JSON.stringify(FEATURED_RESIDENTS.map(r=>'resident-'+r.id+'.png')))"],cwd=root,text=True))
for source in sorted(sources):
    image = Image.open(source).convert('RGBA')
    # New generated sources may carry invisible alpha noise. This exactly
    # matches the renderer's .45 alpha test; original PNGs remain unchanged.
    if source.name in featured:
        pixels = np.array(image)
        pixels[pixels[:,:,3] < 115] = 0
        image = Image.fromarray(pixels)
    target = source.with_suffix('.webp')
    temporary = target.with_suffix('.webp.tmp')
    image.save(temporary, format='WEBP', lossless=True, method=6)
    decoded = Image.open(temporary).convert('RGBA')
    assert image.getchannel('A').tobytes() == decoded.getchannel('A').tobytes()
    visible = image.getchannel('A').point(lambda value: 255 if value else 0)
    difference = ImageChops.difference(image.convert('RGB'), decoded.convert('RGB'))
    assert ImageChops.composite(difference, Image.new('RGB', image.size), visible).getbbox() is None
    temporary.replace(target)
    before += source.stat().st_size
    after += target.stat().st_size
print(f'Resident textures: {before:,} -> {after:,} bytes ({1-after/before:.1%} smaller)')
