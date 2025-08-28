// Achievements tracker for BlackReaper

// Import Firebase functions - with fallbacks for both ESM and global access
let getData, updateData, pushData, stateManager, ui, notificationManager;

// Try to import Firebase utilities as ES modules
try {
  const firebaseModule = await import('../firebase/firebase.js');
  getData = firebaseModule.getData;
  updateData = firebaseModule.updateData;
  pushData = firebaseModule.pushData;

  const stateModule = await import('../firebase/state.js');
  stateManager = stateModule.default;

  const uiModule = await import('../firebase/ui.js');
  ui = uiModule.default;
  
  // Wait for notificationManager module to load
  try {
    const notificationsModule = await import('./notifications.js');
    notificationManager = notificationsModule.default;
  } catch (e) {
    console.warn('Failed to import notifications module, falling back to global object');
    notificationManager = window.notificationManager;
  }
} catch (e) {
  console.warn('Failed to import modules as ES modules, falling back to global objects');
  
  // Fallback to global objects
  if (window.firebaseUtils) {
    getData = window.firebaseUtils.getData;
    updateData = window.firebaseUtils.updateData;
    pushData = window.firebaseUtils.pushData;
    stateManager = window.stateManager;
    ui = window.ui;
    notificationManager = window.notificationManager;
  } else {
    console.error('Firebase utilities not available');
  }
}

/**
 * Achievements tracker class
 */
class AchievementsTracker {
  constructor() {
    this.achievementDefinitions = {};
    this.userAchievements = {};
    this.isInitialized = false;
    
    // Initialize
    this.init();
  }

  /**
   * Initialize achievements tracker
   */
  async init() {
    // Load achievement definitions
    await this.loadAchievementDefinitions();
    
    // Listen for user state changes
    document.addEventListener('blackreaper.userLoaded', () => {
      this.loadUserAchievements();
    });
    
    document.addEventListener('blackreaper.userSignedOut', () => {
      this.userAchievements = {};
    });
    
    // Setup progress tracking events
    this.setupProgressTrackingEvents();
    
    this.isInitialized = true;
  }

  /**
   * Load achievement definitions from database
   */
  async loadAchievementDefinitions() {
    try {
      const result = await getData('achievements');
      
      if (result.exists) {
        this.achievementDefinitions = result.data;
        console.log('Achievement definitions loaded:', Object.keys(this.achievementDefinitions).length);
      } else {
        console.warn('No achievement definitions found');
      }
    } catch (error) {
      console.error('Error loading achievement definitions:', error);
    }
  }

  /**
   * Load user achievements
   */
  async loadUserAchievements() {
    if (!stateManager.user) return;
    
    try {
      const result = await getData(`users/${stateManager.user.uid}/achievements`);
      
      if (result.exists) {
        this.userAchievements = result.data;
        console.log('User achievements loaded:', Object.keys(this.userAchievements).length);
      }
    } catch (error) {
      console.error('Error loading user achievements:', error);
    }
  }

  /**
   * Setup progress tracking events
   */
  setupProgressTrackingEvents() {
    // Track task completions
    document.addEventListener('blackreaper.taskCompleted', this.trackTaskCompleted.bind(this));
    
    // Track pomodoro completions
    document.addEventListener('blackreaper.pomodoroCompleted', this.trackPomodoroCompleted.bind(this));
    
    // Track journal entries
    document.addEventListener('blackreaper.journalEntrySaved', this.trackJournalEntry.bind(this));
    
    // Track battles
    document.addEventListener('blackreaper.battleCompleted', this.trackBattleCompleted.bind(this));
    
    // Track logins
    document.addEventListener('blackreaper.userLoaded', this.trackLogin.bind(this));
    
    // Track level ups
    document.addEventListener('blackreaper.levelUp', this.trackLevelUp.bind(this));
    
    // Track theme switches
    document.addEventListener('blackreaper.themeChanged', this.trackThemeSwitch.bind(this));
  }

