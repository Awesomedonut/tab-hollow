"""Extract the author's building preview; original source resolution is preserved."""
from PIL import Image
from collections import deque
from pathlib import Path
import sys
source=Path(sys.argv[1])
out=Path(sys.argv[2]) if len(sys.argv)>2 else Path(__file__).parent
im=Image.open(source).convert('RGBA')
for name,rect in [('cottage',(32,114,176,258)),('market',(32,259,176,403)),('well',(215,466,265,545))]:
 tile=im.crop(rect); w,h=tile.size; px=tile.load(); q=deque(); seen=set()
 for x in range(w):q.extend([(x,0),(x,h-1)])
 for y in range(h):q.extend([(0,y),(w-1,y)])
 while q:
  x,y=q.popleft()
  if (x,y) in seen or not(0<=x<w and 0<=y<h):continue
  seen.add((x,y));r,g,b,a=px[x,y]
  if min(r,g,b)<240:continue
  px[x,y]=(r,g,b,0)
  q.extend(((x-1,y),(x+1,y),(x,y-1),(x,y+1)))
 tile.save(out/(name+'.png'))
 print(name,tile.size,tile.getbbox())
