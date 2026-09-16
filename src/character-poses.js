



const skin = {edge:'#951c15',base:'#e96d42',light:'#ffab7a'};
function stroke(c,color,a,b,width) {
  c.fillStyle=color;
  const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));
  for(let i=0;i<=n;i++)c.fillRect(Math.round(a[0]+(b[0]-a[0])*i/Math.max(1,n)),Math.round(a[1]+(b[1]-a[1])*i/Math.max(1,n)),width,width);
}
function arm(c,shoulder,elbow,hand) {
  for(const [color,width] of [[skin.edge,3],[skin.base,2],[skin.light,1]]) {
    stroke(c,color,shoulder,elbow,width);stroke(c,color,elbow,hand,width);
  }

  c.fillStyle='#706553';c.fillRect(shoulder[0]-1,shoulder[1]-1,4,2);
  c.fillStyle='#d6cebd';c.fillRect(shoulder[0],shoulder[1]-1,2,1);
}
export const ACTION_DURATION=.38;
export function actionFrame(elapsed) {return Math.min(3,Math.floor(elapsed/ACTION_DURATION*4));}
export function createActionPoses(source) {
  const poses={};
  for(const type of ['hoe','water'])for(const direction of ['down','up','right','left'])for(let frame=0;frame<4;frame++) {
    const rear=direction==='up',side=direction==='right'||direction==='left';
    const row=rear?64:side?32:0;
    const dip=(rear ? (type==='hoe'?[0,3,6,2]:[0,3,5,1]) : (type==='hoe'?[0,1,3,1]:[0,1,2,0]))[frame];
    const canvas=document.createElement('canvas');canvas.width=24;canvas.height=32;
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
    c.translate(4,0);

    c.drawImage(source,0,row+25,16,7,0,25,16,7);

    c.save();c.beginPath();c.rect(-4,0,24,25);c.clip();
    const lean=type==='water'&&side&&(frame===1||frame===2)?1:0;
    if(!(rear&&type==='water'))c.drawImage(source,0,row,16,25,lean,dip,16,25);

    c.clearRect(0,16+dip,5,9);c.clearRect(12,16+dip,4,9);
    c.restore();
    let hand;
    if(type==='hoe') {
      hand=side?[[11,9],[16,14],[17,24],[13,19]][frame]:rear?[[14,9],[16,15],[16,20],[14,18]][frame]:[[12,10],[13,15],[10,26],[12,21]][frame];
    }else {
      hand=rear?[[14,20],[17,17],[17,17],[15,19]][frame]:side?[[11,20],[14,19],[15,21],[12,21]][frame]:[[11,20],[13,20],[14,22],[12,21]][frame];
    }
    if(rear) {

      arm(c,[2,16+Math.floor(dip/2)],type==='water'?[[1,19],[1,18],[2,19],[1,19]][frame]:[1,19],[3,15+Math.floor(dip/2)]);
      arm(c,type==='water'?[13,16+Math.floor(dip/2)]:[12,16+Math.floor(dip/2)],type==='water'?[[15,21],[16,20],[16,20],[15,21]][frame]:[15,21],hand);
    }else if(side) {
      arm(c,[5+lean,16+dip],type==='hoe'?[[5,12],[10,13],[11,24],[8,22]][frame]:[[7,21],[9,21],[10,24],[8,22]][frame],hand);
      if(type==='hoe')arm(c,[11,16+dip],[[13,13],[15,16],[16,22],[14,22]][frame],[[12,13],[13,18],[14,22],[10,21]][frame]);
    }else {

      arm(c,[2,16+dip],type==='hoe'?[3,19+dip]:[4,22+dip],type==='hoe'?[hand[0]-2,hand[1]]:[hand[0]-3,hand[1]+2]);
      arm(c,[12+(type==='water'&&frame===2?1:0),16+dip],type==='water'?[[13,18],[15,18],[16,21],[14,19]][frame]:[14,18+dip],hand);
    }


    if(rear) {



      for(let y=13+dip;y<25;y++) {
        const sy=13+Math.floor((y-13-dip)*12/(12-dip));
        const lean=type==='water'?Math.round((24-y)*[0,2,3,1][frame]/10):0;


        const start=type==='water'?3:5,width=type==='water'?10:7;
        c.drawImage(source,start,row+sy,width,1,start+lean,y,width,1);
      }
      if(dip>=2) {
        c.drawImage(source,1,row+14,4,3,0,14+Math.floor(dip/2),4,3);
        c.drawImage(source,12,row+14,3,3,14,15+Math.floor(dip/2),3,3);
      }
      c.drawImage(source,0,row,16,13,type==='water'?[0,1,2,1][frame]:0,dip,16,13);
    }
    const sprite={image:canvas,width:24,height:32,anchorX:12,anchorY:31};
    poses[type+direction+frame]={sprite,hand:[hand[0]-8,hand[1]-31],mirror:direction==='left'};
  }
  return poses;
}
