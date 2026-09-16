import './style.css';
import './shortcuts.css';
import { initShortcuts } from './shortcuts.js';
import { createGame, serialize, tick, move, act, interact, getNearbyInteraction } from './game.js';
import { createRenderer } from './render.js';

const $ = id => document.getElementById(id);
const SAVE_KEY = 'tab-hollow-farm-v1';
let saved = null, storageAvailable = true;
try { saved = localStorage.getItem(SAVE_KEY); } catch { storageAvailable = false; }
let game = createGame(saved), started = false, lastFrame = performance.now(), saveElapsed = 0, lastMessage = '', toastUntil = 0;
let soundOn = false, audioContext = null, masterGain = null, ambientTimer = null;
const keys = new Set();
const modalOpen = () => Boolean(document.querySelector('dialog[open]'));
initShortcuts({onOpen: () => keys.clear(), onNavigate: () => { keys.clear(); save(); }});
const tools = [
  {id:'hoe', name:'Hoe', hint:'Prepare a patch of earth'},
  {id:'seeds', name:'Seeds', hint:'Plant a little possibility'},
  {id:'water', name:'Water', hint:'Give your garden a drink'},
  {id:'harvest', name:'Harvest', hint:'Pick something you grew'}
];
const soundIcon = muted => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 5 5 9H2v6h3l5 4z"/>'+(muted?'<path d="m16 9 6 6m0-6-6 6"/>':'<path d="M14 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>')+'</svg>';
$('sound-button').innerHTML = soundIcon(true);
document.querySelector('.toolbelt').innerHTML = tools.map((tool,i)=>'<button class="tool" data-tool="'+tool.id+'" aria-label="'+tool.name+' ('+(i+1)+')" title="'+tool.name+' · '+tool.hint+'"><kbd>'+(i+1)+'</kbd><img src="'+(tool.id==='harvest'?'/assets/nina-repixel/turnip.png':'/assets/original-farm/tool-'+tool.id+'.png')+'" alt="" draggable="false"></button>').join('');
document.querySelector('.toolbelt').insertAdjacentHTML('beforeend', '<div class="belt-extra" aria-hidden="true"><img src="/assets/original-farm/tool-seeds.png" alt=""><small id="belt-seeds"></small></div><div class="belt-extra" aria-hidden="true"><img src="/assets/nina-repixel/turnip.png" alt=""><small id="belt-harvest"></small></div>'+Array.from({length:4},()=>'<div class="belt-extra" aria-hidden="true"></div>').join(''));
if(saved) { $('start-button').innerHTML='Welcome home <span>→</span>'; $('welcome-note').textContent='Your farm is right where you left it. Day '+game.day+'.'; }
if(!storageAvailable) $('save-label').textContent='Browser storage unavailable — progress lasts this visit.';

