/**
 * BlackReaper v2 - Statistics System
 * Handles the statistics tracking and display
 */

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Require authentication for this page
  requireAuth().then(initStatsSystem).catch(error => {
    console.error('Authentication error:', error);
  });
});

// Stats system state
const statsState = {
  userData: null,
  tasks: {},
  sessions: {},
  activityData: {
    week: [],
    month: [],
    year: []
  },
  taskData: {
    byDay: [],
    byCategory: []
  },
  achievements: [],
  currentTimePeriod: 'week',
  currentTaskView: 'day'
};

// Cache DOM elements
const elements = {};

// Chart objects
let activityChart = null;
let taskChart = null;

// Color themes for charts
const chartColors = {
  human: {
    primary: '#2196F3',
    secondary: '#03A9F4',
    tertiary: '#00BCD4',
    quaternary: '#009688',
    grid: 'rgba(255, 255, 255, 0.1)',
    text: '#B0BEC5'
  },
  ghoul: {
    primary: '#E91E63',
    secondary: '#F44336',
    tertiary: '#FF5722',
    quaternary: '#FF9800',
    grid: 'rgba(255, 255, 255, 0.1)',
    text: '#B0BEC5'
  }
};

// Achievement definitions
const achievementDefinitions = [
  {
    id: 'first-task',
    title: 'First Task',
    description: 'Complete your first task',
    icon: 'fa-solid fa-check',
    requirement: (stats) => stats.tasksCompleted >= 1
  },
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: 'fa-solid fa-tasks',
    requirement: (stats) => stats.tasksCompleted >= 50,
    progress: (stats) => Math.min(100, (stats.tasksCompleted / 50) * 100)
  },
  {
    id: 'focus-novice',
    title: 'Focus Novice',
    description: 'Complete 5 pomodoro sessions',
    icon: 'fa-solid fa-hourglass-start',
    requirement: (stats) => stats.sessionsCompleted >= 5,
    progress: (stats) => Math.min(100, (stats.sessionsCompleted / 5) * 100)
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Complete 50 pomodoro sessions',
    icon: 'fa-solid fa-hourglass-end',
    requirement: (stats) => stats.sessionsCompleted >= 50,
    progress: (stats) => Math.min(100, (stats.sessionsCompleted / 50) * 100)
  },
  {
    id: 'rc-collector',
    title: 'RC Collector',
    description: 'Collect 100 RC cells',
    icon: 'fa-solid fa-dna',
    requirement: (stats, profile) => profile.rcCells >= 100,
    progress: (stats, profile) => Math.min(100, (profile.rcCells / 100) * 100)
  },
  {
    id: 'ghoul-transformation',
    title: 'Ghoul Transformation',
    description: 'Unlock Ghoul Mode',
    icon: 'fa-solid fa-mask',
    requirement: (stats, profile) => profile.rcCells >= 200
  },
  {
    id: 'kagune-master',
    title: 'Kagune Master',
    description: 'Win 10 battles',
    icon: 'fa-solid fa-khanda',
    requirement: (stats) => stats.battlesWon >= 10,
    progress: (stats) => Math.min(100, (stats.battlesWon || 0) / 10 * 100)
  },
  {
    id: 'journal-keeper',
    title: 'Journal Keeper',
    description: 'Write 10 journal entries',
    icon: 'fa-solid fa-book',
    requirement: (stats) => stats.journalEntries >= 10,
    progress: (stats) => Math.min(100, (stats.journalEntries || 0) / 10 * 100)
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Maintain a 3-day streak',
    icon: 'fa-solid fa-fire',
    requirement: (stats) => stats.streak >= 3,
    progress: (stats) => Math.min(100, (stats.streak / 3) * 100)
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    description: 'Maintain a 7-day streak',
    icon: 'fa-solid fa-fire-flame-curved',
    requirement: (stats) => stats.streak >= 7,
    progress: (stats) => Math.min(100, (stats.streak / 7) * 100)
  },
  {
    id: 'time-warden',
    title: 'Time Warden',
    description: 'Accumulate 24 hours of focus time',
    icon: 'fa-solid fa-clock',
    requirement: (stats) => (stats.totalFocusTime || 0) >= 24 * 60,
    progress: (stats) => Math.min(100, ((stats.totalFocusTime || 0) / (24 * 60)) * 100)
  },
  {
    id: 'productivity-guru',
    title: 'Productivity Guru',
    description: 'Complete all basic achievements',
    icon: 'fa-solid fa-trophy',
    requirement: (stats, profile, achievements) => 
      achievements.filter(a => a.id !== 'productivity-guru' && a.unlocked).length >= 10
  }
];

