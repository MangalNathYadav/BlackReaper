// Notifications and reminders for BlackReaper

// Import Firebase functions - with fallbacks for both ESM and global access
let getData, updateData, onValueChange, stateManager, ui;

// Try to import Firebase utilities as ES modules
try {
  const firebaseModule = await import('../firebase/firebase.js');
  getData = firebaseModule.getData;
  updateData = firebaseModule.updateData;
  onValueChange = firebaseModule.onValueChange;

  const stateModule = await import('../firebase/state.js');
  stateManager = stateModule.default;

  const uiModule = await import('../firebase/ui.js');
  ui = uiModule.default;
} catch (e) {
  console.warn('Failed to import Firebase modules as ES modules, falling back to global objects');
  
  // Fallback to global objects
  if (window.firebaseUtils) {
    getData = window.firebaseUtils.getData;
    updateData = window.firebaseUtils.updateData;
    onValueChange = window.firebaseUtils.onValueChange;
    stateManager = window.stateManager;
    ui = window.ui;
  } else {
    console.error('Firebase utilities not available');
  }
}

/**
 * Notification and reminder management
 */
class NotificationManager {
  constructor() {
    this.hasPermission = false;
    this.notifications = [];
    this.reminders = [];
    this.reminderListeners = [];
    
    // Initialize
    this.init();
  }

  /**
   * Initialize notifications
   */
  async init() {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === 'granted') {
      this.hasPermission = true;
    }
    
    // Add event listener for auth state changes
    document.addEventListener('blackreaper.userLoaded', () => {
      this.loadUserNotificationsAndReminders();
    });
    
