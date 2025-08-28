// Authentication (email/password + anonymous)
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { app } from './firebaseApp.js';
import { write, dbRef, patch } from './db.js';
import { getDatabase, ref, onDisconnect, set } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

export const auth = getAuth(app);
const rtdb = getDatabase(app);

export function guardAuth(){
  return new Promise(resolve => {
    onAuthStateChanged(auth, user => {
      if(!user){
        if(!location.pathname.endsWith('/index.html')) location.href = '/index.html';
        resolve(null);
      } else {
        resolve(user);
      }
    });
  });
}

export async function loginEmail(email, pass){
  console.debug('[auth] loginEmail attempt', email);
  await signInWithEmailAndPassword(auth, email, pass);
  console.debug('[auth] loginEmail success');
}
export async function signupEmail(email, pass, displayName){
  console.debug('[auth] signup attempt', email);
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if(displayName) await updateProfile(cred.user, { displayName });
  await write(`users/${cred.user.uid}/profile`, {
    displayName: cred.user.displayName || 'Unnamed',
    avatarBase64: '',
    modePref: 'human',
    rcBalance: 0,
    threatLevel: 0,
    createdAt: Date.now()
  });
  await write(`stats/${cred.user.uid}`, { tasksDone:0, pomodoros:0, wins:0, losses:0, lastActive: Date.now() });
}
export async function loginGuest(){
  console.debug('[auth] guest login attempt');
  const cred = await signInAnonymously(auth);
  await write(`users/${cred.user.uid}/profile`, {
    displayName: 'Guest', avatarBase64:'', modePref:'human', rcBalance:0, threatLevel:0, createdAt: Date.now()
  });
  await write(`stats/${cred.user.uid}`, { tasksDone:0, pomodoros:0, wins:0, losses:0, lastActive: Date.now() });
}
export function logout(){ return signOut(auth); }

export function initPresence(uid){
  const presRef = ref(rtdb, `presence/${uid}`);
  set(presRef, { state:'online', lastSeen: Date.now() });
  onDisconnect(presRef).set({ state:'offline', lastSeen: Date.now() });
}
