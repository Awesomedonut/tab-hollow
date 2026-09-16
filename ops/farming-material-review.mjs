
import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.PLAY_URL||'http://127.0.0.1:5286';
const out=process.env.REVIEW_DIR||'/home/codex/research/clover-overnight/reviews/20260916T072156Z/character/farming';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1000,height:640},deviceScaleFactor:1});
const reference=await readFile('/home/codex/research/clover-reference/stardew-6.jpg');
await page.route('**/__review/reference.jpg',r=>r.fulfill({contentType:'image/jpeg',body:reference}));
await page.goto(origin+'/?test');await page.locator('#start-button').click();
const source=await readFile(new URL('../src/world-art.js',import.meta.url),'utf8');
const result=await page.evaluate(async source=>{
 window.requestAnimationFrame=()=>0;
 const load=async src=>{const i=new Image();i.src=src;await i.decode();return i;};
 const [ref,crops,soil]=await Promise.all([load('/__review/reference.jpg'),load('/assets/native-farming/turnip-stages.png'),load('/assets/native-farming/soil.png')]);
 const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
 const {configureWorldArt,drawSoil}=await import(url);URL.revokeObjectURL(url);configureWorldArt({soil});
 const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=640;
 document.body.replaceChildren(canvas);document.body.style='margin:0';
 const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#d8bd83';c.fillRect(0,0,1000,640);
 c.fillStyle='#392a29';c.font='18px monospace';
 c.fillText('DIAGNOSTIC — reference and candidate: 4 screen pixels/native pixel',20,30);
 c.fillText('Official reference (4x)',20,65);
 c.drawImage(ref,828,470,200,200,20,80,200,200);
 c.fillText('Authored crop adaptations (4x)',350,65);
 for(let variant=0;variant<3;variant++)c.drawImage(crops,32,variant*32,32,32,350+variant*200,80,128,128);
 c.font='14px monospace';c.fillText('full / ripe        full / ripe        full / ripe',350,230);
 c.fillText('Three stable crowns; shared native cells and rooted anchor',350,256);
 c.font='18px monospace';c.fillText('Soil: isolated / connected dry / mixed wet-dry / concave joins',20,320);
 const fixtures=[[[0,0]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],[[0,0],[1,0],[0,1]]];
 fixtures.forEach((cells,index)=>{
  c.save();c.translate(20+index*240,350);c.scale(4,4);
  const neighbors=new Set(cells.map(([x,y])=>x+','+y));
  for(const [x,y]of cells)drawSoil(c,{x,y,tilled:true,watered:index===2&&x===1},neighbors);
  c.restore();
 });
 c.font='14px monospace';c.fillText('Native connected perimeter; continuous shallow relief crosses tile boundaries.',20,525);
 c.fillText('Component diagnostic only. Fresh scenes and UI-grown ripe crops are captured separately.',20,560);
 return {origin:location.origin,scale:4,referenceCropXYWH:[828,470,200,200],fixture:'Diagnostic actual soil renderer and served crop atlas; not gameplay state.'};
},source);
await page.screenshot({path:out+'/equal-native-scale-comparison.png'});


let gameplay;
try{gameplay=await readFile(out+'/built-gameplay-ripe-close.png');}
catch(error){if(error.code!=='ENOENT')throw error;}
if(gameplay){
 await page.route('**/__review/ripe.png',r=>r.fulfill({contentType:'image/png',body:gameplay}));
 await page.evaluate(async()=>{
  const load=async src=>{const i=new Image();i.src=src;await i.decode();return i;};
  const [ref,ripe]=await Promise.all([load('/__review/reference.jpg'),load('/__review/ripe.png')]);
  const c=document.querySelector('canvas').getContext('2d');
  c.fillStyle='#d8bd83';c.fillRect(0,0,1000,640);c.imageSmoothingEnabled=false;
  c.fillStyle='#392a29';c.font='18px monospace';
  c.fillText('ACTUAL GAMEPLAY GROWTH — both views at 4 screen pixels/native pixel',20,35);
  c.fillText('Official reference 6',20,75);c.drawImage(ref,828,470,200,200,20,95,200,200);
  c.fillText('Watered + slept through UI; travel shortened',350,75);
  c.drawImage(ripe,350,95,256,ripe.height*256/ripe.width);
  c.font='15px monospace';c.fillText('No injected crop growth. Reference stays VM-only and is never shipped.',20,490);
 });
 await page.screenshot({path:out+'/gameplay-equal-native-scale-comparison.png'});
 result.gameplayComparison={input:'built-gameplay-ripe-close.png',nativeWidth:64,displayScale:4};
}
await writeFile(out+'/material-review.json',JSON.stringify(result,null,2));await browser.close();
