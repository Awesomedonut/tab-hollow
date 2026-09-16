
import {chromium} from '@playwright/test';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const origin=process.env.PLAY_URL;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Explicit VM loopback required');
const directory=process.env.CAPTURE_DIR;
if(!directory)throw Error('Explicit CAPTURE_DIR required');
fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/?test');await page.locator('#loading').waitFor({state:'hidden'});
 await page.locator('#start-button').click();await page.evaluate(()=>document.fonts.ready);
 const place=async(x,y)=>page.evaluate(({x,y})=>{
  Object.assign(window.__farm.game.player,{x,y,facing:'down'});
  window.__farm.renderer.render(window.__farm.game,0);
 },{x,y});
 const cells=await page.evaluate(()=>window.__farm.game.tiles.filter(t=>t.tilled&&!t.crop&&
  ((t.x<=16&&t.y>=16)||(t.x>=22&&t.y<=14))).map(({x,y})=>({x,y})));
 assert.equal(cells.length,10);
 const work=async tool=>{
  await page.keyboard.press(tool);
  for(const {x,y}of cells){await place(x+.5,y-.35);await page.keyboard.press('Space');}
 };
 const state=()=>page.evaluate(()=>{
  const g=window.__farm.game;
  return {day:g.day,coins:g.coins,seeds:g.seeds,harvest:g.harvest,tilled:g.tiles.filter(t=>t.tilled).length,
   crops:g.tiles.filter(t=>t.crop),sold:g.stats.sold,scripts:[...document.scripts].map(s=>s.src).filter(Boolean)};
 });
 const report={origin,kind:'Actual seed/water/sleep/harvest/sell UI actions, travel shortened; no injected crop state',cells,before:await state(),days:[]};
 await work('2');
 for(let day=0;day<3;day++){
  await work('3');await place(15.5,11.8);await page.keyboard.press('e');
  report.days.push(await state());
 }
 const ripe=await state();
 assert.equal(ripe.crops.filter(t=>t.crop.growth===3).length,10);
 assert.equal(ripe.seeds,2);assert.equal(ripe.tilled,24);
 await place(19.5,16.5);await page.waitForTimeout(5500);
 await page.screenshot({path:directory+'/gameplay-added-beds-ripe.png'});
 await work('4');assert.equal((await state()).harvest,10);
 await place(18.5,12.3);await page.keyboard.press('e');
 report.afterSale=await state();assert.equal(report.afterSale.coins,330);assert.equal(report.afterSale.sold,10);
 await page.reload();await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
 report.afterReload=await state();assert.equal(report.afterReload.coins,330);assert.equal(report.afterReload.sold,10);
 assert.equal(report.afterReload.harvest,0);assert.equal(report.afterReload.seeds,2);
 assert.equal(report.afterReload.crops.length,6);assert.equal(report.afterReload.tilled,24);
 assert.deepEqual(errors,[]);report.errors=errors;
 fs.writeFileSync(directory+'/added-beds-gameplay.json',JSON.stringify(report,null,2)+'\n');
}finally{await browser.close();}
