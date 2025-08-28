// Task CRUD + RC award
import { auth } from './auth.js';
import { dbRef, txUpdate, write, listen, awardRC } from './db.js';
import { getDatabase, push, remove, update } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { guardAuth } from './auth.js';

const listEl = document.getElementById('tasksList');
const form = document.getElementById('newTaskForm');
const rcBar = document.getElementById('rcBar');
const rcLabel = document.getElementById('rcLabel');
const logoutBtn = document.getElementById('logoutBtn');

let uid = null;
let tasks = {};

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid;
  bindForm();
  bindLogout();
  listen(`users/${uid}/profile`, data => updateRC(data?.rcBalance||0));
  listen(`tasks/${uid}`, data => { tasks = data || {}; renderTasks(); });
}

function bindLogout(){
  if(!logoutBtn) return;
  logoutBtn.addEventListener('click', async () => {
    const { logout } = await import('./auth.js');
    await logout();
    location.href = '/index.html';
  });
}

function bindForm(){
  if(!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const title = form.title.value.trim();
    if(!title) return;
    const rcReward = parseInt(form.rcReward.value,10) || 1;
    const id = push(dbRef(`tasks/${uid}`)).key;
    await write(`tasks/${uid}/${id}`, { title, done:false, rcReward, createdAt: Date.now() });
    form.reset();
  });
}

function updateRC(value){
  rcLabel.textContent = `RC ${value}`;
  const pct = Math.min(100, (value % 100));
  rcBar.style.width = pct + '%';
  const meter = rcBar.parentElement;
  meter.setAttribute('aria-valuenow', pct.toString());
  const nextMilestone = Math.floor(value/100)*100 + 100;
  const remain = nextMilestone - value;
  meter.setAttribute('aria-valuetext', `${pct}% toward next 100 RC, ${remain} remaining`);
}

function renderTasks(){
  listEl.innerHTML = '';
  const entries = Object.entries(tasks).sort((a,b)=> b[1].createdAt - a[1].createdAt);
  if(!entries.length){
    const li = document.createElement('li');
    li.textContent = 'No tasks yet';
    li.style.opacity = '.6';
    listEl.appendChild(li);
    return;
  }
  for(const [id, t] of entries){
    const li = document.createElement('li');
    li.className = 'task' + (t.done ? ' done' : '');
    li.innerHTML = `
      <input type="checkbox" ${t.done? 'checked':''} aria-label="Complete task">
      <div class="title" contenteditable="true" spellcheck="false"></div>
      <div class="row" style="gap:.4rem;">
        <button class="small sec" data-act="reward" title="RC reward">+${t.rcReward}</button>
        <button class="small sec" data-act="del" title="Delete">✕</button>
      </div>
    `;
    const titleDiv = li.querySelector('.title');
    titleDiv.textContent = t.title;

    const cb = li.querySelector('input[type=checkbox]');
    cb.addEventListener('change', () => toggleTask(id, cb.checked));

    titleDiv.addEventListener('blur', () => {
      const newTitle = titleDiv.textContent.trim();
      if(newTitle && newTitle !== t.title){ update(dbRef(`tasks/${uid}/${id}`), { title:newTitle }); }
      else titleDiv.textContent = t.title; // revert blank
    });

    li.querySelector('[data-act=del]').addEventListener('click', async () => {
      await remove(dbRef(`tasks/${uid}/${id}`));
    });

    li.querySelector('[data-act=reward]').addEventListener('click', () => {
      // Visual hint of reward, but awarding occurs on completion transaction
      alert(`Task awards +${t.rcReward} RC when completed.`);
    });

    listEl.appendChild(li);
  }
}

function toggleTask(id, done){
  const task = tasks[id];
  if(!task) return;
  // Transaction pattern: mark done and award RC if transitioning
  txUpdate(`tasks/${uid}/${id}`, current => {
    if(!current) return current;
    if(done && !current.done){
      current.done = true;
      // award RC via profile transaction
      awardRC(uid, current.rcReward, 'task');
      incrementStat('tasksDone');
    } else if(!done && current.done){
      current.done = false; // no RC removal
    }
    return current;
  });
}

function incrementStat(field){
  txUpdate(`stats/${uid}`, data => {
    data = data || {}; data[field] = (data[field]||0) + 1; data.lastActive = Date.now(); return data;
  });
}

init();
