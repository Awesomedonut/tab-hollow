
import {chromium} from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1000,height:650}});
await page.goto('http://127.0.0.1:5173');
await page.evaluate(async()=>{
 const art=await import('/src/character-art.js');document.body.innerHTML='';
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=650;document.body.append(canvas);document.body.style='margin:0;background:#233d38';canvas.style='width:1000px;height:650px';
 const c=canvas.getContext('2d');c.fillStyle='#d8bd83';c.fillRect(0,0,1000,650);c.fillStyle='#3c342f';c.font='24px monospace';c.fillText('CLOVER HOLLOW — CHARACTER & CROP REVIEW',28,35);
 c.font='16px monospace';['Front','Back','Right','Left','Walking'].forEach((n,i)=>c.fillText(n,40+i*190,270));
 c.save();c.scale(6,6);['down','up','right','left','down'].forEach((f,i)=>art.drawFarmer(c,{x:(14+i*31.5)/16,y:40/16,facing:f,walking:i===4},.15));c.restore();
 c.fillStyle='#3c342f';c.font='16px monospace';['Seedling','Young leaves','Full foliage','Harvest ready'].forEach((n,i)=>c.fillText(n,55+i*220,545));
 c.save();c.scale(7,7);for(let i=0;i<4;i++){c.fillStyle='#956139';c.fillRect(6+i*31,51,17,17);art.drawCrop(c,{x:(6+i*31)/16,y:51/16,crop:{growth:i}},0);}c.restore();
 c.fillStyle='#3c342f';c.font='15px monospace';c.fillText('Native size: compact32px farmer, root appears only when ripe',30,590);c.save();c.translate(640,575);for(let i=0;i<4;i++)art.drawCrop(c,{x:i*1.5,y:0,crop:{growth:i}},0);art.drawFarmer(c,{x:7,y:.5,facing:'down'},0);c.restore();
});
await page.screenshot({path:'/tmp/clover-sprite-showcase-v3.png'});await browser.close();
