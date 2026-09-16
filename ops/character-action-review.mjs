
import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const origin=process.env.PLAY_URL||'http://127.0.0.1:5236';
const out=process.env.REVIEW_DIR||'/home/codex/research/clover-overnight/character/20260916T061625Z';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});

for(const name of ['character-art','character-poses','sourced-art','world-art','game']) {
 const body=await readFile(new URL('../src/'+name+'.js',import.meta.url),'utf8');
 await context.route('**/src/'+name+'.js',route=>route.fulfill({contentType:'text/javascript',body}));
}
const page=await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(origin+'/?test');await page.locator('#start-button').click();await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:out+'/fresh-desktop.png'});
await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(50);
await page.evaluate(async()=>{
 const {drawFarmer,loadCharacterArt}=await import('/src/character-art.js');await loadCharacterArt();
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1320;
 document.body.replaceChildren(canvas);document.body.style='margin:0;background:#d8bd83';
 const c=canvas.getContext('2d');c.fillStyle='#d8bd83';c.fillRect(0,0,canvas.width,canvas.height);
 c.fillStyle='#392a29';c.font='20px monospace';c.fillText('Ian action adaptation — actual drawFarmer, fixed feet',24,30);
 c.font='15px monospace';['windup 20ms','swing 120ms','impact/pour 230ms','recovery 330ms','idle 420ms'].forEach((s,i)=>c.fillText(s,140+i*186,62));
 for(const [row,key] of ['hoe down','hoe up','hoe right','hoe left','water down','water up','water right','water left'].entries()) {
  const [type,facing]=key.split(' ');const y=190+row*156;
  c.fillStyle='#392a29';c.fillText(key,12,y-40);
  for(const [col,t] of [.02,.12,.23,.33,.42].entries()) {
   const x=175+col*186;
   c.fillStyle='#9b8b67';c.fillRect(x-50,y,110,1);
   c.save();c.translate(x,y);c.scale(4,4);
   const action={type};drawFarmer(c,{x:-100,y:-100,facing},0,action);
   drawFarmer(c,{x:0,y:0,facing},t,action);c.restore();
  }
 }
 });
await page.setViewportSize({width:1080,height:1320});await page.screenshot({path:out+'/action-phases.png'});

const scene=await context.newPage();scene.on('pageerror',e=>errors.push(e.message));
await scene.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
await scene.goto(origin+'/?test');await scene.locator('#start-button').click();await scene.evaluate(()=>document.fonts.ready);
for(const [index,facing] of ['down','up','right','left'].entries())for(const type of ['hoe','water']) {
 const start=await scene.evaluate(async({index,facing,type})=>{
  const {act}=await import('/src/game.js');const {game,renderer}=window.__farm;

  const x=17+index,y=17;const offset={down:[0,-1],up:[0,1],right:[-1,0],left:[1,0]}[facing];
  Object.assign(game.player,{x:x+.5+offset[0],y:y+.5+offset[1],facing,walking:false});
  game.selected=type;const ok=act(game,x,y);renderer.render(game,0);return {ok,type:game.lastAction?.type};
 },{index,facing,type});
 if(!start.ok||start.type!==type)throw Error('Action fixture failed '+JSON.stringify(start));
 let previous=0;
 for(const [phase,t] of [['windup',.02],['impact',.23],['recovery',.33]]) {
  await scene.evaluate(delta=>{for(let t=0;t<delta-.00001;t+=.01)window.__farm.renderer.render(window.__farm.game,Math.min(.01,delta-t));},t-previous);previous=t;
  await scene.screenshot({path:out+'/'+type+'-'+facing+'-'+phase+'.png'});
 }
}
const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await phone.goto(origin+'/?test');await phone.locator('#start-button').click();await phone.waitForTimeout(5500);
await phone.screenshot({path:out+'/fresh-phone.png'});
await writeFile(out+'/review.json',JSON.stringify({origin,errors,phaseSeconds:[.02,.12,.23,.33,.42],fixture:'Action strip uses checkout drawFarmer with served assets; action scenes use the built renderer with source act calls and shortened travel. Fresh desktop is unmodified starting state.'},null,2));
await page.close();await browser.close();
