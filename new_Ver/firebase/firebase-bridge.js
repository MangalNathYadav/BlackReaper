// Firebase Bridge Script
// This script makes Firebase functions available both as ES modules and global objects

// Import from Firebase module
import { 
  getData, 
  updateData, 
  setData,
  pushData,
  removeData,
  onValueChange,
  getAuth,
  signIn,
  signOut,
  createUser
} from './firebase.js';

import stateManager from './state.js';
import ui from './ui.js';

// Make them available globally
window.firebaseUtils = {
  getData,
  updateData,
  setData,
  pushData,
  removeData,
  onValueChange,
  getAuth,
  signIn,
  signOut,
  createUser
};

window.stateManager = stateManager;
window.ui = ui;

// Re-export everything for use as ES modules
export {
  getData, 
  updateData, 
  setData,
  pushData,
  removeData,
  onValueChange,
  getAuth,
  signIn,
  signOut,
  createUser
};

export { stateManager, ui };
export default window.firebaseUtils;
