# Tab Hollow

A little farm for your new tab, starting from [Clover Hollow](https://github.com/Awesomedonut/clover-hollow).

The farm is playable now: grow crops, finish quests, manage your inventory, and save your progress in the browser. The Brave extension and productivity features are still to come.

## Shortcut chests

The chests at the top open websites with one click, even before you enter the farm. Links open in the current tab; Ctrl/Cmd-click works as usual.

Use **Edit links** to name your chests and set their addresses. You can add up to eight, remove any you don't need, or start with none. Changes save in this browser and appear in other open Tab Hollow tabs.

The repo includes a few examples in src/shortcuts.defaults.json. Personal links are stored as JSON in browser storage, separate from your farm save. Editing them in the page doesn't change any repo files or send them to a server. Clearing site data removes your saved links.

JSON keeps the data separate from the UI; it doesn't make a file private. Anything committed to this public repo is public, so keep personal addresses out of the defaults file.

## Making it your Brave new tab

Brave supports Chrome extensions that replace the new-tab page. The plan is to package Tab Hollow as a Manifest V3 extension, with the farm and its assets included in the download.

The manifest points new tabs at the extension's own page:

~~~json
"chrome_url_overrides": {
  "newtab": "index.html"
}
~~~

That's a fragment of the planned manifest, not a complete extension yet. Once packaged, opening a new tab will load Tab Hollow directly. It will work offline, without a redirect or a running web server. The VM won't need to be online for you to use it.

For development, we'll build the extension on the VM and copy the finished folder to the Mac. In Brave, open brave://extensions, turn on **Developer mode**, choose **Load unpacked**, and select that folder. Brave runs the extension locally; source edits, builds, and tests stay on the VM.

A hosted version would still be useful for previews and sharing a link.

## What belongs on the page

Search, shortcuts, and today's tasks should be easy to reach as soon as a tab opens. The farm can sit beside them or in the background, with room to expand it when you want to play.

The idea is for completed tasks and focus sessions to help the farm grow. Opening more tabs shouldn't be the way to earn progress.

A few things need to work before this becomes an everyday new tab:

- Share one farm across open tabs. An older tab must not overwrite progress made in a newer one.
- Pause animation and unnecessary work in background tabs.
- Keep search and tasks usable without entering the game.
- Keep saves on the device, with no account required.

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
