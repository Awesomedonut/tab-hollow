# Historical visual review

**Superseded:** The acceptance verdict below was too permissive for the requested close resemblance. Use [revision 2 targets and review](VISUAL-TARGET-V2.md) for current status. This document is retained as iteration history.

The user rejected the first release because it did not look sufficiently like the requested farming-game reference. Playability and a polished presentation are insufficient acceptance criteria for this revision.

## Evidence and method

On September 16, 2026, the visual review agent inspected the actual pixels of the original release screenshot `test-results/ripe-desktop.png` and the official Steam reference contact sheet at `/tmp/clover-visual-reference/contact-sheet.jpg`. Reference screenshots 0, 2, and 6 are the primary outdoor comparisons; the dialogue screenshots inform interface materials. These are reference-only files outside the project and must not ship.

The automated monitor captures screenshots on the VM every 20 minutes. Each capture folder records UTC time, checkout commit, working-tree changes, served JavaScript URLs, browser errors, and desktop/mobile screenshots. A timestamp or commit does not prove the deployed build uses that commit. The diagnostic ripe-farm screenshot applies synthetic crop state only for comparison; it is not evidence that gameplay passed.

The timer cannot judge visual similarity. Actual image understanding and pass/fail decisions come from the agent inspecting images against the references during the active build session. No unsupported automated computer-vision score is used.

## Required visual gates

All six gates must pass on actual new desktop gameplay screenshots. Mobile must remain readable and playable. Passing means the original artwork shares the important visual construction of the references, not that proprietary assets have been copied.

| Gate | Concrete pass condition | Original release review |
| --- | --- | --- |
| Palette and ground composition | Sunlit ochre/golden earth is a major farm surface, with vivid green grass islands and irregular textured boundaries; paths and soil use differentiated warm values. | **FAIL.** Muted sage-green lawn and plot board dominate. Straight symmetric paths produce a diagrammatic enclosure. |
| Upright characters and crop forms | Farmer has separately readable head/hair, torso/arms and legs, occupies about 1.5–2 ground tiles in height, and is consistently drawn from a three-quarter overhead view. Crops have distinct growth forms with visible soil between them. | **FAIL.** Farmer reads as a squat one-tile icon; ripe crop rows repeat large purple symbols with limited plant structure. |
| Trees and buildings | Canopies use fine clustered leaf highlights, layered midtones and deep inner shadows with substantial trunks; roofs and front walls read as separate planes with varied timber, shingles and trim. | **FAIL.** Tree crowns are coarse outlined bubbles with repeating highlights. Buildings have useful roof/front separation, but repetitive roof motifs and low texture density remain conspicuous. |
| Camera and visual hierarchy | Character, crop stages and environmental pixels are legible at normal desktop size, without fitting the entire map as a miniature board. Farm structures form a scene around the player rather than a symmetric diagram. | **FAIL.** Whole-map framing leaves the player small and emphasizes a centered rectangular board. |
| Rustic pixel interface | Compact timber/ochre panels, hard pixel edges, suitable bitmap-style lettering and pixel tools feel part of the world; gameplay dominates the screen. | **FAIL.** Dark modern website frame, rounded cream cards, airy serif headings and smooth tool icons use a different visual language. |
| Coherent pixel detail | Ground, foliage, figures, crops, buildings and UI share a consistent crisp pixel scale and shade logic; finer texture is placed in intentional clusters rather than uniform noise. | **FAIL.** Coarse foliage and one-tile figures contrast with dense repeating roof symbols and vector interface. |

## Priorities sent to the implementation team

1. Recompose the farm around warm earth and irregular rich-green margins; reduce the symmetric boxed-board appearance.
2. Increase scene scale and build tall readable player sprites with consistent pixel density.
3. Replace bubble crowns with layered leaves and trunks; give buildings varied material shading rather than repeated glyph-like roof texture.
4. Replace the modern site shell with compact rustic game UI.
5. Review new images against this rubric before treating the revision as accepted.

## Revision verdict

