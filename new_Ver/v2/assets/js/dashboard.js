/**
 * BlackReaper v2 - Dashboard JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize dashboard elements once user is authenticated
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Load user data
      loadUserData(user.uid);
      
      // Initialize dashboard components
      initDashboard();
    }
  });
  
  // Set up event listeners
  setupEventListeners();
});

/**
 * Load user data from Firebase
 * @param {string} userId - Firebase user ID
 */
function loadUserData(userId) {
  // Reference to user data
  const userRef = firebase.database().ref(`users/${userId}`);
  
  // Get user data
  userRef.once('value', snapshot => {
    const userData = snapshot.val() || {};
    
    // Update global user data
    window.currentUser = {
      uid: userId,
      displayName: userData.displayName || 'Anonymous',
      email: userData.email || '',
      rcCells: userData.rcCells || 0,
      level: userData.level || 1,
      tasks: userData.tasks || {},
      pomodoros: userData.pomodoros || {},
      achievements: userData.achievements || {},
      createdAt: userData.createdAt || Date.now(),
      lastActive: Date.now()
    };
    
    // Update UI with user data
    updateDashboardUI();
    
    // Set up real-time listeners
    setupRealTimeListeners(userId);
  });
}

/**
 * Update dashboard UI with user data
 */
function updateDashboardUI() {
  if (!window.currentUser) return;
  
  // Update user name in sidebar
  document.querySelectorAll('.user-name').forEach(el => {
    el.textContent = window.currentUser.displayName;
  });
  
  // Update RC cell count
  document.querySelectorAll('#rc-cell-count').forEach(el => {
    el.textContent = window.currentUser.rcCells.toLocaleString();
  });
  
  // Update achievements count
  const achievementsCount = Object.values(window.currentUser.achievements || {}).filter(a => a.unlocked).length;
  document.getElementById('achievements-count').textContent = achievementsCount.toString();
  
  // Update task list
  updateTaskList();
  
  // Update daily progress
  updateDailyProgress();
  
  // Update pomodoro history
  updatePomodoroHistory();
  
  // Update recent activity
  updateRecentActivity();
}

/**
 * Update task list in dashboard
 */
function updateTaskList() {
  const taskList = document.getElementById('task-list');
  if (!taskList) return;
  
  // Clear current tasks
  taskList.innerHTML = '';
  
  // Get tasks for today
  const tasks = window.currentUser.tasks || {};
  const todayTasks = filterTodayTasks(tasks);
  
  if (Object.keys(todayTasks).length === 0) {
    // No tasks for today
    taskList.innerHTML = `
      <li class="no-tasks">
        <p>No tasks for today. Add a new task to get started!</p>
      </li>
    `;
    return;
  }
  
  // Add each task to the list
  Object.entries(todayTasks).forEach(([taskId, task]) => {
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    taskItem.dataset.id = taskId;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed || false;
    checkbox.addEventListener('change', () => toggleTaskCompletion(taskId, checkbox.checked));
    
    const content = document.createElement('div');
    content.className = 'task-content';
    
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    
    const details = document.createElement('div');
    details.className = 'task-details';
    details.textContent = `${getPriorityText(task.priority)} • ${task.dueDate ? formatDate(task.dueDate) : 'No due date'}`;
    
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', () => editTask(taskId));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', () => deleteTask(taskId));
    
    // Assemble task item
    content.appendChild(title);
    content.appendChild(details);
    
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(content);
    taskItem.appendChild(actions);
    
    taskList.appendChild(taskItem);
  });
}

/**
 * Filter tasks for today
 * @param {Object} tasks - All user tasks
 * @returns {Object} Tasks for today
 */
