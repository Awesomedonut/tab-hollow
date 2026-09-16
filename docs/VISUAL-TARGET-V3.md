# Revision 3: replace the dominant visual surfaces

The user rejected revision 2 again. Its measured palette improvement and better composition did not achieve the requested likeness. The prior review's positive wording must not be treated as acceptance of that requirement.

## Evidence

Review uses actual official Stardew screenshots 0 and 6 and the rendered revision-2 screenshot on the VM. The paired material sheet is /tmp/clover-visual-v2/atlas-substitution-targets.jpg; measurements are in /tmp/clover-visual-v2/atlas-measurements.json. Reference images remain outside the repository.

Three materials account for the most visible mismatch:

1. **Terrain atlas.** The reference's grass is densely packed, individually shaded directional blades with darker rooted tufts. Current grass is mostly flat lime with a few enlarged isolated strokes. Earth median color already matches the chosen reference patch; palette-only correction cannot supply the missing authored texture. Replace grass, dirt, paths, and edge transitions with a coherent tile atlas at the existing 16-pixel logical tile scale. Inspect actual source pixels and map repeated-tile seams before integration.
2. **Tree and hedge sprites.** Reference canopy leaves form cascading, overlapping shapes with bright upper-left faces, dark teal outlines, and deep lower-center shadows. Current tree shapes are circular bough bubbles covered in repeated plus/diamond-like specks, visibly revealing their procedural construction. Replace full canopies/trunks/shrubs with authored sprite silhouettes. Target roughly 16-pixel-wide, 32-pixel-tall farmer anatomy and trees approximately 3–4 farmer heights, while allowing species variation; do not enlarge small spherical sprites into giant trees.
3. **Building sprites.** Reference timber has dark irregular grain, substantially shaded board edges, recessed windows/doors, inset glass highlights, and dense warm trim. Current rectangular window panes and broad flat wood bands remain diagrammatic. Replace whole buildings or coherent roof/wall/window/porch atlas sections rather than adding a few props beside the existing flat structures.

## Concrete shadow measurements

These are hand-selected semantic regions, not exact pixel registration or a general resemblance score. The reference was resized to 1100x619; current source image is 1440x1000. Luminance uses 0.2126R + 0.7152G + 0.0722B. JPEG reference compression and different window arrangements limit direct interpretation.

| Wall and window region | Rectangle x1,y1,x2,y2 | Luminance p10 | Luminance p90 | Pixels below luminance 65 |
| --- | --- | --- | --- | --- |
| Actual Stardew screenshot 0 | 684,202,872,300 | 57.2 | 176.9 | 16.2% |
| Current procedural cottage | 544,293,786,394 | 69.7 | 194.6 | 1.9% |

The source crops visibly confirm the numerical difference: current timber/window materials lack dark recessed and contact-shadow areas. Global darkening is not the remedy; shadows must occur within the right authored forms.

Existing dirt sample matches RGB235,171,35. Current grass sample is RGB106,182,34 versus reference RGB114,193,43. Retuning these base colors again is lower priority than replacing texture geometry.

## Source-asset acceptance

For this iteration the reviewer will inspect the actual downloaded PNGs, source contact sheets, and integrated screenshots. A styled landing-page preview is insufficient. At least the terrain and prominent world sprites must visibly change; replacing only an inventory icon cannot satisfy the request.

Review assets for native pixel dimensions, coherent contour thickness, compatible overhead perspective, suitable saturation, and intentional material shading. Generic soft pastel, very small spherical-tree, or flat mobile-RPG packs should not be accepted just because their subject is farming. The previously reviewed Sunnyside pack has useful authored architectural and prop detail, but its default lawn, compact round trees, and salmon paths differ substantially from Stardew.

After integration, compare the actual new terrain, tree and building regions at matched displayed scale against the reference sheet. Record remaining discrepancies directly. Do not issue another broad genre/style pass, and do not invent a global similarity percentage.

## Actual source-asset reviews

### Simple Foliage — suitable for canopy and shrub replacement

