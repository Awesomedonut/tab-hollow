# Stardew reference comparison, revision 2

## Status and evidence

**Current baseline does not satisfy the requested close visual resemblance.** The earlier six-gate pass established a broadly similar farming-game direction and was too permissive for this user's actual request. This document supersedes that visual acceptance verdict.

Review performed by direct image understanding of actual rendered screenshots and official Steam screenshots on the Azure VM on September 16, 2026. No local build, browser, image processing, or file generation was used.

- Baseline checkout: b79b4df.
- Captures: /tmp/clover-visual-v2/screenshots/2026-09-16T01-46-05.757Z-b79b4df/.
- Official reference screenshots: /tmp/clover-visual-reference/stardew-0.jpg, stardew-2.jpg, stardew-6.jpg.
- Six paired visual crops: /tmp/clover-visual-v2/comparison-crops.jpg.
- Color measurements: /tmp/clover-visual-v2/patch-statistics.json.
- Both production and development produced five screenshots and zero browser page errors. That is technical evidence, not aesthetic acceptance.
- Reference images remain outside the repository and are used only for review. They are not game assets.

The comparison sheet independently enlarges semantic regions to make shapes and material construction visible; it is not intended as a metric for absolute sprite size. The official reference is JPEG, and color-region selection is manual. Reported medians describe these chosen samples, not every pixel in either game. No unsupported global similarity percentage is claimed.

## Material discrepancies and required revisions

| Material | Observed baseline discrepancy | Concrete target |
| --- | --- | --- |
| Exposed ground | Pale beige with separated bright/dark square confetti. | Saturated sunlit amber, subtle correlated patches in adjacent shades, sparse deliberate stones/scuffs. Remove ubiquitous high-contrast isolated specks. |
| Grass | Yellow-green isotropic noise; broad boundaries form smooth wave shapes with a few sparse spikes. | Greener midtone, short directional blade clusters, darker blue-green rooted tufts, several-pixel ragged fringe at earth edge. Vary density by region rather than sprinkling uniform noise everywhere. |
| Farmer | Straight, very narrow torso and long thin legs; eyes/face read as a rectangular icon. | Wider shoulders, more substantial shirt/overalls, rounder head/hair silhouette, broader shaded hat, shorter boots/legs; visible asymmetric three-quarter body planes in side directions. Preserve approximately two-tile total height. |
| Young crops | Thin symmetrical V-shaped leaves, gray greens and exposed cream bulb at early growth. | Individual rounded/lobed leaves with teal/dark contours, yellow-green highlights, asymmetry and larger filled silhouette. Roots appear only at maturity and meet the soil. |
| Cottage | Giant flat triangular gable, very regular plank strokes, shallow roof-plane reading, architectural parts lack dark contact shadows. | Distinct deep sloped roof surface and smaller front gable, substantial roof overhang/eaves, darker plane under eaves, warm irregular plank shade, deeper window recess and shaped trim, layered deck edge. |
| Tree canopy | Nearly circular crown silhouettes with repeated procedural leaf spots. Cherry trees emphasize a pale bubble shape. | Overlapping leaf masses with dark core, directional branch/leaf structure, deeply shaded lower crown, irregular silhouette and darker branches. Plain grass beneath should not have giant flat geometric shadow patches. |
| Scene composition | Large vacant golden central clearing; six starting crops are a small isolated patch away from the house. | Visually active farm foreground: crop beds, hedge/fence edges, tools/containers and paths tied spatially to the cottage. Break large open regions with readable authored groups while preserving navigation. |
| Interface | Persistent brand and quest panel obscure cottage; very thin narrow text strokes; straight CSS frames. | World is dominant. Compact upper-right date/weather/clock and coins; journal affordance with collapsible objective; stepped wooden panel corners and thicker shaded pixel lettering. Toolbar art must match world scale. |

## Measured palette samples

For these measurements the 1920x1080 reference was reduced to 1100x619 with Pillow's default resampling; current screenshot is 1440x1000. RGB medians were converted to HSV. The boxes below use those respective image coordinates.

| Sample | Box x1,y1,x2,y2 | Median RGB | Hue | Saturation | Value |
| --- | --- | --- | --- | --- | --- |
| Stardew plain dirt | 20,285,95,360 | 235,171,35 | 40.8° | 85.1% | 92.2% |
| Current plain dirt | 650,480,725,555 | 237,190,101 | 39.3° | 57.4% | 92.9% |
| Stardew grass | 845,30,920,105 | 114,193,43 | 91.6° | 77.7% | 75.7% |
| Current grass | 790,160,865,235 | 153,196,65 | 79.7° | 66.8% | 76.9% |

