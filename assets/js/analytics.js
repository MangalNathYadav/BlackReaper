// Achievements and analytics system for BlackReaper

// Achievement definitions
const achievements = [
    {
        id: 'first_journal',
        name: 'First Confession',
        description: 'Create your first journal entry',
        icon: '📝',
        condition: (stats) => stats.journalCount >= 1
    },
    {
        id: 'task_master',
        name: 'Task Master',
        description: 'Complete 10 tasks',
        icon: '✓',
        condition: (stats) => stats.tasksCompleted >= 10
    },
    {
        id: 'dedicated_ghoul',
        name: 'Dedicated Ghoul',
        description: 'Spend over 1 hour in Ghoul Mode',
        icon: '👁️',
        condition: (stats) => stats.ghoulModeTime >= 60
    },
    {
        id: 'dark_writer',
        name: 'Dark Writer',
        description: 'Write 5 journal entries in Ghoul Mode',
        icon: '✒️',
        condition: (stats) => stats.ghoulJournals >= 5
    },
    {
        id: 'kagune_master',
        name: 'Kagune Master',
        description: 'Unlock all Kagune types',
        icon: '🔥',
        condition: (stats) => 
            stats.kaguneProgress.rinkaku >= 100 && 
            stats.kaguneProgress.ukaku >= 100 &&
            stats.kaguneProgress.koukaku >= 100 &&
            stats.kaguneProgress.bikaku >= 100
    },
    {
        id: 'rc_overload',
        name: 'RC Cell Overload',
        description: 'Reach maximum RC level',
        icon: '⚡',
        condition: (stats) => stats.rcLevel >= 100
    },
    {
        id: 'consistent_user',
        name: 'Consistent User',
        description: 'Use the app for 7 consecutive days',
        icon: '📆',
        condition: (stats) => stats.consecutiveDays >= 7
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Use the app after midnight',
        icon: '🦉',
        condition: (stats) => stats.nightOwl
    }
];

// User analytics data
let userAnalytics = {
    taskCompletionRate: 0,
    averageJournalLength: 0,
    moodDistribution: {},
    timeInGhoulMode: 0,
    timeInHumanMode: 0,
    preferredModePercentage: 0,
    visitsByTimeOfDay: {
        morning: 0,   // 6am-12pm
        afternoon: 0, // 12pm-6pm
        evening: 0,   // 6pm-12am
        night: 0      // 12am-6am
    },
    activityByDay: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
    }
};

// Track user session
function startUserSession() {
    // Get current time
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Record login time
    const sessionStart = {
        timestamp: now.getTime(),
        isGhoulMode: localStorage.getItem('ghoulMode') === 'true'
    };
    
    // Store session start in localStorage
    localStorage.setItem('sessionStart', JSON.stringify(sessionStart));
    
    // Update time of day analytics
    if (hour >= 6 && hour < 12) {
        incrementAnalytic('visitsByTimeOfDay', 'morning');
    } else if (hour >= 12 && hour < 18) {
        incrementAnalytic('visitsByTimeOfDay', 'afternoon');
    } else if (hour >= 18 && hour < 24) {
        incrementAnalytic('visitsByTimeOfDay', 'evening');
    } else {
        incrementAnalytic('visitsByTimeOfDay', 'night');
        // Set night owl achievement condition
        setAnalytic('nightOwl', true);
    }
    
    // Update day of week analytics
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    incrementAnalytic('activityByDay', days[day]);
    
    // Check for consecutive days
    trackConsecutiveDays();
}

