// Firebase configuration and utilities using v9 modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  push,
  get,
  remove,
  onValue,
  query,
  orderByChild,
  limitToLast,
  runTransaction,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEEMiU0Brkt2zQIpnh_9DA5lpRWz8lIxU",
  authDomain: "blackreaper-68d80.firebaseapp.com",
  projectId: "blackreaper-68d80",
  storageBucket: "blackreaper-68d80.firebasestorage.app",
  messagingSenderId: "878532400780",
  appId: "1:878532400780:web:7e08a1d0e490a7282c8da9",
  measurementId: "G-BQM80KXY60",
  databaseURL: "https://blackreaper-68d80-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

/**
 * Creates a ref to the specified database path
 * @param {string} path - Database path
 * @returns {Object} Firebase reference
 */
const r = (path) => ref(db, path);

/**
 * Writes data to a specific path in the database, replacing any existing data
 * @param {string} path - Database path
 * @param {Object} data - Data to write
 * @returns {Promise} Promise that resolves when write is complete
 */
const write = async (path, data) => {
  try {
    await set(r(path), data);
    return { success: true };
  } catch (error) {
    console.error(`Error writing to ${path}:`, error);
    return { success: false, error };
  }
};

/**
 * Updates data at a specific path in the database (partial update)
 * @param {string} path - Database path
 * @param {Object} data - Data to update
 * @returns {Promise} Promise that resolves when update is complete
 */
const updateData = async (path, data) => {
  try {
    await update(r(path), data);
    return { success: true };
  } catch (error) {
    console.error(`Error updating ${path}:`, error);
    return { success: false, error };
  }
};

/**
 * Pushes new data to a list in the database
 * @param {string} path - Database path to the list
 * @param {Object} data - Data to push
 * @returns {Promise} Promise that resolves with the new key
 */
const pushData = async (path, data) => {
  try {
    const newRef = push(r(path));
    await set(newRef, data);
    return { success: true, id: newRef.key };
  } catch (error) {
    console.error(`Error pushing to ${path}:`, error);
    return { success: false, error };
  }
};

/**
 * Gets data once from a specific path
 * @param {string} path - Database path
 * @returns {Promise} Promise that resolves with the data
 */
const getData = async (path) => {
  try {
    const snapshot = await get(r(path));
    return { success: true, exists: snapshot.exists(), data: snapshot.val() };
  } catch (error) {
    console.error(`Error getting data from ${path}:`, error);
    return { success: false, error };
  }
};

/**
 * Removes data at a specific path
 * @param {string} path - Database path
 * @returns {Promise} Promise that resolves when the data is removed
 */
const removeData = async (path) => {
  try {
    await remove(r(path));
    return { success: true };
  } catch (error) {
    console.error(`Error removing data at ${path}:`, error);
    return { success: false, error };
  }
};

/**
 * Sets up a real-time listener for data at a specific path
 * @param {string} path - Database path
 * @param {Function} callback - Callback function with snapshot
 * @returns {Function} Function to unsubscribe from the listener
 */
const onValueChange = (path, callback) => {
  const unsubscribe = onValue(r(path), (snapshot) => {
    callback({ exists: snapshot.exists(), data: snapshot.val() });
  }, (error) => {
    console.error(`Error in listener at ${path}:`, error);
    callback({ error });
  });
  
  return unsubscribe;
};

/**
 * Runs a transaction to safely update data that might be updated by multiple clients
 * @param {string} path - Database path
 * @param {Function} updateFn - Function that takes current data and returns updated data
 * @returns {Promise} Promise that resolves with the transaction result
 */
const transaction = async (path, updateFn) => {
  try {
    const result = await runTransaction(r(path), updateFn);
    return { success: true, committed: result.committed, snapshot: result.snapshot };
  } catch (error) {
    console.error(`Error in transaction at ${path}:`, error);
    return { success: false, error };
  }
};

// Utility for getting server timestamp
const getServerTimestamp = () => serverTimestamp();

// Create utility shortcuts for simplicity
const getAuth = () => auth;
const signIn = signInWithEmailAndPassword;
const createUser = createUserWithEmailAndPassword;
const setData = write;  // Alias for write function

// Export all functions and objects
export {
  auth,
  db,
  r,
  write,
  setData,
  updateData,
  pushData,
  getData,
  removeData,
  onValueChange,
  transaction,
  getServerTimestamp,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
  signIn,
  createUser,
  onAuthStateChanged,
  query,
  orderByChild,
  limitToLast
};
