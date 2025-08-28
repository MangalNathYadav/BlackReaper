/**
 * BlackReaper v2 - Firebase Database Helper
 */

// Firebase Database helper functions
window.db = {
  /**
   * Get a reference to a database path
   * @param {string} path - Database path
   * @returns {Object} Firebase reference
   */
  ref: (path) => {
    return firebase.database().ref(path);
  },
  
  /**
   * Get data once from a database path
   * @param {string} path - Database path
   * @returns {Promise} Firebase promise with snapshot
   */
  get: (path) => {
    return firebase.database().ref(path).once('value');
  },
  
  /**
   * Set data at a database path
   * @param {string} path - Database path
   * @param {any} data - Data to set
   * @returns {Promise} Firebase promise
   */
  set: (path, data) => {
    return firebase.database().ref(path).set(data);
  },
  
  /**
   * Update data at a database path
   * @param {string} path - Database path
   * @param {Object} data - Data to update
   * @returns {Promise} Firebase promise
   */
  update: (path, data) => {
    return firebase.database().ref(path).update(data);
  },
  
  /**
   * Push new data to a database path
   * @param {string} path - Database path
   * @param {any} data - Data to push
   * @returns {Object} Firebase reference to the new data
   */
  push: (path, data) => {
    return firebase.database().ref(path).push(data);
  },
  
  /**
   * Remove data at a database path
   * @param {string} path - Database path
   * @returns {Promise} Firebase promise
   */
  remove: (path) => {
    return firebase.database().ref(path).remove();
  },
  
  /**
   * Listen for data changes at a database path
   * @param {string} path - Database path
   * @param {string} eventType - Event type ('value', 'child_added', etc.)
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  listen: (path, eventType, callback) => {
    const ref = firebase.database().ref(path);
    ref.on(eventType, callback);
    return () => ref.off(eventType, callback);
  },
  
  /**
   * Get a server timestamp
   * @returns {Object} Firebase server timestamp
   */
  timestamp: () => {
    return firebase.database.ServerValue.TIMESTAMP;
  },
  
  /**
   * Increment a value
   * @param {number} amount - Amount to increment by
   * @returns {Object} Firebase increment value
   */
  increment: (amount) => {
    return firebase.database.ServerValue.increment(amount);
  }
};
