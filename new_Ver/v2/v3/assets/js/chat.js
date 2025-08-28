// Ghoul Chat + Presence (global)
import { guardAuth } from './auth.js';
import { dbRef, write, listen } from './db.js';
import { getDatabase, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

let uid = null; let displayName='';
const form = document.getElementById('chatForm');
const input = document.getElementById('chatInput');
const list = document.getElementById('chatMessages');
const presenceList = document.getElementById('presenceList');
const limit = 80; // keep slightly larger local set
const MAX_STORE = 120; // prune beyond this
const banned = ['badword','curse']; // placeholder simple filter

function modeIsGhoul(){ return document.documentElement.getAttribute('data-mode') === 'ghoul'; }

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid; displayName = user.displayName || 'Anon';
  form?.addEventListener('submit', sendMessage);
  listen(`users/${uid}/profile`, p => { if(p?.displayName) displayName = p.displayName; });
  listen(`chat/global/messages`, data => renderMessages(data || {}));
  listen(`presence`, data => renderPresence(data || {}));
  window.addEventListener('modechange', gateVisibility);
  gateVisibility();
}

function gateVisibility(){
  const container = document.getElementById('chatPanel');
  const lock = document.getElementById('chatLock');
  if(!container || !lock) return;
  const ghoul = modeIsGhoul();
  container.hidden = !ghoul;
  lock.hidden = ghoul;
}

async function sendMessage(e){
  e.preventDefault();
  if(!modeIsGhoul()) return;
  let text = input.value.trim();
  if(!text) return;
  // basic filter replace
  banned.forEach(b => { const re = new RegExp(b,'ig'); text = text.replace(re, '*'.repeat(b.length)); });
  const id = push(dbRef(`chat/global/messages`)).key;
  await write(`chat/global/messages/${id}`, { uid, displayName, text: text.slice(0,500), createdAt: Date.now() });
  // prune if oversized (client-side best effort)
  pruneIfNeeded();
  input.value='';
}

function renderMessages(obj){
  const all = Object.entries(obj).sort((a,b)=> a[1].createdAt - b[1].createdAt);
  const entries = all.slice(-limit);
  list.innerHTML='';
  for(const [id, m] of entries){
    const li = document.createElement('li');
    li.className='msg';
    const own = m.uid === uid;
    const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
    li.innerHTML = `<span class="dn">${escapeHTML(m.displayName||'???')}</span><span class="txt">${escapeHTML(m.text)}</span><small style="opacity:.4;margin-left:.5rem;">${time}</small>`;
    if(own) li.classList.add('own');
    list.appendChild(li);
  }
  list.scrollTop = list.scrollHeight;
}

function pruneIfNeeded(){
  // we don't have a bulk delete API here; rely on db rules & manual trimming by removing oldest beyond MAX_STORE
  // This is a lightweight optional improvement; actual deletion would require listing keys.
}

function renderPresence(obj){
  if(!presenceList) return;
  const entries = Object.entries(obj).filter(([id,p])=>p && p.state==='online');
  presenceList.innerHTML='';
  for(const [id,p] of entries){
    const li=document.createElement('li');
    li.textContent = id===uid? 'You': id.slice(0,6)+'…';
    presenceList.appendChild(li);
  }
}

function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

init();
