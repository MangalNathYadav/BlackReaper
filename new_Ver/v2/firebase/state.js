/**
 * BlackReaper v2 - Firebase State Management
 * Provides state management functionality using Firebase Realtime Database
 */

window.firebaseState = {
  // Track active listeners to prevent duplicates
  _activeListeners: {},
  
  /**
   * Initialize app state
   * @param {string} userId - User ID
   * @returns {Promise} Promise that resolves when state is initialized
   */
  initState: async (userId) => {
    try {
      // Get initial user data
      const userData = await firebaseBridge.loadUserData(userId);
      
      // Store in memory cache
      window.appState = {
        user: userData,
        tasks: {},
        journal: {},
        sessions: {}
      };
      
      console.log('App state initialized');
      return window.appState;
    } catch (error) {
      console.error('Error initializing app state:', error);
      throw error;
    }
  },
  
  /**
   * Start listening for data changes
   * @param {string} userId - User ID
   */
  startListeners: (userId) => {
    // Stop any existing listeners
    firebaseState.stopListeners();
    
    // Listen for profile changes
    firebaseState._activeListeners.profile = db.listen(
      `users/${userId}/profile`, 
      'value', 
      (snapshot) => {
        if (window.appState && window.appState.user) {
          window.appState.user.profile = snapshot.val();
          document.dispatchEvent(new CustomEvent('profile-updated', {
            detail: snapshot.val()
          }));
        }
      }
    );
    
    // Listen for stats changes
    firebaseState._activeListeners.stats = db.listen(
      `users/${userId}/stats`, 
      'value', 
      (snapshot) => {
        if (window.appState && window.appState.user) {
          window.appState.user.stats = snapshot.val();
          document.dispatchEvent(new CustomEvent('stats-updated', {
            detail: snapshot.val()
          }));
        }
      }
    );
    
    // Listen for tasks changes
    firebaseState._activeListeners.tasks = db.listen(
      `users/${userId}/tasks`, 
      'value', 
      (snapshot) => {
        const tasks = snapshot.val() || {};
        if (window.appState) {
          window.appState.tasks = tasks;
          document.dispatchEvent(new CustomEvent('tasks-updated', {
            detail: tasks
          }));
        }
      }
    );
    
    // Listen for journal changes
    firebaseState._activeListeners.journal = db.listen(
      `users/${userId}/journal`, 
      'value', 
      (snapshot) => {
        const journal = snapshot.val() || {};
        if (window.appState) {
          window.appState.journal = journal;
          document.dispatchEvent(new CustomEvent('journal-updated', {
            detail: journal
          }));
        }
      }
    );
    
    console.log('Firebase state listeners started');
  },
  
  /**
   * Stop all listeners
   */
  stopListeners: () => {
    Object.values(firebaseState._activeListeners).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    
    firebaseState._activeListeners = {};
    console.log('Firebase state listeners stopped');
  },
  
  /**
   * Subscribe to state changes
   * @param {string} eventName - Event name to subscribe to
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe: (eventName, callback) => {
    const handler = (event) => callback(event.detail);
    document.addEventListener(eventName, handler);
    
    // Return unsubscribe function
    return () => document.removeEventListener(eventName, handler);
  },
  
  /**
   * Get current state
   * @returns {Object} Current app state
   */
  getState: () => {
    return window.appState || {};
  },
  
  /**
   * Get user profile
   * @returns {Object} User profile
   */
  getProfile: () => {
    return window.appState && window.appState.user && window.appState.user.profile 
      ? window.appState.user.profile 
      : {};
  },
  
  /**
   * Get user stats
   * @returns {Object} User stats
   */
  getStats: () => {
    return window.appState && window.appState.user && window.appState.user.stats 
      ? window.appState.user.stats 
      : {};
  },
  
  /**
   * Get tasks
   * @returns {Object} Tasks
   */
  getTasks: () => {
    return window.appState && window.appState.tasks 
      ? window.appState.tasks 
      : {};
  },
  
  /**
   * Get journal entries
   * @returns {Object} Journal entries
   */
  getJournal: () => {
    return window.appState && window.appState.journal 
      ? window.appState.journal 
      : {};
  }
};
