import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
test('action poses keep native boots fixed, mirror watering and finish on idle',async({page})=>{

 for(const name of ['character-poses','character-art','sourced-art','world-art']) {
  const body=readFileSync(new URL(`../src/${name}.js`,import.meta.url),'utf8');
  await page.route(`**/src/${name}.js`,route=>route.fulfill({contentType:'text/javascript',body}));
 }
 await page.goto('/?test');await expect(page.locator('#loading')).toBeHidden();
 const result=await page.evaluate(async()=>{
  const {createActionPoses}=await import('/src/character-poses.js');
  const {drawFarmer,loadCharacterArt}=await import('/src/character-art.js');await loadCharacterArt();
  const image=new Image();image.src='/assets/ridgeside-character/source-Ian.png';await image.decode();
  const poses=createActionPoses(image), failures=[];
  const base=document.createElement('canvas');base.width=24;base.height=32;const b=base.getContext('2d');
  for(const [key,{sprite}] of Object.entries(poses)){
   const row=key.includes('up')?64:key.includes('right')||key.includes('left')?32:0;
   b.clearRect(0,0,24,32);b.drawImage(image,0,row+29,16,3,4,29,16,3);
   const actual=sprite.image.getContext('2d').getImageData(0,29,24,3).data;
   const expected=b.getImageData(0,29,24,3).data;
   if(!actual.every((v,i)=>v===expected[i]))failures.push(key+' moved boots');
  }
  const canvas=document.createElement('canvas');canvas.width=80;canvas.height=80;const c=canvas.getContext('2d');
  const player={x:2.5,y:3.5,facing:'down'},action={type:'hoe'};
  drawFarmer(c,player,0,action);c.clearRect(0,0,80,80);drawFarmer(c,player,.42,action);
  const settled=c.getImageData(0,0,80,80).data;
  c.clearRect(0,0,80,80);drawFarmer(c,player,.42,null);
  const idle=c.getImageData(0,0,80,80).data;
  const rearToolChecks=[];
  for(const [type,rgb] of [['hoe',[160,175,176]],['water',[174,223,215]]]) {
   const rear={...player,facing:'up'},a={type};
   drawFarmer(c,rear,0,a);c.clearRect(0,0,80,80);drawFarmer(c,rear,.23,a);
   const pixels=c.getImageData(0,0,80,80).data,points=[];
   for(let y=0;y<80;y++)for(let x=0;x<80;x++) {
    const i=(y*80+x)*4;
    if(rgb.every((v,j)=>pixels[i+j]===v)&&pixels[i+3]===255)points.push([x,y]);
   }



   rearToolChecks.push(points.length>0&&points.every(([x,y])=>x>=44&&x<=51&&y>=31&&y<=43));
  }
  const sideToolChecks=[];
  for(const facing of ['right','left']) {
   const centers=[];
   for(const elapsed of [.02,.12,.23,.33]) {
    const a={type:'hoe'},p={x:2.5,y:3.5,facing};
    drawFarmer(c,p,0,a);c.clearRect(0,0,80,80);drawFarmer(c,p,elapsed,a);
    const pixels=c.getImageData(0,0,80,80).data,points=[];
    for(let y=0;y<80;y++)for(let x=0;x<80;x++) {
     const i=(y*80+x)*4;
     if(pixels[i]===160&&pixels[i+1]===175&&pixels[i+2]===176)points.push([x,y]);
    }
    centers.push(points.length ? points.reduce((s,p)=>[s[0]+p[0]/points.length,s[1]+p[1]/points.length],[0,0]):null);
   }


   sideToolChecks.push(centers.every(Boolean)&&centers[0][1]<24&&centers[2][1]>52&&
    (facing==='right'?centers[2][0]>58:centers[2][0]<22)&&centers[3][1]<centers[2][1]-8);
  }
  return {sideToolChecks,rearToolChecks,failures,settled:idle.every((v,i)=>v===settled[i]),count:Object.keys(poses).length,mirrored:poses.waterleft2.mirror&&!poses.waterright2.mirror};
 });
 expect(result).toEqual({sideToolChecks:[true,true],rearToolChecks:[true,true],failures:[],settled:true,count:32,mirrored:true});
});
