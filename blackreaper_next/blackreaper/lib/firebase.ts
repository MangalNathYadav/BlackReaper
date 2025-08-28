import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCEEMiU0Brkt2zQIpnh_9DA5lpRWz8lIxU",
  authDomain: "blackreaper-68d80.firebaseapp.com",
  databaseURL: "https://blackreaper-68d80-default-rtdb.firebaseio.com",
  projectId: "blackreaper-68d80",
  storageBucket: "blackreaper-68d80.firebasestorage.app",
  messagingSenderId: "878532400780",
  appId: "1:878532400780:web:7e08a1d0e490a7282c8da9",
  measurementId: "G-BQM80KXY60"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
