"""Pack measured action drawings without generating or changing source frames."""
from pathlib import Path
import json
import subprocess
from PIL import Image

root = Path(__file__).resolve().parent.parent
spec = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import {ACTION_TYPES,ACTION_NAMES,actionPlacement} from './resident-actions.js';"
    "import {ACTION_SOURCES,ACTION_LAYOUTS} from './action-layouts.js';"
    "console.log(JSON.stringify(ACTION_TYPES.map(type=>({type,files:ACTION_SOURCES[type],sizes:[64,96].map(height=>({height,frames:Object.keys(ACTION_LAYOUTS[type]).flatMap(action=>Array.from({length:24},(_,i)=>actionPlacement(type,action,Math.floor(i/6),i%6,height)))}))}))));"
], cwd=root, text=True))
target = root / 'assets' / 'packed'
target.mkdir(exist_ok=True)
for resident in spec:
    sources = {state: Image.open(root / 'assets' / file).convert('RGBA') for state, file in resident['files'].items()}
    for size in resident['sizes']:
        height = size['height']
        atlas = Image.new('RGBA', (int(height * .875 * 6), height * 12))
        for p in size['frames']:
            frame = sources[p['state']].crop((p['sx'], p['sy'], p['sx'] + p['sw'], p['sy'] + p['sh']))
            x, y = round(p['dx']), round(p['dy'])
            w, h = round(p['dx'] + p['dw']) - x, round(p['dy'] + p['dh']) - y
            atlas.alpha_composite(frame.resize((w, h), Image.Resampling.NEAREST), (x, y))
        path = target / f"actions-{resident['type']}-{height}.webp"
        temporary = path.with_suffix('.webp.tmp')
        atlas.save(temporary, format='WEBP', lossless=True, method=6)
        decoded = Image.open(temporary).convert('RGBA')
        assert decoded.getchannel('A').tobytes() == atlas.getchannel('A').tobytes()
        temporary.replace(path)
    print(resident['type'])
