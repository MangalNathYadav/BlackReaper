// Mode management (human | ghoul)
// Responsibilities: persist setting, apply attribute, provide toggle helper

const STORAGE_KEY = 'blackreaper_mode';

export function getStoredMode(){
  return localStorage.getItem(STORAGE_KEY);
}

export function applyMode(mode){
  if(mode !== 'human' && mode !== 'ghoul') mode = 'human';
  const html = document.documentElement;
  if(html.getAttribute('data-mode') === mode) return;
  html.setAttribute('data-mode', mode);
  localStorage.setItem(STORAGE_KEY, mode);
  const evt = new CustomEvent('modechange', { detail:{ mode } });
  window.dispatchEvent(evt);
  updateToggleLabel(mode);
}

function updateToggleLabel(mode){
  const btn = document.getElementById('modeToggle');
  if(!btn) return;
  const to = mode === 'human' ? 'ghoul' : 'human';
  btn.setAttribute('aria-label', `Switch to ${to} mode`);
  btn.setAttribute('data-next', to);
  const textEl = btn.querySelector('span.txt');
  if(textEl) textEl.textContent = mode === 'human' ? 'Human' : 'Ghoul';
}

export function initMode(){
  // initial mode
  const stored = getStoredMode();
  applyMode(stored || 'human');

  // listen for toggle button
  const btn = document.getElementById('modeToggle');
  if(btn && !btn.dataset.bound){
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-mode') || 'human';
      const next = current === 'human' ? 'ghoul' : 'human';
      applyMode(next);
    });
  }

  // cross-tab sync
  window.addEventListener('storage', e => {
    if(e.key === STORAGE_KEY && e.newValue){
      applyMode(e.newValue);
    }
  });
}
