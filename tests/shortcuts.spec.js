import {test, expect} from '@playwright/test';

test('chests work before play and personal links persist across tabs', async ({page, context}) => {
  await page.goto('/?test');
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.getByRole('link', {name:'GitHub', exact:true})).toBeVisible();
  const other = await context.newPage();
  await other.goto('/');
  await page.getByRole('button', {name:'Edit links'}).click();
  await page.locator('.shortcut-row').first().getByLabel('Name', {exact:true}).fill('My reading');
  await page.locator('.shortcut-row').first().getByLabel('Website').fill('example.com/reading');
  await page.getByRole('button', {name:'Save links', exact:true}).click();
  await expect(page.getByRole('link', {name:'My reading', exact:true})).toHaveAttribute('href', 'https://example.com/reading');
  await expect(other.getByRole('link', {name:'My reading', exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', {name:'My reading', exact:true})).toBeVisible();
  await page.route('https://example.com/reading', route => route.fulfill({body:'Your reading list', contentType:'text/html'}));
  await page.getByRole('link', {name:'My reading', exact:true}).click();
  await expect(page).toHaveURL('https://example.com/reading');
  await expect(page.locator('body')).toHaveText('Your reading list');
});

test('editing pauses play, validates URLs, supports adding and removing, and cancels cleanly', async ({page}) => {
  await page.goto('/?test');
  await expect(page.locator('#loading')).toBeHidden();
  await page.locator('#start-button').click();
  await page.getByRole('button', {name:'Edit links'}).click();
  const before = await page.evaluate(() => ({...window.__farm.game.player, time:window.__farm.game.time, selected:window.__farm.game.selected}));
  await page.locator('.shortcut-row').first().getByLabel('Name', {exact:true}).fill('wasd 1234');
  await page.locator('.shortcut-row').first().getByLabel('Website').fill('javascript:alert(1)');
  await page.getByRole('button', {name:'Save links', exact:true}).click();
  await expect(page.locator('#shortcut-error')).toContainText('http or https');
  expect(await page.evaluate(() => ({...window.__farm.game.player, time:window.__farm.game.time, selected:window.__farm.game.selected}))).toEqual(before);
  await page.getByRole('button', {name:'Cancel', exact:true}).click();
  await expect(page.getByRole('link', {name:'GitHub', exact:true})).toBeVisible();
  await page.getByRole('button', {name:'Edit links'}).click();
  while (await page.getByRole('button', {name:'Remove', exact:true}).count()) await page.getByRole('button', {name:'Remove', exact:true}).first().click();
  await page.getByRole('button', {name:'Save links', exact:true}).click();
  await page.reload();
  await expect(page.locator('.shortcut-chest')).toHaveCount(0);
  await page.getByRole('button', {name:'Edit links'}).click();
  await page.getByRole('button', {name:'+ Add a chest', exact:true}).click();
  await page.getByLabel('Name', {exact:true}).fill('Mail');
  await page.getByLabel('Website', {exact:true}).fill('https://example.com/mail');
  await page.getByRole('button', {name:'Save links', exact:true}).click();
  await expect(page.getByRole('link', {name:'Mail', exact:true})).toBeVisible();
});

test('mobile chests fit the page and broken storage falls back to examples', async ({page}) => {
  await page.setViewportSize({width:390, height:844});
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('tab-hollow-shortcuts-v1', '{broken'));
  await page.reload();
  await expect(page.locator('#loading')).toBeHidden();
  await expect(page.getByRole('link', {name:'GitHub', exact:true})).toBeVisible();
  await expect(page.locator('#shortcut-notice')).toContainText('Showing examples');
  await page.screenshot({path:'test-results/shortcuts-mobile.png'});
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name:'Edit links'}).click();
  await expect(page.getByRole('button', {name:'Save links', exact:true})).toBeInViewport();
  await page.screenshot({path:'test-results/shortcuts-editor-mobile.png'});
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Blocked'); }; });
  await page.getByRole('button', {name:'Save links', exact:true}).click();
  await expect(page.locator('#shortcut-error')).toContainText('could not save');
  await expect(page.locator('#shortcut-editor')).toBeVisible();
});
