# Tab Hollow

A cozy, gamified new-tab project starting from [Clover Hollow](https://github.com/Awesomedonut/clover-hollow).

This initial version preserves the playable pixel-art farm, crops, quests, inventory, browser saves, and bundled artwork. New-tab browser integration and productivity features are planned.

## Development

All development, installs, builds, tests, commits, and pushes run on the Azure VM.

Project directory: /home/codex/projects/tab-hollow

Requires Node.js 22 or later.

~~~sh
npm ci
npm run dev -- --port 5273 --strictPort
~~~

## Checks

~~~sh
npm test
npm run build
npm run test:e2e
~~~

Browser tests launch an isolated server on loopback port 5273. Playwright Chromium must be installed on the VM.

## Play

Move with WASD or arrow keys. Select tools with 1–4, work with Space, and interact with E. Plant and water turnips, sleep at the cottage, harvest, and sell at the shipping box. Farm progress saves in this browser.

## Source and credits

Copied from Clover Hollow revision a423a58 with fresh Git history. Asset licenses, credits, source provenance, and the inherited documentation remain included. See [asset credits](docs/ASSETS.md) and [in-game credits](public/credits.html).

The inherited docs and ops directory describe the original Clover Hollow project and its infrastructure. They are historical references, not Tab Hollow deployment instructions.
