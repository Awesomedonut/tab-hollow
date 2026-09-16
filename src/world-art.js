
export const T=16,W=640,H=448;
let worldSprites={};
const soilTiles=new Map();
export function configureWorldArt(sprites){worldSprites={...worldSprites,...sprites};if(sprites.soil)soilTiles.clear();}
function resource(c,sx,sy,w,h,x,y){
 if(!worldSprites.resources)return false;
 c.drawImage(worldSprites.resources,sx,sy,w,h,Math.round(x),Math.round(y),w,h);return true;
}
export const noise=(x,y,s=0)=>{const n=Math.sin(x*127.1+y*311.7+s*91.3)*43758.5453;return n-Math.floor(n);};
export function box(c,color,x,y,w,h){c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
export function poly(c,color,points){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(Math.round(x),Math.round(y)):c.moveTo(Math.round(x),Math.round(y)));c.closePath();c.fill();}
export function oval(c,color,x,y,rx,ry){
 for(let yy=-Math.ceil(ry);yy<=ry;yy++){const span=Math.floor(rx*Math.sqrt(Math.max(0,1-yy*yy/(ry*ry))));if(span)box(c,color,x-span,y+yy,span*2,1);}
}
function surface(w,h){const image=document.createElement('canvas');image.width=w;image.height=h;return [image,image.getContext('2d')];}
function leaf(c,x,y,color,lit,size=1){
 box(c,color,x,y,1*size,1*size);
 box(c,color,x-size,y+size,3*size,2*size);
 box(c,color,x,y+3*size,1*size,1*size);
 box(c,lit,x-size,y+size,1*size,1*size);
 box(c,lit,x,y,1*size,2*size);
}
export function tuft(c,x,y,size=1,flower=false){
 const hues=['#246d29','#3c922b','#70bc35','#a3d74b'];
 for(let k=0;k<6;k++){
  const dx=(k-3)*size,dy=(noise(x,k,y)*5+3)*size;
  box(c,hues[k%4],x+dx,y-dy,size,dy);
  box(c,hues[(k+1)%4],x+dx+(k<3?-size:size),y-dy,size,2*size);
 }
 if(flower){box(c,'#edb9bd',x-3,y-7,3,2);box(c,'#fff0c1',x-2,y-7,1,1);}
}
export function makeTree(seed,type=0){
 const [image,c]=surface(72,98);const x=36,y=94;
 c.globalAlpha=.28;oval(c,'#31532a',x+3,y,20,4);c.globalAlpha=1;

 poly(c,'#633d25',[[x-5,y-36],[x+4,y-39],[x+4,y-9],[x+10,y],[x+3,y-1],[x,y-5],[x-4,y],[x-12,y],[x-6,y-8]]);
 box(c,'#b87635',x-4,y-36,6,32);box(c,'#d99542',x-3,y-32,2,25);
 for(let i=0;i<8;i++){const yy=y-31+i*4;box(c,i%2?'#885326':'#e3a34e',x-2+(i%3),yy,2,3);}
 poly(c,'#94602e',[[x-3,y-20],[x-11,y-33],[x-10,y-36],[x+1,y-25]]);
 poly(c,'#ba7933',[[x+1,y-26],[x+10,y-39],[x+12,y-39],[x+4,y-20]]);
 const palettes=[
 ['#123d29','#195b2d','#277d30','#43a432','#73c83e','#a1dc50'],
 ['#154b3b','#1d6348','#267c51','#3a9658','#60ae66','#89bd74'],
 ['#663c66','#935880','#be7499','#db96b0','#efb4c8','#ffe0d8'],
 ['#38552b','#557a2c','#779638','#9caf3e','#bdd24d','#dce46e']
 ];
 const pal=palettes[type%palettes.length];
 if(type===4){
  for(let tier=0;tier<5;tier++){
   const yy=18+tier*12,rx=9+tier*4;
   poly(c,pal[0],[[36,yy-17],[36-rx,yy+10],[36-rx+4,yy+9],[36-rx+2,yy+15],[36+rx,yy+12],[36+rx-5,yy+7]]);
   for(let k=0;k<rx*2;k++){
    const xx=36-rx+noise(k,tier,seed)*rx*2,dy=noise(tier,k,seed)*10;
    leaf(c,xx,yy+dy-2,pal[1+k%3],pal[3+k%2]);
   }
  }
 }else{

  const boughs=[[35,16,11,10],[22,23,12,11],[46,26,12,12],[14,38,10,12],[33,36,14,13],[55,41,11,12],[21,52,12,12],[42,55,13,13],[34,64,10,7]];
  for(let j=0;j<boughs.length;j++){
   const [bx,by,rx,ry]=boughs[j],ox=Math.floor(noise(seed,j)*4)-2;
   oval(c,pal[0],bx+ox,by+2,rx+1,ry+1);
   oval(c,pal[1],bx+ox-1,by,rx,ry);
   oval(c,pal[2],bx+ox-2,by-2,rx-2,ry-2);
   for(let yy=-ry+1;yy<ry;yy+=3)for(let xx=-rx+1;xx<rx;xx+=3){
    const offset=Math.floor(noise(xx,yy,seed+j)*4)-1,dx=xx+offset,dy=yy+Math.floor(noise(yy,xx,seed)*3);
    if(dx*dx/(rx*rx)+dy*dy/(ry*ry)>.86||noise(xx,yy,j+seed)<.25||(dy>1&&dx>2&&noise(xx,yy,seed)>.35))continue;
    const shade=clamp(Math.floor(3-dx/rx-dy/ry*.8+noise(xx+j,yy,seed)*1.2),1,4);
    leaf(c,bx+ox+dx,by+dy,pal[shade],pal[Math.min(shade+1,5)]);
   }
  }
  if(type===3)for(let i=0;i<10;i++){
   const xx=20+noise(i,seed,12)*32,yy=24+noise(i,seed,14)*33;
   oval(c,'#914631',xx,yy,2,3);box(c,'#e99643',xx-1,yy-2,2,2);
  }
 }
 return image;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function roofPlane(c,points,color,seed){
 poly(c,'#543029',points);c.save();c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();
 const colors=color==='red'?['#893c32','#a94a34','#bc5a3b','#ce7046']:['#315d48','#3e7550','#4c8956','#6b9d60'];
 for(let yy=0;yy<140;yy+=6){
  box(c,colors[0],0,yy,150,1);
  for(let xx=-8;xx<150;xx+=9){
   const x=xx+(Math.floor(yy/6)%2)*4,shade=Math.floor(noise(xx,yy,seed)*3)+1;
   box(c,colors[shade],x,yy+1,8,5);box(c,colors[0],x+8,yy,1,6);
   box(c,colors[Math.min(shade+1,3)],x+1,yy+1,6,1);
   if(noise(xx,yy,seed+1)>.6)box(c,colors[0],x+2,yy+4,3,1);
  }
 }
 c.restore();
}
function windowArt(c,x,y,w=15,h=21){
 box(c,'#68412a',x-3,y-3,w+6,h+6);box(c,'#edbe73',x-2,y-2,w+4,h+4);
 box(c,'#5b4135',x,y,w,h);box(c,'#78b6b8',x+2,y+2,w-4,h-4);
 box(c,'#bcdfd1',x+2,y+2,3,h-5);box(c,'#e3f1cd',x+4,y+3,3,3);
 box(c,'#a8723d',x+w/2,y,2,h);box(c,'#e0a654',x,y+h/2,w,2);
 box(c,'#65432a',x-3,y+h+2,w+6,3);box(c,'#e4ac5b',x-3,y+h+1,w+6,1);
 for(const side of [-8,w+4]){
  box(c,'#366d4b',x+side,y-1,5,h+3);box(c,'#74a76a',x+side,y,4,h);
  for(let j=0;j<h;j+=4)box(c,'#447d53',x+side,y+j,4,1);
 }
}
export function makeCabin(shop=false){
 const [im,c]=surface(134,148);

 oval(c,'#987747',73,140,58,6);

 box(c,'#61402c',16,86,103,51);box(c,'#b77b3c',19,88,99,43);
 for(let i=0;i<17;i++){
  const x=18+i*6;
  box(c,i%3===0?'#e4b368':i%3===1?'#d69a4b':'#c89148',x,85,5,46);
  box(c,'#8d592d',x+5,87,1,44);
  for(let j=0;j<5;j++)if(noise(i,j,4)>.43)box(c,'#b07839',x+2,90+j*8,1,5);
 }
 box(c,'#81552e',16,128,103,5);
 for(let i=0;i<12;i++){box(c,i%2?'#99917a':'#b9aa8a',17+i*8,134,8,5);box(c,'#746d59',17+i*8,139,8,1);}

 box(c,'#704828',9,101,33,31);box(c,'#a16d36',10,101,31,29);
 for(let yy=105;yy<131;yy+=6)for(let xx=13;xx<40;xx+=6){
  oval(c,'#8a5a2e',xx,yy,3,3);oval(c,'#ba8644',xx,yy-1,2,2);box(c,'#d5a35b',xx-1,yy-2,1,1);
 }
 roofPlane(c,[[5,82],[38,76],[49,101],[7,103]],shop?'green':'red',4);
 box(c,'#583529',6,102,42,3);box(c,'#d79c51',8,105,32,2);


 poly(c,'#764727',[[33,101],[76,58],[119,101]]);
 poly(c,shop?'#d1b376':'#e5ac50',[[39,99],[76,63],[113,99]]);
 for(let x=40;x<114;x+=5){
  const top=63+Math.abs(x-76)*.96;box(c,'#b47a30',x,top,1,99-top);
  box(c,'#f2c26a',x+1,top+2,1,97-top);
 }
 const paintSlope=(left)=>{
  const sx=left?33:76,sy=left?59:20;
  c.save();c.transform(1,left?-.907:.907,0,1,sx,sy);
  box(c,'#542b22',-1,-1,45,41);
  const roof=shop?['#204d35','#326f3c','#498547','#649b50']:['#6d2c20','#a33c22','#bf4d27','#d26732'];
  for(let row=0;row<8;row++)for(let col=-1;col<7;col++){
   const xx=col*7+(row%2)*3,yy=row*5;
   if(xx<0||xx>40)continue;
   const shade=left?2:1;
   box(c,roof[shade],xx,yy,6,4);box(c,roof[0],xx+6,yy,1,5);
   box(c,roof[3],xx+1,yy,5,1);box(c,roof[0],xx,yy+4,7,1);
   if((row+col)%4===0)box(c,roof[shade+1],xx+2,yy+2,2,1);
  }
  box(c,roof[0],0,39,43,3);box(c,left?roof[3]:roof[2],0,38,43,1);
  c.restore();
 };
 paintSlope(true);paintSlope(false);

 box(c,shop?'#356f3d':'#7c2d20',74,20,4,40);
 box(c,shop?'#6c9b53':'#df783b',74,20,1,39);
 for(let y=22;y<58;y+=5)box(c,'#592c20',75,y,3,1);
 poly(c,'#62371f',[[31,99],[76,57],[121,99],[119,103],[76,63],[34,103]]);
 poly(c,'#bf7833',[[33,99],[76,60],[119,99],[118,101],[76,64],[35,101]]);
 box(c,'#80522e',41,100,73,3);box(c,'#e8bb72',41,100,73,1);

 oval(c,'#6a422a',76,83,5,7);oval(c,'#d7ab60',76,83,4,6);box(c,'#8bbdbc',73,80,6,7);box(c,'#edcb83',75,78,1,10);box(c,'#edcb83',72,83,8,1);

 box(c,'#513e34',95,28,13,39);box(c,'#888c81',96,29,11,34);
 for(let y=29;y<62;y+=5){box(c,'#b6b9a4',96,y,11,1);box(c,'#626d66',96+(y%2?4:8),y+1,1,4);}
 box(c,'#565b55',93,25,17,5);box(c,'#b6b8a0',94,25,15,2);box(c,'#484b46',97,24,9,1);
 if(!shop)windowArt(c,43,104,14,20);windowArt(c,96,103,12,19);

 c.save();c.translate(shop?-25:-9,0);
 box(c,'#623c26',72,101,19,32);box(c,'#b47c3c',74,103,15,29);
 box(c,'#e2a951',75,104,12,1);box(c,'#87542b',76,120,10,10);box(c,'#cf9345',77,121,8,8);
 box(c,'#523c2e',77,106,9,12);box(c,'#8dbbbc',78,107,7,9);box(c,'#d8e1c1',79,108,2,6);box(c,'#e6bf6b',87,119,2,2);
 c.restore();

 box(c,'#68452c',10,132,116,11);box(c,'#cc9148',11,132,113,6);box(c,'#edbb65',12,132,111,1);
 for(let x=15;x<125;x+=6){box(c,'#a86a31',x,133,1,5);box(c,'#d89b4b',x,139,3,3);}
 box(c,'#7c4b2a',11,138,114,2);c.save();c.translate(shop?-25:-9,0);box(c,'#d9a454',71,141,24,3);box(c,'#8c592d',69,144,28,2);box(c,'#e6b166',69,143,28,1);
 c.restore();

 for(const x of [21,113]){
  box(c,'#754428',x-4,125,10,8);box(c,'#b9783b',x-3,125,8,6);box(c,'#dfa55a',x-4,124,10,2);
  for(let i=0;i<9;i++){const xx=x-5+noise(i,x)*11,yy=115+noise(x,i)*10;leaf(c,xx,yy,'#347d3f','#77ae54');if(i%2===0){box(c,'#bb527e',xx,yy-2,3,3);box(c,'#f3afbc',xx,yy-2,2,1);}}
 }
 if(shop){

  for(let i=0;i<9;i++){box(c,i%2?'#efda9b':'#638e5b',40+i*8,94,8,10);box(c,i%2?'#ccb17a':'#3a694d',40+i*8,102,8,3);}
  box(c,'#633d28',51,84,53,13);box(c,'#ddb16d',53,85,49,9);box(c,'#f2d28b',54,85,47,1);
  c.font='bold 6px monospace';c.textAlign='center';c.fillStyle='#624a2c';c.fillText('MOSS & SEED',77,92);
 }
 return im;
}
export function fence(c,x,y,length,vertical=false){
 if(worldSprites.props&&!vertical){
  for(let i=0;i<length;i++){
   const sx=i===0?0:i===length-1?128:16+(i%6)*16;
   c.drawImage(worldSprites.props,sx,0,16,32,Math.round(x+i*16),Math.round(y-18),16,32);
  }
  return;
 }
 for(let i=0;i<length;i++){
  const xx=x+(vertical?0:i*16),yy=y+(vertical?i*16:0);
  box(c,'#715130',xx+1,yy+2,16,3);box(c,'#b47c3c',xx+1,yy,16,3);box(c,'#dbaf62',xx+1,yy,15,1);
  box(c,'#795332',xx+1,yy+8,16,3);box(c,'#b48644',xx+1,yy+7,16,2);
  box(c,'#684a2e',xx-1,yy-5,7,19);box(c,'#b78a47',xx+1,yy-5,3,17);box(c,'#e0b56b',xx+1,yy-5,3,2);box(c,'#896130',xx+3,yy-2,2,14);oval(c,'#e8bd6d',xx+2,yy-5,3,2);box(c,'#f4d18b',xx,yy-6,3,1);
 }
}
export function barrel(c,x,y){
 if(worldSprites.props){
  c.drawImage(worldSprites.props,144,0,16,32,Math.round(x),Math.round(y-18),16,32);return;
 }
 oval(c,'#88673b',x+8,y+13,9,3);box(c,'#64442a',x,y-5,15,17);box(c,'#a97035',x+1,y-4,13,16);
 for(let i=0;i<4;i++)box(c,'#d09547',x+2+i*3,y-3,1,14);
 oval(c,'#66472e',x+7,y-5,8,4);oval(c,'#c89755',x+7,y-6,6,2);
 box(c,'#6a7771',x,y-1,15,2);box(c,'#a3a394',x+1,y-1,12,1);box(c,'#69726a',x,y+8,15,2);
}
export function chest(c,x,y){
 box(c,'#78522d',x-2,y+13,28,3);box(c,'#654126',x,y-4,25,18);box(c,'#b47835',x+1,y-2,23,14);
 for(let k=0;k<4;k++){box(c,'#d5a34e',x+2+k*6,y-2,4,14);box(c,'#8b5729',x+5+k*6,y-2,1,14);}
 poly(c,'#794629',[[x,y-4],[x+4,y-10],[x+23,y-10],[x+26,y-4]]);
 poly(c,'#d39844',[[x+2,y-4],[x+5,y-8],[x+21,y-8],[x+24,y-4]]);
 for(let k=0;k<4;k++)box(c,'#f0bf67',x+5+k*5,y-7,1,4);
 box(c,'#744529',x,y+1,25,2);box(c,'#f5cb73',x+11,y,4,5);box(c,'#79572f',x+12,y+1,2,2);
}
export function stone(c,x,y,size=1){
 if(resource(c,64,noise(x,y,6)>.5?32:48,16,16,x-8,y-10))return;
 oval(c,'#a69254',x+1,y+4,5*size,2*size);
 poly(c,'#576b62',[[x-4*size,y+2],[x-4*size,y-2*size],[x,y-5*size],[x+4*size,y-3*size],[x+5*size,y+2*size],[x+2*size,y+4*size]]);
 poly(c,'#929d82',[[x-3*size,y],[x-2*size,y-3*size],[x,y-4*size],[x+3*size,y-2*size],[x+2*size,y+size]]);
 box(c,'#c2c2a2',x-2*size,y-3*size,3*size,size);box(c,'#728672',x+size,y+size,3*size,size);
}
export function makeGround(terrainSheet){
 if(!terrainSheet||terrainSheet.width!==192)throw new Error("The native Ridgeside terrain atlas is required");
 const [im,c]=surface(W,H);c.imageSmoothingEnabled=false;




 const [yard,yardContext]=surface(W,H);
 const contour=(points)=>{
  yardContext.beginPath();
  const last=points.at(-1),first=points[0];
  yardContext.moveTo((last[0]+first[0])/2,(last[1]+first[1])/2);
  points.forEach(([x,y],i)=>{
   const next=points[(i+1)%points.length];
   yardContext.quadraticCurveTo(x,y,(x+next[0])/2,(y+next[1])/2);
  });yardContext.closePath();yardContext.fill();
 };
 yardContext.fillStyle='#fff';
 contour([[162,147],[308,147],[316,172],[377,172],[412,146],[550,146],
  [572,203],[430,229],[416,278],[438,316],[408,351],[376,372],
  [271,372],[251,348],[184,349],[159,325],[151,297],[171,268],
  [157,240],[137,224],[136,190]]);


 yardContext.globalCompositeOperation='destination-out';
 contour([[115,198],[185,202],[204,215],[220,230],[238,250],
  [245,266],[250,277],[237,293],[270,306],[303,319],[331,340],
  [319,359],[275,380],[131,382]]);
 contour([[401,231],[449,237],[445,249],[428,262],[406,273],[398,253]]);
 const mask=yardContext.getImageData(0,0,W,H).data;
 const dirtPixel=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&mask[(Math.floor(y)*W+Math.floor(x))*4+3]>=128;
 const dirtAt=(tx,ty)=>dirtPixel(tx*16+8,ty*16+8);
 const isGrass=(x,y)=>!dirtPixel(x,y);
 box(c,'#3ba622',0,0,W,H);



 const quilt=(crops,choose,size=16)=>{
  const tiles=crops.map(([sx,sy])=>{
   const [im,ctx]=surface(size,size);ctx.drawImage(terrainSheet,sx,sy,size,size,0,0,size,size);
   return ctx.getImageData(0,0,size,size).data;
  });
  const [im,ctx]=surface(W,H),out=ctx.createImageData(W,H),pixels=out.data;
  const seam=(tile,x,y,horizontal,overlap)=>{
   const costs=[],parents=[];
   for(let a=0;a<size;a++){
    costs[a]=[];parents[a]=[];
    for(let b=0;b<overlap;b++){
     const xx=horizontal?a:b,yy=horizontal?b:a;
     const src=(yy*size+xx)*4,dst=((y+yy)*W+x+xx)*4;
     let error=0;
     if(x+xx<W&&y+yy<H)for(let k=0;k<3;k++)error+=(pixels[dst+k]-tile[src+k])**2;
     let best=b;
     if(a)for(let prev=Math.max(0,b-1);prev<=Math.min(overlap-1,b+1);prev++)
      if(costs[a-1][prev]<costs[a-1][best])best=prev;
     costs[a][b]=error+(a?costs[a-1][best]:0);parents[a][b]=best;
    }
   }
   let b=costs[size-1].indexOf(Math.min(...costs[size-1]));const path=[];
   for(let a=size-1;a>=0;a--){path[a]=b;b=parents[a][b];}return path;
  };
  let previousY=0;
  for(let y=0;y<H;){
   let previousX=0;
   for(let x=0;x<W;){
    const overlapX=x?size-(x-previousX):0,overlapY=y?size-(y-previousY):0;
    const tile=tiles[choose(x,y)],left=x?seam(tile,x,y,false,overlapX):null,
     top=y?seam(tile,x,y,true,overlapY):null;
    for(let yy=0;yy<size&&y+yy<H;yy++)for(let xx=0;xx<size&&x+xx<W;xx++){
     if(left&&xx<overlapX&&xx<left[yy]||top&&yy<overlapY&&yy<top[xx])continue;
     const src=(yy*size+xx)*4,dst=((y+yy)*W+x+xx)*4;
     pixels.set(tile.subarray(src,src+4),dst);
    }
    previousX=x;x+=size-Math.floor(size*.44)+Math.floor(noise(x,y,153)*4);
   }
   previousY=y;y+=size-Math.floor(size*.44)+Math.floor(noise(y,0,157)*4);
  }
  ctx.putImageData(out,0,0);return im;
 };


 const rooted=(x,y)=>{
  const stands=[[104,152,68,116],[184,328,58,68],[486,66,84,54],[604,224,52,124],[334,414,124,38]];
  return stands.some(([cx,cy,rx,ry])=>((x-cx)/rx)**2+((y-cy)/ry)**2<1+noise(x,y,174)*.22);
 };



 const lawn=quilt([[112,336],[136,336],[160,336],[40,112],[48,120]],
  (x,y)=>rooted(x,y)?3+Math.floor(noise(x,y,172)*2):Math.floor(noise(x,y,173)*3),24);
 c.drawImage(lawn,0,0);


 const earth=quilt([[64,336],[80,336],[96,336],[16,0],[16,40]],
  (x,y)=>Math.floor(noise(x,y,141)*5));
 const ec=earth.getContext('2d');
 const ground=c.getImageData(0,0,W,H),earthPixels=ec.getImageData(0,0,W,H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(dirtPixel(x,y)){
  const n=(y*W+x)*4;ground.data.set(earthPixels.data.slice(n,n+4),n);
 }
 c.putImageData(ground,0,0);

 const [lips,lc]=surface(64,48);lc.drawImage(terrainSheet,0,16,64,48,0,0,64,48);
 const lipPixels=lc.getImageData(0,0,64,48);
 for(let n=0;n<lipPixels.data.length;n+=4){
  const [r,g,b]=lipPixels.data.slice(n,n+3);
  if(!(g>r&&g>b)&&r>200)lipPixels.data[n+3]=0;
 }
 lc.putImageData(lipPixels,0,0);


 for(let x=2;x<W-8;){
  const run=[4,8,6,4,6][Math.floor(noise(x,0,92)*5)];
  for(let y=2;y<H-2;y++){
   if(dirtPixel(x,y)===dirtPixel(x,y-1))continue;
   const north=dirtPixel(x,y),sx=16+Math.floor(noise(x,y,93)*(16-run));
   c.drawImage(lips,sx,north?0:32,run,16,x,y-(north?8:7),run,16);
  }x+=run;
 }
 for(let y=2;y<H-8;){
  const run=[4,6,8,6][Math.floor(noise(0,y,94)*4)];
  for(let x=2;x<W-2;x++){
   if(dirtPixel(x,y)===dirtPixel(x-1,y))continue;


   if(dirtPixel(x,y-3)!==dirtPixel(x,y+3))continue;
   const west=dirtPixel(x,y),sy=16+Math.floor(noise(x,y,95)*(16-run));
   c.drawImage(lips,west?0:48,sy,16,run,x-(west?8:7),y,16,run);
  }y+=run;
 }




 const [ripples,rippleContext]=surface(128,96);
 box(rippleContext,'#457df5',0,0,128,96);

 rippleContext.globalAlpha=.24;
 for(let y=0;y<96;y+=16)for(let x=-((y/16)%3)*19;x<128;x+=64)
  rippleContext.drawImage(terrainSheet,128,96,64,16,x,y,64,16);
 rippleContext.globalAlpha=1;



 for(const [sx,sy,x,y]of [
  [128,96,4,5],[160,96,69,10],[144,96,39,29],
  [128,96,100,39],[160,96,9,54],[144,96,66,65],
  [128,96,29,83],
 ]){
  rippleContext.drawImage(terrainSheet,sx,sy,32,16,x,y,32,16);
  if(x+32>128)rippleContext.drawImage(terrainSheet,sx,sy,32,16,x-128,y,32,16);
 }


 const [fringe,fringeContext]=surface(64,48);
 fringeContext.drawImage(terrainSheet,0,16,64,48,0,0,64,48);
 const fringePixels=fringeContext.getImageData(0,0,64,48);
 for(let i=0;i<fringePixels.data.length;i+=4){
  const [r,g,b]=fringePixels.data.slice(i,i+3);
  if(g<=r||g<=b)fringePixels.data[i+3]=0;
 }
 fringeContext.putImageData(fringePixels,0,0);
 const paintPond=(c,frame)=>{
 const turf=[];
 const offset=c.getTransform();
 const bank=(sx,sy,x,y)=>c.drawImage(terrainSheet,sx,
  sy+(Math.floor(frame/4)%2?160:0),16,16,x,y,16,16);
 const [flow,flowContext]=surface(128,96);
 box(flowContext,'#457df5',0,0,128,96);
 for(let x=-frame;x<128;x+=128)flowContext.drawImage(ripples,x,0);


 const shoulders=[
  [288,480,528],[292,476,532],[296,472,535],[300,468,538],
  [304,464,541],[308,460,544],[312,456,546],[316,452,548],
  [320,448,549],[328,448,550],[336,448,550],
  [344,456,560],[352,464,552],[360,472,552],[368,480,544],
 ];
 for(const [y,left,right]of shoulders)
  c.drawImage(flow,left-448,y-288,right-left+16,16,left,y,right-left+16,16);

 for(const [y,left,right]of shoulders){
  if(y<320){
   bank(128,0,left,y);bank(160,0,right,y);
   turf.push([0,0,16,16,left-3,y-5,16,16]);
   turf.push([48,0,16,16,right+3,y-5,16,16]);
  }
  else if(y<344){
   bank(128,16,left,y);bank(160,16,right,y);


   turf.push([48,16,16,16,right+3,y,16,16]);
  }
 }


 for(let x=496;x<528;x+=16)bank(144,0,x,288);



 c.drawImage(flow,48,0,32,24,496,288,32,24);
 for(const [sx,width,x,y]of [[148,7,496,288],[146,6,503,289],
  [149,5,509,291],[147,8,514,290],[149,6,522,288]]){

  const wet=c.getImageData(x+offset.e,y+8+offset.f,width,16).data;
  const [face,faceContext]=surface(width,16);
  faceContext.drawImage(terrainSheet,sx,0,width,16,0,0,width,16);
  const rock=faceContext.getImageData(0,0,width,16).data;
  c.save();c.beginPath();
  for(let yy=0;yy<16;yy++)for(let xx=0;xx<width;xx++){
   const n=(yy*width+xx)*4;
   if(rock[n+3]&&rock[n]>rock[n+2]&&wet[n+2]>wet[n]+40&&wet[n+2]>wet[n+1]+20)c.rect(x+xx,y+8+yy,1,1);
  }
  c.clip();
  c.drawImage(terrainSheet,sx,0,width,16,x,y+8,width,16);
  c.save();


  for(let yy=0;yy<16;yy++){
   c.globalAlpha=.42+.5*(yy/15)**2;box(c,'#457df5',x,y+8+yy,width,1);
  }
  c.globalAlpha=.20;
  c.drawImage(flow,x-448,y+8-288,width,16,x,y+8,width,16);
  c.restore();c.restore();
  c.drawImage(terrainSheet,sx,Math.floor(frame/4)%2?160:0,width,16,x,y,width,16);

  c.drawImage(pondBase,x-448,0,width,y-288+5,x,288,width,y-288+5);
  turf.push([16+(x%(17-width)),0,width,12,x,y-1,width,12]);
 }



 c.drawImage(pondBase,0,56,128,40,448,344,128,40);



 const southRuns=[
  [0,368,16,16,448,338],[3,368,13,16,454,339],
  [4,368,12,16,461,343],[6,368,10,16,466,349],
  [8,368,8,16,471,355],
  [16,368,12,16,479,357],[20,368,8,16,491,359],
  [16,368,16,16,499,359],[16,368,16,16,515,360],
  [20,368,12,16,531,357],
  [32,368,16,16,539,350],
  [32,352,16,32,547,326],
  [32,352,16,16,548,322],
 ];
 const [lower,lowerContext]=surface(128,48);
 for(const [sx,sy,w,h,x,y]of southRuns)
  lowerContext.drawImage(terrainSheet,sx,sy,w,h,x-448,y-336,w,h);
 const lowerPixels=lowerContext.getImageData(0,0,128,48).data;
 const contacts=Array(128).fill(-1);
 for(let x=0;x<128;x++){
  for(let y=0;y<48;y++){
   const n=(y*128+x)*4;
   if(lowerPixels[n+3]&&lowerPixels[n]>lowerPixels[n+2]){contacts[x]=y+336;break;}
  }
 }



 for(let x=0;x<128;x++)if(contacts[x]<0){
  let l=x-1,r=x+1;
  while(l>=0&&contacts[l]<0)l--;
  while(r<128&&contacts[r]<0)r++;
  contacts[x]=l>=0&&r<128?Math.round(contacts[l]+(contacts[r]-contacts[l])*(x-l)/(r-l)):
   l>=0?contacts[l]:r<128?contacts[r]:376;
 }



 const assembled=[...contacts];
 for(let x=0;x<128;x++){
  const around=assembled.slice(Math.max(0,x-4),Math.min(128,x+5));
  contacts[x]=Math.round(around.reduce((a,b)=>a+b,0)/around.length);
 }
 for(let x=1;x<128;x++)contacts[x]=Math.min(contacts[x],contacts[x-1]+1);
 for(let x=126;x>=0;x--)contacts[x]=Math.min(contacts[x],contacts[x+1]+1);


 const [shelf,shelfContext]=surface(128,56);
 for(const rise of [12,8,4,0])shelfContext.drawImage(lower,0,8-rise);
 for(let x=0;x<128;x++){
  const contact=contacts[x];
  if(contact>344)c.drawImage(flow,x,56,1,contact-344,x+448,344,1,contact-344);
  c.drawImage(pondBase,x,contact-288,1,384-contact,x+448,contact,1,384-contact);
 }
 c.save();c.beginPath();
 for(let x=0;x<128;x++)c.rect(x+448,contacts[x]-4,1,384-contacts[x]+4);
 c.clip();c.drawImage(shelf,448,328);c.restore();


 for(let x=0;x<128;x++){
  const contact=contacts[x];
  c.save();
  for(let depth=0;depth<4;depth++){
   c.globalAlpha=.46+.12*(3-depth);
   box(c,'#457df5',x+448,contact-4+depth,1,1);
  }
  c.globalAlpha=.12;
  c.drawImage(flow,x,contact-4-288,1,4,x+448,contact-4,1,4);
  c.restore();
 }
 const [lowerTurf,lowerTurfContext]=surface(128,48);
 for(const [,,w,,x,y]of southRuns)for(let offset=0;offset<w;offset+=16){
  const width=Math.min(16,w-offset);
  lowerTurfContext.drawImage(fringe,16,32,width,16,x+offset-448,y+12-336,width,16);
 }
 const turfPixels=lowerTurfContext.getImageData(0,0,128,48);
 for(let y=0;y<48;y++)for(let x=0;x<128;x++)
  if(y+336<contacts[x]+5)turfPixels.data[(y*128+x)*4+3]=0;
 lowerTurfContext.putImageData(turfPixels,0,0);c.drawImage(lowerTurf,448,336);
 for(const args of turf)c.drawImage(fringe,...args);


 resource(c,16,64,16,16,472,288);
 resource(c,64,32,16,16,537,299);
 resource(c,64,48,16,16,503,289);
 resource(c,0,64,16,16,459,365);
 resource(c,64,48,16,16,547,372);
 };

 const [pondBase,pondContext]=surface(128,96);
 pondContext.drawImage(im,448,288,128,96,0,0,128,96);
 paintPond(c,0);


 for(const [x,y,sx,sy]of [[181,329,0,64],[156,249,16,64],[398,311,32,64],[423,247,48,64],[198,371,0,64],[131,283,16,64],[377,364,32,64]]){
  resource(c,sx,sy,16,16,x,y);
 }
 for(const [x,y]of [[108,262],[154,357],[409,274],[403,158],[242,374],[201,221],[388,347],[212,167]])stone(c,x,y);
 resource(c,64,0,16,16,174,361);
 resource(c,64,16,16,16,405,292);
 resource(c,32,0,32,32,102,303);

 for(let i=0;i<2;i++){const x=248+(i%2)*3,y=181+i*7;oval(c,'#d1aa66',x+1,y+2,7,3);oval(c,'#c0b180',x,y,6,3);box(c,'#e2cf9c',x-3,y-2,6,1);}

 const paintPier=c=>{
 if(worldSprites.props){
  for(let i=0;i<4;i++)c.drawImage(worldSprites.props,160,0,16,16,416+i*16,322,16,16);

  box(c,'#784828',416,338,64,2);box(c,'#ba7939',416,337,64,1);
  for(const [x,y]of [[417,322],[474,322],[417,338],[474,338]]){
   box(c,'#603b25',x,y-4,3,7);box(c,'#bf8548',x,y-4,2,2);
  }
 }
 };
 paintPier(c);


 const [flowers,flowerContext]=surface(32,16);
 flowerContext.drawImage(terrainSheet,0,320,32,16,0,0,32,16);
 const flowerPixels=flowerContext.getImageData(0,0,32,16);
 const lawnColors=new Set(['59,166,34','98,203,51','43,135,65','50,150,25','52,155,30','76,175,29']);
 for(let i=0;i<flowerPixels.data.length;i+=4)
  if(lawnColors.has(Array.from(flowerPixels.data.slice(i,i+3)).join(',')))flowerPixels.data[i+3]=0;
 flowerContext.putImageData(flowerPixels,0,0);
 for(const [tx,ty]of [[21,9],[8,15],[25,16],[12,24],[31,15],[7,8],[12,17],[16,20],[19,21],[23,7]]){
  if([tx,tx+1].every(x=>!dirtAt(x,ty)))c.drawImage(flowers,tx*16,ty*16);
 }
 fence(c,110,210,4);fence(c,113,354,7);fence(c,246,347,7);fence(c,422,234,7);
 const waterFrames=Array.from({length:128},(_,frame)=>{
  const [image,water]=surface(128,96);water.imageSmoothingEnabled=false;
  water.drawImage(pondBase,0,0);water.translate(-448,-288);
  paintPond(water,frame);paintPier(water);return image;
 });
 return {image:im,isGrass,waterFrames};
}
export function drawSoil(c,tile,neighbors){
 if(!tile.tilled)return;
 if(!worldSprites.soil)throw new Error('Native soil atlas must load before rendering');
 const x=tile.x*16,y=tile.y*16,wet=tile.watered?24:0;
 const has=(dx,dy)=>neighbors.has((tile.x+dx)+','+(tile.y+dy));
 const mask=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]].map(([dx,dy])=>+has(dx,dy)).join('');
 const key=[tile.x,tile.y,wet,mask].join(':');
 const draw=image=>{c.save();c.imageSmoothingEnabled=false;c.drawImage(image,x,y);c.restore();};
 if(soilTiles.has(key)){draw(soilTiles.get(key));return;}
 const [image,paint]=surface(16,16);paint.imageSmoothingEnabled=false;


 for(let qy=0;qy<2;qy++)for(let qx=0;qx<2;qx++){
  const dx=qx?1:-1,dy=qy?1:-1,h=has(dx,0),v=has(0,dy);
  let sx=(h?1:qx*2)*8,sy=(v?1:qy*2)*8;
  if(h&&v&&!has(dx,dy)){sx=24+qx*8;sy=qy*8;}
  else if(h&&v){

   const rhythm=[0,2,1,3,2,0,3,1,1,3,0];
   sx=32+rhythm[(tile.x*2+qx+tile.y*3+qy)%rhythm.length]*8;sy=16;
  }
  const edgeVariant=((tile.x*7+tile.y*11)%3)*64;
  paint.drawImage(worldSprites.soil,sx+edgeVariant,sy+wet,8,8,qx*8,qy*8,8,8);
 }


 paint.globalCompositeOperation='source-atop';paint.globalAlpha=1;
 const tx=((Math.floor(x)%128)+128)%128,ty=((Math.floor(y)%128)+128)%128;
 paint.drawImage(worldSprites.soil,tx+(wet?128:0),48+ty,16,16,0,0,16,16);
 paint.globalAlpha=1;paint.globalCompositeOperation='source-over';



 const pixels=paint.getImageData(0,0,16,16),rgba=pixels.data;
 const profile=Array(157).fill(0);
 for(const [start,length] of [[3,9],[19,5],[30,13],[49,7],[63,11],[81,6],[96,15],[119,9],[138,12]])profile.fill(1,start,start+length);
 for(const [start,length] of [[34,5],[67,3],[101,6],[142,4]])profile.fill(2,start,start+length);
 const depth=(along,cross)=>profile[((along+cross*7)%profile.length+profile.length)%profile.length];
 for(let yy=0;yy<16;yy++)for(let xx=0;xx<16;xx++){
  if((!has(0,-1)&&yy<depth(x+xx,y))||
     (!has(0,1)&&15-yy<depth(x+xx,y+16))||
     (!has(-1,0)&&xx<depth(y+yy,x+5))||
     (!has(1,0)&&15-xx<depth(y+yy,x+21)))rgba[(yy*16+xx)*4+3]=0;
 }
 const opaque=(xx,yy)=>{
  if(xx<0)return has(-1,0);if(xx>15)return has(1,0);
  if(yy<0)return has(0,-1);if(yy>15)return has(0,1);
  return rgba[(yy*16+xx)*4+3]>0;
 };
 for(let yy=0;yy<16;yy++)for(let xx=0;xx<16;xx++){
  const i=(yy*16+xx)*4;if(!rgba[i+3])continue;
  const ledge=depth(x+xx+13,y+yy);



  const north=!opaque(xx,yy-1),south=!opaque(xx,yy+1);
  const west=!opaque(xx-1,yy),east=!opaque(xx+1,yy);
  const outer=north||south||west||east;
  const shoulder=!opaque(xx,yy-2)||!opaque(xx,yy+2)||!opaque(xx-2,yy)||!opaque(xx+2,yy);
  const apron=!opaque(xx,yy-3)||!opaque(xx-3,yy);



  const innerNorth=!opaque(xx,yy-2),innerWest=!opaque(xx-2,yy);


  const crumb=((x+xx)*3+(y+yy)*7)%19<3;
  const delta=outer?(south?-5:east?-4:crumb?7:3):
   shoulder?(innerNorth||innerWest?-10:crumb&&ledge===1?4:1):apron?-3:0;
  const rim=wet?[139,94,46]:[184,129,63];
  for(let ch=0;ch<3;ch++){
   const earth=rgba[i+ch]+delta;
   rgba[i+ch]=outer?Math.round(earth*(crumb?.65:.85)+rim[ch]*(crumb?.35:.15)):earth;
  }

 }
 paint.putImageData(pixels,0,0);

 soilTiles.set(key,image);draw(image);
}
export function well(c,x,y){
 oval(c,'#b29651',x+2,y+15,17,5);
 oval(c,'#535c4f',x,y+6,14,10);box(c,'#707b63',x-14,y-2,28,10);oval(c,'#86937c',x,y-2,14,7);
 oval(c,'#3e4b40',x,y-3,10,4);oval(c,'#274f53',x,y-1,8,2);
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const xx=x-13+col*7+(row%2?2:0),yy=y+2+row*4;
  box(c,row%2?'#b0ad8b':'#969c7e',xx,yy,6,3);box(c,'#ccd0ad',xx,yy,5,1);
 }
 box(c,'#72482a',x-13,y-25,3,31);box(c,'#c68d42',x-12,y-24,1,28);
 box(c,'#72482a',x+11,y-25,3,31);box(c,'#c68d42',x+12,y-24,1,28);
 box(c,'#5e3d29',x-13,y-11,27,3);box(c,'#c39550',x-12,y-11,26,1);
 box(c,'#ded1a1',x+1,y-10,1,12);box(c,'#755335',x-2,y+1,7,5);box(c,'#c89852',x-1,y+1,5,3);
 poly(c,'#5d3b2a',[[x-18,y-24],[x-9,y-32],[x+10,y-32],[x+18,y-24],[x+18,y-20],[x-18,y-20]]);
 poly(c,'#a56532',[[x-17,y-24],[x-8,y-30],[x+9,y-30],[x+16,y-24]]);
 for(let i=-14;i<16;i+=5){box(c,'#df9c4c',x+i,y-25,4,1);box(c,'#ca823d',x+i+2,y-28,4,1);}
 box(c,'#d59347',x-17,y-23,34,2);
}
export function stump(c,x,y){
 if(resource(c,0,0,32,32,x-16,y-27))return;
 oval(c,'#aa9050',x+1,y+4,11,3);
 poly(c,'#6f4428',[[x-7,y-12],[x+6,y-12],[x+8,y],[x+12,y+4],[x+4,y+3],[x,y],[x-6,y+4],[x-11,y+4],[x-7,y-1]]);
 box(c,'#a66b2e',x-6,y-9,12,11);box(c,'#d09746',x-5,y-8,2,8);box(c,'#d09746',x+2,y-8,2,7);
 oval(c,'#67412a',x,y-10,8,4);oval(c,'#d5a25a',x,y-11,7,3);oval(c,'#9f6d34',x,y-11,4,2);oval(c,'#dab268',x,y-11,2,1);
}


export function hedge(c,x,y,seed=0){
 oval(c,'#9c7936',x+1,y+3,14,4);
 oval(c,'#164b28',x,y-4,14,8);
 for(const [dx,dy,rx,ry]of [[-8,-6,6,7],[-6,-12,6,5],[1,-13,7,6],[8,-9,6,7],[4,-3,9,5]]){
  oval(c,'#226e2b',x+dx,y+dy,rx,ry);
  oval(c,'#3d8f2e',x+dx-1,y+dy-2,rx-1,ry-2);
 }
 for(let i=0;i<60;i++){
  const xx=x-11+noise(i,seed,8)*23,yy=y-15+noise(i,seed,12)*17;
  const color=yy<y-7?'#4ca133':'#287b2d',light=yy<y-7?'#83c646':'#58a938';
  leaf(c,xx,yy,color,light);
 }
 for(let i=0;i<6;i++){
  const xx=x-10+noise(i,seed,3)*21,yy=y-12+noise(seed,i,9)*11;
  box(c,'#9e426d',xx-1,yy,4,3);box(c,'#e66c9d',xx,yy-1,3,3);box(c,'#ffc0ca',xx,yy-1,2,1);box(c,'#f8d996',xx+1,yy,1,1);
 }
}
