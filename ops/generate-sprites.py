#!/usr/bin/env python3
"""Generate original Clover Hollow toolbar artwork. Pixel-authored; no source assets."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/assets/original-farm'
OUT.mkdir(parents=True, exist_ok=True)
P = {
    'outline': '#3d302b', 'wood_dark': '#70432c', 'wood': '#a66f3b', 'wood_light': '#d4a158',
    'metal_dark': '#3d5358', 'metal': '#799b9a', 'metal_light': '#bad0bc',
    'paper_dark': '#a46d3b', 'paper': '#d4a863', 'paper_light': '#f0d291',
    'green_dark': '#355c36', 'green': '#608e3e', 'green_light': '#a2c757',
    'purple_dark': '#794c5b', 'purple': '#b67591', 'purple_light': '#daa2af',
    'cream': '#fff0cd', 'cream_shadow': '#dac59a', 'water_dark': '#35575e',
    'water': '#528a91', 'water_light': '#8ac0ba', 'water_shine': '#c2dacf',
}

def icon():
    im = Image.new('RGBA', (24, 24)); return im, ImageDraw.Draw(im)

def rect(d, box, color): d.rectangle(box, fill=P.get(color, color))
def poly(d, points, color): d.polygon(points, fill=P.get(color, color))
def line(d, points, color, width=1): d.line(points, fill=P.get(color, color), width=width)

def hoe():
    im, d = icon()

    line(d, [(4, 21), (18, 5)], 'outline', 4)
    line(d, [(4, 20), (18, 4)], 'wood_dark', 3)
    line(d, [(4, 20), (18, 4)], 'wood', 2)
    line(d, [(4, 20), (18, 4)], 'wood_light')
    poly(d, [(12, 2), (15, 1), (22, 7), (22, 10), (19, 12), (10, 5)], 'outline')
    poly(d, [(12, 3), (15, 2), (21, 7), (21, 9), (18, 9)], 'metal')
    line(d, [(12, 3), (15, 2), (21, 7)], 'metal_light')
    line(d, [(12, 5), (19, 11), (21, 9)], 'metal_dark', 2)

    poly(d, [(15, 4), (20, 8), (19, 10), (16, 8)], 'metal_dark')
    line(d, [(12, 4), (18, 9)], 'metal_light')
    line(d, [(19, 10), (21, 8)], '#d9ded0')
    rect(d, [17, 6, 18, 7], 'outline')
    rect(d, [17, 6, 17, 6], 'wood_light')

    line(d, [(7, 17), (9, 15)], 'wood_dark')
    line(d, [(12, 12), (14, 10)], 'wood_light')
    line(d, [(15, 8), (16, 9)], 'metal_dark')
    return im

def seeds():
    im, d = icon()
    poly(d, [(6, 2), (18, 2), (19, 8), (21, 21), (19, 23), (4, 23), (3, 21), (5, 8)], 'outline')
    poly(d, [(6, 4), (17, 4), (18, 8), (20, 20), (18, 22), (5, 22), (4, 20)], 'paper_dark')
    poly(d, [(7, 6), (16, 6), (17, 10), (18, 21), (6, 21), (5, 20)], 'paper')
    rect(d, [6, 3, 18, 6], 'paper_light');rect(d, [7, 3, 17, 3], 'cream')
    rect(d, [6, 6, 18, 7], 'wood');rect(d, [7, 8, 7, 19], 'paper_light')
    rect(d, [11, 14, 12, 19], 'green_dark')
    poly(d, [(11, 15), (8, 13), (8, 10), (10, 10), (13, 14)], 'green')
    poly(d, [(12, 15), (12, 12), (15, 10), (17, 10), (16, 13)], 'green_dark')
    line(d, [(9, 11), (11, 13)], 'green_light');line(d, [(13, 13), (15, 11)], 'green')
    rect(d, [10, 19, 14, 20], 'wood');rect(d, [11, 19, 13, 19], 'wood_light')

    poly(d, [(17, 9), (19, 17), (19, 20), (17, 21), (18, 16)], 'wood')
    line(d, [(5, 18), (6, 21), (10, 22), (16, 22)], 'paper_light')
    line(d, [(7, 20), (8, 21), (11, 21)], 'paper_dark')
    line(d, [(7, 4), (10, 4)], 'paper')
    line(d, [(13, 5), (16, 5)], 'paper_dark')
    return im

def water():
    im, d = icon()


    poly(d, [(15, 7), (18, 5), (21, 6), (22, 8), (22, 13), (19, 16), (17, 15), (20, 12), (20, 8), (18, 7), (16, 9)], 'metal_dark')
    line(d, [(17, 7), (18, 6), (20, 7), (21, 8), (21, 12), (19, 14)], 'water_light')

    poly(d, [(8, 12), (5, 9), (4, 6), (2, 7), (3, 11), (6, 16), (9, 16)], 'metal_dark')
    line(d, [(7, 13), (4, 9), (3, 7)], 'water_light', 2)
    poly(d, [(1, 5), (3, 4), (6, 6), (5, 8), (3, 9), (1, 7)], 'metal_dark')
    line(d, [(2, 5), (3, 5), (5, 6)], 'water_shine')
    rect(d, [2, 7, 3, 7], 'water')

    poly(d, [(8, 9), (15, 9), (18, 12), (18, 18), (16, 21), (9, 22), (6, 20), (5, 15), (6, 12)], 'metal_dark')
    poly(d, [(8, 11), (15, 10), (17, 13), (17, 18), (15, 20), (9, 21), (7, 19), (6, 15)], 'water')
    poly(d, [(7, 13), (10, 12), (13, 12), (13, 19), (10, 20), (8, 19)], 'water_light')
    poly(d, [(14, 12), (17, 13), (17, 18), (15, 20), (13, 20), (14, 17)], 'water_dark')
    line(d, [(8, 13), (8, 16)], 'water_shine')
    line(d, [(9, 21), (15, 20), (17, 18)], 'metal_dark')

    poly(d, [(8, 9), (14, 8), (16, 10), (14, 12), (8, 12), (7, 11)], 'water_light')
    line(d, [(9, 10), (13, 9), (14, 10), (13, 11), (9, 11)], 'water_dark')
    line(d, [(8, 9), (13, 8)], 'water_shine')
    rect(d, [16, 13, 16, 13], 'metal_light')
    rect(d, [16, 17, 16, 17], 'water_light')


    line(d, [(7, 18), (9, 20), (12, 20), (15, 19)], 'metal_dark')
    line(d, [(8, 18), (10, 19), (12, 19)], 'water_shine')
    line(d, [(14, 13), (14, 16), (13, 18)], 'metal_dark')
    line(d, [(15, 14), (15, 16)], 'water')

    line(d, [(9, 10), (12, 9), (14, 10)], 'metal_dark')
    line(d, [(10, 11), (13, 11)], 'water')

    rect(d, [2, 6, 2, 6], 'metal_dark')
    rect(d, [4, 7, 4, 7], 'metal_dark')
    line(d, [(5, 10), (6, 9)], 'water_shine')
    return im

def harvest():
    im, d = icon()
    poly(d, [(10, 11), (5, 8), (3, 3), (4, 1), (7, 2), (11, 8), (12, 3), (15, 0), (18, 1), (17, 5), (14, 9), (18, 6), (21, 6), (20, 10), (15, 13)], 'green_dark')
    poly(d, [(10, 10), (5, 7), (4, 3), (6, 3), (11, 9)], 'green')
    poly(d, [(12, 10), (13, 4), (16, 1), (17, 2), (15, 6)], 'green_light')
    poly(d, [(13, 11), (17, 8), (20, 7), (19, 9)], 'green')
    line(d, [(5, 3), (8, 7)], 'green_light')
    poly(d, [(7, 11), (16, 11), (19, 14), (18, 18), (14, 21), (12, 23), (10, 22), (9, 21), (5, 18), (4, 14)], 'purple_dark')
    poly(d, [(7, 12), (15, 12), (18, 14), (17, 17), (14, 20), (11, 22), (10, 20), (6, 18), (5, 14)], 'cream_shadow')
    poly(d, [(8, 12), (14, 12), (16, 14), (16, 17), (12, 20), (9, 19), (6, 16), (6, 14)], 'cream')
    line(d, [(5, 14), (7, 12), (15, 12), (18, 14)], 'purple', 2)
    line(d, [(7, 12), (13, 12)], 'purple_light')
    rect(d, [10, 21, 11, 22], 'cream_shadow')
    return im

ICONS = {'hoe': hoe(), 'seeds': seeds(), 'water': water(), 'harvest': harvest()}
for name, im in ICONS.items(): im.save(OUT / f'tool-{name}.png', optimize=True)

sheet = Image.new('RGB', (960, 300), '#d6b675')
d = ImageDraw.Draw(sheet)
for i, (name, im) in enumerate(ICONS.items()):
    sheet.paste(im.resize((192, 192), Image.Resampling.NEAREST), (i * 240 + 24, 24), im.resize((192, 192), Image.Resampling.NEAREST))
    d.text((i * 240 + 80, 246), name.upper(), fill='#3d302b')
sheet.save('/tmp/clover-tool-showcase.png')
print('Wrote four original 24x24 toolbar PNGs and /tmp/clover-tool-showcase.png')
