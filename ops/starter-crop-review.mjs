
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const origin=process.env.PLAY_URL||'http://127.0.0.1:5247';
const out=process.env.REVIEW_DIR||'/home/codex/research/clover-overnight/character/20260916T065146Z';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
const report={origin,head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),workingTree:execFileSync('git',['status','--short'],{encoding:'utf8'}),errors:[],layouts:[],growth:[]};
const place=async(page,x,y,facing='down')=>page.evaluate(p=>{Object.assign(window.__farm.game.player,p);window.__farm.renderer.render(window.__farm.game,0)},{x,y,facing});
for(const [name,width,height,mobile] of [['desktop',1440,1000,false],['wide',1440,810,false],['phone',390,844,true]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(origin+'/?test');await page.locator('#start-button').click();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(5500);
 await page.screenshot({path:out+'/built-fresh-'+name+'.png'});
 const metadata=await page.evaluate(name=>({name,width:innerWidth,documentWidth:document.documentElement.scrollWidth,touchpoints:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches,crops:window.__farm.game.tiles.filter(t=>t.crop),tilled:window.__farm.game.tiles.filter(t=>t.tilled).length,assets:performance.getEntriesByType('resource').map(r=>r.name).filter(n=>n.includes('/assets/'))}),name);
 if(metadata.crops.length!==12||metadata.tilled!==24||metadata.width!==metadata.documentWidth)throw Error('Fresh layout/state regression');
 report.layouts.push(metadata);
 if(name==='desktop'){
  const crops=metadata.crops;
  for(let day=0;day<3;day++){
   await page.keyboard.press('3');
   for(const {x,y} of crops){await place(page,x+.5,y-.35);await page.keyboard.press('Space');}
   await place(page,15.5,11.8);await page.keyboard.press('e');
   report.growth.push(await page.evaluate(()=>({day:window.__farm.game.day,crops:window.__farm.game.tiles.filter(t=>t.crop)})));

   await place(page,21.5,17.5,'right');await page.waitForTimeout(500);
   await page.screenshot({path:out+'/built-gameplay-growth-day-'+(day+2)+'.png'});
  }
  if(report.growth[2].crops.some(t=>t.crop.growth!==3))throw Error('Starter crops did not ripen through gameplay');
  await place(page,21.5,17.5,'right');await page.waitForTimeout(5500);
  await page.screenshot({path:out+'/built-gameplay-ripe.png'});
  const bounds=await page.evaluate(()=>{
   const canvas=document.querySelector('#game'),b=canvas.getBoundingClientRect(),r=window.__farm.renderer;
   const o=r.screenToWorld(b.left,b.top),s=r.screenToWorld(b.left+1,b.top+1),scale=1/(s.x-o.x);
   return {x:Math.round(b.left+(21-o.x)*scale),y:Math.round(b.top+(15-o.y)*scale),width:Math.round(4*scale),height:Math.round(5*scale)};
  });
  await page.screenshot({path:out+'/built-gameplay-ripe-close.png',clip:bounds});

  const allCrowns=await page.evaluate(()=>{
   const canvas=document.querySelector('#game'),b=canvas.getBoundingClientRect(),r=window.__farm.renderer;
   const o=r.screenToWorld(b.left,b.top),s=r.screenToWorld(b.left+1,b.top+1),scale=1/(s.x-o.x);
   return {x:Math.round(b.left+(15.75-o.x)*scale),y:Math.round(b.top+(12.5-o.y)*scale),width:Math.round(3*scale),height:Math.round(3*scale)};
  });
  await page.screenshot({path:out+'/built-gameplay-three-crowns.png',clip:allCrowns});
  report.threeCrownCapture={clip:allCrowns,nativeSize:[48,48],tiles:[[16,13],[17,13],[16,14],[17,14]],variants:[1,2,0,1]};

 }
 await page.close();
}
await browser.close();await writeFile(out+'/built-review.json',JSON.stringify(report,null,2));