/**
 * Initialize the stats system
 */
function initStatsSystem() {
  // Cache DOM elements
  elements.tasksCompleted = document.getElementById('tasks-completed');
  elements.focusTime = document.getElementById('focus-time');
  elements.streakDays = document.getElementById('streak-days');
  elements.rcCells = document.getElementById('rc-cells');
  elements.activityChart = document.getElementById('activity-chart');
  elements.taskChart = document.getElementById('task-chart');
  elements.achievementsGrid = document.getElementById('achievements-grid');
  elements.achievementsCount = document.getElementById('achievements-count');
  elements.timeButtons = document.querySelectorAll('.chart-action[data-period]');
  elements.viewButtons = document.querySelectorAll('.chart-action[data-view]');
  
  // Set up event listeners
  setupEventListeners();
  
  // Load user data
  loadUserData();
  
  // Setup firebase state subscription for realtime updates
  setupStateSubscription();
  
  // Initialize charts
  initializeCharts();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Time period buttons for activity chart
  elements.timeButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      elements.timeButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update current time period
      statsState.currentTimePeriod = button.dataset.period;
      
      // Update chart
      updateActivityChart();
    });
  });
  
  // View buttons for task chart
  elements.viewButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      elements.viewButtons.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Update current task view
      statsState.currentTaskView = button.dataset.view;
      
      // Update chart
      updateTaskChart();
    });
  });
}

/**
 * Set up Firebase state subscription
 */
function setupStateSubscription() {
  // Subscribe to profile updates
  firebaseState.subscribe('profile-updated', (profileData) => {
    if (statsState.userData && statsState.userData.profile) {
      statsState.userData.profile = profileData;
      updateStatCards();
      checkAchievements();
    }
  });
  
  // Subscribe to stats updates
  firebaseState.subscribe('stats-updated', (statsData) => {
    if (statsState.userData && statsState.userData.stats) {
      statsState.userData.stats = statsData;
      updateStatCards();
      checkAchievements();
    }
  });
}

/**
 * Load user data from Firebase
 */
function loadUserData() {
  const userId = auth.getCurrentUser().uid;
  
  // Get full user data
  firebaseBridge.loadUserData(userId).then(userData => {
    statsState.userData = userData;
    
    // Update stat cards
    updateStatCards();
    
    // Load tasks
    return db.get(`users/${userId}/tasks`);
  }).then(taskSnapshot => {
    statsState.tasks = taskSnapshot.val() || {};
    
    // Load sessions
    return db.get(`users/${userId}/sessions`);
  }).then(sessionSnapshot => {
    statsState.sessions = sessionSnapshot.val() || {};
    
    // Process data for charts
    processChartData();
    
    // Update charts
    updateCharts();
    
    // Check achievements
    checkAchievements();
  }).catch(error => {
    console.error('Error loading user data:', error);
  });
}

/**
 * Update stat cards with latest values
 */
function updateStatCards() {
  if (!statsState.userData) return;
  
  const { stats, profile } = statsState.userData;
  
  // Update tasks completed
  elements.tasksCompleted.textContent = stats.tasksCompleted || 0;
  
  // Update focus time (convert minutes to hours)
  const focusHours = Math.floor((stats.totalFocusTime || 0) / 60);
  elements.focusTime.textContent = focusHours;
  
  // Update streak
  elements.streakDays.textContent = stats.streak || 0;
  
  // Update RC cells
  elements.rcCells.textContent = profile.rcCells || 0;
}

/**
 * Process data for charts
 */
function processChartData() {
  // Process activity data for different time periods
  processActivityData();
  
  // Process task data for different views
  processTaskData();
}

/**
 * Process activity data for charts
 */
