import {drawFarmer,drawCrop,loadCharacterArt} from './character-art.js';
import {loadSpriteAtlas,drawSourcedSprite} from './sourced-art.js';
import {T,W,H,noise,box,oval,poly,makeGround,configureWorldArt,drawSoil,barrel,chest,stump} from './world-art.js';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export async function createRenderer(canvas){
 await loadCharacterArt();
 const ctx=canvas.getContext('2d',{alpha:false});
 const [terrainAtlas,resourceAtlas,propsAtlas,chickenAtlas,signAtlas]=await Promise.all([
  loadSpriteAtlas("/assets/ridgeside-terrain/terrain.png",{}),
  loadSpriteAtlas("/assets/simple-resources/resources.png",{}),
  loadSpriteAtlas("/assets/ridgeside-props/props.png",{}),
  loadSpriteAtlas('/assets/ridgeside-farm-props/chicken.png',Object.fromEntries(Array.from({length:4},(_,i)=>[i,{rect:[i*20,0,20,16],anchor:[10,15]}]))),
  loadSpriteAtlas('/assets/ridgeside-farm-props/sign.png',{sign:{rect:[0,0,16,32],anchor:[8,31]}}),
 ]);
 configureWorldArt({resources:resourceAtlas.image,props:propsAtlas.image});
 const terrain=makeGround(terrainAtlas.image);
 const [cottage,market,sourcedWell,shippingBox]=await Promise.all([
  ["cottage",192,144,136,140],["market",80,112,40,102],["well",48,80,24,79],["shipping-box",32,32,16,31],
 ].map(async([name,w,h,ax,ay])=>{
  const atlas=await loadSpriteAtlas("/assets/ridgeside-buildings/"+name+".png",{sprite:{rect:[0,0,w,h],anchor:[ax,ay]}});
  return atlas.sprites.sprite;
 }));
 const foliage = await Promise.all([
  ['maple',48,96,24,81],['pine',48,88,24,86],['mahogany',48,96,24,83],['bush-small',32,32,16,30],['bush-large',48,48,24,46],['cherry',96,112,48,110],['tuft',16,32,8,30],
 ].map(async([name,w,h,ax,ay])=>{
  const atlas=await loadSpriteAtlas('/assets/simple-foliage/'+name+'.png',{sprite:{rect:[0,0,w,h],anchor:[ax,ay]}});
  return atlas.sprites.sprite;
 }));
 const trees=[];
 const treeImages=[foliage[0],foliage[1],foliage[0],foliage[2],foliage[1],foliage[0]];
 const add=(x,y,i=0)=>trees.push({x:x*T,y:y*T,image:treeImages[i%treeImages.length]});

 for(let i=0;i<22;i++)add(i*1.9-.2,1.8+noise(i,3)*1.6,i,.82+noise(i,2)*.3);
 for(let i=0;i<14;i++){add(.6+noise(i,4),i*2.1+1,i+4,.8+noise(i,5)*.3);add(38.7+noise(i,6),i*2+1,i+2,.8+noise(i,7)*.3);}
 for(let i=0;i<21;i++)add(i*2,27+noise(i,8)*1.5,i+7);
 trees.push({x:6*T,y:7*T,image:foliage[5]},{x:33*T,y:5*T,image:foliage[5]});
 for(const [x,y,i,size]of [[4,7,1,1],[3.3,12,2,.9],[13.5,5,3,.9],[22,5,5,1.05],[26,4.2,7,.9],[36,8,8,1],[5.3,17,10,.85],[7,21,3,.85],[11.7,22,7,.9],[16,25,4,1],[26,25,11,.9],[35.9,17,13,1],[36.7,25,14,1]])add(x,y,i,size);
 let width=1,height=1,dpr=1,scale=2.75,cameraX=0,cameraY=0,elapsed=0,hover=null;
 let player={x:19.5,y:16.5,facing:'down'};
 const props=[];

 for(const [x,y,type]of [[290,165,'barrel'],[302,174,'chest'],[403,181,'barrel'],[548,189,'barrel'],[174,216,'sign'],[388,349,'sign'],[411,228,'well'],[181,354,'stump']])props.push({x,y,type});
 function camera(){
  const vw=width/scale,vh=height/scale;
  cameraX=vw>=W?(W-vw)/2:clamp(player.x*T-vw*.58,0,W-vw);
  cameraY=vh>=H?(H-vh)/2:clamp(player.y*T-vh*.7,0,H-vh);
 }
 function resize(){
  const b=canvas.getBoundingClientRect();width=Math.max(1,b.width);height=Math.max(1,b.height);
  dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);



  scale=width>900&&height>=960?3:2;
  camera();
 }
 function screenToWorld(x,y){
  const b=canvas.getBoundingClientRect();return{x:((x-b.left)/scale+cameraX)/T,y:((y-b.top)/scale+cameraY)/T};
 }
 function pointer(e){hover=screenToWorld(e.clientX,e.clientY);}
 function leave(){hover=null;}
 canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerleave',leave);
 function tree(c,t){
  drawSourcedSprite(c,t.image,t.x,t.y);
 }
 function sign(c,x,y,text){

  drawSourcedSprite(c,signAtlas.sprites.sign,x+5,y+10);
  c.font='bold 5px monospace';c.textAlign='center';c.fillStyle='#593820';c.fillText(text,Math.round(x+5),Math.round(y-12));
  if(text==='FARM')drawCrop(c,{x:(x-3)/16,y:(y-15)/16,crop:{growth:1}},0);
  else for(let row=0;row<3;row++){
   box(c,row===1?'#5ca9b0':'#397c91',x-1+(row%2),y-8+row*3,11,1);
   box(c,'#aed6c2',x+2+(row%2)*3,y-8+row*3,3,1);
  }
 }
 function chicken(c,x,y,phase,facing){
  oval(c,'#a4884f',x,y+1,6,2);
  c.save();c.translate(Math.round(x),Math.round(y));if(facing<0)c.scale(-1,1);
  drawSourcedSprite(c,chickenAtlas.sprites[Math.floor(phase*5)%4],0,0);c.restore();
 }
 function render(game,dt=0){
  elapsed+=Math.min(dt,.1);player=game.player||player;camera();
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled=false;box(ctx,'#476130',0,0,width,height);
  ctx.scale(scale,scale);ctx.translate(-Math.round(cameraX),-Math.round(cameraY));
  ctx.drawImage(terrain.image,0,0);
  ctx.drawImage(terrain.waterFrames[Math.floor(elapsed*4)%terrain.waterFrames.length],448,288);
  const tilled=new Set((game.tiles||[]).filter(t=>t.tilled).map(t=>t.x+','+t.y));
  for(const tile of game.tiles||[])drawSoil(ctx,tile,tilled);


  for(const [x,y]of [[223,191],[385,191],[223,305],[385,305]]){
   box(ctx,'#916536',x,y,2,5);box(ctx,'#d4a45b',x,y,2,1);
  }
  const objects=[
   ...[[202,248],[202,299],[338,181],[401,272],[244,330],[280,330],[351,330]].map(([x,y],i)=>({y,draw:()=>drawSourcedSprite(ctx,foliage[3],x,y)})),
   {y:176,draw:()=>drawSourcedSprite(ctx,cottage,248,184)},
   {y:176,draw:()=>drawSourcedSprite(ctx,market,456,184)},
   ...trees.map(t=>({y:t.y,draw:()=>tree(ctx,t)})),
   ...props.map(p=>({y:p.y+(p.type==='chest'?14:p.type==="well"?0:8),draw:()=>{
    if(p.type==='well')drawSourcedSprite(ctx,sourcedWell,p.x,p.y);
    else if(p.type==='stump')stump(ctx,p.x,p.y);
    else if(p.type==='barrel')barrel(ctx,p.x,p.y);
    else if(p.type==='chest')drawSourcedSprite(ctx,shippingBox,p.x-4,p.y+16);
    else sign(ctx,p.x,p.y,p.x<200?'FARM':'POND');
   }})),
  ];
  for(const tile of game.tiles||[])if(tile.crop)objects.push({y:tile.y*16+14,draw:()=>drawCrop(ctx,tile,elapsed)});
  for(let i=0;i<3;i++){
   const x=139+i*22+Math.sin(elapsed*.2+i)*11,y=344+Math.cos(elapsed*.18+i)*9;
   objects.push({y:y+2,draw:()=>chicken(ctx,x,y,elapsed+i*.23,Math.cos(elapsed*.2+i))});
  }
  objects.push({y:player.y*T,draw:()=>drawFarmer(ctx,player,elapsed,game.lastAction)});
  objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());

  for(const [x,y]of [[72,228],[100,340],[588,251]]){
   drawSourcedSprite(ctx,foliage[6],x,y);
  }

  for(let i=0;i<4;i++){
   const phase=(elapsed*.14+i/4)%1;
   ctx.globalAlpha=(1-phase)*.45;
   oval(ctx,'#eedec0',280+Math.sin(phase*5)*5,57-phase*28,2+phase*4,2+phase*2);
  }
  ctx.globalAlpha=1;
  const directions={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},f=directions[player.facing]||[0,1];
  let target={x:Math.floor(player.x+f[0]*.85),y:Math.floor(player.y+f[1]*.85)};
  if(hover&&Math.hypot(Math.floor(hover.x)+.5-player.x,Math.floor(hover.y)+.5-player.y)<=2.15)target={x:Math.floor(hover.x),y:Math.floor(hover.y)};
  if(target.x>=14&&target.x<=23&&target.y>=12&&target.y<=18){
   const x=target.x*16,y=target.y*16;
   for(const [dx,dy]of [[0,0],[12,0],[0,12],[12,12]]){
    box(ctx,'#975e2e',x+dx,y+dy,4,1);box(ctx,'#975e2e',x+dx,y+dy,1,4);
    box(ctx,'#f7df93',x+dx,y+dy,3,1);
   }
  }
  for(const fx of game.effects||[]){
   const progress=1-fx.life/fx.maxLife;ctx.globalAlpha=clamp(fx.life*2,0,1);
   ctx.font='bold 6px monospace';ctx.textAlign='center';
   ctx.fillStyle='#654324';ctx.fillText(fx.text,fx.x*T+1,fx.y*T-25-progress*12+1);
   ctx.fillStyle='#fff0b2';ctx.fillText(fx.text,fx.x*T,fx.y*T-25-progress*12);
  }
  ctx.globalAlpha=1;
  for(let i=0;i<9;i++){
   const x=(noise(i,53)*640+elapsed*(i%2?1:-1)+640)%640,y=noise(i,71)*400+Math.sin(elapsed*.4+i)*5;
   ctx.globalAlpha=.4+Math.sin(elapsed+i)*.2;box(ctx,'#fff3bd',x,y,1,1);
  }
  ctx.globalAlpha=1;
  for(let i=0;i<3;i++){
   const x=193+i*91+Math.sin(elapsed*.6+i*2)*10,y=171+i*46+Math.cos(elapsed*.8+i)*7;
   box(ctx,i%2?'#f2cd81':'#faf0ba',x,y,Math.sin(elapsed*9+i)>0?2:1,2);box(ctx,'#9c6d36',x+2,y+1,1,1);
  }
  const night=clamp(((game.time||360)-1020)/330,0,.48);
  if(night>0){ctx.globalAlpha=night;box(ctx,'#232c62',0,0,W,H);ctx.globalAlpha=1;}
  ctx.setTransform(1,0,0,1,0,0);
 }
 resize();
 return{render,resize,screenToWorld,destroy(){canvas.removeEventListener('pointermove',pointer);canvas.removeEventListener('pointerleave',leave);}};
}
