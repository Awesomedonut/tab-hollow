import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';

const worldArtSource=readFileSync(new URL('../src/world-art.js',import.meta.url),'utf8');

test('native pond frames animate beneath a stable pier and preserve dry corners',async({page})=>{
 await page.goto('/?test');
 await expect(page.locator('#loading')).toBeHidden();
 const result=await page.evaluate(async(source)=>{
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  const {makeGround,configureWorldArt}=await import(url);
  URL.revokeObjectURL(url);
  const load=async src=>{const image=new Image();image.src=src;await image.decode();return image;};
  const [terrain,props,resources]=await Promise.all([
   load('/assets/ridgeside-terrain/terrain.png'),load('/assets/ridgeside-props/props.png'),load('/assets/simple-resources/resources.png'),
  ]);
  configureWorldArt({props,resources});
  const ground=makeGround(terrain);
  const pixels=(image,x,y,w,h)=>Array.from(image.getContext('2d').getImageData(x,y,w,h).data).join(',');
  return {


   cachedShallowsMatchGround:
    pixels(ground.image,496,300,32,12)===pixels(ground.waterFrames[0],48,12,32,12)&&
    pixels(ground.image,480,346,48,28)===pixels(ground.waterFrames[0],32,58,48,28),

   openLawnShadowFraction:(()=>{
    const data=ground.image.getContext('2d').getImageData(288,48,128,112).data;
    let dark=0;
    for(let i=0;i<data.length;i+=4)if(data[i]<30&&data[i+1]<140&&data[i+2]>40)dark++;
    return dark/(data.length/4);
   })(),
   dimensions:ground.waterFrames.map(frame=>[frame.width,frame.height]),
   distinct:new Set(ground.waterFrames.map(frame=>pixels(frame,0,0,128,96))).size,
   pierStable:new Set(ground.waterFrames.map(frame=>pixels(frame,0,34,32,18))).size===1,
   dryCornerStable:new Set(ground.waterFrames.map(frame=>pixels(frame,0,0,16,16))).size===1,
   flowsLeft:(()=>{
    const a=ground.waterFrames[0].getContext('2d').getImageData(49,48,40,12).data;
    const b=ground.waterFrames[1].getContext('2d').getImageData(48,48,40,12).data;
    return a.every((v,i)=>v===b[i]);
   })(),
   loopFlowsLeft:(()=>{
    const last=ground.waterFrames.at(-1).getContext('2d').getImageData(49,48,40,12).data;
    const first=ground.waterFrames[0].getContext('2d').getImageData(48,48,40,12).data;
    return last.every((v,i)=>v===first[i]);
   })(),
   dryNorthBankStable:pixels(ground.waterFrames[0],48,0,32,9)===pixels(ground.waterFrames[4],48,0,32,9),
   southernContactMaxStep:Math.max(...ground.waterFrames.map(frame=>{
    const data=frame.getContext('2d').getImageData(0,0,128,96).data,contact=[];
    for(let x=16;x<=112;x++){
     let last=51;
     for(let y=52;y<96;y++){
      const n=(y*128+x)*4;
      if(data[n+2]>data[n]+40&&data[n+2]>data[n+1]+20)last=y;
     }
     contact.push(last);
    }
    return Math.max(...contact.slice(1).map((y,i)=>Math.abs(y-contact[i])));
   })),
   drySouthernBankStable:(()=>{
    const frames=ground.waterFrames.map(frame=>frame.getContext('2d').getImageData(0,58,128,38).data);
    const first=frames[0];let dryPixels=0;
    for(let i=0;i<first.length;i+=4){

     if(first[i+2]>=150)continue;
     dryPixels++;
     if(!frames.every(data=>[0,1,2,3].every(channel=>data[i+channel]===first[i+channel])))return false;
    }
    return dryPixels>1500;
   })(),
   grassFringeStable:(()=>{
    const frames=ground.waterFrames.map(frame=>frame.getContext('2d').getImageData(0,0,128,96).data);
    const first=frames[0];let greenPixels=0;
    for(let i=0;i<first.length;i+=4){


     if(first[i+1]-first[i]<24||first[i+1]-first[i+2]<24)continue;
     greenPixels++;
     if(!frames.every(data=>[0,1,2,3].every(channel=>data[i+channel]===first[i+channel])))return false;
    }
    return greenPixels>500;
   })(),
   opaque:ground.waterFrames.every(frame=>Array.from(frame.getContext('2d').getImageData(0,0,128,96).data).every((v,i)=>i%4!==3||v===255)),
  };
 },worldArtSource);
 expect(result.dimensions).toEqual(Array.from({length:128},()=>[128,96]));
 expect(result.distinct).toBe(128);
 expect(result.openLawnShadowFraction).toBeLessThan(.1);
 expect(result.cachedShallowsMatchGround).toBe(true);
 expect(result.pierStable).toBe(true);
 expect(result.dryCornerStable).toBe(true);
 expect(result.opaque).toBe(true);
 expect(result.flowsLeft).toBe(true);
 expect(result.loopFlowsLeft).toBe(true);
 expect(result.dryNorthBankStable).toBe(true);
 expect(result.grassFringeStable).toBe(true);
 expect(result.drySouthernBankStable).toBe(true);

 expect(result.southernContactMaxStep).toBeLessThanOrEqual(1);
});

