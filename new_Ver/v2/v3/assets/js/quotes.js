// Quotes (human clean vs ghoul corrupted)
import { guardAuth } from './auth.js';
import { listen } from './db.js';

const quotesHuman = [
  'It’s better to be hurt than to hurt others.',
  'Why is it that the beautiful things are entwined more deeply with death than with life?',
  'I’m not the protagonist of a novel or anything.',
  'We need to have a mask that we never take off.',
  'Pain is your friend; it shows you are still alive.'
];

// Corruption utilities
const GLYPHS = ['#','%','/','∆','¥','ø','┼','¿','╳','¶','§','¤','†'];
function corrupt(text){
  return text.split('').map(ch => {
    if(/[a-zA-Z]/.test(ch) && Math.random()<0.22){
      return GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    }
    if(Math.random()<0.07) return ch.toUpperCase();
    if(Math.random()<0.03) return ch + GLYPHS[Math.floor(Math.random()*GLYPHS.length)];
    return ch;
  }).join('');
}

function corruptedThought(){
  const bases = ['fear','hunger','silence','mask','memory','pain','echo','void','pulse','taste'];
  const verbs = ['devours','splinters','corrupts','mirrors','fractures','distorts','hunts','stains'];
  const adj = ['hollow','crimson','fragile','endless','bitter','shattered','twisted','ashen'];
  const form = [
    `The ${pick(bases)} ${pick(verbs)} the ${pick(adj)} mind`,
    `${capitalize(pick(adj))} thoughts ${pick(verbs)} my ${pick(bases)}`,
    `I taste the ${pick(adj)} ${pick(bases)} again`,
    `Your ${pick(bases)} is still ${pick(adj)}`
  ];
  return corrupt(pick(form));
}
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

const quoteBox = document.getElementById('quoteBox');
const quoteBtn = document.getElementById('quoteBtn');

async function init(){
  await guardAuth();
  bind();
  nextQuote();
  window.addEventListener('modechange', nextQuote);
}

function bind(){ quoteBtn?.addEventListener('click', nextQuote); }

function nextQuote(){
  if(!quoteBox) return;
  const mode = document.documentElement.getAttribute('data-mode') || 'human';
  if(mode === 'ghoul' && Math.random() < 0.35){
    quoteBox.textContent = corruptedThought();
  } else {
    const q = quotesHuman[Math.floor(Math.random()*quotesHuman.length)];
    quoteBox.textContent = mode === 'ghoul' ? corrupt(q) : q;
  }
}

init();
