"""Rebuild the native terrain adaptation from the two documented upstream files.
Usage: python3 ops/build-ridgeside-terrain.py ORIGINAL_PNG ORIGINAL_TMX
Requires Pillow. Inputs stay outside the repository; hashes must match provenance.
"""
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
asset = root / 'public/assets/ridgeside-terrain'
metadata = json.loads((asset / 'provenance.json').read_text())
source_path, map_path = map(Path, sys.argv[1:])
assert hashlib.sha256(source_path.read_bytes()).hexdigest() == metadata['sourceSha256']
assert hashlib.sha256(map_path.read_bytes()).hexdigest() == metadata['animation']['mapSha256']
tileset = next(t for t in ET.parse(map_path).getroot().findall('tileset')
               if t.get('name') == 'zrsvspiritrealm')
columns = metadata['animation']['sourceTileColumns']
for (first, second), crop in zip(metadata['animation']['bankTilePairs'],
                                  metadata['animation']['bankCrops'], strict=True):
    animation = tileset.find(f"tile[@id='{first}']/animation")
    assert animation is not None, f'Missing native animation for {first}'
    assert [(int(f.get('tileid')), int(f.get('duration'))) for f in animation] == [
        (first, 1000), (second, 1000)]
    assert crop['source'] == [second % columns * 16, second // columns * 16, 16, 16]
source = Image.open(source_path).convert('RGBA')
palette = {tuple(map(int, key.strip('()').split(','))): tuple(value)
           for key, value in metadata['earthPalette'].items()}

def earth_palette(image):
    image.putdata([palette.get(pixel[:3], pixel[:3]) + (pixel[3],)
                   for pixel in image.getdata()])
    return image

base = earth_palette(source.crop(tuple(metadata['crop'])))
output = Image.new('RGBA', tuple(metadata['outputSize']))
output.paste(base, (0, 0))
output.paste(base, (0, 160))
for crop in metadata['animation']['bankCrops']:
    x, y, width, height = crop['source']
    output.paste(earth_palette(source.crop((x, y, x + width, y + height))),
                 tuple(crop['destination']))
x, y, width, height = metadata['flowerCrop']['source']
output.paste(source.crop((x, y, x + width, y + height)),
             tuple(metadata['flowerCrop']['destination']))
if 'lowerRockCrop' in metadata:
    lower = metadata['lowerRockCrop']
    x, y, width, height = lower['source']
    rock = source.crop((x, y, x + width, y + height))
    rock.putdata([p if p[0] > p[2] else (0, 0, 0, 0) for p in rock.getdata()])
    output.paste(rock, tuple(lower['destination']))
for crop in metadata.get('quietEarthCrops', []):
    x, y, width, height = crop['source']
    output.paste(earth_palette(source.crop((x, y, x + width, y + height))),
                 tuple(crop['destination']))
for crop in metadata.get('quietGrassCrops', []):
    x, y, width, height = crop['source']
    output.paste(source.crop((x, y, x + width, y + height)), tuple(crop['destination']))
output.save(asset / 'terrain.png')
assert hashlib.sha256((asset / 'terrain.png').read_bytes()).hexdigest() == metadata['outputSha256']
print('Native terrain reproduced; source, map and output SHA256 verified.')
