# Art sources and credits

The current world combines sourced community artwork and project-authored artwork:

- **Simple Foliage** by Azrashar / itsanette: native mod trees, bushes and tufts. [Sources and permissions](SIMPLE-FOLIAGE.md).
- **Ridgeside Village** by Rafseazz and its graphics contributors: native playable Ian walking sprites, farmhouse, seed shop, well, shipping box, terrain, fences, barrels and pier boards, under CC BY-SA 4.0. [Character](RIDGESIDE-CHARACTER.md) · [architecture](RIDGESIDE-BUILDINGS.md) · [terrain](RIDGESIDE-TERRAIN.md) · [props](RIDGESIDE-PROPS.md).
- **Simple Resources** by Azrashar / itsanette / dugongkebalik: native mod rocks, logs, weeds and stumps. [Sources and permissions](SIMPLE-RESOURCES.md).
- **Some Building Edits** by MourningStar: historical cottage, market and well, now superseded, cropped from the author's public preview. That preview has some existing resampling softness. The mod credits vanilla Stardew elements and strawberrymilk's Witchy House inspiration. [Sources, permission and adaptation](MOURNINGSTAR.md).
- **LPC Terrains** by its credited contributors: historical grass blades, now superseded, recolored and composed under CC-BY-SA 3.0. [Full attribution and changes](LPC-TERRAIN.md).
- **Nina's RePixel**: adapted harvested turnip icon and field growth sequence. [Item permission](REPIXEL.md) · [growth adaptations and native soil](NATIVE-FARMING.md).
- Prepared soil: native Ridgeside ground quarter-tiles adapted into connected dry/wet beds under CC BY-SA 4.0. [Source, exact crops and verification](NATIVE-FARMING.md).
- Chickens and signs: native Ridgeside map artwork under CC BY-SA 4.0. [Sources and crop review](RIDGESIDE-FARM-PROPS.md).
- Some small props and most tool icons: project artwork in `src/world-art.js`, `src/character-art.js` and the icon generator.

Public players can read [the shipped credits page](https://clover-hollow.20-119-164-122.sslip.io/credits.html) from the field guide. No Stardew game code is included. Community mod art retains its authors' terms; it is not claimed as original project artwork or public domain.

## Historical prototype assets

| Pack | Source | License | Included files |
|---|---|---|---|
| Tiny Town 1.1 | https://kenney.nl/assets/tiny-town | Creative Commons Zero (CC0) | `public/assets/kenney-tiny-town/atlas.png`, `License.txt` |
| Tiny Farm 1.0 | https://kenney.nl/assets/tiny-farm | Creative Commons Zero (CC0) | `public/assets/kenney-tiny-farm/atlas.png`, `License.txt` |

Downloaded on the Azure VM on 2026-09-15. Original license texts are preserved beside each atlas. Atlases are 12 columns × 11 rows of tightly packed 16 × 16 sprites. Original packed tilemaps were renamed `atlas.png` without modification.

The Kenney packs were sourced from the internet for the first prototype. Following visual review, their low-detail look was replaced, first with project artwork and then with the sourced artwork listed above. Current game rendering does not load the Kenney atlases. Official Stardew Valley Steam screenshots were inspected on the VM as visual references only; they are not shipped, traced into sprites, or included in repository assets.

Direct archive URLs:

- https://kenney.nl/media/pages/assets/tiny-town/a415fbeb49-1735736916/kenney_tiny-town.zip
- https://kenney.nl/media/pages/assets/tiny-farm/dfded1ae3e-1782913588/kenney_tiny-farm.zip

## Pixel interface

The hoe, seed bag and watering-can toolbar icons in public/assets/original-farm/ were authored for this project; their reproducible generator is ops/generate-sprites.py. The harvested turnip now uses an adaptation of Nina’s RePixel radish: [source, permission and exact changes](REPIXEL.md).

VT323 by Peter Hull is bundled at public/assets/fonts/VT323-Regular.ttf, under the SIL Open Font License 1.1 preserved in the same directory. Source: https://github.com/google/fonts/tree/main/ofl/vt323. It is served by this game, with no runtime request to Google Fonts.

Pixelify Sans by Stefie Justprince is bundled at public/assets/fonts/PixelifySans.ttf for the gameplay interface, under the SIL Open Font License 1.1 in PixelifySans-OFL.txt. Source: https://github.com/google/fonts/tree/main/ofl/pixelifysans. Both fonts are served locally by the game.

Sunnyside World by Daniel Diggle was downloaded and visually evaluated on the VM (https://danieldiggle.itch.io/sunnyside). Its rounded compact trees and smoother terrain were not chosen for the current visual direction. No Sunnyside assets are shipped in this release.
