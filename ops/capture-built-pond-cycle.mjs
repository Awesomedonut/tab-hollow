

import {chromium} from '@playwright/test';
import fs from 'node:fs';
const origin=process.env.PLAY_URL,directory=process.env.CAPTURE_DIR;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname)||!directory)throw Error('Explicit VM loopback and capture directory required');
fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.clock.install();await page.goto(origin+'/?test');
 await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#start-button').click();
 await page.clock.pauseAt(await page.evaluate(()=>new Date(Date.now()+100)));
 const result=await page.evaluate(()=>{
  const {game,renderer}=window.__farm,canvas=document.querySelector('#game');
  Object.assign(game.player,{x:29,y:20.8,facing:'right'});renderer.render(game,0);
  const bounds=canvas.getBoundingClientRect(),o=renderer.screenToWorld(bounds.left,bounds.top),one=renderer.screenToWorld(bounds.left+16,bounds.top);
  const scale=1/(one.x-o.x),sx=Math.round((448-o.x*16)*scale),sy=Math.round((288-o.y*16)*scale);
  const sheets=[];
  for(let sheet=0;sheet<4;sheet++){
   const image=document.createElement('canvas');image.width=1536;image.height=2496;
   const c=image.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#203329';c.fillRect(0,0,image.width,image.height);c.font='14px monospace';
   for(let i=0;i<32;i++){
    const x=i%4*384,y=Math.floor(i/4)*312,frame=sheet*32+i;
    c.fillStyle='#fff1c5';c.fillText(`Built renderer +${frame*250}ms`,x+4,y+16);
    c.drawImage(canvas,sx,sy,128*scale,96*scale,x,y+24,384,288);

    renderer.render(game,.1);renderer.render(game,.1);renderer.render(game,.05);
   }
   sheets.push(image.toDataURL());
  }
  return {sheets,scripts:[...document.scripts].map(s=>s.src).filter(Boolean),scale,crops:game.tiles.filter(t=>t.crop).length,tilled:game.tiles.filter(t=>t.tilled).length};
 });
 for(const [i,data]of result.sheets.entries())fs.writeFileSync(`${directory}/built-cycle-${i}.png`,Buffer.from(data.split(',')[1],'base64'));
 delete result.sheets;
 if(errors.length)throw Error(JSON.stringify(errors));
 fs.writeFileSync(`${directory}/built-cycle.json`,JSON.stringify({origin,note:'Shipped renderer, all 128 successive 250ms samples including foreground. Diagnostic player/camera on the pier at 29,20.8. Renderer clock advanced; no game state growth fixture.',...result,errors},null,2)+'\n');
}finally{await browser.close();}