  /**
   * Track task completed
   * @param {CustomEvent} event - Task completed event
   */
  async trackTaskCompleted(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { task } = event.detail;
    
    await Promise.all([
      this.incrementProgress('tasks_completed'),
      this.checkTaskTypeAchievements(task)
    ]);
  }

  /**
   * Check task type achievements
   * @param {Object} task - Task data
   */
  async checkTaskTypeAchievements(task) {
    if (!task.type) return;
    
    await this.incrementProgress(`tasks_completed_${task.type.toLowerCase()}`);
  }

  /**
   * Track pomodoro completed
   * @param {CustomEvent} event - Pomodoro completed event
   */
  async trackPomodoroCompleted(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { pomodoro } = event.detail;
    const isWork = pomodoro.type === 'work';
    
    await Promise.all([
      this.incrementProgress('pomodoros_completed'),
      isWork ? this.incrementProgress('work_sessions_completed') : this.incrementProgress('break_sessions_completed')
    ]);
  }

  /**
   * Track journal entry
   * @param {CustomEvent} event - Journal entry saved event
   */
  async trackJournalEntry(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { entry } = event.detail;
    
    await Promise.all([
      this.incrementProgress('journal_entries'),
      this.checkJournalEntryMilestones(entry)
    ]);
  }

  /**
   * Check journal entry milestones
   * @param {Object} entry - Journal entry data
   */
  async checkJournalEntryMilestones(entry) {
    // Check for long entries (over 500 words)
    if (entry.content && entry.content.split(/\s+/).length > 500) {
      await this.incrementProgress('long_journal_entries');
    }
    
    // Check for entries with images
    if (entry.images && entry.images.length > 0) {
      await this.incrementProgress('journal_entries_with_images');
    }
    
    // Check for entries with tags
    if (entry.tags && entry.tags.length > 0) {
      await this.incrementProgress('journal_entries_with_tags');
    }
  }

  /**
   * Track battle completed
   * @param {CustomEvent} event - Battle completed event
   */
  async trackBattleCompleted(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { battle, won } = event.detail;
    
    await Promise.all([
      this.incrementProgress('battles_completed'),
      won ? this.incrementProgress('battles_won') : this.incrementProgress('battles_lost')
    ]);
    
    // Check for battle difficulty
    if (battle.difficulty === 'easy') {
      await this.incrementProgress('easy_battles_completed');
    } else if (battle.difficulty === 'medium') {
      await this.incrementProgress('medium_battles_completed');
    } else if (battle.difficulty === 'hard') {
      await this.incrementProgress('hard_battles_completed');
    }
  }

  /**
   * Track login
   */
  async trackLogin() {
    if (!stateManager.user || !this.isInitialized) return;
    
    // Increment login count
    await this.incrementProgress('logins');
    
    // Check daily streak
    await this.checkDailyStreak();
  }

  /**
   * Check daily streak
   */
  async checkDailyStreak() {
    try {
      // Get last login timestamp
      const result = await getData(`users/${stateManager.user.uid}/lastLogin`);
      const currentTime = Date.now();
      
      if (result.exists) {
        const lastLogin = result.data;
        const lastLoginDate = new Date(lastLogin);
        const currentDate = new Date();
        
        // Check if last login was yesterday
        const isYesterday = (
          currentDate.getDate() - lastLoginDate.getDate() === 1 ||
          (
            currentDate.getDate() === 1 &&
            lastLoginDate.getDate() === new Date(
              lastLoginDate.getFullYear(),
              lastLoginDate.getMonth() + 1,
              0
            ).getDate()
          )
        ) && (
          currentDate.getMonth() === lastLoginDate.getMonth() ||
          (
            currentDate.getMonth() - lastLoginDate.getMonth() === 1 ||
            (currentDate.getMonth() === 0 && lastLoginDate.getMonth() === 11)
          )
        );
        
        if (isYesterday) {
          // Increment streak
          await this.incrementProgress('login_streak');
        } else if (
          currentDate.getDate() !== lastLoginDate.getDate() ||
          currentDate.getMonth() !== lastLoginDate.getMonth() ||
          currentDate.getFullYear() !== lastLoginDate.getFullYear()
        ) {
          // Reset streak if not same day and not yesterday
          await updateData(`users/${stateManager.user.uid}/stats/login_streak`, 1);
        }
      }
      
      // Update last login
      await updateData(`users/${stateManager.user.uid}/lastLogin`, currentTime);
    } catch (error) {
      console.error('Error checking daily streak:', error);
    }
  }

