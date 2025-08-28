// Profile page logic
import { guardAuth } from './auth.js';
import { readOnce, write, patch, listen, txUpdate } from './db.js';
import { applyMode } from './mode.js';

let uid=null;
const displayNameInput = document.getElementById('displayNameInput');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const modePrefSelect = document.getElementById('modePrefSelect');
const profileForm = document.getElementById('profileForm');
const statsGrid = document.getElementById('statsGrid');
const applyPrefBtn = document.getElementById('applyPrefBtn');

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid;
  listen(`users/${uid}/profile`, p => { if(p) populate(p); });
  listen(`stats/${uid}`, s => { if(s) renderStats(s); });
  bind();
}

function populate(p){
  displayNameInput.value = p.displayName || '';
  modePrefSelect.value = p.modePref || 'human';
  if(p.avatarBase64){ avatarImg.src = p.avatarBase64; }
  else avatarImg.removeAttribute('src');
}

function renderStats(s){
  statsGrid.innerHTML='';
  const mapping = {
    rcBalance: 'RC',
    tasksDone: 'Tasks',
    pomodoros: 'Pomodoros',
    wins: 'Wins',
    losses: 'Losses'
  };
  for(const key of Object.keys(mapping)){
    const val = s[key] ?? 0;
    const div = document.createElement('div');
    div.className='stat';
    div.innerHTML = `<strong>${mapping[key]}</strong><span>${val}</span>`;
    statsGrid.appendChild(div);
  }
}

function bind(){
  profileForm.addEventListener('submit', saveProfile);
  avatarInput.addEventListener('change', handleAvatar);
  applyPrefBtn.addEventListener('click', () => {
    const m = modePrefSelect.value; applyMode(m);
  });
}

async function saveProfile(e){
  e.preventDefault();
  const displayName = displayNameInput.value.trim() || 'Unnamed';
  const modePref = modePrefSelect.value;
  await patch(`users/${uid}/profile`, { displayName, modePref });
  // update auth displayName only if changed
  try { const { auth } = await import('./auth.js'); if(auth.currentUser && auth.currentUser.displayName !== displayName){ await import('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js').then(m=> m.updateProfile(auth.currentUser,{ displayName })); }} catch(e){/* ignore */}
  if(modePref) applyMode(modePref);
}

async function handleAvatar(){
  const file = avatarInput.files[0]; if(!file) return;
  if(file.size > 25*1024){ alert('Avatar must be <= 25KB'); avatarInput.value=''; return; }
  const b64 = await toBase64(file);
  await patch(`users/${uid}/profile`, { avatarBase64: b64 });
}

function toBase64(file){
  return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
}

init();
