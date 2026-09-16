"""Reproduce Clover Hollow's turnip adaptation of Nina's radish item."""
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
image = Image.open(HERE / "source-radish-1x_19.png").convert("RGBA")

ROOT = [(167, 54, 106, 255), (223, 101, 128, 255),
        (237, 171, 171, 255), (248, 217, 206, 255)]
SHOULDER = [(100, 60, 104, 255), (145, 83, 141, 255),
            (188, 132, 175, 255), (223, 182, 207, 255)]
BULB = [(118, 91, 66, 255), (186, 151, 102, 255),
        (232, 211, 153, 255), (255, 240, 189, 255)]
for y in range(image.height):
    for x in range(image.width):
        color = image.getpixel((x, y))
        if color in ROOT:
            image.putpixel((x, y), (SHOULDER if y <= 6 else BULB)[ROOT.index(color)])
image.save(HERE / "turnip.png")
