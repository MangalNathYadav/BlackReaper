// Stats tracking and visualization for BlackReaper
import { 
  r, 
  db, 
  getData, 
  onValueChange, 
  getServerTimestamp, 
  orderByChild, 
  query, 
  limitToLast 
} from "../firebase/firebase.js";
import stateManager from "../firebase/state.js";
import ui from "../firebase/ui.js";

/**
 * StatsManager - Handles stats tracking and visualization
 */
class StatsManager {
  constructor() {
    this.charts = {};
    this.userStats = null;
    this.battles = [];
    this.achievements = [];
    
    // Initialize
    this.init();
  }

  /**
   * Initialize stats functionality
   */
  async init() {
    // Listen for DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupStats());
    } else {
      this.setupStats();
    }
    
    // Listen for stats updates
    document.addEventListener('blackreaper.statsUpdated', (event) => {
      this.userStats = event.detail;
      this.updateStatsUI();
      // Robust sidebar update
      function updateSidebar() {
        const sidebarUserName = document.querySelector('.sidebar .user-name');
        const sidebarRC = document.getElementById('rc-cell-count');
        if (sidebarUserName && sidebarRC) {
          sidebarUserName.textContent = event.detail.displayName || 'Anonymous Ghoul';
          sidebarRC.textContent = event.detail.rcCells || 0;
        } else {
          // Retry after short delay if sidebar not ready
          setTimeout(updateSidebar, 100);
        }
      }
      updateSidebar();
    });
  }

  /**
   * Set up stats UI and event listeners
   */
  setupStats() {
    // Load Chart.js if not already loaded
    this.loadChartJs().then(() => {
      // Load data for stats
      this.loadStatsData();
    });
  }
  
  /**
   * Load Chart.js library
   * @returns {Promise} Promise that resolves when Chart.js is loaded
   */
  loadChartJs() {
    return new Promise((resolve) => {
      if (window.Chart) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  /**
   * Load stats data from database
   */
  async loadStatsData() {
    if (!stateManager.user) return;
    
    try {
      // Show loading spinners
      const containers = [
        'stats-summary', 
        'rc-growth-chart-container', 
        'daily-activity-chart-container',
        'mode-usage-chart-container',
        'task-distribution-chart-container',
        'achievements-container'
      ];
      
      const spinners = containers.map(id => {
        const container = document.getElementById(id);
        return container ? ui.spinner(container, 'Loading...') : null;
      }).filter(Boolean);
      
      // Set up real-time listener for user stats
      onValueChange(`users/${stateManager.user.uid}/stats`, ({ exists, data }) => {
        if (exists && data) {
          this.userStats = data;
          this.updateStatsUI();
        }
      });
      
      // Load battles
      const battlesResult = await getData(`battles/${stateManager.user.uid}`);
      if (battlesResult.exists && battlesResult.data) {
        this.battles = Object.keys(battlesResult.data).map(id => ({
          id,
          ...battlesResult.data[id]
        }));
        
        // Sort battles by timestamp
        this.battles.sort((a, b) => a.ts - b.ts);
      }
      
      // Load achievements
      const achievementsResult = await getData('achievements');
      if (achievementsResult.exists && achievementsResult.data) {
        const achievementsList = Object.keys(achievementsResult.data).map(id => ({
          id,
          ...achievementsResult.data[id]
        }));
        
        // Load user achievement progress
        const userAchievementsResult = await getData(`users/${stateManager.user.uid}/achievements`);
        const userAchievements = userAchievementsResult.exists ? userAchievementsResult.data : {};
        
        // Combine achievements with user progress
        this.achievements = achievementsList.map(achievement => {
          const userProgress = userAchievements[achievement.id] || { unlockedAt: null, progress: 0 };
          
          return {
            ...achievement,
            ...userProgress,
            isUnlocked: !!userProgress.unlockedAt
          };
        });
      }
      
      // Initialize charts after data is loaded
      this.initializeCharts();
      
      // Render achievements
      this.renderAchievements();
      
      // Remove spinners
      spinners.forEach(spinner => spinner.remove());
    } catch (error) {
      console.error('Error loading stats data:', error);
      ui.toast('Failed to load stats data', 'error');
    }
  }

  /**
   * Update stats summary UI
   */
  updateStatsUI() {
    if (!this.userStats) return;
    
    // Update stats tiles
    const statTiles = {
      'tasks-completed': this.userStats.tasksCompleted || 0,
      'pomodoros-completed': this.userStats.pomodoros || 0,
      'journal-entries': this.userStats.journalEntries || 0,
      'battles-total': this.userStats.battles || 0,
      'battles-won': this.userStats.battlesWon || 0,
      'focus-time': this.formatFocusTime(this.userStats.focusTimeMins || 0),
      'win-rate': this.calculateWinRate(this.userStats.battlesWon || 0, this.userStats.battles || 0),
      'active-days': this.userStats.activeDays || 1
    };
    
    Object.keys(statTiles).forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = statTiles[id];
      }
    });
    
    // Update charts if they exist
    if (this.charts.taskDistribution) {
      this.updateTaskDistributionChart();
    }
  }

  /**
   * Initialize charts
   */
  initializeCharts() {
    // RC Growth Chart
    this.initializeRCGrowthChart();
    
    // Daily Activity Chart
    this.initializeDailyActivityChart();
    
    // Mode Usage Chart
    this.initializeModeUsageChart();
    
    // Task Distribution Chart
    this.initializeTaskDistributionChart();
  }

  /**
   * Initialize RC growth chart
   */
  async initializeRCGrowthChart() {
    const canvas = document.getElementById('rc-growth-chart');
    if (!canvas) return;
    
    try {
      // Calculate RC growth over time from battle history
      const rcData = await this.calculateRCGrowthData();
      
      // Create chart
      this.charts.rcGrowth = new Chart(canvas, {
        type: 'line',
        data: {
          labels: rcData.labels,
          datasets: [{
            label: 'RC Cells',
            data: rcData.data,
            borderColor: '#e53935',
            backgroundColor: 'rgba(229, 57, 53, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (items) => {
                  if (items.length > 0) {
                    return `Day ${items[0].label}`;
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Days'
              }
            },
            y: {
              title: {
                display: true,
                text: 'RC Cells'
              },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing RC growth chart:', error);
    }
  }

  /**
   * Calculate RC growth data from battle history
   * @returns {Object} Chart data and labels
   */
  async calculateRCGrowthData() {
    // Get current RC value
    const currentRC = stateManager.profile?.rc || 100;
    
    // If no battles, just return current RC
    if (!this.battles || this.battles.length === 0) {
      return {
        labels: ['Start', 'Now'],
        data: [100, currentRC]
      };
    }
    
    // Group battles by day
    const battlesByDay = {};
    const startDate = new Date(this.battles[0].ts);
    const today = new Date();
    const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Initialize with starting RC
    let runningRC = 100;
    const rcByDay = [100];
    const labels = ['Start'];
    
    // Calculate RC for each day
    for (let i = 1; i <= dayDiff; i++) {
      // Find battles for this day
      const dayBattles = this.battles.filter(battle => {
        const battleDate = new Date(battle.ts);
        return Math.floor((battleDate - startDate) / (1000 * 60 * 60 * 24)) + 1 === i;
      });
      
      // Add RC from battles
      dayBattles.forEach(battle => {
        runningRC += battle.rcDelta || 0;
      });
      
      rcByDay.push(runningRC);
      labels.push(i.toString());
    }
    
    // Ensure last value matches current RC
    if (rcByDay[rcByDay.length - 1] !== currentRC) {
      rcByDay[rcByDay.length - 1] = currentRC;
    }
    
    return {
      labels,
      data: rcByDay
    };
  }

  /**
   * Initialize daily activity chart
   */
  async initializeDailyActivityChart() {
    const canvas = document.getElementById('daily-activity-chart');
    if (!canvas) return;
    
    try {
      // Calculate activity by day
      const activityData = await this.calculateDailyActivityData();
      
      // Create chart
      this.charts.dailyActivity = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: activityData.labels,
          datasets: [{
            label: 'Activities',
            data: activityData.data,
            backgroundColor: '#7e57c2',
            borderColor: '#5e35b1',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Activity Count'
              },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing daily activity chart:', error);
    }
  }

  /**
   * Calculate daily activity data
   * @returns {Object} Chart data and labels
   */
  async calculateDailyActivityData() {
    try {
      // Get user activity data
      const activityResult = await getData(`users/${stateManager.user.uid}/activity`);
      
      if (!activityResult.exists || !activityResult.data) {
        return {
          labels: ['No Data'],
          data: [0]
        };
      }
      
      // Convert to array
      const activities = Object.values(activityResult.data);
      
      // Group by date
      const activityByDate = {};
      
      activities.forEach(activity => {
        const date = new Date(activity.ts);
        const dateString = date.toLocaleDateString();
        
        if (!activityByDate[dateString]) {
          activityByDate[dateString] = 0;
        }
        
        activityByDate[dateString]++;
      });
      
      // Sort dates
      const sortedDates = Object.keys(activityByDate).sort((a, b) => {
        return new Date(a) - new Date(b);
      });
      
      // Limit to last 7 days
      const labels = sortedDates.slice(-7);
      const data = labels.map(date => activityByDate[date]);
      
      return { labels, data };
    } catch (error) {
      console.error('Error calculating daily activity:', error);
      return {
        labels: ['Error'],
        data: [0]
      };
    }
  }

  /**
   * Initialize mode usage chart
   */
  async initializeModeUsageChart() {
    const canvas = document.getElementById('mode-usage-chart');
    if (!canvas) return;
    
    try {
      // Get mode usage data
      const modeData = await this.calculateModeUsageData();
      
      // Create chart
      this.charts.modeUsage = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Human Mode', 'Ghoul Mode'],
          datasets: [{
            data: modeData,
            backgroundColor: ['#42a5f5', '#e53935'],
            borderColor: ['#1e88e5', '#c62828'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${percentage}%`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing mode usage chart:', error);
    }
  }

  /**
   * Calculate mode usage data
   * @returns {Array} Mode usage data [humanTime, ghoulTime]
   */
  async calculateModeUsageData() {
    try {
      // Get mode toggle data
      const activityResult = await getData(`users/${stateManager.user.uid}/activity`);
      
      if (!activityResult.exists || !activityResult.data) {
        // Default to 50/50 split if no data
        return [50, 50];
      }
      
      // Convert to array and filter for mode changes
      const activities = Object.values(activityResult.data)
        .filter(activity => 
          activity.type === 'profile' && 
          (activity.message.includes('human mode') || activity.message.includes('ghoul mode'))
        );
      
      // Count mode changes
      const modeChanges = {
        human: 0,
        ghoul: 0
      };
      
      activities.forEach(activity => {
        if (activity.message.includes('human mode')) {
          modeChanges.human++;
        } else if (activity.message.includes('ghoul mode')) {
          modeChanges.ghoul++;
        }
      });
      
      // If no changes recorded, use current mode as indicator
      if (modeChanges.human === 0 && modeChanges.ghoul === 0) {
        const currentMode = stateManager.profile?.mode || 'human';
        return currentMode === 'human' ? [75, 25] : [25, 75];
      }
      
      // Calculate percentages
      const total = modeChanges.human + modeChanges.ghoul;
      const humanPercentage = Math.max(10, Math.round((modeChanges.human / total) * 100));
      const ghoulPercentage = 100 - humanPercentage;
      
      return [humanPercentage, ghoulPercentage];
    } catch (error) {
      console.error('Error calculating mode usage:', error);
      return [50, 50]; // Default to even split on error
    }
  }

  /**
   * Initialize task distribution chart
   */
  async initializeTaskDistributionChart() {
    const canvas = document.getElementById('task-distribution-chart');
    if (!canvas) return;
    
    try {
      // Get task distribution data
      const taskData = await this.calculateTaskDistributionData();
      
      // Create chart
      this.charts.taskDistribution = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: ['Completed', 'Active'],
          datasets: [{
            data: taskData,
            backgroundColor: ['#66bb6a', '#ffa726'],
            borderColor: ['#43a047', '#fb8c00'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error initializing task distribution chart:', error);
    }
  }

  /**
   * Calculate task distribution data
   * @returns {Array} Task data [completed, active]
   */
  async calculateTaskDistributionData() {
    try {
      // Get tasks data
      const tasksResult = await getData(`users/${stateManager.user.uid}/tasks`);
      
      if (!tasksResult.exists || !tasksResult.data) {
        return [0, 0]; // No tasks
      }
      
      // Count completed and active tasks
      let completed = 0;
      let active = 0;
      
      Object.values(tasksResult.data).forEach(task => {
        if (task.completed) {
          completed++;
        } else {
          active++;
        }
      });
      
      return [completed, active];
    } catch (error) {
      console.error('Error calculating task distribution:', error);
      return [0, 0];
    }
  }

  /**
   * Update task distribution chart with latest data
   */
  async updateTaskDistributionChart() {
    if (!this.charts.taskDistribution) return;
    
    try {
      const taskData = await this.calculateTaskDistributionData();
      
      this.charts.taskDistribution.data.datasets[0].data = taskData;
      this.charts.taskDistribution.update();
    } catch (error) {
      console.error('Error updating task distribution chart:', error);
    }
  }

  /**
   * Render achievements
   */
  renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container || !this.achievements) return;
    
    if (this.achievements.length === 0) {
      container.innerHTML = '<div class="no-achievements">No achievements available</div>';
      return;
    }
    
    container.innerHTML = '';
    
    // Group achievements by status (unlocked first)
    const unlockedAchievements = this.achievements.filter(a => a.isUnlocked);
    const lockedAchievements = this.achievements.filter(a => !a.isUnlocked);
    
    // Create unlocked achievements section
    if (unlockedAchievements.length > 0) {
      const unlockedSection = document.createElement('div');
      unlockedSection.className = 'achievements-section';
      unlockedSection.innerHTML = '<h3 class="section-title">Unlocked</h3>';
      
      const unlockedGrid = document.createElement('div');
      unlockedGrid.className = 'achievements-grid';
      
      unlockedAchievements.forEach(achievement => {
        unlockedGrid.appendChild(this.createAchievementElement(achievement));
      });
      
      unlockedSection.appendChild(unlockedGrid);
      container.appendChild(unlockedSection);
    }
    
    // Create locked achievements section
    if (lockedAchievements.length > 0) {
      const lockedSection = document.createElement('div');
      lockedSection.className = 'achievements-section';
      lockedSection.innerHTML = '<h3 class="section-title">Locked</h3>';
      
      const lockedGrid = document.createElement('div');
      lockedGrid.className = 'achievements-grid';
      
      lockedAchievements.forEach(achievement => {
        lockedGrid.appendChild(this.createAchievementElement(achievement));
      });
      
      lockedSection.appendChild(lockedGrid);
      container.appendChild(lockedSection);
    }
  }

  /**
   * Create achievement element
   * @param {Object} achievement - Achievement data
   * @returns {HTMLElement} Achievement element
   */
  createAchievementElement(achievement) {
    const achievementEl = document.createElement('div');
    achievementEl.className = `achievement-item ${achievement.isUnlocked ? 'unlocked' : 'locked'}`;
    
    // Calculate progress percentage
    const progress = achievement.isUnlocked ? 100 : (achievement.progress || 0);
    const progressPercentage = Math.min(100, Math.max(0, progress));
    
    // Format unlock date if available
    let unlockDateStr = '';
    if (achievement.unlockedAt) {
      const unlockDate = new Date(achievement.unlockedAt);
      unlockDateStr = unlockDate.toLocaleDateString();
    }
    
    achievementEl.innerHTML = `
      <div class="achievement-icon">
        <i class="${achievement.icon || 'fas fa-trophy'}"></i>
      </div>
      <div class="achievement-content">
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
        ${unlockDateStr ? `<div class="achievement-date">Unlocked on ${unlockDateStr}</div>` : ''}
        <div class="achievement-progress-bar">
          <div class="progress-fill" style="width: ${progressPercentage}%"></div>
        </div>
        <div class="achievement-progress-text">${progressPercentage}%</div>
      </div>
    `;
    
    return achievementEl;
  }

  /**
   * Format focus time in minutes to readable format
   * @param {number} minutes - Focus time in minutes
   * @returns {string} Formatted time
   */
  formatFocusTime(minutes) {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Calculate win rate percentage
   * @param {number} won - Battles won
   * @param {number} total - Total battles
   * @returns {string} Win rate percentage
   */
  calculateWinRate(won, total) {
    if (total === 0) return '0%';
    
    const percentage = Math.round((won / total) * 100);
    return `${percentage}%`;
  }
}

// Initialize stats manager when the script loads
const statsManager = new StatsManager();
export default statsManager;
