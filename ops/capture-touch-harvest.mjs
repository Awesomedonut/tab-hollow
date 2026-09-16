
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.PLAY_URL;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Explicit VM loopback required');
const directory=process.env.CAPTURE_DIR;fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/?test');await page.locator('#loading').waitFor({state:'hidden'});
 await page.locator('#start-button').tap();await page.evaluate(()=>document.fonts.ready);
 const place=async(x,y)=>{
  await page.evaluate(({x,y})=>{Object.assign(window.__farm.game.player,{x,y,facing:'down'});window.__farm.renderer.render(window.__farm.game,0);},{x,y});
  await page.waitForTimeout(60);
 };
 const work=async tool=>{
  await place(19.5,16.5);await page.locator(`[data-tool=${tool}]`).tap();await page.locator('#touch-act').tap();
 };
 await work('hoe');await work('seeds');
 for(let day=0;day<3;day++){
  await work('water');
  assert.equal(await page.evaluate(()=>window.__farm.game.tiles.find(t=>t.x===19&&t.y===17).watered),true);
  await place(15.5,11.8);await page.locator('#interaction').tap();
  assert.equal(await page.evaluate(()=>window.__farm.game.day),day+2);
 }
 assert.equal(await page.evaluate(()=>window.__farm.game.tiles.find(t=>t.x===19&&t.y===17).crop.growth),3);
 await place(19.5,16.5);await page.waitForTimeout(6500);
 await page.screenshot({path:`${directory}/touch-grown-ripe.png`});
 await work('harvest');assert.equal(await page.evaluate(()=>window.__farm.game.harvest),1);
 await place(18.5,12.3);await page.locator('#interaction').tap();
 assert.equal(await page.evaluate(()=>window.__farm.game.coins),105);
 await page.reload();await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').tap();
 await page.waitForTimeout(6500);await page.screenshot({path:`${directory}/touch-sold-reloaded.png`});
 const state=await page.evaluate(()=>({day:window.__farm.game.day,coins:window.__farm.game.coins,seeds:window.__farm.game.seeds,sold:window.__farm.game.stats.sold,harvest:window.__farm.game.harvest,touch:navigator.maxTouchPoints,coarse:matchMedia('(pointer:coarse)').matches,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scripts:[...document.scripts].map(s=>s.src).filter(Boolean)}));
 assert.equal(state.day,4);assert.equal(state.coins,105);assert.equal(state.seeds,5);assert.equal(state.sold,1);assert.equal(state.harvest,0);assert.equal(state.width,state.scrollWidth);assert.deepEqual(errors,[]);
 fs.writeFileSync(`${directory}/touch-gameplay.json`,JSON.stringify({origin,note:'Actual touchscreen taps: till, plant, water three days, sleep three nights, harvest, sell, reload. Only travel shortened by player relocation; no crop growth, time, day, inventory or save fixtures.',state,errors},null,2)+'\n');
 await context.close();
}finally{await browser.close();}
