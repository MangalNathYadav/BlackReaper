/**
 * BlackReaper v2 - Firebase Auth Helper
 */

// Firebase Auth helper functions
window.auth = {
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Firebase auth promise
   */
  signIn: (email, password) => {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  },
  
  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Firebase auth promise
   */
  signUp: (email, password) => {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  },
  
  /**
   * Sign in anonymously
   * @returns {Promise} Firebase auth promise
   */
  signInAnonymously: () => {
    return firebase.auth().signInAnonymously();
  },
  
  /**
   * Sign out current user
   * @returns {Promise} Firebase auth promise
   */
  signOut: () => {
    return firebase.auth().signOut();
  },
  
  /**
   * Get current user
   * @returns {Object|null} Firebase user or null if not signed in
   */
  getCurrentUser: () => {
    return firebase.auth().currentUser;
  },
  
  /**
   * Reset password for user
   * @param {string} email - User email
   * @returns {Promise} Firebase auth promise
   */
  resetPassword: (email) => {
    return firebase.auth().sendPasswordResetEmail(email);
  },
  
  /**
   * Listen for auth state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged: (callback) => {
    return firebase.auth().onAuthStateChanged(callback);
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated: () => {
    return !!firebase.auth().currentUser;
  },
  
  /**
   * Check if user is anonymous
   * @returns {boolean} True if user is anonymous
   */
  isAnonymous: () => {
    const user = firebase.auth().currentUser;
    return user ? user.isAnonymous : false;
  }
};
