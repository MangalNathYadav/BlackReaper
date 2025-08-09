// Notification system for BlackReaper

// Container for notifications
const notificationContainer = document.createElement('div');
notificationContainer.className = 'notification-container';

// Initialize notification system
function initNotificationSystem() {
    // Add container to body
    document.body.appendChild(notificationContainer);
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            max-width: 350px;
            z-index: 9999;
        }
        
        .notification {
            background-color: var(--card-bg);
            color: var(--text);
            border-left: 4px solid var(--accent);
            border-radius: 4px;
            padding: 12px 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            display: flex;
            transform: translateX(400px);
            opacity: 0;
            transition: transform 0.3s ease, opacity 0.3s ease;
            cursor: pointer;
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.success {
            border-color: #4caf50;
        }
        
        .notification.error {
            border-color: #f44336;
        }
        
        .notification.warning {
            border-color: #ff9800;
        }
        
        .notification.info {
            border-color: #2196f3;
        }
        
        .notification.achievement {
            border-color: #9c27b0;
        }
        
        .notification-icon {
            margin-right: 12px;
            font-size: 1.5rem;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-title {
            font-weight: bold;
            margin-bottom: 4px;
        }
        
        .notification-message {
            font-size: 0.9rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text);
            font-size: 1rem;
            cursor: pointer;
            opacity: 0.7;
            padding: 0;
            margin-left: 10px;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification.ghoul-mode {
            background-color: var(--bg-ghoul);
            color: var(--text-ghoul);
        }
        
        .notification.ghoul-mode .notification-close {
            color: var(--text-ghoul);
        }
        
        /* Glitch effect for notifications in ghoul mode */
        .notification.glitching {
            animation: notif-glitch 0.3s infinite;
        }
        
        @keyframes notif-glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(2px, -2px); }
            60% { transform: translate(-2px, -2px); }
            80% { transform: translate(2px, 2px); }
            100% { transform: translate(0); }
        }
    `;
    document.head.appendChild(style);
}

// Show notification
function showNotification(options) {
    const defaults = {
        type: 'info',           // info, success, warning, error, achievement
        title: 'Notification',
        message: '',
        icon: '💬',
        duration: 5000,         // ms before auto-close, 0 to disable
        clickToClose: true,
        glitchEffect: false
    };
    
    // Merge options with defaults
    const settings = { ...defaults, ...options };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${settings.type}`;
    
    // Add ghoul mode class if active
    if (localStorage.getItem('ghoulMode') === 'true') {
        notification.classList.add('ghoul-mode');
        
        // Add glitch effect if specified
        if (settings.glitchEffect) {
            notification.classList.add('glitching');
        }
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-icon">${settings.icon}</div>
        <div class="notification-content">
            <div class="notification-title">${settings.title}</div>
            <div class="notification-message">${settings.message}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Show notification (delay for transition effect)
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Setup close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNotification(notification);
    });
    
    // Click to close
    if (settings.clickToClose) {
        notification.addEventListener('click', () => {
            closeNotification(notification);
        });
    }
    
    // Auto close after duration
    if (settings.duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, settings.duration);
    }
    
    // Play sound effect for notification
    playNotificationSound(settings.type);
    
    return notification;
}

// Close notification
function closeNotification(notification) {
    // Remove show class for transition effect
    notification.classList.remove('show');
    
    // Remove from DOM after transition
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Close all notifications
function closeAllNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        closeNotification(notification);
    });
}

// Play notification sound
function playNotificationSound(type) {
    // Check if audio is enabled
    const audioElement = document.getElementById('background-audio');
    if (audioElement && !audioElement.paused) {
        // Create sound effect
        const sound = new Audio();
        
        // Set source based on type
        switch (type) {
            case 'success':
                sound.src = 'assets/audio/success.mp3';
                break;
            case 'error':
                sound.src = 'assets/audio/error.mp3';
                break;
            case 'warning':
                sound.src = 'assets/audio/warning.mp3';
                break;
            case 'achievement':
                sound.src = 'assets/audio/achievement.mp3';
                break;
            default:
                sound.src = 'assets/audio/notification.mp3';
        }
        
        // Play sound
        sound.volume = 0.5;
        sound.play().catch(e => console.log('Error playing notification sound:', e));
    }
}

// Show achievement notification
function showAchievementNotification(achievement) {
    return showNotification({
        type: 'achievement',
        title: `Achievement Unlocked: ${achievement.name}`,
        message: achievement.description,
        icon: achievement.icon || '🏆',
        duration: 8000,
        glitchEffect: true
    });
}

// Show task completed notification
function showTaskCompletedNotification(taskText) {
    return showNotification({
        type: 'success',
        title: 'Task Completed',
        message: `You completed: "${taskText}"`,
        icon: '✅',
        duration: 3000
    });
}

// Show journal saved notification
function showJournalSavedNotification() {
    return showNotification({
        type: 'success',
        title: 'Journal Entry Saved',
        message: 'Your thoughts have been preserved.',
        icon: '📝',
        duration: 3000
    });
}

// Show RC level increase notification
function showRCLevelNotification(newLevel) {
    let message = 'Your RC cell count has increased.';
    let icon = '⬆️';
    
    // Special message for high levels
    if (newLevel >= 100) {
        message = 'Maximum RC level reached! Your kagune has fully developed.';
        icon = '⚡';
        
        // Dispatch event for kagune animation
        document.dispatchEvent(new CustomEvent('maxRCLevel'));
    }
    else if (newLevel >= 90) {
        message = 'Your RC level is nearing its peak. Full kagune manifestation imminent.';
        icon = '🔥';
    }
    
    return showNotification({
        type: 'info',
        title: `RC Level: ${newLevel}`,
        message: message,
        icon: icon,
        duration: 4000,
        glitchEffect: newLevel >= 90
    });
}

// Show mode change notification
function showModeChangeNotification(isGhoulMode) {
    if (isGhoulMode) {
        return showNotification({
            type: 'warning',
            title: 'Ghoul Mode Activated',
            message: 'Your darker side emerges...',
            icon: '👁️',
            duration: 4000,
            glitchEffect: true
        });
    } else {
        return showNotification({
            type: 'info',
            title: 'Human Mode Activated',
            message: 'Returning to humanity.',
            icon: '😌',
            duration: 3000
        });
    }
}

// Initialize notification system when document loads
document.addEventListener('DOMContentLoaded', () => {
    initNotificationSystem();
});

// Export notification functions
window.BlackReaperNotifications = {
    show: showNotification,
    close: closeNotification,
    closeAll: closeAllNotifications,
    showAchievement: showAchievementNotification,
    showTaskCompleted: showTaskCompletedNotification,
    showJournalSaved: showJournalSavedNotification,
    showRCLevel: showRCLevelNotification,
    showModeChange: showModeChangeNotification
};
