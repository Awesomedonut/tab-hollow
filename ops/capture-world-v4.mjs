

import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const origin=process.env.PLAY_URL || 'http://127.0.0.1:5188';
if(!['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname))throw new Error('VM loopback URL required');
const directory=process.env.CAPTURE_DIR||'docs/screenshots/world-v4-native';fs.mkdirSync(directory,{recursive:true});
const metadata={checkout:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTree:execFileSync('git',['status','--short'],{encoding:'utf8'}).trim(),origin,capturedAt:new Date().toISOString(),captures:[]};
const browser=await chromium.launch({headless:true});
try{
 for(const [name,options]of [['desktop',{viewport:{width:1440,height:1000}}],['desktop-16x9',{viewport:{width:1440,height:810}}],['touch',{viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1}]]){
  const context=await browser.newContext(options),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));

  if(name==='desktop')await page.clock.install();
  await page.goto(origin+'/?test');await page.locator('#loading').waitFor({state:'hidden'});
  await page.locator('#start-button').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(7000);await page.locator('#welcome').waitFor({state:'hidden'});
  await page.screenshot({path:`${directory}/${name}.png`});
  const state=await page.evaluate(()=>({touch:navigator.maxTouchPoints,coarse:matchMedia('(pointer:coarse)').matches,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scripts:[...document.scripts].map(s=>s.src).filter(Boolean),tilled:window.__farm.game.tiles.filter(t=>t.tilled).length,crops:window.__farm.game.tiles.filter(t=>t.crop).length}));
  if(errors.length||state.width!==state.scrollWidth)throw new Error(JSON.stringify({errors,state}));
  metadata.captures.push({name,path:`${directory}/${name}.png`,options,errors,state});
  if(name==='desktop'){
   await page.evaluate(()=>{
    Object.assign(window.__farm.game.player,{x:29,y:20.8,facing:'right'});
    window.__farm.renderer.render(window.__farm.game,0);
    const label=document.createElement('div');label.textContent='CAMERA DIAGNOSTIC: player moved to pier; fresh crop state unchanged';
    label.style.cssText='position:fixed;top:12px;left:20%;padding:8px;background:#ffe4ac;color:#513b26;font:14px monospace;z-index:999';document.body.append(label);
   });
   await page.clock.pauseAt(await page.evaluate(()=>new Date(Date.now()+100)));
   await page.screenshot({path:`${directory}/pond-camera-diagnostic.png`});
   for(let frame=1;frame<=4;frame++){
    await page.clock.runFor(250);
    await page.screenshot({path:`${directory}/pond-camera-${frame*250}ms.png`});
   }
   metadata.diagnostic={path:`${directory}/pond-camera-diagnostic.png`,player:{x:29,y:20.8},note:'Camera/player relocation only; no crop, day or inventory fixture.'};
  }
  if(errors.length)throw new Error(JSON.stringify({name,errors}));
  await context.close();
 }
 fs.writeFileSync(`${directory}/capture.json`,JSON.stringify(metadata,null,2)+'\n');
}finally{await browser.close();}
