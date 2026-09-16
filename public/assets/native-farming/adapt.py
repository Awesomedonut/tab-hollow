"""Reproduce native-grid asset adaptations; Pillow, no resampling.
Usage: python3 public/assets/native-farming/adapt.py
Optional argument: full upstream zrsvspiritrealm.png.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import sys
out=Path(__file__).resolve().parent
source=Image.open(sys.argv[1] if len(sys.argv)>1 else out/'source-soil-patch.png').convert('RGBA')
offset=(0,0) if len(sys.argv)>1 else (80,320)
def native_crop(rect):
 x,y,r,b=rect
 return source.crop((x-offset[0],y-offset[1],r-offset[0],b-offset[1]))

coords=[(88,344),(100,344),(112,344),(88,356),(100,356),(112,356),(88,368),(100,368),(112,368)]

exterior={(224,224,181),(209,189,138),(181,160,132)}
dry={(159,128,103):(153,99,53),(156,114,54):(143,87,42),(138,101,28):(121,71,35),(167,131,41):(172,113,54),(162,116,54):(160,100,46),(126,89,25):(107,63,34),(211,178,48):(164,108,55),(170,182,166):(172,113,54)}


base=dry[(159,128,103)]
dry={k:tuple(round(base[j]+(v[j]-base[j])*.38) for j in range(3)) for k,v in dry.items()}
wet={k:tuple(round(c*f) for c,f in zip(v,(.69,.68,.72))) for k,v in dry.items()}
atlas=Image.new('RGBA',(64,48))
for state,palette in enumerate([dry,wet]):
 for i,(x,y) in enumerate(coords):
  cell=native_crop((x,y,x+8,y+8))
  cell.putdata([(0,0,0,0) if p[:3] in exterior else (*palette.get(p[:3],p[:3]),p[3]) for p in cell.getdata()])
  atlas.paste(cell,(i%3*8,state*24+i//3*8))

 cell=native_crop((88,324,96,332))
 cell.putdata([(0,0,0,0) if p[:3] in exterior else (*palette.get(p[:3],p[:3]),p[3]) for p in cell.getdata()])
 for i,angle in enumerate([270,180,0,90]):
  atlas.paste(cell.rotate(angle),(24+(i%2)*8,state*24+(i//2)*8))


 for i,(x,y) in enumerate([(96,352),(104,352),(96,360),(104,360)]):
  cell=native_crop((x,y,x+8,y+8));base=palette[(159,128,103)]
  cell.putdata([(*tuple(round(base[j]+(palette.get(p[:3],base)[j]-base[j])*.28) for j in range(3)),255) for p in cell.getdata()])
  atlas.paste(cell,(32+i*8,state*24+16))


 for i in range(9):
  cx,cy=i%3*8,state*24+i//3*8
  cell=atlas.crop((cx,cy,cx+8,cy+8));d=ImageDraw.Draw(cell)


  if i in (0,2,6,8):
   base=palette[(159,128,103)]
   for yy in range(8):
    for xx in range(8):
     ex=xx if i%3==0 else 7-xx
     ey=yy if i//3==0 else 7-yy
     if ex+ey<4:
      cell.putpixel((xx,yy),(0,0,0,0))
     elif not cell.getpixel((xx,yy))[3]:
      delta=-7 if min(ex,ey)==0 else 0
      cell.putpixel((xx,yy),(*tuple(c+delta for c in base),255))
  base=palette[(159,128,103)]


  for yy in range(8):
   for xx in range(8):
    pixel=cell.getpixel((xx,yy))
    if not pixel[3]:continue
    distances=[]
    if i%3==0:distances.append(xx)
    if i%3==2:distances.append(7-xx)
    if i//3==0:distances.append(yy)
    if i//3==2:distances.append(7-yy)
    edge=min(distances,default=8)
    delta=(-9 if edge==0 else -3 if edge==1 else 0)
    rgb=tuple(max(0,min(255,base[j]+round((pixel[j]-base[j])*.18)+delta)) for j in range(3))
    cell.putpixel((xx,yy),(*rgb,255))
  atlas.paste(cell,(cx,cy))


variants=Image.new('RGBA',(192,48))
for variant in range(3):
 patch=atlas.copy()
 for state in range(2):
  for i in range(9):
   cx,cy=i%3*8,state*24+i//3*8
   if i not in (1,3,5,7):continue
   nicks={}
   for along in nicks.get((variant,i),[]):
    if i//3==0:patch.putpixel((cx+along,cy),(0,0,0,0))
    if i//3==2:patch.putpixel((cx+along,cy+7),(0,0,0,0))
    if i%3==0:patch.putpixel((cx,cy+along),(0,0,0,0))
    if i%3==2:patch.putpixel((cx+7,cy+along),(0,0,0,0))
 variants.paste(patch,(variant*64,0))

relief=Image.new('RGBA',(256,176));relief.paste(variants,(0,0))
for state,palette in enumerate([dry,wet]):
 base=palette[(159,128,103)]
 field=Image.new('RGBA',(128,128),(*base,255))
 native=native_crop((96,352,112,368))
 for yy in range(128):
  for xx in range(128):
   original=native.getpixel((xx%16,yy%16))[:3]
   material=palette.get(original,base)
   field.putpixel((xx,yy),(*[round(base[ch]+(material[ch]-base[ch])*.9) for ch in range(3)],255))



 mottles=[(98,354,5,4),(105,354,4,5),(99,362,5,4),(105,361,4,5)]
 anchors=[(5,9),(27,3),(48,14),(76,6),(103,12),(119,29),
          (14,33),(39,26),(61,39),(87,30),(106,48),(3,58),
          (28,52),(49,66),(73,57),(92,73),(117,65),(13,83),
          (37,78),(63,88),(81,99),(106,89),(5,109),(29,101),
          (48,117),(70,110),(98,120),(119,108)]
 for index,(x,y) in enumerate(anchors):
  sx,sy,w,h=mottles[index%4]
  fragment=native_crop((sx,sy,sx+w,sy+h))
  for fy in range(h):
   for fx in range(w):
    original=fragment.getpixel((fx,fy))[:3]
    material=palette.get(original,base)

    if material==base:continue
    field.putpixel(((x+fx)%128,(y+fy)%128),
                   (*[round(base[ch]+(material[ch]-base[ch])*1.8) for ch in range(3)],255))



 for index,(x,y) in enumerate(anchors):
  if index%2:continue
  sx,sy,w,h=mottles[index%4]
  fragment=native_crop((sx,sy,sx+w,sy+h))
  solid={(fx,fy) for fy in range(h) for fx in range(w)
         if palette.get(fragment.getpixel((fx,fy))[:3],base)!=base}
  for fx,fy in sorted(solid,key=lambda p:p[1],reverse=True):
   if (fx,fy+1) not in solid:
    field.putpixel(((x+fx)%128,(y+fy+1)%128),(*[c-9 for c in base],255))
   if (fx,fy-1) not in solid:
    field.putpixel(((x+fx)%128,(y+fy)%128),(*[c+5 for c in base],255))



 for index,(x,y) in enumerate([(19,18),(54,45),(96,24),(17,95),(82,79),(113,114)]):
  for part,(dx,dy) in enumerate([(0,0),(6,3),(-3,6)] if index%2==0 else [(0,0),(5,-3)]):
   sx,sy,w,h=mottles[(index+part)%4]
   fragment=native_crop((sx,sy,sx+w,sy+h))
   solid={(fx,fy) for fy in range(h) for fx in range(w)
          if palette.get(fragment.getpixel((fx,fy))[:3],base)!=base}
   for fx,fy in sorted(solid,key=lambda p:p[1],reverse=True):
    px,py=(x+dx+fx)%128,(y+dy+fy)%128
    material=palette.get(fragment.getpixel((fx,fy))[:3],base)
    field.putpixel((px,py),(*material,255))
    if (fx,fy+1) not in solid:
     field.putpixel((px,(py+1)%128),(*[c-9 for c in base],255))
    if (fx,fy-1) not in solid:
     field.putpixel((px,py),(*[c+5 for c in base],255))



 shelves=[(8,22,[(1,0),(6,0),(9,1),(8,2),(2,2),(0,1)]),
          (46,12,[(2,0),(7,0),(8,1),(6,2),(0,2),(0,1)]),
          (80,44,[(1,0),(5,0),(8,1),(7,3),(3,3),(0,2)]),
          (30,71,[(2,0),(8,0),(10,1),(8,2),(1,2),(0,1)]),
          (108,82,[(0,1),(3,0),(7,0),(8,2),(5,3),(1,2)]),
          (61,104,[(1,0),(6,0),(9,2),(7,3),(2,2),(0,1)]),
          (12,92,[(2,0),(6,0),(8,1),(6,2),(1,2),(0,1)]),
          (38,101,[(1,0),(5,0),(7,1),(8,2),(2,3),(0,2)]),
          (53,86,[(2,0),(8,0),(9,1),(6,2),(0,2)]),
          (95,13,[(0,1),(2,0),(6,0),(8,2),(4,3),(1,2)]),
          (17,51,[(1,0),(7,0),(9,1),(7,2),(1,3),(0,1)]),
          (63,59,[(2,0),(5,0),(8,1),(7,2),(2,2),(0,1)])]
 for ax,ay,points in shelves:
  mask=Image.new('1',(12,5));ImageDraw.Draw(mask).polygon(points,fill=1)
  for fy in range(5):
   for fx in range(12):
    if not mask.getpixel((fx,fy)):continue
    upper=fy==0 or not mask.getpixel((fx,fy-1))
    lower=fy==4 or not mask.getpixel((fx,fy+1))
    delta=11 if upper else -14 if lower else 2
    px,py=ax+fx,ay+fy
    old=field.getpixel((px,py))
    field.putpixel((px,py),(*[round((old[ch]+base[ch])/2)+delta for ch in range(3)],255))
 relief.paste(field,(state*128,48))

for variant in range(3):
 for state,palette in enumerate([dry,wet]):
  base=palette[(159,128,103)]
  for i in range(9):
   cx,cy=variant*64+i%3*8,state*24+i//3*8
   for yy in range(8):
    for xx in range(8):
     if not relief.getpixel((cx+xx,cy+yy))[3]:continue
     delta=0
     if (i//3==0 and yy==0) or (i%3==0 and xx==0):delta=-17
     elif i//3==2 and yy==7:delta=7 if (xx+variant)%5<3 else -5
     elif i%3==2 and xx==7:delta=-7
     if delta:relief.putpixel((cx+xx,cy+yy),(*[c+delta for c in base],255))
relief.save(out/'soil.png')


root=Image.open(out.parent/'nina-repixel/turnip.png').convert('RGBA')
ramp={(69,101,89):(31,65,43),(76,135,107):(49,108,57),
      (110,167,86):(99,158,58),(166,208,132):(172,204,91)}
leaves=root.copy()
leaves.putdata([(*ramp[p[:3]],p[3]) if p[:3] in ramp else (0,0,0,0) for p in leaves.getdata()])



colors={'d':(27,67,46,255),'m':(40,111,65,255),'l':(77,160,74,255),'h':(151,209,111,255),'s':(20,48,35,255)}
def painted(rows):
 image=Image.new('RGBA',(len(rows[0]),len(rows)))
 for yy,row in enumerate(rows):
  for xx,p in enumerate(row):
   if p in colors:image.putpixel((xx,yy),colors[p])
 return image



full=painted([
 '.....ll.........',
 '....lhld........',
 '....lhmd........',
 '....llmd........',
 '....llmd..ll....',
 '..l.llmd.lhmd...',
 '.lhmllmd.lhmd...',
 '.lhmllmlllmdd...',
 '..lmmlllhmmd....',
 '..lmmlllhmdd....',
 '...lmmllmmd.....',
 '....lmlmmd......',
 '.....lmmd.......',
 '......mdd.......'])
ripe=painted([
 '.....ll.........',
 '....lhhld.......',
 '....lhhmd.......',
 '....lhlmd.......',
 '....lllmd..ll...',
 '..l.llllmdlhmd..',
 '.lhlmlllmdlhmd..',
 '.lhllmllmllmmd..',
 '..lhllmlllhmdd..',
 '..lllmlmllhmdd..',
 '...lmmlllhmdd...',
 '....lmmllmmd....',
 '.....lmlmmd.....',
 '......lmmd......',
 '.......md.......'])
full_b=painted([
 '........ll......',
 '.......lhld.....',
 '.......lhmd.....',
 '...ll..llmd.....',
 '..lhld.llmd.....',
 '..lhmllllmd.ll..',
 '..llmllhlmdlhmd.',
 '...lmllhlmllmdd.',
 '....lmllmllmdd..',
 '.....lmlmlmdd...',
 '......lmmmd.....',
 '.......mdd......'])
ripe_b=painted([
 '........lll.....',
 '.......lhhld....',
 '.......lhlmd....',
 '...lll.lllmd....',
 '..lhhldlllmd....',
 '..lhhmlhllmd.ll.',
 '..lhlmlhlmmdlhmd',
 '...lmlhllmllhmdd',
 '....llhlmlllmdd.',
 '.....lmlmlmmdd..',
 '......lmmmd.....',
 '.......mdd......',
 '.......md.......'])
full_c=painted([
 '........ll......',
 '.......lhld.....',
 '.......lhmd.....',
 '.......llmd.....',
 '....ll.llmd.....',
 '...lhldllmd.....',
 '...lhmlllmd.....',
 '...llmlllmdd.ll.',
 '....lmlhlmddlhmd',
 '....lllhllmllmdd',
 '.....llhlmllmdd.',
 '......llmlmmdd..',
 '......lmmmd.....',
 '.......mdd......',
 '.......md.......'])
ripe_c=painted([
 '........lll.....',
 '.......lhhld....',
 '.......lhlmd....',
 '.......lllmd....',
 '....ll.llllmd...',
 '...lhldllllmd...',
 '...lhmllhllmd...',
 '...lhmllhlmdd.ll',
 '....lmlhllmddlhm',
 '....lllhllmllhmd',
 '.....llhllmllmdd',
 '......lhlmlmmdd.',
 '......llmlmmdd..',
 '.......lmmmd....',
 '.......lmmd.....',
 '........md......'])
young=painted([
 '..ll.',
 '.lhmd',
 '.lmdd',
 '..lmd',
 '..mdd',
 '...d.'])
fan=leaves.crop((5,2,12,6))
crops=Image.new('RGBA',(64,96))
for variant in range(3):
 for stage in range(4):
  ox=stage*16;oy=variant*32;draw=ImageDraw.Draw(crops)
  draw.line([(ox+5,oy+30),(ox+10,oy+30)],fill=(81,62,33,255))
  draw.line([(ox+6,oy+31),(ox+9,oy+31)],fill=(104,69,34,255))
  def place(image,x,y):crops.alpha_composite(image,(ox+x,oy+y))
  if stage==0:
   place(fan.crop((1,0,5,3)),3,26)
   place(fan.crop((1,0,5,3)).transpose(Image.Transpose.FLIP_LEFT_RIGHT),8,25)
   draw.line([(ox+6,oy+28),(ox+8,oy+30),(ox+10,oy+27)],fill=colors['d'],width=2)
   draw.line([(ox+8,oy+28),(ox+8,oy+25)],fill=colors['l'])
  else:
   if stage==1:

    place(young,5 if variant==0 else 6,23)
    place(fan,3,26)
    draw.line([(ox+7,oy+28),(ox+8,oy+30)],fill=colors['d'])
   else:
    if stage==3:
     bulb=root.crop((3,7,10,11))
     for yy in range(4):
      for xx in range(7):
       r,g,b,a=bulb.getpixel((xx,yy))
       if yy==3 or (xx,yy) in [(0,0),(6,0)]:bulb.putpixel((xx,yy),(0,0,0,0))
       elif a:bulb.putpixel((xx,yy),(*[(192,169,113),(161,135,87),(126,99,65)][yy],a))
     place(bulb,5,28)


    crown=(full,full_b,full_c)[variant] if stage==2 else (ripe,ripe_b,ripe_c)[variant]
    place(crown,0,(31 if stage==2 else 30)-crown.height)

    draw.line([(ox+7,oy+29),(ox+9,oy+29)],fill=colors['m'])
    draw.line([(ox+7,oy+30),(ox+9,oy+30)],fill=colors['d'])
crops.save(out/'turnip-stages.png')


ian=Image.open(out.parent/'ridgeside-character/source-Ian.png').convert('RGBA')
row=ian.crop((0,224,64,256))
work=Image.new('RGBA',(64,64));work.paste(row,(0,0))
for frame in range(4):
 work.paste(row.crop((frame*16,0,frame*16+16,32)).transpose(Image.Transpose.FLIP_LEFT_RIGHT),(frame*16,32))
work.save(out/'ian-side-work.png')