function processActivityData() {
  const now = new Date();
  const sessions = Object.values(statsState.sessions || {});
  const tasks = Object.values(statsState.tasks || {}).filter(task => task.completed);
  
  // Process week data (last 7 days)
  const weekData = Array(7).fill(0).map((_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      sessions: 0,
      tasks: 0
    };
  });
  
  // Process month data (last 30 days)
  const monthData = Array(30).fill(0).map((_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sessions: 0,
      tasks: 0
    };
  });
  
  // Process year data (last 12 months)
  const yearData = Array(12).fill(0).map((_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (11 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      sessions: 0,
      tasks: 0
    };
  });
  
  // Add session data to the appropriate time periods
  sessions.forEach(session => {
    const sessionDate = new Date(session.completedAt);
    
    // Week data (if within last 7 days)
    const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      weekData[6 - daysDiff].sessions++;
    }
    
    // Month data (if within last 30 days)
    if (daysDiff < 30) {
      monthData[29 - daysDiff].sessions++;
    }
    
    // Year data (if within last 12 months)
    const monthsDiff = (now.getFullYear() - sessionDate.getFullYear()) * 12 + now.getMonth() - sessionDate.getMonth();
    if (monthsDiff < 12) {
      yearData[11 - monthsDiff].sessions++;
    }
  });
  
  // Add task data to the appropriate time periods
  tasks.forEach(task => {
    if (!task.completedAt) return;
    
    const taskDate = new Date(task.completedAt);
    
    // Week data (if within last 7 days)
    const daysDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      weekData[6 - daysDiff].tasks++;
    }
    
    // Month data (if within last 30 days)
    if (daysDiff < 30) {
      monthData[29 - daysDiff].tasks++;
    }
    
    // Year data (if within last 12 months)
    const monthsDiff = (now.getFullYear() - taskDate.getFullYear()) * 12 + now.getMonth() - taskDate.getMonth();
    if (monthsDiff < 12) {
      yearData[11 - monthsDiff].tasks++;
    }
  });
  
  // Store processed data
  statsState.activityData = {
    week: weekData,
    month: monthData,
    year: yearData
  };
}

/**
 * Process task data for charts
 */
function processTaskData() {
  const tasks = Object.values(statsState.tasks || {}).filter(task => task.completed);
  const now = new Date();
  
  // Data for tasks by day
  const byDayData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    data: Array(7).fill(0)
  };
  
  // Data for tasks by category
  const categories = {};
  
  // Process tasks
  tasks.forEach(task => {
    if (!task.completedAt) return;
    
    const taskDate = new Date(task.completedAt);
    
    // Add to by-day data
    const dayOfWeek = taskDate.getDay();
    byDayData.data[dayOfWeek]++;
    
    // Add to by-category data
    const category = task.category || 'Uncategorized';
    categories[category] = (categories[category] || 0) + 1;
  });
  
  // Convert categories object to arrays for chart
  const byCategoryData = {
    labels: Object.keys(categories),
    data: Object.values(categories)
  };
  
  // Store processed data
  statsState.taskData = {
    byDay: byDayData,
    byCategory: byCategoryData
  };
}

/**
 * Initialize charts
 */
function initializeCharts() {
  // Get theme colors based on current mode
  const isDarkMode = document.body.classList.contains('dark-mode') || 
                    document.body.classList.contains('ghoul-mode');
  const colorTheme = isDarkMode ? chartColors.ghoul : chartColors.human;
  
  // Activity Chart
  activityChart = new Chart(elements.activityChart, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Tasks',
          data: [],
          backgroundColor: colorTheme.primary
        },
        {
          label: 'Focus Sessions',
          data: [],
          backgroundColor: colorTheme.secondary
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: colorTheme.grid
          },
          ticks: {
            color: colorTheme.text
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: colorTheme.text
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: colorTheme.text
          }
        }
      }
    }
  });
  
  // Task Chart
  taskChart = new Chart(elements.taskChart, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Tasks Completed',
          data: [],
          backgroundColor: colorTheme.tertiary
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: colorTheme.grid
          },
          ticks: {
            color: colorTheme.text
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: colorTheme.text
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: colorTheme.text
          }
        }
      }
    }
  });
}