// End user session and update analytics
function endUserSession() {
    const sessionStartJson = localStorage.getItem('sessionStart');
    
    if (sessionStartJson) {
        const sessionStart = JSON.parse(sessionStartJson);
        const now = new Date().getTime();
        const sessionDuration = (now - sessionStart.timestamp) / 60000; // in minutes
        
        // Update time in mode
        if (sessionStart.isGhoulMode) {
            incrementAnalytic('timeInGhoulMode', sessionDuration);
            
            // Update Firebase if user is logged in
            const uid = getCurrentUserId();
            if (uid) {
                window.BlackReaperDB.logGhoulModeTime(uid, sessionDuration);
            }
        } else {
            incrementAnalytic('timeInHumanMode', sessionDuration);
        }
        
        // Calculate mode preference
        const totalTime = getAnalytic('timeInGhoulMode') + getAnalytic('timeInHumanMode');
        if (totalTime > 0) {
            const ghoulPercentage = (getAnalytic('timeInGhoulMode') / totalTime) * 100;
            setAnalytic('preferredModePercentage', ghoulPercentage);
        }
        
        // Clear session start
        localStorage.removeItem('sessionStart');
    }
}

// Track consecutive days of use
function trackConsecutiveDays() {
    const lastVisit = localStorage.getItem('lastVisitDate');
    const today = new Date().toDateString();
    
    if (lastVisit) {
        // Convert to dates for comparison
        const lastDate = new Date(lastVisit);
        const currentDate = new Date(today);
        
        // Calculate difference in days
        const timeDiff = currentDate.getTime() - lastDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        // If it's the next day, increment consecutive days
        if (dayDiff === 1) {
            const currentStreak = parseInt(localStorage.getItem('consecutiveDays') || '0');
            localStorage.setItem('consecutiveDays', (currentStreak + 1).toString());
            
            // Update user profile in Firebase if logged in
            const uid = getCurrentUserId();
            if (uid) {
                const streak = currentStreak + 1;
                window.BlackReaperDB.updateUserProfile(uid, { consecutiveDays: streak });
            }
        } 
        // If more than one day has passed, reset streak
        else if (dayDiff > 1) {
            localStorage.setItem('consecutiveDays', '1');
            
            // Update user profile in Firebase if logged in
            const uid = getCurrentUserId();
            if (uid) {
                window.BlackReaperDB.updateUserProfile(uid, { consecutiveDays: 1 });
            }
        }
    } else {
        // First visit, set consecutive days to 1
        localStorage.setItem('consecutiveDays', '1');
    }
    
    // Update last visit date
    localStorage.setItem('lastVisitDate', today);
}

// Get current user ID helper
function getCurrentUserId() {
    // This would check Firebase Auth
    return localStorage.getItem('userEmail') || null;
}

// Helper to get analytic value
function getAnalytic(category, subcategory = null) {
    if (subcategory) {
        return parseFloat(localStorage.getItem(`analytics_${category}_${subcategory}`) || '0');
    }
    return parseFloat(localStorage.getItem(`analytics_${category}`) || '0');
}

// Helper to set analytic value
function setAnalytic(category, value, subcategory = null) {
    if (subcategory) {
        localStorage.setItem(`analytics_${category}_${subcategory}`, value.toString());
    } else {
        localStorage.setItem(`analytics_${category}`, value.toString());
    }
}

// Helper to increment analytic value
function incrementAnalytic(category, subcategory = null, amount = 1) {
    const current = getAnalytic(category, subcategory);
    setAnalytic(category, current + amount, subcategory);
}

// Check for achieved achievements
function checkAchievements() {
    // Get user stats
    const uid = getCurrentUserId();
    if (!uid) return Promise.resolve([]);
    
    // Get user profile from Firebase
    return window.BlackReaperDB.getUserProfile(uid)
        .then(profile => {
            // Combine with local analytics
            const stats = {
                ...profile,
                consecutiveDays: parseInt(localStorage.getItem('consecutiveDays') || '0'),
                nightOwl: getAnalytic('nightOwl') === 1,
                ghoulJournals: parseInt(localStorage.getItem('ghoulJournals') || '0'),
            };
            
            // Check each achievement
            const achieved = [];
            
            achievements.forEach(achievement => {
                // Check if condition is met
                if (achievement.condition(stats)) {
                    achieved.push(achievement);
                    
                    // Store achievement if not already recorded
                    const achievedList = JSON.parse(localStorage.getItem('achievements') || '[]');
                    if (!achievedList.includes(achievement.id)) {
                        achievedList.push(achievement.id);
                        localStorage.setItem('achievements', JSON.stringify(achievedList));
                        
                        // Show achievement notification
                        showAchievementNotification(achievement);
                    }
                }
            });
            
            return achieved;
        });
}

