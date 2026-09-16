
import {loadSpriteAtlas,drawSourcedSprite} from './sourced-art.js';
import {configureWorldArt} from './world-art.js';
import {createActionPoses,actionFrame,ACTION_DURATION} from './character-poses.js';
const TILE = 16;
const PALETTE = {
  O:'#392a29', H:'#8c542e', h:'#bd8139', Y:'#e9b755', y:'#ffe093', b:'#9a4b35',
  A:'#573225', a:'#87512d', S:'#ca794e', s:'#f4b278', L:'#ffdb9d', M:'#ae584a', E:'#273238', I:'#f5e1bd',
  T:'#7d293a', t:'#c1493b', U:'#ed7251', q:'#ecc06f', C:'#222a5a', c:'#344b8a', V:'#667ab2',
  B:'#44302a', W:'#78503a',
  d:'#173d35', g:'#1d6550', m:'#329c66', l:'#79c853', v:'#c7e56b',
  p:'#754858', r:'#ad6686', R:'#d391a1', f:'#f4dfb2', F:'#fff0cd', n:'#cebf95', z:'#a28d6e',
};
const cache = new Map();
function painted(rows, width=20, height=32) {
  const key = rows.join('/') + width;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas'); canvas.width=width;canvas.height=height;
  const c=canvas.getContext('2d');
  rows.forEach((row,y)=>{
    const offset=Math.floor((width-row.length)/2);
    for(let x=0;x<row.length;x++)if(PALETTE[row[x]]) {c.fillStyle=PALETTE[row[x]];c.fillRect(offset+x,y,1,1);}
  });
  cache.set(key,canvas); return canvas;
}
function pixel(c,color,x,y,w=1,h=1) {c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);}
function line(c,color,x0,y0,x1,y1,width=1) {
  const steps=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
  for(let i=0;i<=steps;i++)pixel(c,color,x0+(x1-x0)*i/Math.max(1,steps),y0+(y1-y0)*i/Math.max(1,steps),width,width);
}
const actionTimers = new WeakMap();

