// Pomodoro timer (+3 RC on work session completion)
// Enhanced: session counter, persistence, pause/resume state, ARIA live updates, audio cue.
import { guardAuth } from './auth.js';
import { awardRC, txUpdate } from './db.js';

let uid = null;
let interval = null;
let phase = 'idle'; // idle | work | break
let remaining = 0; // ms remaining in current phase
let workLen = 25 * 60 * 1000; // default 25m
let breakLen = 5 * 60 * 1000; // default 5m
let awardedForSession = false; // ensures RC only once per work phase
let sessionsCompleted = 0; // number of completed work sessions this visit
const STORAGE_KEY = 'blackreaper_pomo_state_v1';

const workInput = document.getElementById('pomoWork');
const breakInput = document.getElementById('pomoBreak');
const startBtn = document.getElementById('pomoStart');
const resetBtn = document.getElementById('pomoReset');
const statusEl = document.getElementById('pomoStatus');
const displayEl = document.getElementById('pomoDisplay');
const sessionEl = document.getElementById('pomoSessions');
const liveEl = document.getElementById('pomoLive');

function fmt(ms){ const t=Math.max(0,Math.floor(ms/1000)); const m=Math.floor(t/60); const s=t%60; return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`; }

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid;
  restore();
  bind();
  render();
}

function bind(){
  if(workInput) workInput.addEventListener('change', () => { workLen = clampMinutes(workInput.value,1,180)*60*1000; if(phase==='idle') remaining = workLen; persist(); render(); });
  if(breakInput) breakInput.addEventListener('change', () => { breakLen = clampMinutes(breakInput.value,1,120)*60*1000; persist(); });
  startBtn?.addEventListener('click', startPauseToggle);
  resetBtn?.addEventListener('click', reset);
}

function clampMinutes(v,min,max){ let n=parseInt(v,10)||min; return Math.min(max, Math.max(min,n)); }

function startPauseToggle(){
  if(phase==='idle'){ startWork(); return; }
  if(interval){ // pause
    clearInterval(interval); interval=null; setStatus(`${phase} (paused)`); startBtn.textContent='Resume'; persist(); return; }
  // resume
  tick(); interval=setInterval(tick,1000); setStatus(phase); startBtn.textContent='Pause'; persist();
}

function startWork(){
  phase='work'; awardedForSession=false; remaining = workLen; tick(); interval=setInterval(tick,1000); setStatus('work'); startBtn.textContent='Pause'; persist(); }
function startBreak(){ phase='break'; remaining = breakLen; tick(); interval=setInterval(tick,1000); setStatus('break'); startBtn.textContent='Pause'; persist(); }

function reset(){ clearInterval(interval); interval=null; phase='idle'; remaining=workLen; awardedForSession=false; startBtn.textContent='Start'; setStatus('idle'); render(); persist(); }

function tick(){
  remaining -= 1000; render();
  if(remaining <= 0){
    beep();
    clearInterval(interval); interval=null;
    if(phase==='work'){
      if(!awardedForSession){ awardRC(uid, 3, 'pomodoro'); incrementStat('pomodoros'); awardedForSession=true; sessionsCompleted++; }
      startBreak();
    } else if(phase==='break') { reset(); }
  }
  persist();
}

function render(){
  if(displayEl) displayEl.textContent = fmt(phase==='idle'? workLen : remaining);
  if(sessionEl) sessionEl.textContent = sessionsCompleted.toString();
}

function incrementStat(field){
  txUpdate(`stats/${uid}`, data => { data = data || {}; data[field]=(data[field]||0)+1; data.lastActive=Date.now(); return data; });
}

function setStatus(text){ if(statusEl) statusEl.textContent = text; if(liveEl){ liveEl.textContent = `Pomodoro ${text}`; } }

function persist(){
  try{
    const state = { phase, remaining, workLen, breakLen, awardedForSession, sessionsCompleted, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){/* ignore */}
}

function restore(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY); if(!raw) { remaining = workLen; return; }
    const s = JSON.parse(raw);
    workLen = s.workLen || workLen; breakLen = s.breakLen || breakLen; phase = s.phase || 'idle';
    sessionsCompleted = s.sessionsCompleted || 0; awardedForSession = s.awardedForSession || false;
    remaining = s.remaining || (phase==='idle'? workLen : workLen);
    if(workInput) workInput.value = Math.round(workLen/60000);
    if(breakInput) breakInput.value = Math.round(breakLen/60000);
    if(phase !== 'idle' && remaining > 0){ startBtn.textContent='Resume'; }
  }catch(e){ remaining = workLen; }
}

function beep(){
  try {
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.type='triangle'; o.frequency.value=660; o.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.18, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+0.6);
    o.start(); o.stop(ctx.currentTime+0.6);
  } catch(e){ /* noop */ }
}

init();