  /**
   * Track level up
   * @param {CustomEvent} event - Level up event
   */
  async trackLevelUp(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { level } = event.detail;
    
    // Track highest level
    await this.updateHighestValue('highest_level', level);
  }

  /**
   * Track theme switch
   * @param {CustomEvent} event - Theme changed event
   */
  async trackThemeSwitch(event) {
    if (!stateManager.user || !this.isInitialized) return;
    
    const { theme } = event.detail;
    
    if (theme === 'ghoul') {
      await this.incrementProgress('ghoul_mode_activations');
    } else {
      await this.incrementProgress('human_mode_activations');
    }
  }

  /**
   * Increment progress for an achievement metric
   * @param {string} metric - Achievement metric
   * @param {number} amount - Amount to increment
   */
  async incrementProgress(metric, amount = 1) {
    if (!stateManager.user) return;
    
    try {
      // Get current value
      const result = await getData(`users/${stateManager.user.uid}/stats/${metric}`);
      
      let currentValue = 0;
      if (result.exists) {
        currentValue = result.data;
      }
      
      // Increment value
      const newValue = currentValue + amount;
      
      // Update value
      await updateData(`users/${stateManager.user.uid}/stats/${metric}`, newValue);
      
      // Check for achievements
      await this.checkAchievements(metric, newValue);
      
      return newValue;
    } catch (error) {
      console.error(`Error incrementing progress for ${metric}:`, error);
      return null;
    }
  }

  /**
   * Update highest value for an achievement metric
   * @param {string} metric - Achievement metric
   * @param {number} value - New value
   */
  async updateHighestValue(metric, value) {
    if (!stateManager.user) return;
    
    try {
      // Get current value
      const result = await getData(`users/${stateManager.user.uid}/stats/${metric}`);
      
      let currentValue = 0;
      if (result.exists) {
        currentValue = result.data;
      }
      
      // Only update if new value is higher
      if (value > currentValue) {
        // Update value
        await updateData(`users/${stateManager.user.uid}/stats/${metric}`, value);
        
        // Check for achievements
        await this.checkAchievements(metric, value);
      }
      
      return Math.max(currentValue, value);
    } catch (error) {
      console.error(`Error updating highest value for ${metric}:`, error);
      return null;
    }
  }

  /**
   * Check for achievements based on progress
   * @param {string} metric - Achievement metric
   * @param {number} value - Current value
   */
  async checkAchievements(metric, value) {
    if (!this.achievementDefinitions) return;
    
    try {
      // Find achievements that use this metric
      const relevantAchievements = Object.values(this.achievementDefinitions)
        .filter(achievement => achievement.metric === metric);
      
      for (const achievement of relevantAchievements) {
        // Check if the achievement has already been earned
        if (this.userAchievements && this.userAchievements[achievement.id]) {
          continue;
        }
        
        // Check if the achievement threshold has been reached
        if (value >= achievement.threshold) {
          await this.unlockAchievement(achievement);
        }
      }
    } catch (error) {
      console.error(`Error checking achievements for ${metric}:`, error);
    }
  }

  /**
   * Unlock an achievement
   * @param {Object} achievement - Achievement data
   */
  async unlockAchievement(achievement) {
    if (!stateManager.user) return;
    
    try {
      const timestamp = Date.now();
      
      // Save achievement to user's achievements
      await updateData(
        `users/${stateManager.user.uid}/achievements/${achievement.id}`,
        {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          rarity: achievement.rarity,
          points: achievement.points,
          unlockedAt: timestamp
        }
      );
      
      // Add to local cache
      this.userAchievements[achievement.id] = {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
        points: achievement.points,
        unlockedAt: timestamp
      };
      
      // Update user stats (experience points)
      await this.grantAchievementReward(achievement);
      
      // Show notification
      this.showAchievementNotification(achievement);
      
      // Log achievement to activity
      await this.logAchievementActivity(achievement);
      
      // Dispatch achievement event
      this.dispatchAchievementEvent(achievement);
      
      return true;
    } catch (error) {
      console.error(`Error unlocking achievement ${achievement.id}:`, error);
      return false;
    }
  }

