import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.env.REVIEW_DIR||'/home/codex/research/clover-overnight/character/20260916T061625Z';
const origin=process.env.PLAY_URL||'http://127.0.0.1:5236';await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});const errors=[],layouts=[];
for(const [name,width,height,mobile] of [['desktop',1440,1000,false],['wide',1440,810,false],['phone',390,844,true]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/?test');await page.locator('#start-button').click();await page.waitForTimeout(5500);
 await page.screenshot({path:out+'/crowns-fresh-'+name+'.png'});
 layouts.push(await page.evaluate(name=>({name,width:innerWidth,documentWidth:document.documentElement.scrollWidth,touchpoints:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches,assets:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('/assets/'))}),name));
 if(name==='desktop'){
  await page.evaluate(()=>{window.requestAnimationFrame=()=>0});await page.waitForTimeout(50);
  await page.evaluate(()=>{
   const {game,renderer}=window.__farm;
   for(const tile of game.tiles){if(tile.x>=16&&tile.x<=21&&tile.y>=14&&tile.y<=17){tile.tilled=true;tile.watered=tile.y%2===1;tile.crop={growth:3};}}
   Object.assign(game.player,{x:18.5,y:18.5,facing:'up'});renderer.render(game,0);
   const label=document.createElement('div');label.textContent='DIAGNOSTIC — injected mature crops, not gameplay evidence';label.style='position:fixed;top:80px;left:100px;background:#fff0bd;color:#392a29;padding:8px;font:18px monospace;z-index:99';document.body.append(label);
  });await page.screenshot({path:out+'/crowns-mature-diagnostic.png'});
 }
 await page.close();
}
await writeFile(out+'/crowns-review.json',JSON.stringify({origin,errors,layouts},null,2));await browser.close();