test('connected soil keeps wet/dry masks and updates cached joins after tilling',async({page})=>{
 await page.goto('/?test');await expect(page.locator('#loading')).toBeHidden();
 const result=await page.evaluate(async source=>{
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  const {drawSoil,configureWorldArt}=await import(url);URL.revokeObjectURL(url);
  const soil=new Image();soil.src='/assets/native-farming/soil.png';await soil.decode();configureWorldArt({soil});
  const canvas=document.createElement('canvas');canvas.width=48;canvas.height=48;
  const c=canvas.getContext('2d');
  const render=(watered,neighbors)=>{
   c.clearRect(0,0,48,48);drawSoil(c,{x:1,y:1,tilled:true,watered},neighbors);
   return Array.from(c.getImageData(16,16,16,16).data);
  };
  const alone=new Set(['1,1']),joined=new Set(['1,1','2,1']);
  const dry=render(false,alone),wet=render(true,alone),connected=render(false,joined),again=render(false,alone);
  const all=new Set();for(let y=0;y<3;y++)for(let x=0;x<3;x++)all.add(x+','+y);
  const inner=render(false,all);


  canvas.width=96;canvas.height=32;
  const bed=new Set();for(let y=0;y<2;y++)for(let x=0;x<6;x++)bed.add(x+','+y);
  const bedPixels=mixed=>{
   c.clearRect(0,0,96,32);
   for(let y=0;y<2;y++)for(let x=0;x<6;x++)drawSoil(c,{x,y,tilled:true,watered:mixed&&x%2===0},bed);
   return c.getImageData(0,0,96,32).data;
  };
  const dryBed=bedPixels(false),mixedBed=bedPixels(true);
  const tops=[];
  for(let x=3;x<93;x++){
   let y=0;while(y<32&&!dryBed[(y*96+x)*4+3])y++;
   tops.push(y);
  }
  const seams=[15,16,31,32,47,48,63,64,79,80];

  return {
   sameMask:dry.every((v,i)=>i%4!==3||v===wet[i]),
   waterVisible:dry.some((v,i)=>i%4!==3&&v!==wet[i]),


   joinedCorner:[0,1,2,3].some(y=>[12,13,14,15].some(x=>
    dry[(y*16+x)*4+3]===0&&connected[(y*16+x)*4+3]===255)),
   cacheRestores:dry.every((v,i)=>v===again[i]),
   noInteriorHoles:inner.every((v,i)=>i%4!==3||v===255),
   bedWaterMask:dryBed.every((v,i)=>i%4!==3||v===mixedBed[i]),
   bedSeamsOpaque:seams.every(x=>Array.from({length:28},(_,i)=>i+2).every(y=>dryBed[(y*96+x)*4+3]===255)),
   shallowIrregularRim:new Set(tops).size>1&&tops.every((v,i)=>i===0||Math.abs(v-tops[i-1])<=2),
  };
 },worldArtSource);
 expect(result).toEqual({sameMask:true,waterVisible:true,joinedCorner:true,cacheRestores:true,noInteriorHoles:true,bedWaterMask:true,bedSeamsOpaque:true,shallowIrregularRim:true});
});
