# Nina RePixel turnip item

Clover Hollow uses one adapted item icon from **Nina's Stardew Valley Item RePixel (No Fish)** pack. This icon is intended for harvested turnips and the harvest tool/inventory interface; field crop growth now uses an explicitly documented [adapted native-leaf sequence](NATIVE-FARMING.md).

- Source page: https://misnina.itch.io/stardew-valley-item-repixel
- Author: [Nina](https://misnina.itch.io/)
- Author-requested credit link: https://mastodon.art/@misnina
- Download: `stardew_V3.zip`, selected file `stardew/crops/1x_19.png`
- Source-page inspection date: 2026-09-15
- Runtime URL: `/assets/nina-repixel/turnip.png`
- Retained original: `public/assets/nina-repixel/source-radish-1x_19.png`

## Published permission

The source page states:

> These are free to use for anything you want, even beyond using them in the game itself. If you enjoy them though, think about leaving a tip!

The page describes the pack as Stardew Valley assets repixeled in Nina's own style. We preserve this attribution and the permission as stated; no CC0 or other standardized license is asserted. Clover Hollow is not affiliated with or endorsed by Nina or Stardew Valley's creators. A copy of this notice ships with the image in `public/assets/nina-repixel/PERMISSION.txt`.

## Exact adaptation

The original round pink root item is 16 × 16 RGBA. Only its four root palette colors change. Rows 0–6 (zero-based) use a purple shoulder palette; rows 7–15 use a cream bulb palette. Leaf pixels, native pixel grid, dimensions, outline geometry and transparency remain unchanged. Every palette entry below has alpha 255.

| Original RGB | Shoulder RGB, y ≤ 6 | Bulb RGB, y ≥ 7 |
| --- | --- | --- |
| 167, 54, 106 | 100, 60, 104 | 118, 91, 66 |
| 223, 101, 128 | 145, 83, 141 | 186, 151, 102 |
| 237, 171, 171 | 188, 132, 175 | 232, 211, 153 |
| 248, 217, 206 | 223, 182, 207 | 255, 240, 189 |

Reproduce on the VM with Pillow installed:

```sh
python3 public/assets/nina-repixel/adapt-turnip.py
```

The original sheet candidates and the before/after adaptation were visually inspected as nearest-neighbor enlargements on the VM. The result preserves the artist's compact, shaded item silhouette while matching Clover Hollow's cream and purple turnips. Render the PNG with nearest-neighbor scaling (`image-rendering: pixelated` in the UI).
