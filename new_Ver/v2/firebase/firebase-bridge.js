/**
 * BlackReaper v2 - Firebase Bridge
 * Connects Firebase services and provides a unified API for the application
 */

// Firebase Bridge - Integrates auth, database, and other Firebase services
window.firebaseBridge = {
  /**
   * Initialize user data after authentication
   * @param {string} userId - User ID
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  initUserData: async (userId) => {
    try {
      // Check if user data exists
      const snapshot = await db.get(`users/${userId}`);
      
      if (!snapshot.exists()) {
        // Create new user data if it doesn't exist
        const userData = {
          createdAt: db.timestamp(),
          lastLogin: db.timestamp(),
          profile: {
            displayName: '',
            level: 1,
            rcCells: 0,
            kagune: 'rinkaku', // Default kagune type
            ghoulMode: false
          },
          stats: {
            tasksCompleted: 0,
            sessionsCompleted: 0,
            totalFocusTime: 0,
            streak: 0,
            lastActive: db.timestamp()
          },
          preferences: {
            theme: 'human',
            notifications: true,
            soundEffects: true
          },
          achievements: {}
        };
        
        await db.set(`users/${userId}`, userData);
        console.log('New user data created');
        return userData;
      } else {
        // Update last login time
        await db.update(`users/${userId}`, { lastLogin: db.timestamp() });
        console.log('User data exists, updated lastLogin');
        return snapshot.val();
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
      throw error;
    }
  },
  
  /**
   * Load user data
   * @param {string} userId - User ID
   * @returns {Promise} Promise that resolves with user data
   */
  loadUserData: async (userId) => {
    try {
      const snapshot = await db.get(`users/${userId}`);
      return snapshot.val();
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Promise that resolves when update is complete
   */
  updateProfile: async (userId, profileData) => {
    try {
      await db.update(`users/${userId}/profile`, profileData);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences data to update
   * @returns {Promise} Promise that resolves when update is complete
   */
  updatePreferences: async (userId, preferences) => {
    try {
      await db.update(`users/${userId}/preferences`, preferences);
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },
  
  /**
   * Add a task for a user
   * @param {string} userId - User ID
   * @param {Object} taskData - Task data
   * @returns {Promise} Promise that resolves with the new task reference
   */
  addTask: async (userId, taskData) => {
    try {
      const task = {
        ...taskData,
        createdAt: db.timestamp(),
        completed: false
      };
      
      return await db.push(`users/${userId}/tasks`, task);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },
  
  /**
   * Update a task
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Task data to update
   * @returns {Promise} Promise that resolves when update is complete
   */
  updateTask: async (userId, taskId, taskData) => {
    try {
      await db.update(`users/${userId}/tasks/${taskId}`, taskData);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },
  
  /**
   * Complete a task and update user stats
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @returns {Promise} Promise that resolves when completion is processed
   */
  completeTask: async (userId, taskId) => {
    try {
      // Mark task as completed
      await db.update(`users/${userId}/tasks/${taskId}`, {
        completed: true,
        completedAt: db.timestamp()
      });
      
      // Increment tasks completed count
      await db.update(`users/${userId}/stats`, {
        tasksCompleted: db.increment(1)
      });
      
      // Check for RC cell increment (25% chance)
      if (Math.random() < 0.25) {
        await db.update(`users/${userId}/profile`, {
          rcCells: db.increment(1)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },
  
  /**
   * Record a completed pomodoro session
   * @param {string} userId - User ID
   * @param {number} duration - Session duration in minutes
   * @returns {Promise} Promise that resolves when session is recorded
   */
  recordPomodoroSession: async (userId, duration) => {
    try {
      const sessionData = {
        duration,
        completedAt: db.timestamp()
      };
      
      // Add session record
      await db.push(`users/${userId}/sessions`, sessionData);
      
      // Update user stats
      await db.update(`users/${userId}/stats`, {
        sessionsCompleted: db.increment(1),
        totalFocusTime: db.increment(duration),
        lastActive: db.timestamp()
      });
      
      // Check for RC cell increment (40% chance)
      if (Math.random() < 0.40) {
        await db.update(`users/${userId}/profile`, {
          rcCells: db.increment(1)
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error recording pomodoro session:', error);
      throw error;
    }
  },
  
  /**
   * Add a journal entry
   * @param {string} userId - User ID
   * @param {Object} entryData - Journal entry data
   * @returns {Promise} Promise that resolves with the new entry reference
   */
  addJournalEntry: async (userId, entryData) => {
    try {
      const entry = {
        ...entryData,
        createdAt: db.timestamp()
      };
      
      return await db.push(`users/${userId}/journal`, entry);
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  },
  
  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise} Promise that resolves with user statistics
   */
  getUserStats: async (userId) => {
    try {
      const snapshot = await db.get(`users/${userId}/stats`);
      return snapshot.val();
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
};
