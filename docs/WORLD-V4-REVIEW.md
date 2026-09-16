# World V4 native terrain increment — 2026-09-16

Implementation: `c25abb9154feaedbb30cd8a59c64960134905789`, on `overnight/world`, after fast-forwarding to `fd3615c` from origin/main. No deployment or main-branch merge was performed. The pre-existing node_modules link was preserved.

## Actual-image review

Compared the official VM reference `/home/codex/research/clover-reference/ref2-review.jpg`, the prior `docs/screenshots/fresh-farm.png`, the native atlas pixels and the resulting desktop/touch captures. Source-map bank frame pairs were inspected at enlarged nearest-neighbor scale before extraction. The new production evidence is in `docs/screenshots/world-v4-native/`; it does not replace root's earlier screenshots.

- **Grass:** large hollow-square/oval stamps no longer repeat behind the farmhouse or between the buildings. Three compatible fine-blade native cells produce a more even lawn, with six sparse paired flower accents. An intermediate candidate had stray earth-colored pixels and checkerboard shading; that candidate was rejected before commit. The selected lawn remains fairly uniform and could benefit from carefully placed coherent shade patches later.
- **Water:** four authored surface variants now advance at 250 ms with spatial phase variation. Eight bank cells follow the upstream map's actual two-frame, 1000 ms animation. The cached frame strip and browser pixel checks confirm eight distinct composites; the pier remains fixed above the water. Existing concave corner geometry, pond silhouette and collision boundaries are unchanged.
- **Shore:** the widening corners remain joined and the pier contacts the western bank. The lower sandy border is still geometric, and the small water vocabulary still repeats. This does not clear the overall terrain/water fidelity gate.
- **Layout:** 1440×1000, 1440×810 and genuine 390×844 touch captures retain the farmer, prepared soil, starter crops and controls. The existing roof crop at 16:9 remains. The pond diagnostic deliberately relocates the player/camera to the pier and carries an on-image label; it does not inject crops or inventory.
- **Remaining larger failures:** flat prepared soil and limited crop shapes remain in this branch; those belong to the other worker. No architecture, building placements, soil implementation, save schema or gameplay rules were changed.

## Verification

- `npm test`: all 17 unit tests pass.
- `npm run build`: pass; served production module `/assets/index-_uADdlrA.js`.
- Existing two browser scenarios pass on both isolated dev port 5187 and production-preview port 5188: farming loop, transactions, save restoration, touch tools, reset and malformed-save recovery.
- New `tests/world-art.spec.js` passes on 5187: all eight pond composites differ, pier pixels and dry corners stay stable, every pond frame is opaque and native dimensions are preserved.
- Production screenshots report zero page errors and document width equal to viewport width. Phone reports one touchpoint and coarse pointer. Fresh state is fourteen tilled tiles and six crops; no crop fixture is used.
- Reproducible asset rebuild verifies original PNG, original TMX and output PNG SHA256 values. Crops, adaptation details, author attribution and permission evidence are in [terrain provenance](../public/assets/ridgeside-terrain/provenance.json) and [terrain documentation](RIDGESIDE-TERRAIN.md).

Capture command: start the built preview on an unused loopback port, then `PLAY_URL=http://127.0.0.1:5188 node ops/capture-world-v4.mjs`. The capture metadata records the actual script URL, source checkout, working-tree state and viewport evidence. Working-tree entries at capture time are the evidence files and capture helper being prepared, not uncommitted rendering changes.

This is a worker's actual-image review, not an independent reviewer-agent pass. Root's thirty-minute strict review remains authoritative; overall visual acceptance is still false.
