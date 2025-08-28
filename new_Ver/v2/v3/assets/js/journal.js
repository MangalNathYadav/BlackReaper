// Journal (Ghoul-only) with glitch typing and mood entries
import { guardAuth } from './auth.js';
import { write, listen, dbRef, txUpdate, patch, del } from './db.js';
import { getDatabase, push } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { playTransformation } from './transform.js';

let uid = null;

const ghoulLock = document.getElementById('ghoulLock');
const unlockSwitch = document.getElementById('unlockSwitch');
const journalPanel = document.getElementById('journalPanel');
const entriesPanel = document.getElementById('entriesPanel');
const form = document.getElementById('journalForm');
const textArea = document.getElementById('journalText');
const moodSelect = document.getElementById('moodSelect');
const entriesList = document.getElementById('entriesList');

function currentMode(){ return document.documentElement.getAttribute('data-mode') || 'human'; }

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid;
  applyVisibility();
  window.addEventListener('modechange', applyVisibility);
  unlockSwitch?.addEventListener('click', () => playTransformation('ghoul'));
  bindForm();
  bindGlitchTyping();
  listen(`journals/${uid}`, data => renderEntries(data || {}));
}

function applyVisibility(){
  const ghoul = currentMode() === 'ghoul';
  ghoulLock.hidden = ghoul;
  journalPanel.hidden = !ghoul;
  entriesPanel.hidden = !ghoul;
}

function bindForm(){
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if(currentMode() !== 'ghoul') return;
    const mood = moodSelect.value;
    const text = textArea.value.trim();
    if(!text) return;
    const id = push(dbRef(`journals/${uid}`)).key;
    await write(`journals/${uid}/${id}`, { mood, text, createdAt: Date.now(), visibility:'ghoul' });
    textArea.value='';
    textArea.focus();
  });
}

function renderEntries(obj){
  entriesList.innerHTML='';
  const arr = Object.entries(obj).sort((a,b)=> b[1].createdAt - a[1].createdAt);
  if(!arr.length){
    const li = document.createElement('li'); li.textContent='No entries yet'; li.style.opacity='.6'; entriesList.appendChild(li); return;
  }
  for(const [id, e] of arr){
    const li = document.createElement('li');
    li.className='entry';
    li.dataset.id = id;
    const date = new Date(e.createdAt).toLocaleString();
    const body = escapeHTML(e.text);
    li.innerHTML = `<small>${date} • ${e.mood}</small>
      <div class="body" data-body>${body}</div>
      <div class="row" style="gap:.4rem;flex-wrap:wrap;">
        <button class="sec small" data-edit type="button">Edit</button>
        <button class="sec small" data-delete type="button">Delete</button>
      </div>`;
    li.querySelector('[data-edit]').addEventListener('click', () => beginEdit(li, id, e));
    li.querySelector('[data-delete]').addEventListener('click', () => deleteEntry(id));
    entriesList.appendChild(li);
  }
}

function beginEdit(li, id, entry){
  if(li.dataset.editing) return; li.dataset.editing='1';
  const bodyDiv = li.querySelector('[data-body]');
  const ta = document.createElement('textarea');
  ta.value = entry.text; ta.maxLength=2000; ta.style.minHeight='90px'; ta.style.width='100%';
  bodyDiv.replaceWith(ta);
  const controls = document.createElement('div');
  controls.className='row'; controls.style.gap='.4rem'; controls.style.marginTop='.4rem';
  controls.innerHTML = `<button type="button" data-save class="small">Save</button><button type="button" data-cancel class="sec small">Cancel</button>`;
  li.appendChild(controls);
  controls.querySelector('[data-save]').addEventListener('click', async ()=>{
    const newText = ta.value.trim(); if(!newText){ ta.focus(); return; }
    await patch(`journals/${uid}/${id}`, { text: newText, editedAt: Date.now() });
  });
  controls.querySelector('[data-cancel]').addEventListener('click', ()=>{ renderEntries({ ...Object.fromEntries([[id, entry]]), ...collectOthers(id) }); listen(`journals/${uid}`, data => renderEntries(data||{})); });
}

function deleteEntry(id){
  if(!confirm('Delete entry permanently?')) return;
  del(`journals/${uid}/${id}`);
}

function collectOthers(skip){
  // helper to re-render editing cancel gracefully (not full accurate, rely on listen update soon)
  return {};
}

function escapeHTML(s){ return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

// Glitch typing effect: occasional character substitution + CSS flicker
function bindGlitchTyping(){
  if(!textArea) return;
  let lastSub = 0;
  const replacements = ['#','%','∆','ø','¥'];
  function maybeGlitch(){
    if(currentMode() !== 'ghoul') return;
    const now = Date.now();
    if(now - lastSub > 900 && textArea === document.activeElement && textArea.value.length){
      const pos = Math.floor(Math.random()*textArea.value.length);
      const chars = textArea.value.split('');
      const original = chars[pos];
      if(/[a-zA-Z]/.test(original)){
        chars[pos] = replacements[Math.floor(Math.random()*replacements.length)];
        textArea.value = chars.join('');
        lastSub = now;
      }
    }
    requestAnimationFrame(maybeGlitch);
  }
  textArea.addEventListener('focus', () => { textArea.classList.add('glitching'); });
  textArea.addEventListener('blur', () => { textArea.classList.remove('glitching'); });
  requestAnimationFrame(maybeGlitch);
}

init();