The dirt discrepancy is primarily saturation, not brightness. The grass needs a greener hue and stronger saturation, with dark localized shading instead of globally darkening the image.

## Geometry and density observations

Approximate manual bounding boxes on the paired screenshots show similar overall house-to-farmer scale: cottage width is roughly four to five farmer heights. Enlarging the whole scene again would not fix the distinctive shape problem. Current farmer total height is about 90 display pixels and hat width about 40; its main body is substantially thinner than the reference body at matched height.

The reference's roof edges, window trim, crop silhouettes, fence rails and leaf clusters carry dark contour lines at the same visual pixel scale. Current ground texture has much denser high-frequency detail than its largely flat buildings, making material coherence worse despite similar overall palette categories.

The initial crop plot is roughly two columns by three rows and occupies only about one percent of the 1440x1000 frame. It is mostly hidden by the startup toast in that frame. Farm activity should remain identifiable once the toast disappears and at the actual starting camera.

## Required review procedure for every major iteration

1. Capture fresh gameplay after the startup toast settles, a realistic worked crop state, and mobile gameplay on the VM.
2. Inspect whole-scene composition and paired farmer/crop/roof/grass/ground/tree crops against the actual reference.
3. Record which specific discrepancies improved and which remain. Build success cannot override remaining visual failures.
4. Check that the shipped screenshot corresponds to the newly served scripts and record checkout/working-tree state.
5. Do not claim that passing broad genre cues establishes a close reproduction, and do not invent a numerical computer-vision similarity score.

The timed monitor captures evidence every 20 minutes; actual aesthetic judgments require this active visual reviewer.

## Final revision review — 01:59 UTC, September 16

Evidence: /tmp/clover-visual-v2/final/evidence.json. The stable preview at port 4174 served /assets/index-C42LWYSG.js from checkout 9db2c5dbcad0874c1598673f77453da62264fe67. The reviewer inspected desktop-worked-fixture.png and touch-settled.png directly, and compared the farm against the official reference. Captures produced no browser page errors.

Desktop was captured at 1440x810, matching the official reference's 16:9 aspect ratio; native artwork renders at integer 3x. The worked-farm fixture injects eighteen plants at growth stages two and three for material/scale review and is explicitly **not** proof of normal gameplay progression. Phone capture uses an actual touch/mobile browser context at 390x844, with integer 2x artwork and the startup toast dismissed by elapsed time. The final comparison sheet remains at /tmp/clover-visual-v2/final/reference-comparison.jpg outside the repository.

### Verified changes versus rejected baseline

- Dirt sample now has the reference region's median RGB 235,171,35, resolving the beige/desaturated cast. Grass is greener: current sample 106,182,34 versus reference 114,193,43. These are palette-region measurements, not similarity scores.
- Grass changed from isotropic speckle through a rejected diagonal-pattern iteration to subtle blade clusters with visible base gaps. Dirt has restrained fine mottling, and tilled fields have stepped, irregular edges with short furrows instead of a dark rectangular border.
- Farmer proportions now include a broader head/hat and torso, compact legs and boots, and richer brick-red/indigo clothing. Crop rosettes have overlapping lobes, teal contours and distinct growth stages. An adapted Nina RePixel mod icon supplies the harvested-turnip inventory image.
- Buildings now have genuinely separate projected roof planes with eaves, and the cottage moved near the garden. Flowering hedges, fences and clustered props establish the working farm more clearly. Bare polygon hedge caps and broad opaque tree-shadow platforms were rejected and corrected.
- The persistent brand and quest panel no longer cover the cottage. Compact journal controls, thicker Pixelify Sans lettering and the upper-right clock leave the world visible. In the true phone view, cottage, player and crops remain visible together; movement and USE controls are clear.

### Candid verdict and remaining distance

**The revised images are recognizably much closer to the actual Stardew reference, and the specific large discrepancies identified in this review have materially improved. This is not a finding that the game is an exact visual match or equal in art quality.** Palette, sprite proportions, roof projection, soil integration and phone composition are now supported by direct screenshot evidence rather than a broad genre checklist.

Remaining visible differences are the cottage's cleaner/flatter window and plank shading, more circular and regular tree boughs, and fewer authored environmental details and object varieties than the developed official farm. These should be the next art priorities if pushing resemblance further. The small fresh farm is deliberately less developed than the official mature-farm reference; the worked fixture helps distinguish that gameplay-state difference from a material-rendering difference.

No global likeness percentage is asserted. The timer continues collecting screenshots; it does not independently repeat this model's visual judgment while the reviewer is inactive.