/**
 * Update all charts
 */
function updateCharts() {
  updateActivityChart();
  updateTaskChart();
}

/**
 * Update activity chart with current data
 */
function updateActivityChart() {
  const data = statsState.activityData[statsState.currentTimePeriod];
  
  if (!data || !data.length) return;
  
  // Update chart data
  activityChart.data.labels = data.map(day => day.date);
  activityChart.data.datasets[0].data = data.map(day => day.tasks);
  activityChart.data.datasets[1].data = data.map(day => day.sessions);
  
  activityChart.update();
}

/**
 * Update task chart with current data
 */
function updateTaskChart() {
  const data = statsState.taskData[statsState.currentTaskView];
  
  if (!data) return;
  
  // Update chart type if needed
  if (statsState.currentTaskView === 'byCategory' && taskChart.config.type !== 'pie') {
    taskChart.destroy();
    taskChart = new Chart(elements.taskChart, {
      type: 'pie',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.data,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#8BC34A', '#F44336', '#3F51B5', '#009688'
            ]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: document.body.classList.contains('dark-mode') ? '#B0BEC5' : '#546E7A'
            }
          }
        }
      }
    });
  } else if (statsState.currentTaskView === 'byDay' && taskChart.config.type !== 'bar') {
    // Recreate as bar chart
    taskChart.destroy();
    
    // Get theme colors based on current mode
    const isDarkMode = document.body.classList.contains('dark-mode') || 
                      document.body.classList.contains('ghoul-mode');
    const colorTheme = isDarkMode ? chartColors.ghoul : chartColors.human;
    
    taskChart = new Chart(elements.taskChart, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Tasks Completed',
            data: data.data,
            backgroundColor: colorTheme.tertiary
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: colorTheme.grid
            },
            ticks: {
              color: colorTheme.text
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: colorTheme.text
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: colorTheme.text
            }
          }
        }
      }
    });
  } else {
    // Update existing chart
    taskChart.data.labels = data.labels;
    taskChart.data.datasets[0].data = data.data;
    taskChart.update();
  }
}

/**
 * Check and update achievements
 */
function checkAchievements() {
  if (!statsState.userData) return;
  
  const { stats, profile } = statsState.userData;
  
  // Add journal entries count if not present
  if (stats && !stats.journalEntries) {
    const journalEntries = statsState.userData.journal ? Object.keys(statsState.userData.journal).length : 0;
    stats.journalEntries = journalEntries;
  }
  
  // Process achievements
  statsState.achievements = achievementDefinitions.map(achievement => {
    // Check if achievement is unlocked
    const unlocked = achievement.requirement(stats, profile, statsState.achievements);
    
    // Calculate progress if available
    let progress = 0;
    if (achievement.progress) {
      progress = achievement.progress(stats, profile);
    } else if (unlocked) {
      progress = 100;
    }
    
    return {
      ...achievement,
      unlocked,
      progress
    };
  });
  
  // Update achievements display
  renderAchievements();
}

/**
 * Render achievements
 */
function renderAchievements() {
  if (!elements.achievementsGrid) return;
  
  // Clear current achievements
  elements.achievementsGrid.innerHTML = '';
  
  // Count unlocked achievements
  const unlockedCount = statsState.achievements.filter(a => a.unlocked).length;
  elements.achievementsCount.textContent = `${unlockedCount}/${statsState.achievements.length}`;
  
  // Render each achievement
  statsState.achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-card';
    
    const iconClass = achievement.unlocked ? 'unlocked' : 'locked';
    
    let progressBar = '';
    if (achievement.progress !== undefined) {
      progressBar = `
        <div class="achievement-progress">
          <div class="achievement-progress-bar" style="width: ${achievement.progress}%"></div>
        </div>
      `;
    }
    
    achievementElement.innerHTML = `
      <div class="achievement-icon ${iconClass}">
        <i class="${achievement.icon}"></i>
        ${!achievement.unlocked ? '<div class="lock"><i class="fa-solid fa-lock"></i></div>' : ''}
      </div>
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-desc">${achievement.description}</div>
      ${progressBar}
    `;
    
    elements.achievementsGrid.appendChild(achievementElement);
  });
}
