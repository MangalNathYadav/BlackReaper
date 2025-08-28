// Data synchronization utility for BlackReaper
// Handles offline data storage and sync when connection is restored

// Import Firebase functions - with fallbacks for both ESM and global access
let getData, updateData, setData, onValueChange, stateManager, ui;

// Try to import Firebase utilities as ES modules
try {
  const firebaseModule = await import('../firebase/firebase.js');
  getData = firebaseModule.getData;
  updateData = firebaseModule.updateData;
  setData = firebaseModule.setData;
  onValueChange = firebaseModule.onValueChange;

  const stateModule = await import('../firebase/state.js');
  stateManager = stateModule.default;

  const uiModule = await import('../firebase/ui.js');
  ui = uiModule.default;
} catch (e) {
  console.warn('Failed to import modules as ES modules, falling back to global objects');
  
  // Fallback to global objects
  if (window.firebaseUtils) {
    getData = window.firebaseUtils.getData;
    updateData = window.firebaseUtils.updateData;
    setData = window.firebaseUtils.setData;
    onValueChange = window.firebaseUtils.onValueChange;
    stateManager = window.stateManager;
    ui = window.ui;
  } else {
    console.error('Firebase utilities not available');
  }
}

/**
 * Data synchronization manager for BlackReaper
 */
class DataSync {
  constructor() {
    this.isOnline = navigator.onLine;
    this.pendingOperations = [];
    this.syncing = false;
    this.localStorageKey = 'blackreaper_pending_operations';
    this.syncInterval = null;
    this.connectedRef = null;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize data sync
   */
  init() {
    // Load pending operations from local storage
    this.loadPendingOperations();
    
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Listen for user state changes
    document.addEventListener('blackreaper.userLoaded', () => {
      this.setupFirebaseConnectionMonitor();
      this.syncData();
    });
    
    document.addEventListener('blackreaper.userSignedOut', () => {
      this.cleanup();
    });
    
    // Set up sync interval
    this.syncInterval = setInterval(() => {
      if (this.isOnline && stateManager.user) {
        this.syncData();
      }
    }, 60000); // Try to sync every minute
    
    // Run initial sync if online
    if (this.isOnline && stateManager.user) {
      this.syncData();
    }
  }

  /**
   * Set up Firebase connection monitor
   */
  setupFirebaseConnectionMonitor() {
    // Clean up existing connection reference
    if (this.connectedRef) {
      this.connectedRef();
    }
    
    // Monitor Firebase connection state
    this.connectedRef = onValueChange('.info/connected', (snapshot) => {
      const connected = snapshot.data;
      
      if (connected) {
        console.log('Connected to Firebase');
        this.isOnline = true;
        this.syncData();
      } else {
        console.log('Disconnected from Firebase');
        this.isOnline = false;
      }
    });
  }

  /**
   * Handle going online
   */
  handleOnline() {
    console.log('Device went online');
    this.isOnline = true;
    ui.toast('Connection restored', 'success');
    
    if (stateManager.user) {
      this.syncData();
    }
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    console.log('Device went offline');
    this.isOnline = false;
    ui.toast('Connection lost - working offline', 'warning');
  }

  /**
   * Load pending operations from local storage
   */
  loadPendingOperations() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }

