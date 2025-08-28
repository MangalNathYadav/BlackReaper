// Realtime Database helpers
import { getDatabase, ref, runTransaction, get, set, update, onValue, serverTimestamp as st } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { app } from './app.js';

export const db = getDatabase(app);

export function dbRef(path){ return ref(db, path); }

export async function readOnce(path){ return (await get(dbRef(path))).val(); }
export function listen(path, cb){ return onValue(dbRef(path), snap => cb(snap.val())); }
export async function write(path, data){ return set(dbRef(path), data); }
export async function patch(path, data){ return update(dbRef(path), data); }
export async function del(path){ return set(dbRef(path), null); }

export function txUpdate(path, fn){
  return runTransaction(dbRef(path), current => fn(current || null));
}

export async function awardRC(uid, amount, reason='generic'){
  if(amount <= 0) return;
  const userStatsPath = `stats/${uid}`;
  const userProfilePath = `users/${uid}/profile`;
  await txUpdate(userProfilePath, data => {
    data = data || {};
    const now = Date.now();
    data.rcBalance = Math.min(9999, (data.rcBalance||0) + amount);
    data.lastAward = now;
    return data;
  });
  console.log(`[RC+${amount}] ${reason}`);
}

export { st as serverTimestamp };
