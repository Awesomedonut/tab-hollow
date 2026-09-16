# LPC terrain artwork

Selected grass from **[LPC] Terrains**, distributed in the public [love2d-lpc-tiles repository](https://github.com/DrJamgo/love2d-lpc-tiles/blob/HEAD/terrain-v7.png).

Attribution: bluecarrot16, Lanea Zimmerman (Sharm), Daniel Eddeland (Daneeklu), Richard Kettering (Jetrel), Zachariah Husiar (Zabin), Hyptosis, Casper Nilsson, Buko Studios, Nushio, ZaPaper, billknye, William Thompson, caeles, Redshrike, Bertram, and Rayane Félix (RayaneFLX). The accompanying public/assets/lpc-terrain/CREDITS.txt preserves the original detailed credits and source links.

The selected artwork is used under **Creative Commons Attribution-ShareAlike 3.0**: https://creativecommons.org/licenses/by-sa/3.0/ . These cropped/adapted images remain under that license. No authors endorse this game. These are authored LPC assets, not Stardew Valley assets.

Changes: crop the native 32-pixel lime grass set; make only the exact solid background color transparent in four additional blade overlays. No smoothing or downsampling. Source rectangles and SHA-256 are recorded in provenance.json. Parent game's renderer may compose these images into terrain.

Atlas layout, relative to grass-lime.png (96×224):
- Inner corners: x32,64; y0,32.
- Outer edges: 3×3 tiles starting x0,y64; center x32,y96.
- Sparse variations: x0,32,64; y160.
- Extra blades: x64,y192.

## In-game adaptation

`makeGround` in `src/world-art.js` crops four native 32×32 authored blade variations from the atlas. It removes the exact solid background, maps three blade colors to the surrounding spring foliage palette, and composes the shapes with staggered offsets across the lawn. It clips the interior layer to the farm clearing and overlaps a second sparse layer at the grass boundary. Source pixels are never resized. The terrain composition and palette adaptation of this artwork remain under CC-BY-SA 3.0; the original source credits above apply. The golden clearing, pond, and tilled soil remain project artwork.
