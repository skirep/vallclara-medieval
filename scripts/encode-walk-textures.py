"""Optional authoring helper: python scripts/encode-walk-textures.py (Pillow).

Runtime copies are lossless WebP. PNG originals stay available as a fallback.
RGB values of fully transparent pixels may change, but visible pixels and alpha
must remain identical. No image generation or frame redrawing takes place here.
"""
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent.parent
before = after = 0
for source in sorted((root / 'assets').glob('walk-*.png')):
    image = Image.open(source).convert('RGBA')
    target = source.with_suffix('.webp')
    image.save(target, format='WEBP', lossless=True, method=6)
    decoded = Image.open(target).convert('RGBA')
    assert image.getchannel('A').tobytes() == decoded.getchannel('A').tobytes()
    visible = image.getchannel('A').point(lambda value: 255 if value else 0)
    difference = ImageChops.difference(image.convert('RGB'), decoded.convert('RGB'))
    assert ImageChops.composite(difference, Image.new('RGB', image.size), visible).getbbox() is None
    before += source.stat().st_size
    after += target.stat().st_size
print(f'Walk textures: {before:,} -> {after:,} bytes ({1-after/before:.1%} smaller)')