  /**
   * Save pending operations to local storage
   */
  savePendingOperations() {
    try {
      localStorage.setItem(
        this.localStorageKey, 
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.error('Error saving pending operations:', error);
    }
  }

  /**
   * Enqueue an operation to be synchronized
   * @param {string} path - Data path
   * @param {*} data - Data to write
   * @param {string} operation - Operation type ('update', 'set')
   */
  enqueueOperation(path, data, operation) {
    // Create a unique ID for the operation
    const operationId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Add to pending operations
    this.pendingOperations.push({
      id: operationId,
      path,
      data,
      operation,
      timestamp: Date.now()
    });
    
    // Save to local storage
    this.savePendingOperations();
    
    // Try to sync if online
    if (this.isOnline && stateManager.user) {
      this.syncData();
    }
    
    return operationId;
  }

  /**
   * Synchronize data with Firebase
   */
  async syncData() {
    if (this.syncing || !this.isOnline || !stateManager.user) {
      return;
    }
    
    if (this.pendingOperations.length === 0) {
      return;
    }
    
    this.syncing = true;
    
    try {
      const operations = [...this.pendingOperations];
      
      // Sort operations by timestamp (oldest first)
      operations.sort((a, b) => a.timestamp - b.timestamp);
      
      let completed = [];
      let failed = [];
      
      for (const operation of operations) {
        try {
          if (operation.operation === 'update') {
            await updateData(operation.path, operation.data);
          } else if (operation.operation === 'set') {
            await setData(operation.path, operation.data);
          }
          
          completed.push(operation.id);
        } catch (error) {
          console.error(`Error syncing operation ${operation.id}:`, error);
          failed.push(operation.id);
        }
      }
      
      // Remove completed operations
      if (completed.length > 0) {
        this.pendingOperations = this.pendingOperations.filter(
          op => !completed.includes(op.id)
        );
        this.savePendingOperations();
      }
      
      // If operations were synced, notify user
      if (completed.length > 0) {
        console.log(`Synced ${completed.length} operations`);
        
        if (completed.length > 3) {
          ui.toast(`Synced ${completed.length} changes`, 'success');
        }
      }
      
      // If any operations failed, retry them later
      if (failed.length > 0) {
        console.warn(`Failed to sync ${failed.length} operations`);
      }
    } catch (error) {
      console.error('Error during data sync:', error);
    }
    
    this.syncing = false;
  }

  /**
   * Update data with offline support
   * @param {string} path - Data path
   * @param {*} data - Data to update
   * @returns {Promise<Object>} Operation result
   */
  async updateWithOfflineSupport(path, data) {
    if (!stateManager.user) {
      throw new Error('User not authenticated');
    }
    
    // Store operation locally
    this.enqueueOperation(path, data, 'update');
    
    if (!this.isOnline) {
      // When offline, return a mock result
      return {
        success: true,
        offline: true,
        data
      };
    }
    
    try {
      // Try to perform the operation online
      await updateData(path, data);
      
      return {
        success: true,
        offline: false,
        data
      };
    } catch (error) {
      console.error(`Error updating data at ${path}:`, error);
      
      return {
        success: false,
        offline: false,
        error
      };
    }
  }

  /**
   * Set data with offline support
   * @param {string} path - Data path
   * @param {*} data - Data to set
   * @returns {Promise<Object>} Operation result
   */
  async setWithOfflineSupport(path, data) {
    if (!stateManager.user) {
      throw new Error('User not authenticated');
    }
    
    // Store operation locally
    this.enqueueOperation(path, data, 'set');
    
    if (!this.isOnline) {
      // When offline, return a mock result
      return {
        success: true,
        offline: true,
        data
      };
    }
    
    try {
      // Try to perform the operation online
      await setData(path, data);
      
      return {
        success: true,
        offline: false,
        data
      };
    } catch (error) {
      console.error(`Error setting data at ${path}:`, error);
      
      return {
        success: false,
        offline: false,
        error
      };
    }
  }

  /**
   * Get data with offline support
   * @param {string} path - Data path
   * @returns {Promise<Object>} Data result
   */
  async getWithOfflineSupport(path) {
    if (!stateManager.user) {
      throw new Error('User not authenticated');
    }
    
    // Try to get from localStorage first
    try {
      const cached = localStorage.getItem(`blackreaper_cache_${path}`);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        
        // Use cache if offline or if cache is less than 5 minutes old
        if (!this.isOnline || (Date.now() - timestamp < 5 * 60 * 1000)) {
          return {
            success: true,
            offline: !this.isOnline,
            cached: true,
            timestamp,
            data
          };
        }
      }
    } catch (error) {
      console.error(`Error reading cached data for ${path}:`, error);
    }
    
    if (!this.isOnline) {
      return {
        success: false,
        offline: true,
        error: new Error('Offline and no cached data available')
      };
    }
    
    try {
      // Try to get data online
      const result = await getData(path);
      
      if (result.exists) {
        // Cache the result
        try {
          localStorage.setItem(`blackreaper_cache_${path}`, JSON.stringify({
            data: result.data,
            timestamp: Date.now()
          }));
        } catch (cacheError) {
          console.warn(`Failed to cache data for ${path}:`, cacheError);
        }
        
        return {
          success: true,
          offline: false,
          cached: false,
          data: result.data
        };
      }
      
      return {
        success: true,
        offline: false,
        cached: false,
        exists: false
      };
    } catch (error) {
      console.error(`Error getting data at ${path}:`, error);
      
      return {
        success: false,
        offline: false,
        error
      };
    }
  }

  /**
   * Check if there are pending operations
   * @returns {boolean} Whether there are pending operations
   */
  hasPendingOperations() {
    return this.pendingOperations.length > 0;
  }

  /**
   * Get count of pending operations
   * @returns {number} Count of pending operations
   */
  getPendingOperationsCount() {
    return this.pendingOperations.length;
  }

  /**
   * Force a sync attempt
   */
  forceSync() {
    if (stateManager.user) {
      return this.syncData();
    }
    
    return Promise.resolve(false);
  }

  /**
   * Clear offline cache for testing or troubleshooting
   */
  clearOfflineCache() {
    // Get all cache keys
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('blackreaper_cache_')) {
        cacheKeys.push(key);
      }
    }
    
    // Remove cache entries
    cacheKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    ui.toast(`Cleared ${cacheKeys.length} cached items`, 'info');
  }

  /**
   * Clean up when user signs out
   */
  cleanup() {
    // Clear connection monitor
    if (this.connectedRef) {
      this.connectedRef();
      this.connectedRef = null;
    }
  }
}

// Create singleton instance
const dataSync = new DataSync();

// Export for ES modules
export default dataSync;

// Make available globally
window.dataSync = dataSync;
