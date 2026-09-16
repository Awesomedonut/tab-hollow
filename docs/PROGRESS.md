# Build progress monitoring

Project: `/home/codex/projects/clover-hollow` on the Azure VM.

The project-specific monitor runs `ops/monitor.sh` every 1,200 seconds (20 minutes). It records branch and commit, modified paths, upstream alignment, a live remote branch comparison, production build and gameplay tests when the required files exist, and HTTP reachability on loopback ports 4173 and 5173. Builds use `/tmp/clover-hollow-monitor/build` so monitoring does not replace the served production build.

Screenshot evidence is captured by `ops/monitor-capture.mjs` for available production and development services, including welcome, fresh farm, diagnostic ripe crops, and mobile views. Each capture directory records timestamps, checkout commit, working tree and served JavaScript URLs. Captures do not assess visual similarity: an agent reviews actual images during the session using `docs/VISUAL-REVIEW.md`.

Runtime files are outside the repository at `/tmp/clover-hollow-monitor/`: `monitor.log`, `monitor.pid`, `build.log`, and `tests.log`. A process lock prevents duplicate monitors. The original six-hour monitoring session ended. A new visual revision session starts approximately 01:33 UTC on September 16, 2026, and runs every 20 minutes until approximately 07:33 UTC. No release-completion marker is being created. The monitor exits after six hours; an optional `ops/RELEASE_COMPLETE` marker would also stop it at the next scheduled wake. It only inspects this project and these loopback ports; it never starts, restarts, or stops application services.

Start on the VM:

```sh
mkdir -p /tmp/clover-hollow-monitor
nohup ./ops/monitor.sh >> /tmp/clover-hollow-monitor/monitor.log 2>&1 < /dev/null &
```

Stop this monitor immediately:

```sh
kill "$(cat /tmp/clover-hollow-monitor/monitor.pid)"
```

## First release review — September 15, 2026, 18:51 UTC

- The first playable release is serving at https://clover-hollow.20-119-164-122.sslip.io, with production HTTP on VM loopback port 4173.
- Independent VM checks returned HTTP 200 for the page, production JavaScript, stylesheet, and both Kenney sprite atlases through both origins. Asset bytes matched between loopback and HTTPS, MIME types were correct, and both atlases had valid PNG signatures.
- Local `main` and the live remote branch matched at release commit `3420354` before this documentation update.
- The coordinating agent reports 12 passing gameplay tests and passing desktop/mobile browser coverage including the full farming cycle. This review verified deployment and assets independently without rerunning those suites.
- The monitor process is still active; runtime PID is recorded in `/tmp/clover-hollow-monitor/monitor.pid`. Its next scheduled wake is approximately 19:04 UTC, when production build and gameplay test checks will run now that implementation files exist.
- The monitor is deliberately bounded to this six-hour session. It does not promise ongoing availability, external alerts, or monitoring after that window.
- Review handoff: the HTTPS Caddy configuration was still untracked at review time; the coordinating agent was notified to include it in the release documentation commit.
- Development, asset download, build, tests, and deployment work took place on the Azure VM. The repository uses original gameplay and CC0 Kenney art documented in `docs/ASSETS.md`.

## Visual revision reopened — September 16, 2026, 01:33 UTC

The user rejected the original release's visual similarity. Its deployment and gameplay checks above remain historical checks, not visual acceptance. The independent visual reviewer inspected the rendered original release and official reference contact sheet, and failed all six style gates in `docs/VISUAL-REVIEW.md`. Terrain/building art, tall player/crop sprites, and rustic UI are now being revised by the team.

The new six-hour monitor captures evidence every 1,200 seconds without modifying gameplay source or restarting application services. Its first capture runs immediately. It records browser errors but makes no automated similarity claim and sends no external alerts. The next acceptance decision requires actual new-image inspection by the reviewing agent.

## Revised visual release review — September 16, 2026, 01:40 UTC

The independent reviewer inspected the latest production desktop and genuine touch/mobile screenshots at `/tmp/clover-hollow-monitor/screenshots/2026-09-16T01-40-36.506Z-e8153ca/`. All six first-release visual gates now pass, with specific visible evidence and limitations documented in `docs/VISUAL-REVIEW.md`. The earlier mobile counter clipping is resolved, and ten production/development screenshot captures recorded no browser page errors.

The renewed monitoring process remains active, with PID stored in `/tmp/clover-hollow-monitor/monitor.pid`; its next scheduled wake is approximately 01:53 UTC and its bounded session ends approximately 07:33 UTC. The timer captures evidence and runs technical checks; the agent performed the actual image comparison during the live work session.

## Sourced-art release — September 16, 2026, 05:00 UTC

The user rejected the earlier broad visual acceptance. This release replaces the dominant procedural trees/bushes with Simple Foliage mod sprites; the cottage, market and well with MourningStar preview-derived artwork; and generated lawn glyphs with authored LPC grass. Public attribution is available from the field guide at `/credits.html`. Exact provenance, permission statements and adaptations are recorded in the asset documents.

The independent visual director and coordinating agent inspected the final rendered scene. The director also inspected 1440×810 desktop and genuine 390×844 touch-browser evidence against official Stardew screenshots. The sourced integration and layout pass; this is not a claim of faithful vanilla Stardew appearance. Building preview pixels are softer than native sheets; water, small props and terrain variety remain simpler. Current findings are in `VISUAL-TARGET-V3.md`; the earlier acceptance language above is historical.

Validation on the VM: all 15 simulation tests and both browser scenarios passed on the final stable build. Deployment serves `/assets/index-C28q_8Aj.js`; the public page and credits returned HTTP 200, all seven checked scenery PNGs decoded at their expected dimensions, public credit/license links returned 200, and the browser recorded no page errors. The private GitHub repository remains private. All editing, downloads, builds, tests, captures and Git pushes ran on the VM.

At 04:57 UTC the existing 20-minute monitor was alive; its 04:56 check passed build, gameplay, Git alignment and production/development screenshot capture with no browser errors. It remains a bounded health/evidence logger scheduled to end around 07:33 UTC, not an autonomous visual judge.

## 2026-09-16 native-mod release and overnight handoff

All implementation, asset downloads, screenshot capture, tests and Git operations remain on the Azure VM. Native Ridgeside Ian, warm distinct buildings, shipping box, grass/dirt/water, fences, barrels and pier boards replace the earlier mixed rendering. Simple Resources supplies native rocks, logs, weeds and stumps. Upstream art attribution, license statements and crop provenance are retained. New farms have eight prepared empty plots; existing saves preserve their farm state.

Stable-build verification: 17 simulation tests and both desktop/touch Playwright scenarios passed. Actual 1440×1000, 1440×810 and 390×844 touch screenshots were inspected against official Stardew references. Native character and architecture now fit; full visual acceptance remains withheld. The next pass must improve flat tilled soil, crop stage sprites, repeated grass interiors, pond movement and dedicated tool-body animation. Technical checks do not substitute for visual review.

Two persistent VM Codex workers use isolated overnight/character and overnight/world branches. A systemd visual-review agent runs every 30 minutes, integrates useful changes, validates stable builds and screenshots, and deploys/pushes. Runtime logs and current review: /home/codex/research/clover-overnight. See ops/overnight/README.md for status and stop commands.
