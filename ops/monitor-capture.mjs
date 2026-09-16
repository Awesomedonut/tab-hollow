import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const runtime = process.env.CLOVER_MONITOR_RUNTIME || '/tmp/clover-hollow-monitor';
const timestamp = new Date().toISOString().replaceAll(':', '-');
const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
const directory = path.join(runtime, 'screenshots', timestamp + '-' + head);
await mkdir(directory, { recursive: true });
const report = {
  timestamp, checkoutHead: head,
  workingTree: execFileSync('git', ['status', '--short'], { encoding: 'utf8' }).trim(),
  note: 'Screenshots are evidence, not a computer-vision similarity score. Checkout HEAD need not equal deployed build. An agent must inspect images against references.',
  targets: [],
};
const browser = await chromium.launch({ headless: true });
try {
  for (const [label, url] of [['production', 'http://127.0.0.1:4173'], ['development', 'http://127.0.0.1:5173']]) {
    const target = { label, url, images: [], errors: [] };
    report.targets.push(target);
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', error => target.errors.push(error.message));
    try {
      await page.goto(url + '/?test', { waitUntil: 'networkidle', timeout: 10000 });
      target.servedScripts = await page.locator('script[src]').evaluateAll(nodes => nodes.map(node => node.getAttribute('src')));
      await page.locator('#loading').waitFor({ state: 'hidden', timeout: 10000 });
      for (const stage of ['welcome', 'fresh-farm', 'diagnostic-ripe']) {
        if (stage === 'fresh-farm' && await page.locator('#start-button').isVisible()) {
          await page.locator('#start-button').click();
        }
        if (stage === 'diagnostic-ripe') {
          target.diagnosticFixtureApplied = await page.evaluate(() => {
            const game = window.__farm?.game;
            if (!game) return false;
            game.player.x = 19.5; game.player.y = 16.5; game.player.facing = 'down';
            game.time = 720;
            for (const tile of game.tiles) {
              if (tile.x >= 15 && tile.x <= 20 && tile.y >= 13 && tile.y <= 15) {
                tile.tilled = true; tile.watered = true; tile.crop = { growth: 3 };
              }
            }
            return true;
          });
        }
        await page.waitForTimeout(300);
        const name = label + '-' + stage + '.png';
        await page.screenshot({ path: path.join(directory, name) });
        target.images.push(name);
      }
      const mobileContext = await browser.newContext({
        viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      });
      try {
        const mobile = await mobileContext.newPage();
        mobile.on('pageerror', error => target.errors.push('mobile: ' + error.message));
        await mobile.goto(url + '/?test', { waitUntil: 'networkidle', timeout: 10000 });
        await mobile.locator('#loading').waitFor({ state: 'hidden', timeout: 10000 });
        if (await mobile.locator('#start-button').isVisible()) await mobile.locator('#start-button').click();
        await mobile.waitForTimeout(300);
        const startupName = label + '-mobile-startup.png';
        await mobile.screenshot({ path: path.join(directory, startupName) });
        target.images.push(startupName);
        await mobile.waitForTimeout(6000);
        const name = label + '-mobile.png';
        await mobile.screenshot({ path: path.join(directory, name) });
        target.images.push(name);
      } finally {
        await mobileContext.close();
      }
    } catch (error) {
      target.errors.push(error.message);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(path.join(directory, 'evidence.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log('Visual evidence: ' + directory);
for (const target of report.targets) {
  console.log(target.label + ': ' + target.images.length + ' images; ' + target.errors.length + ' errors');
}
