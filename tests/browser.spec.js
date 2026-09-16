import { test, expect } from '@playwright/test';
const place = async (page,x,y,facing='down') => {
 await page.evaluate(({x,y,facing})=>{Object.assign(window.__farm.game.player,{x,y,facing});window.__farm.renderer.render(window.__farm.game,0);},{x,y,facing});
};
const farmKey='tab-hollow-farm-v1';
test('browser completes first harvest, sells, buys and restores its save', async ({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?test');await expect(page.locator('#loading')).toBeHidden();
 await page.screenshot({path:'test-results/welcome-desktop.png'});
 await page.locator('#start-button').click();
 const before=await page.evaluate(()=>window.__farm.game.player.x);
 await page.keyboard.down('d');await page.waitForTimeout(400);await page.keyboard.up('d');
 expect(await page.evaluate(()=>window.__farm.game.player.x)).toBeGreaterThan(before+1);

 const planted=Array.from({length:6},(_,i)=>({x:15+i,y:15}));
 const starters=await page.evaluate(()=>window.__farm.game.tiles.filter(t=>t.crop).slice(0,6).map(({x,y})=>({x,y})));
 const plots=[...planted,...starters];
 async function work(tool, subset=plots) {
  await page.keyboard.press(tool);
  for(const {x,y} of subset) {
   await place(page,x+.5,y-.35);
   await page.keyboard.press('Space');
  }
 }

 await place(page,15.5,13.65);
 const click=await page.evaluate(()=>{
  const canvas=document.querySelector('#game'), box=canvas.getBoundingClientRect(), r=window.__farm.renderer;
  const origin=r.screenToWorld(box.left,box.top), step=r.screenToWorld(box.left+1,box.top+1);
  return {x:box.left+(15.5-origin.x)/(step.x-origin.x),y:box.top+(14.5-origin.y)/(step.y-origin.y)};
 });
 await page.mouse.click(click.x,click.y);
 expect(await page.evaluate(()=>window.__farm.game.tiles.find(t=>t.x===15&&t.y===14).tilled)).toBe(true);
 await work('1',planted);expect(await page.evaluate(()=>window.__farm.game.tiles.filter(t=>t.x>=15&&t.x<=20&&t.y===15&&t.tilled).length)).toBe(6);
 await work('2',planted);expect(await page.evaluate(()=>window.__farm.game.seeds)).toBe(0);
 for(let day=0;day<3;day++) {
  await work('3');
  expect(await page.evaluate(()=>window.__farm.game.tiles.filter(t=>t.y===15&&t.x>=15&&t.x<=20&&t.watered).length)).toBe(6);
  await place(page,15.5,11.8);await page.keyboard.press('e');
  expect(await page.evaluate(()=>window.__farm.game.day)).toBe(day+2);
 }
 expect(await page.evaluate(plots=>plots.every(({x,y})=>window.__farm.game.tiles.find(t=>t.x===x&&t.y===y)?.crop?.growth===3),plots)).toBe(true);
 await place(page,19.5,16.5);await page.waitForTimeout(200);
 await page.screenshot({path:'test-results/ripe-desktop.png'});
 await work('4');expect(await page.evaluate(()=>window.__farm.game.harvest)).toBe(12);
 await place(page,18.5,12.3);await page.keyboard.press('e');
 await expect(page.locator('#coins-label')).toHaveText('380');
 await page.locator('#quest-toggle').click();
 await expect(page.locator('#quest-card')).toBeVisible();
 await expect(page.locator('.quest-card h2')).toHaveText('Roots in the valley');
 await expect(page.locator('#quest-count')).toHaveText('12 / 12');
 await page.keyboard.press('j');await expect(page.locator('#quest-card')).toBeHidden();
 await place(page,28.5,11.5);await page.keyboard.press('e');
 expect(await page.evaluate(()=>window.__farm.game.seeds)).toBe(6);
 await expect(page.locator('#coins-label')).toHaveText('350');
 expect(JSON.parse(await page.evaluate(key=>localStorage.getItem(key),farmKey)).stats.sold).toBe(12);
 await page.reload();await expect(page.locator('#loading')).toBeHidden();
 await expect(page.locator('#start-button')).toContainText('Welcome home');await page.locator('#start-button').click();
 await expect(page.locator('#coins-label')).toHaveText('350');await expect(page.locator('#quest-count')).toHaveText('12 / 12');
 await page.locator('#help-button').click();
 const paused=await page.evaluate(()=>window.__farm.game.time);await page.waitForTimeout(400);
 expect(await page.evaluate(()=>window.__farm.game.time)).toBe(paused);
 await page.locator('#resume-button').click();
 expect(errors).toEqual([]);
});
test('click tools, mobile touch controls, reset confirmation and invalid-save recovery',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/?test');await expect(page.locator('#loading')).toBeHidden();
 await page.screenshot({path:'test-results/welcome-mobile.png'});
 await page.locator('#start-button').click();
 const x0=await page.evaluate(()=>window.__farm.game.player.x);
 const right=page.locator('[data-dir=right]');
 await right.dispatchEvent('pointerdown',{pointerId:1});await page.waitForTimeout(350);await right.dispatchEvent('pointerup',{pointerId:1});
 expect(await page.evaluate(()=>window.__farm.game.player.x)).toBeGreaterThan(x0+.8);
 await place(page,19.5,16.5);
 await page.locator('[data-tool=hoe]').click();await page.locator('#touch-act').click();
 expect(await page.evaluate(()=>window.__farm.game.tiles.find(t=>t.x===19&&t.y===17).tilled)).toBe(true);
 await page.locator('[data-tool=seeds]').click();await page.locator('#touch-act').click();
 expect(await page.evaluate(()=>window.__farm.game.seeds)).toBe(5);
 await page.locator('[data-tool=water]').click();await page.locator('#touch-act').click();
 await page.screenshot({path:'test-results/farm-mobile.png'});
 await page.locator('#help-button').click();await page.locator('#reset-button').click();await page.locator('#cancel-reset').click();
 expect(await page.evaluate(()=>window.__farm.game.seeds)).toBe(5);
 await page.locator('#reset-button').click();await page.locator('#confirm-reset').click();
 expect(await page.evaluate(()=>window.__farm.game.seeds)).toBe(6);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);

 await page.goto('/');await page.evaluate(key=>localStorage.setItem(key,'not-json'),farmKey);await page.goto('/?test');
 await expect(page.locator('#loading')).toBeHidden();await page.locator('#start-button').click();
 expect(await page.evaluate(()=>window.__farm.game.day)).toBe(1);expect(errors).toEqual([]);
 await context.close();
});
