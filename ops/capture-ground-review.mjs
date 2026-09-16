

import {chromium} from '@playwright/test';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const origin=process.env.PLAY_URL||'http://127.0.0.1:5196';
if(!['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname))throw new Error('VM loopback required');
const directory=process.env.CAPTURE_DIR||'docs/screenshots/world-20260916T065146Z';
fs.mkdirSync(directory,{recursive:true});
const source=fs.readFileSync(process.env.WORLD_SOURCE||new URL('../src/world-art.js',import.meta.url),'utf8');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();await page.goto(origin+'/?test');
 const images=await page.evaluate(async source=>{
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  const {makeGround,configureWorldArt}=await import(url);URL.revokeObjectURL(url);
  const load=async path=>{const im=new Image();im.src=path;await im.decode();return im;};
  const [terrain,props,resources]=await Promise.all([
   load('/assets/ridgeside-terrain/terrain.png'),load('/assets/ridgeside-props/props.png'),load('/assets/simple-resources/resources.png'),
  ]);
  configureWorldArt({props,resources});const ground=makeGround(terrain);
  const crop=(image,x,y,w,h,scale)=>{
   const canvas=document.createElement('canvas');canvas.width=w*scale;canvas.height=h*scale;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(image,x,y,w,h,0,0,w*scale,h*scale);return canvas.toDataURL();
  };
  const cycle={};
  for(let sheet=0;sheet<4;sheet++){
   const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1664;
   const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
   c.fillStyle='#202c29';c.fillRect(0,0,1024,1664);c.font='12px monospace';
   for(let i=0;i<32;i++){
    const frame=sheet*32+i,x=i%4*256,y=Math.floor(i/4)*208;
    c.fillStyle='#fff1c5';c.fillText(`Frame ${frame} / ${frame*250} ms`,x+4,y+12);
    c.drawImage(ground.waterFrames[frame],x,y+16,256,192);
   }
   cycle[`component-cycle-${sheet}`]=canvas.toDataURL();
  }
  return {
   ...cycle,
   'component-ground-native':ground.image.toDataURL(),
   'component-grass-4x':crop(ground.image,288,48,128,112,4),
   'component-west-edge-4x':crop(ground.image,176,208,168,152,4),
   'component-shore-4x':crop(ground.image,416,280,168,112,4),
   'component-shore-frame4-4x':crop(ground.waterFrames[4],0,0,128,96,4),
  };
 },source);
 for(const [name,data]of Object.entries(images))fs.writeFileSync(`${directory}/${name}.png`,Buffer.from(data.split(',')[1],'base64'));
 fs.writeFileSync(`${directory}/component.json`,JSON.stringify({kind:'Source component diagnostic, no foreground sprites. Not a fresh gameplay screenshot.',origin,sourceSha256:createHash('sha256').update(source).digest('hex'),images:Object.keys(images),nativePixelScale:1,detailPixelScale:4},null,2)+'\n');
}finally{await browser.close();}