let characterAtlas=null,cropAtlas=null,actionPoses=null,characterLoading=null;
export async function loadCharacterArt(){
  if(!characterLoading)characterLoading=Promise.all([
    loadSpriteAtlas('/assets/ridgeside-character/ian-walk.png',
      Object.fromEntries(['down','right','up','left'].flatMap((direction,row)=>
        Array.from({length:4},(_,frame)=>[direction+frame,{rect:[frame*16,row*32,16,32],anchor:[8,31]}])
      ))),
    loadSpriteAtlas('/assets/native-farming/turnip-stages.png',
      Object.fromEntries(Array.from({length:12},(_,cell)=>[cell,{rect:[cell%4*16,Math.floor(cell/4)*32,16,32],anchor:[8,32]}]))),
    loadSpriteAtlas('/assets/native-farming/soil.png',{})
  ]).then(([character,crops,soil])=>{
    characterAtlas=character;cropAtlas=crops;actionPoses=createActionPoses(character.image);configureWorldArt({soil:soil.image});return character;
  });
  return characterLoading;
}
function drawToolAction(c,facing,type,progress,grip=null){
  c.save();
  if(facing==='left')c.scale(-1,1);

  const rear=facing==='up',front=facing==='down';
  const [handX,handY]=grip??[front||rear?5:3,-10];
  const reach=Math.round(Math.sin(progress*Math.PI)*5);
  if(type==='hoe'){
    const swing=progress<.58?progress/.58:1-(progress-.58)/.42*.45;


    const phase=actionFrame(progress*ACTION_DURATION);
    const tipX=front?handX+2:rear?[6,10,8,9][phase]:[0,16,22,14][phase];
    const tipY=rear?[-39,-27,-15,-23][phase]:front?-28+Math.round(swing*32):[-38,-28,1,-13][phase];
    line(c,'#563b2c',handX,handY,tipX,tipY,2);
    line(c,'#b47b43',handX,handY,tipX,tipY);
    pixel(c,'#384651',tipX-3,tipY-2,7,3);pixel(c,'#a0afb0',tipX-3,tipY-2,7,1);
  }else if(type==='water'){
    const phase=actionFrame(progress*ACTION_DURATION),pour=phase===1||phase===2;


    const metal={o:'#355966',s:'#477b86',m:'#599ba1',l:'#75a9a6',h:'#a8d0bd'};
    const vessel=(rows,x,y)=>rows.forEach((row,yy)=>[...row].forEach((key,xx)=>{
      if(metal[key])pixel(c,metal[key],x+xx,y+yy);
    }));
    if(rear){
      const px=[7,8,8,7][phase],py=[-16,-19,-20,-17][phase];
      line(c,metal.o,handX,handY,px+3,py+4,2);
      line(c,metal.l,handX,handY,px+3,py+4);
      vessel(pour?['.hho..','hlsmo.','.lmsso','.lmsso','..sso.']:['.hho.','hlmso','olmso','omsso','.ooo.'],px,py);

      line(c,metal.o,px+1,py+2,px-1,py-(pour?2:0),2);
      pixel(c,metal.l,px,py+1);
      pixel(c,metal.h,px-2,py-(pour?2:0),3,1);
      if(pour)for(let i=0;i<3;i++)pixel(c,'#aedfd7',px-2+(i%2),py-1+i*3);
      c.restore();return;
    }
    const px=handX+1,py=handY+1;


    line(c,metal.o,handX,handY,px+3,py-2);
    line(c,metal.l,handX+1,handY,px+3,py-1);
    line(c,metal.o,handX-1,handY+1,handX-1,py+3);
    line(c,metal.o,handX-1,py+3,px+1,py+4);
    vessel(pour?[
      '..hho..','hhlmso.','olllmso','olmmsoo','.mmsso.','..ooo..'
    ]:[
      '..hh...','.holho.','olllmso','olmmsoo','ommssoo','.ossoo.','..ooo..'
    ],px,py);
    const tx=px+(front?5:9),ty=py+(pour?5:2);


    line(c,metal.o,px+5,py+3,tx,ty,2);
    line(c,metal.l,px+5,py+2,tx,ty);
    pixel(c,metal.s,tx,ty,front?3:2,2);
    pixel(c,metal.h,tx,ty,front?3:2,1);
    if(pour)for(let i=0;i<3;i++)pixel(c,'#aedfd7',tx+(front?i%2:i),ty+3+i*2,1,i===1?2:1);
  }else if(type==='harvest'){
    pixel(c,'#568641',handX+1,handY-11,4,3);pixel(c,'#ad6686',handX,handY-8,6,2);
    pixel(c,'#fff0cd',handX,handY-6,6,4);pixel(c,'#cebf95',handX+2,handY-2,2,2);
  }else pixel(c,'#e9b755',handX+reach,handY+4+Math.floor(progress*5),1,1);
  c.restore();
}
export function drawFarmer(c,player,time=0,lastAction=null) {
  if(!characterAtlas)throw new Error('Character sprites must load before rendering');
  const x=Math.round(player.x*TILE),y=Math.round(player.y*TILE);
  const facing=['down','right','up','left'].includes(player.facing)?player.facing:'down';
  const frame=player.walking?Math.floor(time*9)%4:0;
  let actionState=actionTimers.get(c);
  if(!actionState||actionState.action!==lastAction){
    actionState={action:lastAction,at:lastAction?time:-10};actionTimers.set(c,actionState);
  }
  const elapsed=time-actionState.at;
  const active=lastAction&&elapsed>=0&&elapsed<ACTION_DURATION&&['hoe','water','plant','harvest'].includes(lastAction.type);
  c.save();c.imageSmoothingEnabled=false;
  c.globalAlpha=.25;pixel(c,'#273d25',x-5,y-1,10,3);pixel(c,'#273d25',x-3,y+2,6,1);c.globalAlpha=1;
  c.translate(x,y);
  if(active&&['hoe','water'].includes(lastAction.type)){
    const pose=actionPoses[lastAction.type+facing+actionFrame(elapsed)];
    if(facing==='up')drawToolAction(c,facing,lastAction.type,elapsed/ACTION_DURATION,pose.hand);
    c.save();if(pose.mirror)c.scale(-1,1);
    drawSourcedSprite(c,pose.sprite,0,0);c.restore();
    if(facing!=='up')drawToolAction(c,facing,lastAction.type,elapsed/ACTION_DURATION,pose.hand);
  }else{
    if(active&&facing==='up')drawToolAction(c,facing,lastAction.type,elapsed/.38);
    drawSourcedSprite(c,characterAtlas.sprites[facing+frame],0,0);
    if(active&&facing!=='up')drawToolAction(c,facing,lastAction.type,elapsed/.38);
  }
  c.restore();
}

export function drawCrop(c,tile,time=0) {
  if(!tile.crop)return;
  const stage=Math.max(0,Math.min(3,Math.floor(tile.crop.growth||0)));
  const x=tile.x*TILE,y=tile.y*TILE;
  c.save();c.imageSmoothingEnabled=false;
  c.globalAlpha=.2;pixel(c,'#493f26',x+(stage===0?6:stage===1?4:3),y+13,stage===0?4:stage===1?8:10,2);c.globalAlpha=1;
  if(!cropAtlas)throw new Error('Crop sprites must load before rendering');

  const variant=((Math.floor(tile.x)*7+Math.floor(tile.y/2)*5)%3+3)%3;
  drawSourcedSprite(c,cropAtlas.sprites[stage+variant*4],x+8,y+16);
  if(stage===3){
    const sparkle=(time*.8+tile.x*.41+tile.y*.23)%3;
    if(sparkle<.5){pixel(c,'#fff3be',x+13,y-3);pixel(c,'#fff3be',x+12,y-2,3);pixel(c,'#fff3be',x+13,y-1);}
  }
  c.restore();
}


const CHICKEN=['......rr.....','....rRrr.....','...OFFFFO....','..OFFFFFEOy..','.OFFFFFFFO...','OFFFFFFFFFO..','OFFFFFFFnFO..','.OnFFFFnnO...','..OnnnnnO....','...OOOOO.....','....h.h......','...hh.hh.....'];
export function drawChicken(c,x,y,time=0,facing=1){
  c.save();c.translate(Math.round(x),Math.round(y));if(facing<0)c.scale(-1,1);
  c.imageSmoothingEnabled=false;c.drawImage(painted(CHICKEN,16,12),-8,-12+(Math.sin(time*5)>0?0:-1));c.restore();
}