// Display achievement notification
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
            <h3>${achievement.name}</h3>
            <p>${achievement.description}</p>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after display
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

// Update mood distribution analytics
function updateMoodAnalytics(mood) {
    // Get current distribution
    const distribution = JSON.parse(localStorage.getItem('moodDistribution') || '{}');
    
    // Increment count for this mood
    distribution[mood] = (distribution[mood] || 0) + 1;
    
    // Save updated distribution
    localStorage.setItem('moodDistribution', JSON.stringify(distribution));
}

// Update journal analytics
function updateJournalAnalytics(journalText) {
    // Track journal length
    const journalCount = getAnalytic('journalCount');
    const totalLength = getAnalytic('totalJournalLength');
    
    setAnalytic('journalCount', journalCount + 1);
    setAnalytic('totalJournalLength', totalLength + journalText.length);
    
    // Calculate average length
    const averageLength = (totalLength + journalText.length) / (journalCount + 1);
    setAnalytic('averageJournalLength', averageLength);
    
    // Track if in ghoul mode
    if (localStorage.getItem('ghoulMode') === 'true') {
        incrementAnalytic('ghoulJournals');
    }
}

// Update task analytics
function updateTaskAnalytics(completed, total) {
    // Calculate completion rate
    const completionRate = (completed / total) * 100;
    setAnalytic('taskCompletionRate', completionRate);
}

// Get user analytics summary
function getAnalyticsSummary() {
    // Build analytics object
    userAnalytics = {
        taskCompletionRate: getAnalytic('taskCompletionRate'),
        averageJournalLength: getAnalytic('averageJournalLength'),
        moodDistribution: JSON.parse(localStorage.getItem('moodDistribution') || '{}'),
        timeInGhoulMode: getAnalytic('timeInGhoulMode'),
        timeInHumanMode: getAnalytic('timeInHumanMode'),
        preferredModePercentage: getAnalytic('preferredModePercentage'),
        visitsByTimeOfDay: {
            morning: getAnalytic('visitsByTimeOfDay', 'morning'),
            afternoon: getAnalytic('visitsByTimeOfDay', 'afternoon'),
            evening: getAnalytic('visitsByTimeOfDay', 'evening'),
            night: getAnalytic('visitsByTimeOfDay', 'night')
        },
        activityByDay: {
            monday: getAnalytic('activityByDay', 'monday'),
            tuesday: getAnalytic('activityByDay', 'tuesday'),
            wednesday: getAnalytic('activityByDay', 'wednesday'),
            thursday: getAnalytic('activityByDay', 'thursday'),
            friday: getAnalytic('activityByDay', 'friday'),
            saturday: getAnalytic('activityByDay', 'saturday'),
            sunday: getAnalytic('activityByDay', 'sunday')
        }
    };
    
    return userAnalytics;
}

// Initialize analytics when document loads
document.addEventListener('DOMContentLoaded', () => {
    // Start user session
    startUserSession();
    
    // Register end session on page unload
    window.addEventListener('beforeunload', endUserSession);
    
    // Check for achievements
    if (typeof BlackReaperDB !== 'undefined') {
        setTimeout(() => {
            checkAchievements();
        }, 2000); // Delay to ensure Firebase is initialized
    }
});

// Export analytics for use in other scripts
window.BlackReaperAnalytics = {
    updateMoodAnalytics,
    updateJournalAnalytics,
    updateTaskAnalytics,
    getAnalyticsSummary,
    checkAchievements
};
