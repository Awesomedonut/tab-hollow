# Original Clover Hollow artwork

These four transparent 24×24 PNG toolbar icons were pixel-authored specifically for Clover Hollow. They contain no copied, traced, extracted, or recolored third-party artwork. Each icon uses a small original palette and explicit native-pixel coordinates.

- `tool-hoe.png`: hardwood handle with a beveled metal hoe head.
- `tool-seeds.png`: folded paper seed packet with a sprout illustration.
- `tool-water.png`: shaded teal watering can with an open handle and droplets.
- `tool-harvest.png`: cream turnip root, purple shoulder, and branching green leaves.

Rebuild on the development VM with `python3 ops/generate-sprites.py` (requires Pillow). The generator also writes `/tmp/clover-tool-showcase.png` for visual inspection. Render the PNGs with `image-rendering: pixelated` and integer scaling where possible.

Runtime farmer walking uses the credited Ridgeside Ian atlas; tool actions are project adaptations of Ian. Field crop growth uses the documented Nina-derived adaptation atlas. The toolbar harvest slot uses Nina’s credited turnip icon, rather than the historical project icon in this folder. See `docs/ASSETS.md`, `docs/RIDGESIDE-CHARACTER.md` and `docs/NATIVE-FARMING.md`.

Visual references were used to assess the broad proportions and density of the cozy farming genre; these files do not include Stardew Valley sprites. Production artwork was generated and reviewed on the VM.

Iteration 20260916T122336Z: hoe receives a shaded socket, honed edge, ferrule and broken wood grain; seed packet receives a folded side gusset and crimped paper seam. Both remain project-authored 24×24 masks with exact coordinates in the generator. No new source or third-party permission.