Inspected the downloaded transparent PNGs and an enlarged 16-pixel grid review, not merely a promotional screenshot. Evidence is /tmp/clover-mod-assets/contact.png and outdoor-grid-review.png. The authored overlapping leaf silhouettes, deep teal lower shadows and irregular branch/trunk shapes directly address the current tree failure.

Adult tree crops [0,0,48,96] from tree2_spring.png, tree3_spring.png and tree8_spring.png preserve appropriate native detail. On spring_outdoorsTileSheet.png (352x224), useful rectangles are large shrub [208,0,48,48], medium shrub [208,48,32,32], narrow tuft [240,48,16,32], and cherry tree [256,0,96,112]. Keep one source pixel per world pixel before the overall integer display scale.

This is component suitability, not whole-scene acceptance. Root handles provenance and reuse terms separately.

### Cozy RPG by Lakiiah — rejected for this target

Actual downloaded PNG contact sheet: /tmp/clover-mod-assets-v3/cozy-rpg/contact.png. Flat cream walls, broad uniform roof bands, isolated tiny windows and nearly solid lime lawn repeat the very material problems that the user rejected. The 64-pixel cottage also creates an inconsistent scale beside 96-pixel native mod trees; enlarging the cottage introduces mismatched pixel density.

The pack is coherent on its own terms, but adding it simply because it is sourced art would not advance the requested Stardew resemblance. Do not replace the dominant terrain/building surfaces with this pack.

### Some Building Edits by MourningStar — suitable design; preview quality limited

Inspected the author's full public preview (/tmp/clover-mod-assets-v3/buildings/3113-1544389007-1268692174.png, 694×754) and an enlarged house crop. Slate shingles, irregular timber, recessed arched windows and layered stone foundations directly address the procedural cottage's missing material depth. This is a suitable architectural direction.

The preview contains softened, uneven single-pixel transitions and appears smaller than a native building atlas. Extracting a white-background house from it is only an interim option; prioritize the original transparent asset and retain its original pixel grid. Enlarging a reduced promotional sheet cannot recover native detail. Source permissions and retrieval are tracked separately by the parent.

### First integrated Simple Foliage scene — real improvement, still incomplete

Inspected /tmp/clover-mod-foliage-first.png. Full mod trees now have the appropriate overlapping leaf silhouettes and native pixel density, approximately three farmer heights. Actual sprites make the procedural lawn and cottage's flat material treatment more apparent. This does not yet pass whole-scene review.

The tall 16×32 tufts inherited coordinates intended for tiny procedural grass and visibly overlap the cottage roof, deck and well. Reposition them along grass margins with walkable gaps; do not shrink them fractionally. The gameplay worker received these exact placement issues.

### DustBeauty outdoor atlas — suitable terrain geometry; permissions unresolved

Inspected the actual 400×1264 PNG at /tmp/clover-mod-assets/dust-spring_outdoorsTileSheet.png and a nearest-neighbor enlarged native grid crop at dust-terrain-review.png. Densely shaded directional blades, rooted irregular grass-over-dirt edges, and authored rocky banks directly address the missing terrain forms. Its khaki-brown dirt is a weaker palette match than the existing golden dirt. If reuse is confirmed, preserve the authored forms and consider a targeted dirt palette conversion.

The sheet also includes recognizable game-derived building graphics. Visual suitability does not establish permission to reuse these. The asset researcher reported the exact mod's reuse terms unresolved at review time; this paragraph does not authorize integration.

### Foliage placement follow-up

A fresh 1440×810 development capture at /tmp/clover-mod-foliage-review-latest.png confirms the roof/deck/well tuft overlaps are removed. Tree pixels remain crisp and coherent. The paired teal bushes between buildings create conspicuous repetition, a lesser issue than the still-procedural dominant terrain and cottage. Whole-scene acceptance remains withheld.

### Integrated building replacement — material improvement, terrain still blocks acceptance

Inspected /tmp/clover-sourced-building-first.png at 1440×1000. The authored slate shingles, dark inset windows and door, irregular stone foundation and layered timber materially improve architectural resemblance. Building height is approximately 4.5 farmer heights, plausible at the native world scale. No obvious white extraction halo is visible. The public-preview source's softened/uneven pixels remain a quality limitation compared with the crisp foliage sprites; this is an interim source-quality result.

