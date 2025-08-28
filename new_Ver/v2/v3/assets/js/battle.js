// AI Battle logic
import { guardAuth } from './auth.js';
import { awardRC, txUpdate, write, listen } from './db.js';

let uid=null;
let player; let enemy; let lastWinTs=0; let history=[];
const COOLDOWN = 60 * 1000; // 60s

const playerHpBar = document.getElementById('playerHpBar');
const enemyHpBar = document.getElementById('enemyHpBar');
const playerStatsEl = document.getElementById('playerStats');
const enemyStatsEl = document.getElementById('enemyStats');
const logEl = document.getElementById('battleLog');
const resEl = document.getElementById('battleResult');
const attackBtn = document.getElementById('attackBtn');
const resetBtn = document.getElementById('resetBtn');

function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

function genStats(base){
  return {
    hp: randInt(base.hp[0], base.hp[1]),
    ATK: randInt(base.ATK[0], base.ATK[1]),
    DEF: randInt(base.DEF[0], base.DEF[1]),
    SPD: randInt(base.SPD[0], base.SPD[1])
  };
}

function initEntities(){
  player = genStats({ hp:[42,58], ATK:[12,18], DEF:[6,11], SPD:[6,12] });
  enemy = genStats({ hp:[40,60], ATK:[10,17], DEF:[5,12], SPD:[5,13] });
  updateBars();
  updateStats();
  logEl.textContent='';
  resEl.textContent='';
}

async function init(){
  const user = await guardAuth();
  if(!user) return; uid = user.uid;
  initEntities();
  // load last win timestamp & history
  listen(`stats/${uid}`, s => { if(s?.lastBattleWinTs) lastWinTs = s.lastBattleWinTs; });
  listen(`battles/${uid}/history`, h => { history = Object.values(h||{}).sort((a,b)=> b.createdAt - a.createdAt).slice(0,20); renderHistory(); });
  attackBtn?.addEventListener('click', turnCycle);
  resetBtn?.addEventListener('click', () => { initEntities(); });
}

function updateBars(){
  playerHpBar.style.width = Math.max(0,(player.hp / 60)*100)+'%';
  enemyHpBar.style.width = Math.max(0,(enemy.hp / 60)*100)+'%';
}

function updateStats(){
  playerStatsEl.textContent = `HP ${player.hp} ATK ${player.ATK} DEF ${player.DEF} SPD ${player.SPD}`;
  enemyStatsEl.textContent = `HP ${enemy.hp} ATK ${enemy.ATK} DEF ${enemy.DEF} SPD ${enemy.SPD}`;
}

function log(line){
  const t = document.createElement('div');
  t.textContent = line;
  logEl.appendChild(t);
  logEl.scrollTop = logEl.scrollHeight;
}

function damage(att, def){
  const base = Math.max(1, att - 0.5*def);
  return Math.max(1, Math.round(base * (0.9 + Math.random()*0.2)));
}

function turnCycle(){
  if(player.hp<=0 || enemy.hp<=0) return;
  const order = player.SPD === enemy.SPD ? (Math.random()<0.5?'player':'enemy') : (player.SPD>enemy.SPD?'player':'enemy');
  if(order==='player') playerAttack(); else enemyAttack();
  if(player.hp>0 && enemy.hp>0){
    if(order==='player') enemyAttack(); else playerAttack();
  }
  updateBars();
  updateStats();
  checkEnd();
}

function playerAttack(){
  const dmg = damage(player.ATK, enemy.DEF);
  enemy.hp -= dmg; log(`You hit for ${dmg}`);
}
function enemyAttack(){
  const dmg = damage(enemy.ATK, player.DEF);
  player.hp -= dmg; log(`Enemy hits for ${dmg}`);
}

function checkEnd(){
  if(enemy.hp<=0 && player.hp>0){
    resEl.textContent='Victory!';
    log('You win.');
    tryAwardWin();
    saveBattle('win');
  } else if(player.hp<=0 && enemy.hp>0){
    resEl.textContent='Defeat';
    log('You were defeated.');
    saveBattle('loss');
  } else if(player.hp<=0 && enemy.hp<=0){
    resEl.textContent='Draw';
    log('Mutual destruction.');
    saveBattle('draw');
  }
}

function tryAwardWin(){
  const now = Date.now();
  if(now - lastWinTs < COOLDOWN) { log('Win reward on cooldown.'); return; }
  lastWinTs = now;
  awardRC(uid,5,'battle');
  txUpdate(`stats/${uid}`, data => { data=data||{}; data.wins=(data.wins||0)+1; data.lastActive=Date.now(); data.lastBattleWinTs=now; return data; });
}

function saveBattle(result){
  const rec = { hp: player.hp, enemyHp: enemy.hp, result, createdAt: Date.now() };
  write(`battles/${uid}/lastAI`, rec);
  // push into history list with generated key via timestamp (simple)
  write(`battles/${uid}/history/${rec.createdAt}`, rec);
  if(result==='loss') txUpdate(`stats/${uid}`, data => { data=data||{}; data.losses=(data.losses||0)+1; return data; });
}

function renderHistory(){
  const list = document.getElementById('battleHistory'); if(!list) return;
  list.innerHTML='';
  if(!history.length){ list.innerHTML='<li style="opacity:.6;">No battles yet</li>'; return; }
  for(const h of history){
    const li=document.createElement('li');
    const time = new Date(h.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    li.textContent = `${time} – ${h.result.toUpperCase()} (HP ${h.hp}/${h.enemyHp})`;
    list.appendChild(li);
  }
}

init();