    // Setup the notification close handler
    this.setupNotificationCloseHandler();
  }

  /**
   * Request notification permission
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }
    
    if (this.hasPermission) {
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        this.hasPermission = true;
        
        // Save preference to user profile
        if (stateManager.user) {
          await updateData(`users/${stateManager.user.uid}/preferences`, {
            notificationsEnabled: true
          });
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification
   * @param {Object} options - Notification options
   * @returns {Notification|null} Notification object
   */
  async showNotification(options) {
    const {
      title,
      message,
      icon = 'assets/images/placeholder-frame.png',
      badge = 'assets/images/placeholder-frame.png',
      tag = 'blackreaper-notification',
      requireInteraction = false,
      actions = [],
      data = {},
      silent = false,
      saveToHistory = true
    } = options;
    
    // Request permission if needed
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      
      if (!granted) {
        console.warn('Notification permission denied');
        
        // Show fallback toast
        ui.toast(message, 'info', { title });
        
        return null;
      }
    }
    
    // Create notification
    const notification = new Notification(title, {
      body: message,
      icon,
      badge,
      tag,
      requireInteraction,
      actions,
      data: {
        ...data,
        timestamp: Date.now()
      },
      silent
    });
    
    // Setup event handlers
    notification.onclick = (event) => {
      event.preventDefault();
      
      // Focus window
      window.focus();
      
      // Close notification
      notification.close();
      
      // Execute custom click handler if provided
      if (options.onClick) {
        options.onClick(notification.data);
      }
    };
    
    // Save to history if needed
    if (saveToHistory && stateManager.user) {
      this.saveNotificationToHistory({
        title,
        message,
        timestamp: Date.now(),
        type: data.type || 'general'
      });
    }
    
    return notification;
  }

  /**
   * Save notification to history
   * @param {Object} notification - Notification data
   */
  async saveNotificationToHistory(notification) {
    if (!stateManager.user) return;
    
    try {
      // Get current notifications (limited to 50)
      const result = await getData(`users/${stateManager.user.uid}/notifications`);
      
      const notifications = result.exists ? result.data : [];
      
      // Add new notification
      notifications.unshift(notification);
      
      // Keep only the latest 50
      const limitedNotifications = notifications.slice(0, 50);
      
      // Save back to database
      await updateData(`users/${stateManager.user.uid}/notifications`, limitedNotifications);
      
    } catch (error) {
      console.error('Error saving notification to history:', error);
    }
  }

  /**
   * Load user notifications and reminders
   */
  async loadUserNotificationsAndReminders() {
    if (!stateManager.user) return;
    
    try {
      // Load notifications history
      const notificationsResult = await getData(`users/${stateManager.user.uid}/notifications`);
      if (notificationsResult.exists) {
        this.notifications = notificationsResult.data;
      }
      
      // Load reminders and set up listeners
      this.setupReminderListeners();
      
      // Load notification preferences
      const preferencesResult = await getData(`users/${stateManager.user.uid}/preferences`);
      if (preferencesResult.exists && preferencesResult.data.notificationsEnabled) {
        this.hasPermission = true;
      }
    } catch (error) {
      console.error('Error loading notifications and reminders:', error);
    }
  }

  /**
   * Setup reminder listeners
   */
  setupReminderListeners() {
    if (!stateManager.user) return;
    
    // Clear existing listeners
    this.clearReminderListeners();
    
    // Listen for task reminders
    const taskReminderListener = onValueChange(
      `users/${stateManager.user.uid}/tasks`, 
      this.handleTaskReminders.bind(this)
    );
    
    this.reminderListeners.push(taskReminderListener);
    
    // Listen for pomodoro reminders
    const pomodoroReminderListener = onValueChange(
      `users/${stateManager.user.uid}/pomodoro`,
      this.handlePomodoroReminders.bind(this)
    );
    
    this.reminderListeners.push(pomodoroReminderListener);
  }

  /**
   * Clear reminder listeners
   */
  clearReminderListeners() {
    this.reminderListeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener();
      }
    });
    
    this.reminderListeners = [];
  }

  /**
   * Handle task reminders
   * @param {Object} result - Database result
   */
  handleTaskReminders(result) {
    if (!result.exists) return;
    
    const tasks = result.data;
    const now = Date.now();
    
    // Check for tasks with due dates
    Object.values(tasks).forEach(task => {
      if (task.completed) return;
      if (!task.dueDate) return;
      
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now;
      
      // If due date is within the next hour but more than 55 minutes away
      if (timeDiff > 0 && timeDiff <= 60 * 60 * 1000 && timeDiff >= 55 * 60 * 1000) {
        this.showTaskReminderNotification(task);
      }
      // If due date is within the next 15 minutes
      else if (timeDiff > 0 && timeDiff <= 15 * 60 * 1000) {
        this.showTaskReminderNotification(task, true);
      }
    });
  }

  /**
   * Show task reminder notification
   * @param {Object} task - Task data
   * @param {boolean} urgent - Whether the reminder is urgent
   */
  showTaskReminderNotification(task, urgent = false) {
    const title = urgent 
      ? 'Task Due Soon!' 
      : 'Upcoming Task Reminder';
    
    const message = urgent
      ? `Task "${task.title}" is due in less than 15 minutes!`
      : `Task "${task.title}" is due in about an hour.`;
    
    this.showNotification({
      title,
      message,
      icon: 'assets/images/placeholder-frame.png',
      tag: `task-reminder-${task.id}`,
      requireInteraction: urgent,
      data: {
        type: 'task-reminder',
        taskId: task.id,
        urgent
      },
      onClick: () => {
        // Navigate to task view
        window.location.href = 'dashboard.html';
      }
    });
  }

  /**
   * Handle pomodoro reminders
   * @param {Object} result - Database result
   */
  handlePomodoroReminders(result) {
    if (!result.exists) return;
    
    const pomodoros = result.data;
    const now = Date.now();
    
    // Check for active pomodoros
    Object.values(pomodoros).forEach(pomodoro => {
      if (pomodoro.status !== 'active') return;
      
      const endTime = pomodoro.startTime + pomodoro.duration * 1000;
      const timeDiff = endTime - now;
      
      // If pomodoro is about to end (within the next minute)
      if (timeDiff > 0 && timeDiff <= 60 * 1000) {
        this.showPomodoroEndingNotification(pomodoro);
      }
    });
  }

  /**
   * Show pomodoro ending notification
   * @param {Object} pomodoro - Pomodoro data
   */
  showPomodoroEndingNotification(pomodoro) {
    const isWork = pomodoro.type === 'work';
    
    const title = isWork 
      ? 'Work Session Ending' 
      : 'Break Ending';
    
    const message = isWork
      ? 'Your work session is ending soon. Time for a break!'
      : 'Your break is ending soon. Get ready to work!';
    
    this.showNotification({
      title,
      message,
      icon: 'assets/images/placeholder-frame.png',
      tag: `pomodoro-${pomodoro.id}`,
      requireInteraction: false,
      data: {
        type: 'pomodoro-ending',
        pomodoroId: pomodoro.id,
        pomodoroType: pomodoro.type
      },
      onClick: () => {
        // Navigate to dashboard
        window.location.href = 'dashboard.html';
      }
    });
  }

  /**
   * Setup notification close handler
   */
  setupNotificationCloseHandler() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'notificationclick') {
          const { action, notificationData } = event.data;
          
          // Handle notification click based on type
          if (notificationData.type === 'task-reminder') {
            window.location.href = 'dashboard.html';
          } else if (notificationData.type === 'pomodoro-ending') {
            window.location.href = 'dashboard.html';
          }
        }
      });
    }
  }

  /**
   * Create a task reminder
   * @param {Object} task - Task data
   * @param {Date} reminderTime - Reminder time
   */
  async createTaskReminder(task, reminderTime) {
    if (!stateManager.user) return;
    
    try {
      // Calculate reminder timestamp
      const timestamp = reminderTime.getTime();
      
      // Save reminder to database
      await updateData(`users/${stateManager.user.uid}/reminders/${task.id}`, {
        type: 'task',
        taskId: task.id,
        taskTitle: task.title,
        timestamp,
        createdAt: Date.now()
      });
      
      ui.toast('Reminder set', 'success');
      
      return true;
    } catch (error) {
      console.error('Error creating task reminder:', error);
      ui.toast('Failed to set reminder', 'error');
      
      return false;
    }
  }

  /**
   * Get notification history
   * @returns {Array} Notification history
   */
  getNotificationHistory() {
    return this.notifications;
  }

  /**
   * Clear notification history
   */
  async clearNotificationHistory() {
    if (!stateManager.user) return;
    
    try {
      await updateData(`users/${stateManager.user.uid}/notifications`, []);
      this.notifications = [];
      
      return true;
    } catch (error) {
      console.error('Error clearing notification history:', error);
      return false;
    }
  }
  
  /**
   * Update notification settings
   * @param {Object} settings - Notification settings
   */
  async updateNotificationSettings(settings) {
    if (!stateManager.user) return;
    
    try {
      await updateData(`users/${stateManager.user.uid}/preferences/notifications`, settings);
      
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Export for ES modules
export default notificationManager;

// Make available globally
window.notificationManager = notificationManager;