The single bush between buildings resolves the prior repeated row. The chest overlaps the foundation as a foreground object; the gameplay worker separately reports actual sleep/purchase interactions and unobstructed farmer visibility at the steps/chest.

The paired actual-image evidence /tmp/clover-visual-v2/mod-integration-comparison.jpg shows both the architectural improvement and the unresolved lawn failure. Reference grass has dense directional shading throughout; current lawn remains mostly a flat field with isolated strokes. This is still the dominant whole-scene mismatch, followed by simplified water, fences and props. Whole-scene target acceptance is still withheld.

A genuine touch/mobile capture at 390×844, /tmp/clover-sourced-building-mobile-review.png, confirms readable movement/use controls, toolbar, date/coins and energy without obvious overflow. Farmer and starter crops remain visible. This capture is layout evidence, not independent gameplay proof.

### LPC terrain-v7 — edge/detail component, not a complete lawn solution

Inspected the native 1024×2048 sheet and /tmp/clover-mod-assets/lpc-top.png. Its pointed directional grass rims are a credible improvement over the current boundary, and the yellow-green variant is closest in palette. Most center grass is still nearly solid color, however. Replacing the current fill with this fill alone would leave the dominant density mismatch unresolved. Integration needs sufficiently dense authored blade/texture overlays within the lawn as well as edges.

The atlas uses 32-pixel cells. Preserve source pixels across two-by-two 16-pixel world tiles rather than shrinking the source grid. The asset researcher separately reported CC-BY-SA 3.0 provenance/credits.

### Sourced well — placement and material review

Inspected /tmp/clover-sourced-well-first.png. The authored stone basin, visible water, rope and slate roof improve the simplified previous prop and match the sourced cottages. Approximately 2.5 farmer heights is plausible for this ornamental covered well. Its overlap with the market's left foundation reads as foreground placement; the central stairs and doorway remain clear. The reduced public-preview source has the same pixel-quality limitation as the buildings.

## Final integrated review after grass correction (2e34f31)

This current assessment supersedes the earlier intermediate terrain objections above. All captures and image processing ran on the Azure VM.

The first LPC integration produced conspicuous repeated forked fern shapes. Inspection of the native clump PNGs identified clump 3 as the cause. Removing it from the lawn interior, using it only rarely at the edge, and slightly reducing the brightest grass value removed that dominant repetition. The final lawn now has dense authored fine blade shapes instead of the earlier flat fill. This is a material change in texture geometry, not only a palette adjustment.

Visually inspected the complete fresh desktop at 1440×1000, a separate 1440×810 capture, the crop fixture, and a genuine mobile browser context at 390×844. Mobile reports one touch point and a coarse pointer; movement/use controls are visible, document width remains 390, and no page errors were recorded in any capture. The trees, shrubs, houses and well retain coherent world scale. Farmer, real starter plants, toolbar and status remain legible.

Current artifacts:
- docs/screenshots/fresh-farm.png — real fresh-save scene with six starter plants, toast settled.
- docs/screenshots/mobile.png — real fresh-save scene in a true touch/mobile browser context.
- docs/screenshots/first-harvest.png — explicitly labeled diagnostic image with 18 ripe crops and day four injected for visual review; this is not gameplay proof.
- docs/screenshots/visual-review.json — capture context and limitations.
- /tmp/clover-v3-final-review/reference-comparison.jpg — actual reference/current lawn and building crops; the official reference remains outside the repository.

**Judgment:** the dominant sourced-art replacement and desktop/mobile layout pass integration review. The game is materially closer to a Stardew mod scene than the rejected procedural versions. This is not a claim of exact Stardew fidelity or a global similarity score. The reduced building preview remains softer than native foliage, its white/slate palette differs from vanilla warm wood/red roofs, grass shading and variation still differ, and water/fences/chest/crop-ground materials remain simpler. A strict vanilla-fidelity target is still unmet; those discrepancies are visible in the actual images.