function filterTodayTasks(tasks) {
  if (!tasks || Object.keys(tasks).length === 0) {
    return {};
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = {};
  
  Object.entries(tasks).forEach(([taskId, task]) => {
    // Check if task is for today or has no date
    if (!task.dueDate || isToday(new Date(task.dueDate))) {
      todayTasks[taskId] = task;
    }
  });
  
  return todayTasks;
}

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {boolean} True if date is today
 */
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

/**
 * Get priority text based on priority value
 * @param {string} priority - Priority value
 * @returns {string} Priority text
 */
function getPriorityText(priority) {
  switch (priority) {
    case 'high':
      return 'High priority';
    case 'medium':
      return 'Medium priority';
    case 'low':
      return 'Low priority';
    default:
      return 'Normal priority';
  }
}

/**
 * Format date to readable string
 * @param {number|string|Date} date - Date to format
 * @returns {string} Formatted date
 */
function formatDate(date) {
  const dateObj = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Check if date is today or tomorrow
  if (isToday(dateObj)) {
    return 'Due today';
  } else if (
    dateObj.getDate() === tomorrow.getDate() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getFullYear() === tomorrow.getFullYear()
  ) {
    return 'Due tomorrow';
  } else {
    // Format date as MM/DD/YYYY
    return `Due ${dateObj.getMonth() + 1}/${dateObj.getDate()}/${dateObj.getFullYear()}`;
  }
}

/**
 * Toggle task completion status
 * @param {string} taskId - Task ID
 * @param {boolean} completed - Completion status
 */
function toggleTaskCompletion(taskId, completed) {
  if (!window.firebase || !window.currentUser) return;
  
  // Update task in Firebase
  firebase.database().ref(`users/${window.currentUser.uid}/tasks/${taskId}`).update({
    completed: completed,
    completedAt: completed ? Date.now() : null
  }).then(() => {
    // Show notification
    if (completed) {
      window.notificationManager?.showSuccess('Task Completed', 'Great job! Keep up the good work!');
      
      // Award RC cells
      awardRcCells(50, 'Task completion');
    }
  }).catch(error => {
    console.error('Error updating task:', error);
  });
}

/**
 * Award RC cells to user
 * @param {number} amount - Amount of RC cells to award
 * @param {string} reason - Reason for awarding
 */
function awardRcCells(amount, reason) {
  if (!window.firebase || !window.currentUser) return;
  
  // Update RC cells in Firebase
  firebase.database().ref(`users/${window.currentUser.uid}/rcCells`).transaction(currentRcCells => {
    return (currentRcCells || 0) + amount;
  }).then(() => {
    // Show notification
    window.notificationManager?.showSuccess('RC Cells Earned', `+${amount} RC cells from ${reason}`);
    
    // Log activity
    logActivity('RC Cells Earned', `+${amount} RC cells from ${reason}`);
  }).catch(error => {
    console.error('Error awarding RC cells:', error);
  });
}

/**
 * Log user activity
 * @param {string} title - Activity title
 * @param {string} details - Activity details
 */
function logActivity(title, details) {
  if (!window.firebase || !window.currentUser) return;
  
  // Create activity object
  const activity = {
    title: title,
    details: details,
    timestamp: Date.now()
  };
  
  // Add activity to Firebase
  firebase.database().ref(`users/${window.currentUser.uid}/activities`).push(activity)
    .catch(error => {
      console.error('Error logging activity:', error);
    });
}

/**
 * Edit task
 * @param {string} taskId - Task ID
 */
function editTask(taskId) {
  if (!window.currentUser || !window.currentUser.tasks) return;
  
  const task = window.currentUser.tasks[taskId];
  if (!task) return;
  
  // Show edit task modal
  // This would be implemented with a modal component
  // For now, just log that we want to edit
  console.log('Edit task:', task);
  
  // Example implementation with a simple prompt
  const newTitle = prompt('Edit task title:', task.title);
  if (newTitle && newTitle !== task.title) {
    // Update task in Firebase
    firebase.database().ref(`users/${window.currentUser.uid}/tasks/${taskId}`).update({
      title: newTitle
    }).then(() => {
      window.notificationManager?.showSuccess('Task Updated', 'Task has been updated successfully.');
    }).catch(error => {
      console.error('Error updating task:', error);
    });
  }
}

/**
 * Delete task
 * @param {string} taskId - Task ID
 */
function deleteTask(taskId) {
  if (!window.firebase || !window.currentUser) return;
  
  // Confirm deletion
  if (confirm('Are you sure you want to delete this task?')) {
    // Delete task from Firebase
    firebase.database().ref(`users/${window.currentUser.uid}/tasks/${taskId}`).remove()
      .then(() => {
        window.notificationManager?.showSuccess('Task Deleted', 'Task has been deleted successfully.');
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  }
}

/**
 * Update daily progress in dashboard
 */
function updateDailyProgress() {
  if (!window.currentUser) return;
  
  // Get tasks for today
  const tasks = window.currentUser.tasks || {};
  const todayTasks = filterTodayTasks(tasks);
  
  // Calculate task completion
  const totalTasks = Object.keys(todayTasks).length;
  const completedTasks = Object.values(todayTasks).filter(task => task.completed).length;
  
  // Update tasks progress bar
  const tasksProgressValue = document.querySelector('.progress-container:nth-child(1) .progress-value');
  const tasksProgressFill = document.querySelector('.progress-container:nth-child(1) .progress-fill');
  
  if (tasksProgressValue && tasksProgressFill) {
    tasksProgressValue.textContent = `${completedTasks}/${totalTasks}`;
    tasksProgressFill.style.width = totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : '0%';
  }
  
  // Calculate focus time
  const pomodoros = window.currentUser.pomodoros || {};
  const todayPomodoros = filterTodayPomodoros(pomodoros);
  
  const totalFocusMinutes = Object.values(todayPomodoros)
    .filter(session => session.type === 'focus' && session.completed)
    .reduce((total, session) => total + (session.duration || 25), 0);
  
  // Update focus time progress bar
  const focusProgressValue = document.querySelector('.progress-container:nth-child(2) .progress-value');
  const focusProgressFill = document.querySelector('.progress-container:nth-child(2) .progress-fill');
  
  if (focusProgressValue && focusProgressFill) {
    const targetMinutes = 120; // 2 hours
    focusProgressValue.textContent = `${totalFocusMinutes}/${targetMinutes} min`;
    focusProgressFill.style.width = `${Math.min((totalFocusMinutes / targetMinutes) * 100, 100)}%`;
  }
  
  // Calculate RC cell growth
  const rcCells = window.currentUser.rcCells || 0;
  const dailyRcTarget = 100;
  
  // Update RC cell progress bar
  const rcProgressValue = document.querySelector('.progress-container:nth-child(3) .progress-value');
  const rcProgressFill = document.querySelector('.progress-container:nth-child(3) .progress-fill');
  
  if (rcProgressValue && rcProgressFill) {
    // For simplicity, we'll just show the total RC cells vs target
    rcProgressValue.textContent = `${rcCells}/${dailyRcTarget}`;
    rcProgressFill.style.width = `${Math.min((rcCells / dailyRcTarget) * 100, 100)}%`;
  }
}

/**
 * Filter pomodoros for today
 * @param {Object} pomodoros - All user pomodoros
 * @returns {Object} Pomodoros for today
 */
function filterTodayPomodoros(pomodoros) {
  if (!pomodoros || Object.keys(pomodoros).length === 0) {
    return {};
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPomodoros = {};
  
  Object.entries(pomodoros).forEach(([id, pomodoro]) => {
    const pomodoroDate = new Date(pomodoro.startTime);
    pomodoroDate.setHours(0, 0, 0, 0);
    
    if (pomodoroDate.getTime() === today.getTime()) {
      todayPomodoros[id] = pomodoro;
    }
  });
  
  return todayPomodoros;
}

/**
 * Update pomodoro history in dashboard
 */
function updatePomodoroHistory() {
  const historyContainer = document.getElementById('pomodoro-history');
  if (!historyContainer || !window.currentUser) return;
  
  // Clear current history
  historyContainer.innerHTML = '';
  
  // Get pomodoros for today
  const pomodoros = window.currentUser.pomodoros || {};
  const todayPomodoros = filterTodayPomodoros(pomodoros);
  
  if (Object.keys(todayPomodoros).length === 0) {
    // No pomodoros for today
    historyContainer.innerHTML = `
      <div class="no-history">
        <p>No pomodoro sessions completed today. Start a session to track your progress!</p>
      </div>
    `;
    return;
  }
  
  // Sort pomodoros by start time (most recent first)
  const sortedPomodoros = Object.entries(todayPomodoros)
    .sort((a, b) => b[1].startTime - a[1].startTime);
  
  // Add each pomodoro to the history
  sortedPomodoros.forEach(([id, pomodoro], index) => {
    const sessionElement = document.createElement('div');
    sessionElement.className = 'pomodoro-session';
    
    const sessionNumber = document.createElement('div');
    sessionNumber.className = 'session-number';
    sessionNumber.textContent = `#${sortedPomodoros.length - index}`;
    
    const sessionType = document.createElement('div');
    sessionType.className = 'session-type';
    sessionType.textContent = pomodoro.type === 'focus' ? 'Focus' : pomodoro.type === 'short' ? 'Short Break' : 'Long Break';
    
    const sessionStatus = document.createElement('div');
    sessionStatus.className = 'session-status';
    sessionStatus.textContent = pomodoro.completed ? 'Completed' : 'Interrupted';
    
    const sessionDuration = document.createElement('div');
    sessionDuration.className = 'session-duration';
    sessionDuration.textContent = `${pomodoro.duration} min`;
    
    const sessionDate = document.createElement('div');
    sessionDate.className = 'session-date';
    sessionDate.textContent = formatTime(pomodoro.startTime);
    
    // Assemble session element
    sessionElement.appendChild(sessionNumber);
    sessionElement.appendChild(sessionType);
    sessionElement.appendChild(sessionStatus);
    sessionElement.appendChild(sessionDuration);
    sessionElement.appendChild(sessionDate);
    
    historyContainer.appendChild(sessionElement);
  });
}

/**
 * Format time to readable string
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted time
 */
function formatTime(timestamp) {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
}

/**
 * Update recent activity in dashboard
 */
function updateRecentActivity() {
  const activityList = document.getElementById('activity-list');
  if (!activityList || !window.currentUser) return;
  
  // Clear current activities
  activityList.innerHTML = '';
  
  // Get activities
  const activities = window.currentUser.activities || {};
  
  if (Object.keys(activities).length === 0) {
    // No activities
    activityList.innerHTML = `
      <li class="no-activity">
        <p>No recent activities. Start using the app to see your activity here!</p>
      </li>
    `;
    return;
  }
  
  // Sort activities by timestamp (most recent first)
  const sortedActivities = Object.entries(activities)
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .slice(0, 5); // Only show 5 most recent
  
  // Add each activity to the list
  sortedActivities.forEach(([id, activity]) => {
    const activityItem = document.createElement('li');
    activityItem.className = 'activity-item';
    
    const icon = document.createElement('div');
    icon.className = 'activity-icon';
    
    // Choose icon based on activity title
    let iconClass = 'fa-info-circle';
    if (activity.title.includes('Task')) {
      iconClass = 'fa-check-circle';
    } else if (activity.title.includes('RC')) {
      iconClass = 'fa-dna';
    } else if (activity.title.includes('Pomodoro')) {
      iconClass = 'fa-clock';
    } else if (activity.title.includes('Achievement')) {
      iconClass = 'fa-trophy';
    }
    
    icon.innerHTML = `<i class="fas ${iconClass}"></i>`;
    
    const content = document.createElement('div');
    content.className = 'activity-content';
    
    const title = document.createElement('div');
    title.className = 'activity-title';
    title.textContent = activity.title;
    
    const details = document.createElement('div');
    details.className = 'activity-details';
    details.textContent = activity.details;
    
    const time = document.createElement('div');
    time.className = 'activity-time';
    time.textContent = formatTimeAgo(activity.timestamp);
    
    // Assemble activity item
    content.appendChild(title);
    content.appendChild(details);
    content.appendChild(time);
    
    activityItem.appendChild(icon);
    activityItem.appendChild(content);
    
    activityList.appendChild(activityItem);
  });
}

/**
 * Format time ago string
 * @param {number} timestamp - Timestamp to format
 * @returns {string} Formatted time ago
 */
function formatTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Convert to seconds
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return 'Just now';
  }
  
  // Convert to minutes
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // Convert to hours
  const hours = Math.floor(minutes / 60);
  
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Convert to days
  const days = Math.floor(hours / 24);
  
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Add task button
  const addTaskBtn = document.getElementById('add-task');
  if (addTaskBtn) {
    addTaskBtn.addEventListener('click', showAddTaskModal);
  }
  
  // Refresh dashboard button
  const refreshBtn = document.getElementById('refresh-dashboard');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      // Show loading animation
      refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      refreshBtn.disabled = true;
      
      // Refresh data
      setTimeout(() => {
        updateDashboardUI();
        
        // Reset button
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        refreshBtn.disabled = false;
        
        // Show notification
        window.notificationManager?.showSuccess('Dashboard Refreshed', 'Your dashboard has been updated with the latest data.');
      }, 1000);
    });
  }
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      if (window.toggleTheme) {
        window.toggleTheme();
      }
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (window.firebase) {
        firebase.auth().signOut()
          .then(() => {
            window.location.href = 'index.html';
          })
          .catch(error => {
            console.error('Error signing out:', error);
          });
      }
    });
  }
}