function save() {
  if (!started) return;
  try { localStorage.setItem(SAVE_KEY, serialize(game)); $('save-label').textContent='Farm saved on this device'; }
  catch { $('save-label').textContent='Could not save — allow browser storage to keep your farm.'; }
}
function tone(frequency, duration=.1, volume=.045, delay=0, type='sine') {
  if(!soundOn || !audioContext || !masterGain) return;
  const oscillator=audioContext.createOscillator(), gain=audioContext.createGain(), at=audioContext.currentTime+delay;
  oscillator.type=type; oscillator.frequency.setValueAtTime(frequency,at);
  gain.gain.setValueAtTime(0,at); gain.gain.linearRampToValueAtTime(volume,at+.015); gain.gain.exponentialRampToValueAtTime(.001,at+duration);
  oscillator.connect(gain); gain.connect(masterGain); oscillator.start(at); oscillator.stop(at+duration+.02);
}
function ambient() {
  if(document.hidden || !started || modalOpen()) return;
  [261.63,329.63,392,523.25].forEach((frequency,i)=>tone(frequency,2.3,.018,i*.75));
  if(Math.random()>.4) { tone(1318,.12,.014,3); tone(1568,.14,.012,3.16); }
}
async function toggleSound() {
  try {
    if(!audioContext) { const Audio=window.AudioContext||window.webkitAudioContext; audioContext=new Audio(); masterGain=audioContext.createGain(); masterGain.gain.value=.55; masterGain.connect(audioContext.destination); }
    await audioContext.resume();
    soundOn=!soundOn; $('sound-button').innerHTML=soundIcon(!soundOn); $('sound-button').setAttribute('aria-label',soundOn?'Mute ambient sound':'Enable ambient sound');
    clearInterval(ambientTimer); if(soundOn) { ambient(); ambientTimer=setInterval(ambient,6500); }
  } catch { notify('This browser cannot play ambient audio. The garden is still open.'); }
}
function notify(message) { lastMessage=message; $('toast').textContent=message; toastUntil=performance.now()+5500; $('toast').classList.remove('hidden'); }
function selectTool(id) { game.selected=id; updateHUD(); save(); tone(440,.07,.02); }
function perform(fn) {
  if(!started || modalOpen()) return;
  const result=fn();
  notify(game.message); save(); updateHUD();
  if(result) { const type=game.lastAction?.type; if(type==='harvest'||type==='sell'||type==='quest') { tone(523,.12); tone(659,.15,.04,.12); tone(784,.24,.04,.24); } else if(type==='sleep') { tone(392,.5); tone(523,.8,.03,.2); } else tone(type==='water'?740:330,.09,.03,0,type==='hoe'?'triangle':'sine'); }
}
function updateHUD() {
  const weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  $('day-label').textContent=weekdays[(game.day-1)%7].slice(0,3)+'. '+game.day;
  const hour=Math.floor(game.time/60), minute=Math.floor(game.time%60/10)*10;
  $('time-label').textContent=(hour%12||12)+':'+String(minute).padStart(2,'0')+' '+(hour>=12?'pm':'am');
  $('coins-label').textContent=game.coins.toLocaleString();
  $('energy-fill').style.height=(game.energy/game.maxEnergy*100)+'%';
  $('energy-fill').style.background=game.energy<20?'#d77938':'#88b634';
  $('energy-label').textContent=Math.floor(game.energy)+' / '+game.maxEnergy;
  $('belt-seeds').textContent=game.seeds; $('belt-harvest').textContent=game.harvest; $('seeds-label').textContent=game.seeds+' turnip seeds'; $('harvest-label').textContent=game.harvest+' harvested';
  $('quest-count').textContent=Math.min(game.stats.sold,12)+' / 12';
  $('quest-progress').style.width=Math.min(game.stats.sold/12*100,100)+'%';
  $('quest-icon').textContent=game.questComplete?'✓':'◇';
  $('quest-copy').textContent=game.questComplete?'You did it. This little farm is home now. Keep growing!':'A handful of seeds. A world of possibility.';
  document.querySelector('.quest-card h2').textContent=game.questComplete?'Roots in the valley':'A growing beginning';
  const tool=tools.find(t=>t.id===game.selected)||tools[0];
  $('tool-tip').replaceChildren(document.createTextNode(tool.name.toUpperCase()+' '));
  const hint=document.createElement('span');hint.textContent=tool.hint;$('tool-tip').append(hint);
  document.querySelectorAll('.tool').forEach(button=>{const selected=button.dataset.tool===game.selected;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected));});
  const station=getNearbyInteraction(game);
  $('interaction').classList.toggle('hidden',!station||!started);
  if(station) $('interaction').querySelector('span').textContent=station.label;
}
function toggleJournal() {
 const open=$('quest-card').classList.contains('hidden');
 $('quest-card').classList.toggle('hidden',!open);
 $('quest-toggle').setAttribute('aria-expanded',String(open));
 $('quest-toggle').setAttribute('aria-label',open?'Close journal':'Open journal');
}
$('quest-toggle').addEventListener('click',toggleJournal);
function openGuide() { keys.clear(); $('guide').showModal(); }
function closeGuide() { $('guide').close(); $('reset-confirm').classList.add('hidden'); $('game').focus(); }
$('start-button').addEventListener('click',()=>{
 started=true; document.body.classList.add('playing'); $('welcome').classList.add('hidden');
 ['hud','quest-toggle','tool-area','location-tag','touch-controls'].forEach(id=>$(id).classList.remove('hidden'));
 notify(game.message);updateHUD();save();$('game').focus();
});
$('sound-button').addEventListener('click',toggleSound);
$('help-button').addEventListener('click',openGuide);
$('journal-button').addEventListener('click',openGuide);
$('resume-button').addEventListener('click',closeGuide);
document.querySelector('.close-dialog').addEventListener('click',closeGuide);
$('guide').addEventListener('close',()=>keys.clear());
$('reset-button').addEventListener('click',()=>$('reset-confirm').classList.remove('hidden'));
$('cancel-reset').addEventListener('click',()=>$('reset-confirm').classList.add('hidden'));
$('confirm-reset').addEventListener('click',()=>{game=createGame();if(!started)$('start-button').click();save();closeGuide();notify('A fresh patch of earth. Welcome to your new farm.');updateHUD();});
$('interaction').addEventListener('click',()=>perform(()=>interact(game)));
document.querySelectorAll('.tool').forEach(button=>button.addEventListener('click',()=>selectTool(button.dataset.tool)));
$('touch-act').addEventListener('click',()=>perform(()=>act(game)));
const directionKeys={up:'arrowup',left:'arrowleft',down:'arrowdown',right:'arrowright'};
document.querySelectorAll('[data-dir]').forEach(button=>{
 const key=directionKeys[button.dataset.dir];
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(key);});
 ['pointerup','pointercancel','lostpointercapture'].forEach(name=>button.addEventListener(name,()=>keys.delete(key)));
});
window.addEventListener('keydown',event=>{
 if(event.key==='Escape') {keys.clear();return;}
 if(event.target.closest('input, textarea, select, [contenteditable]')) return;
 if(event.target.closest('button, a') && [' ', 'Enter'].includes(event.key)) return;
 if(!started||modalOpen()||event.ctrlKey||event.metaKey||event.altKey) return;
 const key=event.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d'].includes(key))event.preventDefault();
 keys.add(key);
 if(event.repeat) return;
 if('1234'.includes(key)&&key.length===1)selectTool(tools[Number(key)-1].id);
 if(key===' ')perform(()=>act(game));
 if(key==='e')perform(()=>interact(game));
 if(key==='h')openGuide();
 if(key==='j')toggleJournal();
});
window.addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();save();});
document.addEventListener('visibilitychange',()=>{keys.clear();save();lastFrame=performance.now();});
window.addEventListener('pagehide',save);

async function boot() {
 const renderer=await createRenderer($('game'));
 $('loading').classList.add('hidden');
 $('game').addEventListener('pointerdown',event=>{if(!started)return;const point=renderer.screenToWorld(event.clientX,event.clientY);perform(()=>act(game,point.x,point.y));});
 const observer=new ResizeObserver(()=>renderer.resize());observer.observe($('game'));
 let hudElapsed=0;
 function frame(now) {
  const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
  if(started&&!modalOpen()&&!document.hidden) {
   const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
   const dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
   move(game,dx,dy,dt);tick(game,dt);saveElapsed+=dt;hudElapsed+=dt;
   if(game.message!==lastMessage)notify(game.message);
   if(saveElapsed>3){save();saveElapsed=0;}
   if(hudElapsed>.15){updateHUD();hudElapsed=0;}
  }
  renderer.render(game,dt);
  if(now>toastUntil)$('toast').classList.add('hidden');
  requestAnimationFrame(frame);
 }
 updateHUD();requestAnimationFrame(frame);

 if(new URLSearchParams(location.search).has('test')) window.__farm={get game(){return game;},renderer,save};
}
boot().catch(error=>{console.error(error);$('loading').textContent='The garden gate got stuck. Refresh to try again.';});
