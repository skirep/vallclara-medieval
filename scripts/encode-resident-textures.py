"""Optional authoring helper: python scripts/encode-walk-textures.py (Pillow).

Runtime copies are lossless WebP. PNG originals stay available as a fallback.
RGB values of fully transparent pixels may change, but visible pixels and alpha
must remain identical. No image generation or frame redrawing takes place here.
"""
from pathlib import Path
import json, subprocess
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent.parent
before = after = 0
names = json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {RESIDENT_ASSETS} from './resident-assets.js'; console.log(JSON.stringify(RESIDENT_ASSETS.map(a=>a.fallback)))"],cwd=root,text=True))
sources = [root / 'assets' / name for name in names]
for source in sorted(sources):
    image = Image.open(source).convert('RGBA')
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
