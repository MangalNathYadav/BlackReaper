// Firebase configuration

// Your web app's Firebase configuration
const firebaseConfig = {

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  apiKey: "AIzaSyCEEMiU0Brkt2zQIpnh_9DA5lpRWz8lIxU",
  authDomain: "blackreaper-68d80.firebaseapp.com",
  projectId: "blackreaper-68d80",
  storageBucket: "blackreaper-68d80.firebasestorage.app",
  messagingSenderId: "878532400780",
  appId: "1:878532400780:web:7e08a1d0e490a7282c8da9",
  measurementId: "G-BQM80KXY60"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get database reference
const database = firebase.database();

console.log("Firebase configuration loaded");

// Export for use in other scripts
window.db = database;