  /**
   * Grant achievement reward
   * @param {Object} achievement - Achievement data
   */
  async grantAchievementReward(achievement) {
    try {
      // Grant experience points
      const points = achievement.points || 0;
      
      if (points > 0) {
        // Get current XP
        const result = await getData(`users/${stateManager.user.uid}/stats/xp`);
        
        let currentXP = 0;
        if (result.exists) {
          currentXP = result.data;
        }
        
        // Update XP
        const newXP = currentXP + points;
        await updateData(`users/${stateManager.user.uid}/stats/xp`, newXP);
        
        // Dispatch XP gain event
        const xpGainEvent = new CustomEvent('blackreaper.xpGained', {
          detail: {
            amount: points,
            source: 'achievement',
            achievementId: achievement.id
          }
        });
        
        document.dispatchEvent(xpGainEvent);
      }
    } catch (error) {
      console.error(`Error granting achievement reward for ${achievement.id}:`, error);
    }
  }

  /**
   * Show achievement notification
   * @param {Object} achievement - Achievement data
   */
  showAchievementNotification(achievement) {
    // Show UI notification
    ui.toast(`Achievement Unlocked: ${achievement.title}`, 'success', {
      duration: 5000,
      icon: achievement.icon || 'assets/images/placeholder-frame.png'
    });
    
    // Show browser notification
    notificationManager.showNotification({
      title: 'Achievement Unlocked!',
      message: achievement.title,
      icon: achievement.icon || 'assets/images/placeholder-frame.png',
      tag: `achievement-${achievement.id}`,
      data: {
        type: 'achievement',
        achievementId: achievement.id
      }
    });
  }

  /**
   * Log achievement activity
   * @param {Object} achievement - Achievement data
   */
  async logAchievementActivity(achievement) {
    if (!stateManager.user) return;
    
    try {
      await pushData(`users/${stateManager.user.uid}/activity`, {
        type: 'achievement',
        achievementId: achievement.id,
        achievementTitle: achievement.title,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(`Error logging achievement activity for ${achievement.id}:`, error);
    }
  }

  /**
   * Dispatch achievement event
   * @param {Object} achievement - Achievement data
   */
  dispatchAchievementEvent(achievement) {
    const achievementEvent = new CustomEvent('blackreaper.achievementUnlocked', {
      detail: {
        achievement
      }
    });
    
    document.dispatchEvent(achievementEvent);
  }

  /**
   * Get all user achievements
   * @returns {Array} User achievements
   */
  getUserAchievements() {
    return Object.values(this.userAchievements || {});
  }

  /**
   * Get achievement progress
   * @param {string} achievementId - Achievement ID
   * @returns {Object|null} Achievement progress
   */
  async getAchievementProgress(achievementId) {
    if (!stateManager.user || !this.achievementDefinitions) return null;
    
    try {
      const achievement = this.achievementDefinitions[achievementId];
      
      if (!achievement) {
        return null;
      }
      
      // Get current value for the metric
      const result = await getData(`users/${stateManager.user.uid}/stats/${achievement.metric}`);
      
      let currentValue = 0;
      if (result.exists) {
        currentValue = result.data;
      }
      
      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        currentValue,
        threshold: achievement.threshold,
        progress: Math.min(1, currentValue / achievement.threshold),
        completed: currentValue >= achievement.threshold
      };
    } catch (error) {
      console.error(`Error getting achievement progress for ${achievementId}:`, error);
      return null;
    }
  }
}

// Create singleton instance
const achievementsTracker = new AchievementsTracker();

// Export for ES modules
export default achievementsTracker;

// Make available globally
window.achievementsTracker = achievementsTracker;
