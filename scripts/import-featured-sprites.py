"""Measure a reviewed 12-column/10-row sheet; no frame synthesis or recoloring.

Pass [{id,path},...] on stdin. Existing art is copied byte-for-byte. Measurements
follow the real transparent gaps, so the source need not have exact pixel cells.
Requires Pillow, numpy and scipy, only during authoring.
"""
from pathlib import Path
import json, sys, shutil
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects
from scipy.cluster.vq import kmeans2

root = Path(__file__).resolve().parent.parent
manifest = json.load(sys.stdin)
layouts, actions, sources = {}, {}, {}
for entry in manifest:
    target = root / 'assets' / f"resident-{entry['id']}.png"
    if Path(entry['path']).resolve() != target.resolve() and (not target.exists() or Path(entry['path']).read_bytes()!=target.read_bytes()):
        shutil.copyfile(entry['path'], target)
    im = Image.open(target).convert('RGBA')
    alpha = np.array(im)[:, :, 3]
    mask = alpha >= 115
    assert (alpha == 0).mean() > .1, f'{target}: background is not transparent'
    height, width = mask.shape
    # Cluster whole painted figures. Nominal image-height/10 boundaries can cut
    # heads off when a generated sheet has extra padding at the bottom.
    labels,count=label(mask)
    areas=np.bincount(labels.ravel())
    boxes=[b for n,b in enumerate(find_objects(labels),1) if b and areas[n]>50]
    typical_height=float(np.median([b[0].stop-b[0].start for b in boxes]))
    boxes=[b for b in boxes if b[0].stop-b[0].start>typical_height*.35]
    cy=np.array([[(b[0].start+b[0].stop)/2] for b in boxes])
    initial=np.quantile(cy[:,0],[(i+.5)/10 for i in range(10)]).reshape(-1,1)
    centers_y,assignment=kmeans2(cy,initial,iter=100,minit='matrix',missing='raise')
    rows, prototypes = [], []
    for cluster in np.argsort(centers_y[:,0]):
        row_boxes=[b for b,c in zip(boxes,assignment) if c==cluster]
        row_boxes.sort(key=lambda b:b[1].start)
        y0=min(b[0].start for b in row_boxes)
        y1=max(b[0].stop for b in row_boxes)
        if len(row_boxes)==12:
            prototypes.append([(b[1].start+b[1].stop)/2 for b in row_boxes])
        rows.append((y0,y1,row_boxes))
    assert prototypes, f'{target}: no complete 12-frame row'
    centers = np.median(prototypes, axis=0)
    measured = []
    for y0,y1,boxes in rows:
        # Individual components retain whole hands/capes. Only connected pairs
        # require separation at the midpoint between their torso centers.
        if len(boxes) == 12:
            ranges = [(b[1].start,b[1].stop,b[0].start,b[0].stop) for b in boxes]
        else:
            cuts = [0]+[round((a+b)/2) for a,b in zip(centers,centers[1:])]+[width]
            ranges = [(a,b,y0,y1) for a,b in zip(cuts,cuts[1:])]
        frames = []
        for x0,x1,frame_top,frame_bottom in ranges:
            ys,xs = np.where(mask[frame_top:frame_bottom,x0:x1])
            assert len(xs)>50, f'{target}: missing frame'
            left,right = x0+int(xs.min()),x0+int(xs.max())+1
            top,bottom = frame_top+int(ys.min()),frame_top+int(ys.max())+1
            torso = []
            for y in range(round(top+(bottom-top)*.3),round(top+(bottom-top)*.55)):
                occupied=np.where(mask[y,left:right])[0]
                if len(occupied):torso.append(left+(occupied[0]+occupied[-1]+1)/2)
            anchor=float(np.median(torso)) if torso else (left+right)/2
            frames.append(dict(x=left,y=top,w=right-left,h=bottom-top,anchorX=anchor,footY=bottom))
        measured.append(frames)
    states = {}
    for state_index,state in enumerate(['walk','idle','jump','punch','talk']):
        views=[]
        for view in range(4):
            row=state_index*2+view//2
            frames=measured[row][(view%2)*6:(view%2)*6+6]
            top=min(b['y'] for b in frames)
            views.append(dict(top=top,height=max(b['y']+b['h'] for b in frames)-top,frames=frames))
        states[state]=views
    layouts[entry['id']]={k:states[k] for k in ['walk','idle']}
    actions[entry['id']]={k:states[k] for k in ['jump','punch','talk']}
    sources[entry['id']]={k:target.name for k in ['jump','punch','talk']}
    # Shader alphaTest=.45 already discards these pixels. Remove invisible
    # generated background noise in the runtime copy; keep the PNG untouched.
    webp=target.with_suffix('.webp')
    if not webp.exists() or webp.stat().st_mtime < target.stat().st_mtime:
        runtime=np.array(im)
        runtime[runtime[:,:,3]<115]=0
        Image.fromarray(runtime).save(webp,format='WEBP',lossless=True,method=6)
    print(entry['id'],width,height,'120 measured frames')
with (root/'featured-layouts.js').open('w') as f:
    f.write('// Source artwork measured by scripts/import-featured-sprites.py.\n')
    for name,data in [('FEATURED_LAYOUTS',layouts),('FEATURED_ACTION_LAYOUTS',actions),('FEATURED_ACTION_SOURCES',sources)]:
        f.write(f'export const {name}='+json.dumps(data,separators=(',',':'))+';\n')
