// App bootstrap: initialize Firebase, attach auth handlers on index, common utilities
import { loginEmail, signupEmail, loginGuest, auth, guardAuth } from './auth.js';
import { initPresence } from './auth.js';
import { initMode } from './mode.js';
import { playTransformation, initInactivityAutoSwitch } from './transform.js';
import { app } from './firebaseApp.js';

// Initialize mode early (affects initial paint tokens)
initMode();
// Attach transformation to toggle
const modeBtn = document.getElementById('modeToggle');
if(modeBtn && !modeBtn.dataset.trBound){
  modeBtn.dataset.trBound = '1';
  modeBtn.addEventListener('click', e => {
    e.preventDefault();
    const current = document.documentElement.getAttribute('data-mode') || 'human';
    const next = current === 'human' ? 'ghoul' : 'human';
    playTransformation(next);
  });
}

// Start inactivity monitoring (auto-switch human -> ghoul)
initInactivityAutoSwitch();

// Index page logic
if(location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')){
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const guestBtn = document.getElementById('guestBtn');
  const swapLinks = document.querySelectorAll('[data-swap]');

  swapLinks.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    document.body.classList.toggle('show-signup');
  }));

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = loginForm.email.value.trim();
    const pass = loginForm.password.value;
  const errBox = document.getElementById('authError');
  if(errBox) errBox.textContent='';
  try{ await loginEmail(email, pass); location.href = '/dashboard.html'; }
  catch(err){ if(errBox){ errBox.textContent = friendlyAuthError(err); } else alert(err.message); }
  });
  signupForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = signupForm.email.value.trim();
    const pass = signupForm.password.value;
    const dn = signupForm.displayName.value.trim();
  const errBox = document.getElementById('authError');
  if(errBox) errBox.textContent='';
  try{ await signupEmail(email, pass, dn); location.href='/dashboard.html'; }
  catch(err){ if(errBox){ errBox.textContent = friendlyAuthError(err); } else alert(err.message); }
  });
  guestBtn?.addEventListener('click', async () => {
  const errBox = document.getElementById('authError');
  if(errBox) errBox.textContent='';
  try{ await loginGuest(); location.href='/dashboard.html'; }catch(err){ if(errBox){ errBox.textContent = friendlyAuthError(err); } else alert(err.message); }
  });
}

// Redirect logic (auth gate) for protected pages
const protectedPages = ['/dashboard.html','/journal.html','/battle.html','/profile.html'];
if(protectedPages.includes(location.pathname)){
  guardAuth().then(user => { if(user){ console.log('Authed as', user.uid); initPresence(user.uid); } });
}

function friendlyAuthError(err){
  const code = err.code || '';
  const map = {
    'auth/invalid-email':'Invalid email format',
    'auth/user-disabled':'Account disabled',
    'auth/user-not-found':'No user for those credentials',
    'auth/wrong-password':'Wrong password',
    'auth/too-many-requests':'Too many attempts, please wait',
    'auth/email-already-in-use':'Email already in use',
    'auth/weak-password':'Password too weak (min 6 chars)'
  };
  return map[code] || (err.message || 'Authentication error');
}