**PASS for the revised first-release visual direction**, based on actual production image review at 01:40 UTC on September 16, 2026. The original release remains a failed baseline. This is a qualitative review of the six explicit gates, not a numerical similarity score or a claim of matching the reference game's full art quality. See the final evidence below.

## First revision evidence — September 16, 2026, 01:33 UTC

Evidence folder: `/tmp/clover-hollow-monitor/screenshots/2026-09-16T01-33-18.938Z-6246eb3`. Both production and development captures produced four images without page errors. The agent visually inspected the development diagnostic-ripe image, then independently inspected the new character/crop showcase at `/tmp/clover-sprite-showcase.png`.

- **Interface: substantial improvement; final pass pending.** The fullscreen game, ochre timber panels and pixel lettering now share the reference's material language. Remaining visible issues: smooth vector tool icons contrast with the pixel artwork; quest progress wraps its number awkwardly.
- **New sprites in isolation: pass for anatomy/stage readability.** The new farmer has a separate hat/head, red shirt, arms, overalls and boots, with differentiated front/back/side views. New crops have branching leaves and cream roots with purple shoulders, and stages are visibly distinct. Final in-scene acceptance still depends on scale and occlusion.
- **World gates: still fail in this capture.** It contains the old muted ground, symmetric map and bubble canopies; forthcoming renderer changes have not yet been reviewed.

This is an intermediate review, not acceptance of the revised release.

## Final integrated production review — September 16, 2026, 01:40 UTC

Evidence: `/tmp/clover-hollow-monitor/screenshots/2026-09-16T01-40-36.506Z-e8153ca/`. The agent inspected actual production pixels in `production-diagnostic-ripe.png`, `production-mobile.png`, and `production-mobile-startup.png`, after previously viewing the official Steam reference contact sheet. The evidence metadata identifies checkout `e8153ca`, its working tree, and the scripts served by each target. Both production and development produced five screenshots and zero browser page errors.

| Gate | Final verdict | Visible basis |
| --- | --- | --- |
| Palette and ground composition | **PASS** | Golden earth now dominates the farm clearing; saturated green islands have irregular margins and differentiated soil. The centered board border and symmetric road loop are gone. |
| Upright characters and crop forms | **PASS** | Farmer has readable hat/head, shirt, arms, overalls and boots at roughly two ground tiles in height. Crops show distinct leafy seedling and cream/purple mature root forms, with soil visible between. |
| Trees and buildings | **PASS** | Leaf clusters, deeper crown shading, substantial trunks and multiple tree types give volume. Cottages have substantial roofs, gables, front-wall planes, window trim, flower boxes and porches. |
| Camera and visual hierarchy | **PASS** | Close framing makes the farmer, crop stages and building materials legible. The world continues beyond the viewport, and the map no longer presents as a small enclosed board. |
| Rustic pixel interface | **PASS** | Ochre timber panels, pixel lettering, original PNG tool icons and compact HUD belong to the game world. The earlier modern website shell is removed. |
| Coherent pixel detail | **PASS** | Character, crops, terrain, trees, buildings and toolbar consistently use crisp pixel forms and warm/dark shading. The final wall contrast and ground texture refinements reduce the most distracting repeated patterns. |

True touch/mobile review used a new 390×844 browser context with `isMobile` and `hasTouch`, not merely a resized desktop. The earlier clipped quest counter is fixed: `0 / 12` is fully visible. Direction pad, USE button, toolbelt and energy remain readable; the startup toast is above the farmer, and settled gameplay is unobscured. Desktop shortcut text is hidden on mobile.

**No remaining visual release blockers found in these views.** The revision now shares the requested reference's main visual construction. It is still a smaller, simpler and sparser original prototype, with some more uniform procedural texture than the reference's hand-authored environments. This review does not claim exact likeness, equal art quality, or coverage of every possible camera position. Gameplay coverage remains a separate responsibility.

The automated 20-minute timer continues producing evidence until approximately 07:33 UTC. These final image judgments were performed by the agent during this session; the background timer does not repeat human-like visual review autonomously.