/**
 * Show add task modal
 */
function showAddTaskModal() {
  // This would be implemented with a modal component
  // For now, just use a simple prompt
  const taskTitle = prompt('Enter task title:');
  if (!taskTitle) return;
  
  // Create new task
  const task = {
    title: taskTitle,
    priority: 'medium',
    dueDate: Date.now(),
    createdAt: Date.now(),
    completed: false
  };
  
  // Add task to Firebase
  if (window.firebase && window.currentUser) {
    firebase.database().ref(`users/${window.currentUser.uid}/tasks`).push(task)
      .then(() => {
        window.notificationManager?.showSuccess('Task Added', 'New task has been added successfully.');
      })
      .catch(error => {
        console.error('Error adding task:', error);
      });
  }
}

/**
 * Set up real-time listeners for user data
 * @param {string} userId - Firebase user ID
 */
function setupRealTimeListeners(userId) {
  if (!window.firebase) return;
  
  // Listen for tasks changes
  firebase.database().ref(`users/${userId}/tasks`).on('value', snapshot => {
    if (window.currentUser) {
      window.currentUser.tasks = snapshot.val() || {};
      updateTaskList();
      updateDailyProgress();
    }
  });
  
  // Listen for pomodoros changes
  firebase.database().ref(`users/${userId}/pomodoros`).on('value', snapshot => {
    if (window.currentUser) {
      window.currentUser.pomodoros = snapshot.val() || {};
      updatePomodoroHistory();
      updateDailyProgress();
    }
  });
  
  // Listen for RC cells changes
  firebase.database().ref(`users/${userId}/rcCells`).on('value', snapshot => {
    if (window.currentUser) {
      window.currentUser.rcCells = snapshot.val() || 0;
      
      // Update RC cell count in sidebar
      document.querySelectorAll('#rc-cell-count').forEach(el => {
        el.textContent = window.currentUser.rcCells.toLocaleString();
      });
      
      // Update daily progress
      updateDailyProgress();
    }
  });
  
  // Listen for achievements changes
  firebase.database().ref(`users/${userId}/achievements`).on('value', snapshot => {
    if (window.currentUser) {
      window.currentUser.achievements = snapshot.val() || {};
      
      // Update achievements count
      const achievementsCount = Object.values(window.currentUser.achievements || {}).filter(a => a.unlocked).length;
      document.getElementById('achievements-count').textContent = achievementsCount.toString();
    }
  });
  
  // Listen for activities changes
  firebase.database().ref(`users/${userId}/activities`).on('value', snapshot => {
    if (window.currentUser) {
      window.currentUser.activities = snapshot.val() || {};
      updateRecentActivity();
    }
  });
}

/**
 * Initialize dashboard components
 */
function initDashboard() {
  // Initialize pomodoro timer
  if (window.initPomodoro) {
    window.initPomodoro();
  }
  
  // Apply initial animations
  applyInitialAnimations();
}

/**
 * Apply initial animations to dashboard elements
 */
function applyInitialAnimations() {
  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(el => {
      const width = el.dataset.width || '0%';
      el.style.width = width;
    });
  }, 300);
  
  // Fade in dashboard cards
  const cards = document.querySelectorAll('.dashboard-card');
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}
