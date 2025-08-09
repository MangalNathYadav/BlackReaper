/**
 * BlackReaper Pomodoro Timer
 * A Tokyo Ghoul themed productivity timer
 */

const BlackReaperPomodoro = (() => {
    // Default timer settings
    const DEFAULT_SETTINGS = {
        workTime: 25 * 60, // 25 minutes in seconds
        shortBreak: 5 * 60, // 5 minutes in seconds
        longBreak: 15 * 60, // 15 minutes in seconds
        longBreakInterval: 4, // After 4 pomodoros
        autoStart: false
    };
    
    // Private variables
    let settings = {...DEFAULT_SETTINGS};
    let timerType = 'work'; // 'work', 'shortBreak', or 'longBreak'
    let timeRemaining = settings.workTime;
    let isRunning = false;
    let interval = null;
    let pomodorosCompleted = 0;
    let timerElement = null;
    let timerControlsElement = null;
    let timerActionButton = null;
    let timerResetButton = null;
    let timerSkipButton = null;
    let timerLabelElement = null;
    let progressRingElement = null;
    
    // Initialize pomodoro timer
    function init() {
        // Load settings from localStorage
        loadSettings();
        
        // Create timer UI
        createTimerUI();
        
        // Add event listeners
        setupEventListeners();
        
        // Update timer display
        updateTimerDisplay();
    }
    
    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('pomodoro_settings');
        if (savedSettings) {
            try {
                settings = {...DEFAULT_SETTINGS, ...JSON.parse(savedSettings)};
            } catch (e) {
                console.error('Error parsing pomodoro settings:', e);
            }
        }
        
        // Initialize time remaining based on timer type
        resetTimer();
    }
    
    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
    }
    
    // Create timer UI
    function createTimerUI() {
        // Check if timer container already exists
        if (document.getElementById('pomodoro-timer')) {
            timerElement = document.getElementById('pomodoro-timer');
            timerControlsElement = document.getElementById('timer-controls');
            timerActionButton = document.getElementById('timer-action');
            timerResetButton = document.getElementById('timer-reset');
            timerSkipButton = document.getElementById('timer-skip');
            timerLabelElement = document.getElementById('timer-label');
            progressRingElement = document.querySelector('.progress-ring-circle');
            return;
        }
        
        // Create timer container
        const timerContainer = document.createElement('div');
        timerContainer.id = 'pomodoro-container';
        timerContainer.className = 'pomodoro-container';
        
        // Create inner HTML
        timerContainer.innerHTML = `
            <div class="pomodoro-header">
                <h3>Focus Timer</h3>
                <button id="timer-settings" class="timer-settings-btn">⚙️</button>
            </div>
            
            <div class="timer-type-selector">
                <button data-type="work" class="active">Work</button>
                <button data-type="shortBreak">Short Break</button>
                <button data-type="longBreak">Long Break</button>
            </div>
            
            <div id="pomodoro-timer" class="pomodoro-timer">
                <div class="timer-ring">
                    <svg class="progress-ring" width="200" height="200">
                        <circle class="progress-ring-circle-bg" cx="100" cy="100" r="90" />
                        <circle class="progress-ring-circle" cx="100" cy="100" r="90" />
                    </svg>
                    <div class="timer-display">
                        <div id="timer-time" class="timer-time">25:00</div>
                        <div id="timer-label" class="timer-label">Focus Time</div>
                    </div>
                </div>
                
                <div id="timer-controls" class="timer-controls">
                    <button id="timer-action" class="timer-action">Start</button>
                    <button id="timer-reset" class="timer-reset">Reset</button>
                    <button id="timer-skip" class="timer-skip">Skip</button>
                </div>
            </div>
            
            <div class="pomodoro-stats">
                <div class="pomodoro-counter">
                    <span id="pomodoros-completed">0</span> pomodoros completed
                </div>
            </div>
        `;
        
        // Find appropriate place to add timer
        let targetContainer;
        
        // Check if we're on dashboard
        const dashboardContainer = document.querySelector('.dashboard-container');
        
        if (dashboardContainer) {
            // Create a section for the pomodoro timer
            const pomodoroSection = document.createElement('div');
            pomodoroSection.className = 'pomodoro-section';
            pomodoroSection.appendChild(timerContainer);
            
            // Add to dashboard
            dashboardContainer.appendChild(pomodoroSection);
        } else {
            // Add to any container
            targetContainer = document.querySelector('.container');
            if (targetContainer) {
                targetContainer.appendChild(timerContainer);
            } else {
                // Last resort: add to body
                document.body.appendChild(timerContainer);
            }
        }
        
        // Add CSS
        if (!document.getElementById('pomodoro-styles')) {
            const styles = document.createElement('style');
            styles.id = 'pomodoro-styles';
            styles.textContent = `
                .pomodoro-container {
                    background-color: var(--card-bg);
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    max-width: 320px;
                    margin: 20px auto;
                }
                
                .pomodoro-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .pomodoro-header h3 {
                    margin: 0;
                }
                
                .timer-settings-btn {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: var(--text);
                }
                
                .timer-type-selector {
                    display: flex;
                    margin-bottom: 15px;
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 4px;
                    padding: 4px;
                }
                
                .timer-type-selector button {
                    flex: 1;
                    background: none;
                    border: none;
                    padding: 8px;
                    cursor: pointer;
                    color: var(--text);
                    border-radius: 4px;
                    transition: all 0.3s ease;
                }
                
                .timer-type-selector button.active {
                    background-color: var(--accent);
                    color: white;
                }
                
                .pomodoro-timer {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 15px;
                }
                
                .timer-ring {
                    position: relative;
                    width: 200px;
                    height: 200px;
                }
                
                .progress-ring {
                    transform: rotate(-90deg);
                }
                
                .progress-ring-circle-bg {
                    fill: transparent;
                    stroke: rgba(255, 255, 255, 0.1);
                    stroke-width: 8px;
                }
                
                .progress-ring-circle {
                    fill: transparent;
                    stroke: var(--accent);
                    stroke-width: 8px;
                    stroke-dasharray: 565.48; /* 2 * PI * 90 */
                    stroke-dashoffset: 0;
                    transition: stroke-dashoffset 0.5s ease;
                }
                
                .timer-display {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .timer-time {
                    font-size: 2.5rem;
                    font-weight: bold;
                }
                
                .timer-label {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
                
                .timer-controls {
                    display: flex;
                    gap: 10px;
                    margin-top: 15px;
                }
                
                .timer-action {
                    padding: 8px 20px;
                    border: none;
                    border-radius: 4px;
                    background-color: var(--accent);
                    color: white;
                    cursor: pointer;
                    font-weight: bold;
                }
                
                .timer-reset, .timer-skip {
                    padding: 8px 15px;
                    border: none;
                    border-radius: 4px;
                    background-color: rgba(255, 255, 255, 0.1);
                    color: var(--text);
                    cursor: pointer;
                }
                
                .pomodoro-stats {
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text);
                    opacity: 0.8;
                }
                
                /* Ghoul mode styles */
                body.ghoul .progress-ring-circle {
                    stroke: #e10000;
                }
                
                body.ghoul .timer-action {
                    background-color: #e10000;
                }
                
                body.ghoul .timer-type-selector button.active {
                    background-color: #e10000;
                }
                
                /* Timer completion effect */
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .timer-completed {
                    animation: pulse 1s ease infinite;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Reference elements
        timerElement = document.getElementById('pomodoro-timer');
        timerControlsElement = document.getElementById('timer-controls');
        timerActionButton = document.getElementById('timer-action');
        timerResetButton = document.getElementById('timer-reset');
        timerSkipButton = document.getElementById('timer-skip');
        timerLabelElement = document.getElementById('timer-label');
        progressRingElement = document.querySelector('.progress-ring-circle');
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Action button (Start/Pause)
        timerActionButton.addEventListener('click', toggleTimer);
        
        // Reset button
        timerResetButton.addEventListener('click', resetTimer);
        
        // Skip button
        timerSkipButton.addEventListener('click', skipTimer);
        
        // Timer type selector
        const timerTypeButtons = document.querySelectorAll('.timer-type-selector button');
        timerTypeButtons.forEach(button => {
            button.addEventListener('click', () => {
                timerTypeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Change timer type
                timerType = button.dataset.type;
                resetTimer();
            });
        });
        
        // Settings button
        const settingsButton = document.getElementById('timer-settings');
        if (settingsButton) {
            settingsButton.addEventListener('click', showTimerSettings);
        }
    }
    
    // Toggle timer (start/pause)
    function toggleTimer() {
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
    
    // Start timer
    function startTimer() {
        isRunning = true;
        timerActionButton.textContent = 'Pause';
        
        // Start interval
        interval = setInterval(() => {
            // Decrease time remaining
            timeRemaining--;
            
            // Update display
            updateTimerDisplay();
            
            // Check if timer is finished
            if (timeRemaining <= 0) {
                timerCompleted();
            }
        }, 1000);
    }
    
    // Pause timer
    function pauseTimer() {
        isRunning = false;
        timerActionButton.textContent = 'Start';
        
        // Clear interval
        clearInterval(interval);
        interval = null;
    }
    
    // Reset timer
    function resetTimer() {
        // Pause timer if running
        if (isRunning) {
            pauseTimer();
        }
        
        // Set time based on timer type
        switch (timerType) {
            case 'work':
                timeRemaining = settings.workTime;
                timerLabelElement.textContent = 'Focus Time';
                break;
            case 'shortBreak':
                timeRemaining = settings.shortBreak;
                timerLabelElement.textContent = 'Short Break';
                break;
            case 'longBreak':
                timeRemaining = settings.longBreak;
                timerLabelElement.textContent = 'Long Break';
                break;
        }
        
        // Remove completed class if present
        timerElement.classList.remove('timer-completed');
        
        // Update display
        updateTimerDisplay();
    }
    
    // Skip timer
    function skipTimer() {
        // Determine next timer type
        if (timerType === 'work') {
            // If we've completed the required number of pomodoros for a long break
            if ((pomodorosCompleted + 1) % settings.longBreakInterval === 0) {
                timerType = 'longBreak';
            } else {
                timerType = 'shortBreak';
            }
            
            // Increment pomodoros completed
            pomodorosCompleted++;
            document.getElementById('pomodoros-completed').textContent = pomodorosCompleted;
            
            // Save to analytics
            if (window.BlackReaperAnalytics) {
                window.BlackReaperAnalytics.trackEvent('pomodoro_completed', { count: pomodorosCompleted });
            }
        } else {
            // After any break, go back to work
            timerType = 'work';
        }
        
        // Update timer type selector UI
        const timerTypeButtons = document.querySelectorAll('.timer-type-selector button');
        timerTypeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.type === timerType);
        });
        
        // Reset timer with new type
        resetTimer();
        
        // Start timer if auto-start is enabled
        if (settings.autoStart) {
            startTimer();
        }
    }
    
    // Timer completed
    function timerCompleted() {
        // Pause timer
        pauseTimer();
        
        // Add completed class
        timerElement.classList.add('timer-completed');
        
        // Show notification
        showTimerCompletionNotification();
        
        // Play sound
        playTimerCompletionSound();
        
        // If work timer completed, increment pomodoros
        if (timerType === 'work') {
            pomodorosCompleted++;
            document.getElementById('pomodoros-completed').textContent = pomodorosCompleted;
            
            // Save to analytics
            if (window.BlackReaperAnalytics) {
                window.BlackReaperAnalytics.trackEvent('pomodoro_completed', { count: pomodorosCompleted });
            }
        }
        
        // Auto-transition to next timer if auto-start is enabled
        if (settings.autoStart) {
            setTimeout(() => {
                skipTimer();
            }, 3000);
        }
    }
    
    // Show timer completion notification
    function showTimerCompletionNotification() {
        let title, message;
        
        if (timerType === 'work') {
            title = 'Work Session Complete';
            message = 'Take a break! You\'ve earned it.';
        } else if (timerType === 'shortBreak') {
            title = 'Break Over';
            message = 'Ready to focus again?';
        } else {
            title = 'Long Break Complete';
            message = 'Ready for another productivity session?';
        }
        
        // Use notification system if available
        if (window.BlackReaperNotifications) {
            window.BlackReaperNotifications.show(title, message, timerType === 'work' ? 'success' : 'info');
            window.BlackReaperNotifications.desktop(title, message);
        } else {
            // Fallback to browser notification
            if (Notification.permission === "granted") {
                new Notification(title, { body: message });
            }
        }
    }
    
    // Play timer completion sound
    function playTimerCompletionSound() {
        // Check if audio is muted
        const audioControls = document.getElementById('toggle-audio');
        if (!audioControls || audioControls.querySelector('.audio-off').classList.contains('hidden')) {
            const audio = new Audio();
            
            if (timerType === 'work') {
                audio.src = 'assets/audio/timer-work-done.mp3';
            } else {
                audio.src = 'assets/audio/timer-break-done.mp3';
            }
            
            audio.volume = 0.5;
            audio.play();
        }
    }
    
    // Update timer display
    function updateTimerDisplay() {
        // Format time remaining
        const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
        const seconds = (timeRemaining % 60).toString().padStart(2, '0');
        
        // Update timer display
        document.getElementById('timer-time').textContent = `${minutes}:${seconds}`;
        
        // Update progress ring
        if (progressRingElement) {
            let totalTime;
            
            switch (timerType) {
                case 'work':
                    totalTime = settings.workTime;
                    break;
                case 'shortBreak':
                    totalTime = settings.shortBreak;
                    break;
                case 'longBreak':
                    totalTime = settings.longBreak;
                    break;
            }
            
            const circumference = 2 * Math.PI * 90; // 2π × radius
            const progress = 1 - (timeRemaining / totalTime);
            const dashoffset = circumference * progress;
            
            progressRingElement.style.strokeDasharray = circumference;
            progressRingElement.style.strokeDashoffset = dashoffset;
        }
    }
    
    // Show timer settings modal
    function showTimerSettings() {
        // Create modal if it doesn't exist
        if (!document.getElementById('timer-settings-modal')) {
            const modal = document.createElement('div');
            modal.id = 'timer-settings-modal';
            modal.className = 'modal';
            
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Timer Settings</h3>
                        <span class="modal-close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="settings-form">
                            <div class="form-group">
                                <label for="work-time">Work Duration (minutes)</label>
                                <input type="number" id="work-time" min="1" max="60" value="${settings.workTime / 60}">
                            </div>
                            <div class="form-group">
                                <label for="short-break">Short Break (minutes)</label>
                                <input type="number" id="short-break" min="1" max="30" value="${settings.shortBreak / 60}">
                            </div>
                            <div class="form-group">
                                <label for="long-break">Long Break (minutes)</label>
                                <input type="number" id="long-break" min="5" max="60" value="${settings.longBreak / 60}">
                            </div>
                            <div class="form-group">
                                <label for="long-break-interval">Long Break After (pomodoros)</label>
                                <input type="number" id="long-break-interval" min="1" max="10" value="${settings.longBreakInterval}">
                            </div>
                            <div class="form-group checkbox">
                                <input type="checkbox" id="auto-start" ${settings.autoStart ? 'checked' : ''}>
                                <label for="auto-start">Auto-start next timer</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="save-settings" class="glitch-btn">Save Settings</button>
                        <button id="reset-settings">Reset to Default</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add modal styles
            if (!document.getElementById('modal-styles')) {
                const styles = document.createElement('style');
                styles.id = 'modal-styles';
                styles.textContent = `
                    .modal {
                        display: none;
                        position: fixed;
                        z-index: 1000;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: 100%;
                        background-color: rgba(0, 0, 0, 0.5);
                        align-items: center;
                        justify-content: center;
                    }
                    
                    .modal.show {
                        display: flex;
                    }
                    
                    .modal-content {
                        background-color: var(--card-bg);
                        border-radius: 8px;
                        width: 90%;
                        max-width: 400px;
                    }
                    
                    .modal-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 15px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    .modal-header h3 {
                        margin: 0;
                    }
                    
                    .modal-close {
                        font-size: 1.5rem;
                        cursor: pointer;
                    }
                    
                    .modal-body {
                        padding: 15px;
                    }
                    
                    .settings-form .form-group {
                        margin-bottom: 15px;
                    }
                    
                    .settings-form label {
                        display: block;
                        margin-bottom: 5px;
                    }
                    
                    .settings-form input[type="number"] {
                        width: 100%;
                        padding: 8px;
                        background-color: rgba(0, 0, 0, 0.2);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 4px;
                        color: var(--text);
                    }
                    
                    .settings-form .checkbox {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    
                    .settings-form .checkbox input {
                        width: auto;
                    }
                    
                    .settings-form .checkbox label {
                        margin-bottom: 0;
                    }
                    
                    .modal-footer {
                        padding: 15px;
                        display: flex;
                        justify-content: space-between;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    
                    #reset-settings {
                        background-color: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: var(--text);
                        padding: 8px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                `;
                document.head.appendChild(styles);
            }
            
            // Add event listeners
            document.querySelector('.modal-close').addEventListener('click', closeModal);
            document.getElementById('save-settings').addEventListener('click', saveTimerSettings);
            document.getElementById('reset-settings').addEventListener('click', resetTimerSettings);
        }
        
        // Update values
        document.getElementById('work-time').value = settings.workTime / 60;
        document.getElementById('short-break').value = settings.shortBreak / 60;
        document.getElementById('long-break').value = settings.longBreak / 60;
        document.getElementById('long-break-interval').value = settings.longBreakInterval;
        document.getElementById('auto-start').checked = settings.autoStart;
        
        // Show modal
        document.getElementById('timer-settings-modal').classList.add('show');
    }
    
    // Close modal
    function closeModal() {
        document.getElementById('timer-settings-modal').classList.remove('show');
    }
    
    // Save timer settings
    function saveTimerSettings() {
        // Get values
        settings.workTime = parseInt(document.getElementById('work-time').value) * 60;
        settings.shortBreak = parseInt(document.getElementById('short-break').value) * 60;
        settings.longBreak = parseInt(document.getElementById('long-break').value) * 60;
        settings.longBreakInterval = parseInt(document.getElementById('long-break-interval').value);
        settings.autoStart = document.getElementById('auto-start').checked;
        
        // Save settings
        saveSettings();
        
        // Reset timer to apply new settings
        resetTimer();
        
        // Close modal
        closeModal();
        
        // Show notification
        if (window.BlackReaperNotifications) {
            window.BlackReaperNotifications.show('Settings Saved', 'Timer settings have been updated.', 'success');
        }
    }
    
    // Reset timer settings to default
    function resetTimerSettings() {
        settings = {...DEFAULT_SETTINGS};
        
        // Update form values
        document.getElementById('work-time').value = settings.workTime / 60;
        document.getElementById('short-break').value = settings.shortBreak / 60;
        document.getElementById('long-break').value = settings.longBreak / 60;
        document.getElementById('long-break-interval').value = settings.longBreakInterval;
        document.getElementById('auto-start').checked = settings.autoStart;
        
        // Save settings
        saveSettings();
        
        // Reset timer
        resetTimer();
        
        // Show notification
        if (window.BlackReaperNotifications) {
            window.BlackReaperNotifications.show('Settings Reset', 'Timer settings have been reset to default.', 'info');
        }
    }
    
    // Public methods
    return {
        init: init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if on dashboard
    if (document.querySelector('.dashboard-container')) {
        BlackReaperPomodoro.init();
    }
});
