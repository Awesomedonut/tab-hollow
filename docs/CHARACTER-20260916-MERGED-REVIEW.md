# Character iteration 20260916T061625Z: merged action follow-up

Clean worktree fetched origin and merged origin/main as `764df19`, preserving earlier character poses (`88ce31a`), rooted crop/soil adaptations (`a3114cd`) and native sign/chicken integration (`7127d1d`). No main checkout edits or deployment.

The rear hoe now drops from above the head to a visible north-facing impact beside the back, then lifts into recovery. Water spouts lower into the pour and lift back while handles stay attached to the posed hands. These separate integer-pixel tool overlays are Clover-authored; the existing articulated bodies and unchanged native side-hoe frames remain in use. The rear impact is still partly occluded by the body and the four-frame torso motion remains simpler than Stardew's authored action sequences.

## Evidence and comparison

Inspected actual VM `stardew-6.jpg`, the review's older `gameplay-ripe.png`, and the resulting production gameplay capture in `screenshots/character-20260916-merged/gameplay-ripe.png`. The older pale inventory-like bulbs now have smaller exposed crowns, upright multi-leaf foliage and darker ground contacts. Native board signs and chickens replace the previous procedural silhouettes. Soil interiors are quieter with connected edge boundaries retained. The official reference still has substantially richer crop species/heights, trellises, productive bed arrangements and purpose-built farm props. This is a visible increment, not whole-scene acceptance.

`screenshots/character-20260916-merged/action-phases.png` captures production drawFarmer at 20, 120, 230, 330 and 420ms for hoe/water in four directions. Inspected the entire strip and actual in-world rear impact. All real act-triggered windup/impact/recovery scene captures remain under `/home/codex/research/clover-overnight/character/20260916T061625Z/merged-actions/`; player travel alone is shortened. Strip capture uses the dev module on isolated loopback 5247.

Production build served only on VM loopback 5248. `crowns-review.json` records served JS `index-Qqav4tRz.js`, CSS `index-Cyx8yazm.css`, no page errors, 1440x1000/1440x810/390x844 layouts without horizontal overflow, and phone touchpoints=1/coarse pointer=true. Fresh phone image inspected: player, starter crops and touch controls remain visible. Production gameplay-ripe comes from the browser test's real till/plant/water/sleep UI sequence, followed by harvest/sell/buy/save restoration. The separate mature-crop diagnostic is explicitly labeled injected state.

Validation: build passed; 17 game tests and all four browser checks passed on the merged source. Both gameplay/touch browser checks also passed against the production bundle.

## Permission and adaptation provenance

No new downloaded artwork. Ian remains Rafseazz and Ridgeside Village contributors' CC BY-SA 4.0 art from pinned upstream revision `1f3bf6d73039d4b7bec7c9d70a0a1e7ea971f6b9`. Rechecked the preserved README's non-SMAPI license grant and unchanged source SHA256 `0a25d5e6a1c031c7f246013f551b45f06051d9bb2073258635895c93406e11d7`. Original source URL, exact 16x32 input rectangles, body adaptations and this tool-motion delta are recorded in `public/assets/ridgeside-character/provenance.json`; see [character attribution](RIDGESIDE-CHARACTER.md). Existing [crop/soil](NATIVE-FARMING.md) and [sign/chicken](RIDGESIDE-FARM-PROPS.md) provenance remains applicable. No vanilla game art added.
