// Transformation overlay controller
import { applyMode } from './mode.js';
import { SPRITE_EYE_ZOOM, SPRITE_RING } from './sprites.js';

let overlayEl;
let isTransforming = false;
let inactivityTimer = null;
let countdownActive = false;
const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_SECONDS = 10;

function ensureOverlay(){
  if(overlayEl) return overlayEl;
  overlayEl = document.getElementById('transformOverlay');
  if(!overlayEl){
    overlayEl = document.createElement('div');
    overlayEl.id = 'transformOverlay';
    overlayEl.innerHTML = `
      <div class="tr-layer sprite" id="trSprite"></div>
      <div class="tr-layer ring" id="trRing"></div>
      <div class="tr-layer glitch" id="trGlitch"></div>
      <div class="tr-count" id="trCount"></div>
    `;
    document.body.appendChild(overlayEl);
  }
  return overlayEl;
}

function playSheet(el, frames, w, h, fps=11){
  let i=0; const ms = 1000 / fps;
  return new Promise(res => {
    const id = setInterval(() => {
      el.style.backgroundPosition = `-${(i%frames)*w}px 0`;
      if(++i >= frames){ clearInterval(id); res(); }
    }, ms);
  });
}

export async function playTransformation(nextMode){
  const current = document.documentElement.getAttribute('data-mode') || 'human';
  if(current === nextMode) return; // no-op
  const root = ensureOverlay();
  root.classList.remove('done');
  document.body.dataset.lockScroll = '1';
  document.documentElement.style.overflow='hidden';
  isTransforming = true;
  cancelCountdown();

  const sprite = root.querySelector('#trSprite');
  const ring = root.querySelector('#trRing');
  const glitch = root.querySelector('#trGlitch');

  // Set sheet images
  sprite.style.backgroundImage = `url(${SPRITE_EYE_ZOOM.base64})`;
  sprite.style.setProperty('--cellW', SPRITE_EYE_ZOOM.cellW + 'px');
  sprite.style.setProperty('--cellH', SPRITE_EYE_ZOOM.cellH + 'px');
  ring.style.backgroundImage = `url(${SPRITE_RING.base64})`;
  ring.style.setProperty('--cellW', SPRITE_RING.cellW + 'px');
  ring.style.setProperty('--cellH', SPRITE_RING.cellH + 'px');

  root.classList.add('active');

  // Start animations (sprite & ring sheet stepping)
  const spriteP = playSheet(sprite, SPRITE_EYE_ZOOM.frames, SPRITE_EYE_ZOOM.cellW, SPRITE_EYE_ZOOM.cellH, 11);
  const ringP = playSheet(ring, SPRITE_RING.frames, SPRITE_RING.cellW, SPRITE_RING.cellH, 15);

  // Glitch pulses
  glitch.animate([
    { filter:'none', opacity:0 },
    { filter:'contrast(160%) hue-rotate(20deg)', opacity:0.4, offset:0.15 },
    { filter:'none', opacity:0.05, offset:0.3 },
    { filter:'contrast(170%) hue-rotate(-30deg)', opacity:0.5, offset:0.55 },
    { filter:'none', opacity:0, offset:1 }
  ], { duration: 1800, easing:'linear' });

  // Switch theme mid-way
  setTimeout(()=>{ applyMode(nextMode); }, 1400);

  await Promise.all([spriteP, ringP]);
  root.classList.add('done');
  setTimeout(()=>{
    root.classList.remove('active');
    document.documentElement.style.overflow='';
    delete document.body.dataset.lockScroll;
    isTransforming = false;
    scheduleInactivityCheck();
  }, 400); // fade out
}

// Optional: attach to global for manual testing
window.playTransformation = playTransformation;

// ================= Inactivity Auto-Switch =================

function scheduleInactivityCheck(){
  if(inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(onInactivityTrigger, INACTIVITY_MS);
}

function onUserActivity(){
  if(countdownActive){
    // cancel countdown on any activity
    cancelCountdown();
    scheduleInactivityCheck();
    return;
  }
  if(!isTransforming) scheduleInactivityCheck();
}

async function onInactivityTrigger(){
  const mode = document.documentElement.getAttribute('data-mode') || 'human';
  if(mode !== 'human' || isTransforming || countdownActive) { scheduleInactivityCheck(); return; }
  const canceled = await startCountdown(COUNTDOWN_SECONDS);
  if(!canceled){
    // double-check mode not already changed
    const cm = document.documentElement.getAttribute('data-mode') || 'human';
    if(cm === 'human') playTransformation('ghoul');
  } else {
    scheduleInactivityCheck();
  }
}

function startCountdown(seconds){
  const root = ensureOverlay();
  const counter = root.querySelector('#trCount');
  root.classList.add('active');
  counter.style.display = 'block';
  countdownActive = true;
  let remaining = seconds;
  counter.textContent = remaining.toString();

  return new Promise(resolve => {
    const activityHandler = () => { if(countdownActive) { cancel(true); } };
    ['mousemove','keydown','pointerdown','touchstart','scroll'].forEach(ev => window.addEventListener(ev, activityHandler, { once:true }));
    const tick = setInterval(()=>{
      if(!countdownActive){ clearInterval(tick); return; }
      remaining--;
      if(remaining <= 0){ clearInterval(tick); finish(); }
      counter.textContent = remaining.toString();
    },1000);
    function finish(){ countdownActive = false; counter.style.display='none'; resolve(false); }
    function cancel(userCanceled){
      clearInterval(tick);
      countdownActive = false;
      counter.style.display='none';
      root.classList.remove('active');
      resolve(true);
    }
    // expose cancel for transformation start / manual
    startCountdown._cancel = cancel;
  });
}

function cancelCountdown(){
  if(countdownActive && startCountdown._cancel){
    startCountdown._cancel(true);
  }
}

export function initInactivityAutoSwitch(){
  ['mousemove','keydown','pointerdown','touchstart','scroll','focus'].forEach(ev => window.addEventListener(ev, onUserActivity, { passive:true }));
  scheduleInactivityCheck();
}

