

import {chromium} from '@playwright/test';
import fs from 'node:fs';
const origin=process.env.PLAY_URL;
if(!origin||!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Explicit VM loopback PLAY_URL required');
const directory=process.env.CAPTURE_DIR||'docs/screenshots/world-20260916T060754Z';
fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.goto(origin+'/?test');
 await page.locator('#loading').waitFor({state:'hidden'});
 const data=await page.evaluate(async()=>{
  const {makeGround,configureWorldArt}=await import('/src/world-art.js');
  const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
  const [terrain,props,resources]=await Promise.all(['ridgeside-terrain/terrain.png','ridgeside-props/props.png','simple-resources/resources.png'].map(p=>load('/assets/'+p)));
  configureWorldArt({props,resources});const ground=makeGround(terrain);
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=688;
  const c=canvas.getContext('2d');c.fillStyle='#202c29';c.fillRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
  c.fillStyle='#fff1c5';c.font='16px monospace';
  c.fillText('NATIVE TERRAIN DIAGNOSTIC — complete N/E/S/W banks, stepped corners and pier contact',12,22);
  const frames=[0,1,3,4,7,8,31,63];
  frames.forEach((f,i)=>{
   const x=i%4*384,y=40+Math.floor(i/4)*324;
   c.fillText(`Frame ${f} / ${f*250} ms`,x+8,y+20);
   c.drawImage(ground.waterFrames[f],x,y+28,384,288);
  });
  const grass=document.createElement('canvas');grass.width=480;grass.height=432;
  const g=grass.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(ground.image,288,32,160,144,0,0,480,432);
  return {pond:canvas.toDataURL(),grass:grass.toDataURL()};
 });
 for(const [name,url]of Object.entries(data))fs.writeFileSync(`${directory}/${name}-diagnostic.png`,Buffer.from(url.split(',')[1],'base64'));
}finally{await browser.close();}
