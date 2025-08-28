// Central Firebase app initializer (breaks circular deps)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { firebaseConfig } from '/firebase/config.js';

export const app = initializeApp(firebaseConfig);
