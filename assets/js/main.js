// Main JavaScript file for BlackReaper

// Global variables
let currentUser = null;
let isGhoulMode = false;
let idleTimer = null;
const idleTime = 300000; // 5 minutes of inactivity

// DOM Elements
const modeToggle = document.getElementById('mode-toggle');
const audioToggle = document.getElementById('toggle-audio');
const backgroundAudio = document.getElementById('background-audio');
const audioOn = document.querySelector('.audio-on');
const audioOff = document.querySelector('.audio-off');

// Initialize the app once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('BlackReaper is initializing...');
    initializeFirebase();
    checkAuthState();
    initializeTheme();
    setupEventListeners();
    setupIdleTimer();
    
    // Initialize Battle features if in ghoul mode
    if (isGhoulMode) {
        initializeBattleFeatures();
    }
    
    // Apply any pending RC cells that might have been earned when main.js wasn't loaded
    if (window.pendingRCCells && window.pendingRCCells > 0) {
        updateRCCells(window.pendingRCCells);
        window.pendingRCCells = 0;
    }
});

// Initialize Firebase based on config
function initializeFirebase() {
    // Firebase config will be loaded from the config.js file
    try {
        if (typeof firebaseConfig !== 'undefined') {
            console.log('Initializing Firebase...');
        } else {
            console.error('Firebase config is missing');
        }
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Check user authentication state
function checkAuthState() {
    // This will be handled by auth.js
    // Just a placeholder for the main.js file
    console.log('Checking authentication state...');
    
    // If we're on a page that requires authentication and we're not authenticated
    // we'll redirect to the login page
    const requiresAuth = ['dashboard.html', 'journal.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (requiresAuth.includes(currentPage)) {
        // Logic to be implemented in auth.js
    }
}

// Initialize theme based on user preference
function initializeTheme() {
    // Check localStorage for theme preference
    isGhoulMode = localStorage.getItem('ghoulMode') === 'true';
    
    // Update UI
    updateThemeUI();
    
    // If modeToggle exists, update its state
    if (modeToggle) {
        modeToggle.checked = isGhoulMode;
    }
    
    // Profile-specific initialization if we're on the profile page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'profile.html') {
        if (typeof updateKaguneProgress === 'function') {
            updateKaguneProgress();
        }
    }
    
    console.log(`Theme initialized: ${isGhoulMode ? 'Ghoul Mode' : 'Human Mode'}`);
}

// Update the UI based on the current theme
function updateThemeUI() {
    if (isGhoulMode) {
        document.body.classList.add('ghoul-mode');
    } else {
        document.body.classList.remove('ghoul-mode');
    }
    
    // Hide/show specific content based on mode
    const humanContent = document.querySelectorAll('.human-mode-content');
    const ghoulContent = document.querySelectorAll('.ghoul-mode-content');
    
    if (humanContent.length > 0 && ghoulContent.length > 0) {
        humanContent.forEach(element => {
            if (isGhoulMode) {
                element.classList.add('hidden');
            } else {
                element.classList.remove('hidden');
            }
        });
        
        ghoulContent.forEach(element => {
            if (isGhoulMode) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
    }
    
    // Update any theme-specific CSS variables
    document.documentElement.style.setProperty('--primary-bg', 
        isGhoulMode ? 'var(--primary-bg-ghoul)' : 'var(--primary-bg-human)');
    document.documentElement.style.setProperty('--secondary-bg', 
        isGhoulMode ? 'var(--secondary-bg-ghoul)' : 'var(--secondary-bg-human)');
    document.documentElement.style.setProperty('--accent-color', 
        isGhoulMode ? 'var(--accent-color-ghoul)' : 'var(--accent-color-human)');
    document.documentElement.style.setProperty('--accent-hover', 
        isGhoulMode ? 'var(--accent-hover-ghoul)' : 'var(--accent-hover-human)');
    document.documentElement.style.setProperty('--text-primary', 
        isGhoulMode ? 'var(--text-primary-ghoul)' : 'var(--text-primary-human)');
    document.documentElement.style.setProperty('--text-secondary', 
        isGhoulMode ? 'var(--text-secondary-ghoul)' : 'var(--text-secondary-human)');
    document.documentElement.style.setProperty('--border-color', 
        isGhoulMode ? 'var(--border-color-ghoul)' : 'var(--border-color-human)');
    document.documentElement.style.setProperty('--card-bg', 
        isGhoulMode ? 'var(--card-bg-ghoul)' : 'var(--card-bg-human)');
    document.documentElement.style.setProperty('--panel-shadow', 
        isGhoulMode ? 'var(--panel-shadow-ghoul)' : 'var(--panel-shadow-human)');
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    if (modeToggle) {
        modeToggle.addEventListener('change', toggleTheme);
    }
    
    // Ghoul Chat link
    const ghoulChatLink = document.getElementById('ghoul-chat-link');
    if (ghoulChatLink) {
        ghoulChatLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof toggleChat === 'function') {
                toggleChat();
            } else {
                // Load ghoul chat if not already loaded
                loadScript('assets/js/ghoul-chat.js').then(() => {
                    if (typeof toggleChat === 'function') {
                        toggleChat();
                    }
                });
            }
        });
    }
    
    // Audio toggle
    if (audioToggle) {
        audioToggle.addEventListener('click', toggleAudio);
    }
    
    // Reset idle timer on user activity
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);
    
    console.log('Event listeners set up');
}

// Toggle between human and ghoul mode
function toggleTheme() {
    isGhoulMode = !isGhoulMode;
    
    // Save preference to localStorage
    localStorage.setItem('ghoulMode', isGhoulMode);
    
    // Update UI
    updateThemeUI();
    
    // Add glitch effect on transition
    applyGlitchEffect();
    
    // Initialize battle features if switching to ghoul mode
    if (isGhoulMode) {
        initializeBattleFeatures();
    }
    
    // Profile-specific updates if we're on the profile page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'profile.html') {
        if (typeof updateKaguneProgress === 'function') {
            updateKaguneProgress();
        }
    }
    
    // Dispatch custom event for theme change that other scripts can listen for
    const themeEvent = new CustomEvent('themeChanged', { 
        detail: { isGhoulMode: isGhoulMode } 
    });
    document.dispatchEvent(themeEvent);
    
    console.log(`Switched to ${isGhoulMode ? 'Ghoul Mode' : 'Human Mode'}`);
    
    // If we're in ghoul mode, play a sound effect
    if (isGhoulMode && backgroundAudio && backgroundAudio.paused) {
        playSound('mode-change');
    }
}

// Toggle background audio
function toggleAudio() {
    if (backgroundAudio.paused) {
        backgroundAudio.play();
        audioOn.classList.remove('hidden');
        audioOff.classList.add('hidden');
    } else {
        backgroundAudio.pause();
        audioOn.classList.add('hidden');
        audioOff.classList.remove('hidden');
    }
}

// Play a sound effect
function playSound(soundType) {
    // This would be expanded to play different sound effects
    console.log(`Playing sound effect: ${soundType}`);
}

// Apply glitch effect on theme change
function applyGlitchEffect() {
    document.body.classList.add('glitching');
    setTimeout(() => {
        document.body.classList.remove('glitching');
    }, 1000);
}

// Setup idle timer for auto-switching to ghoul mode
function setupIdleTimer() {
    resetIdleTimer();
}

// Reset the idle timer
function resetIdleTimer() {
    clearTimeout(idleTimer);
    
    // Only set the idle timer if we're in human mode
    if (!isGhoulMode) {
        idleTimer = setTimeout(goGhoulMode, idleTime);
    }
}

// Auto switch to ghoul mode after idle time
function goGhoulMode() {
    if (!isGhoulMode) {
        isGhoulMode = true;
        
        // Save preference
        localStorage.setItem('ghoulMode', true);
        
        // Update UI
        updateThemeUI();
        
        // Update toggle if it exists
        if (modeToggle) {
            modeToggle.checked = true;
        }
        
        // Apply glitch effect
        applyGlitchEffect();
        
        console.log('Auto-switched to Ghoul Mode due to inactivity');
    }
}

// Handle eye animation for index page
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const eyeAnimation = document.querySelector('.eye');
    if (eyeAnimation) {
        // Eye blinking effect
        setInterval(() => {
            eyeAnimation.style.opacity = '0';
            setTimeout(() => {
                eyeAnimation.style.opacity = '1';
            }, 200);
        }, 5000);
    }
}

// Load script dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize battle mode features
async function initializeBattleFeatures() {
    if (!document.body.classList.contains('ghoul')) return;
    
    try {
        // Check if we're on a page that would use these features
        const currentPage = window.location.pathname.split('/').pop();
        if (['battle.html', 'dashboard.html'].includes(currentPage)) {
            // Load battle script if not already loaded
            if (typeof BlackReaperBattle === 'undefined') {
                await loadScript('assets/js/battle.js');
                console.log('Battle script loaded');
            }
        }
        
        // Load ghoul chat on all pages when in ghoul mode
        if (typeof BlackReaperGhoulChat === 'undefined') {
            await loadScript('assets/js/ghoul-chat.js');
            console.log('Ghoul chat script loaded');
        }
    } catch (error) {
        console.error('Error loading battle features:', error);
    }
}

// RC Cell System for reward system across all features
let rcCellCount = parseInt(localStorage.getItem('rcCellCount') || '0');

// Update RC Cell count
function updateRCCells(amount) {
    rcCellCount += amount;
    localStorage.setItem('rcCellCount', rcCellCount);
    
    // Update any UI elements that show RC Cell count
    const rcCountElements = document.querySelectorAll('.rc-value, #rcCellCount');
    rcCountElements.forEach(element => {
        if (element) {
            element.textContent = rcCellCount;
        }
    });
    
    // If we earned RC cells, show a notification
    if (amount > 0) {
        createNotification('RC Cells Earned', `You've earned ${amount} RC cells!`, 'success');
    } else if (amount < 0) {
        createNotification('RC Cells Spent', `You've spent ${Math.abs(amount)} RC cells.`, 'info');
    }
    
    return rcCellCount;
}

// Get current RC Cell count
function getRCCells() {
    return rcCellCount;
}

// Update RC Cell UI on page load
function updateRCCellUI() {
    const rcCountElements = document.querySelectorAll('.rc-value, #rcCellCount');
    rcCountElements.forEach(element => {
        if (element) {
            element.textContent = rcCellCount;
        }
    });
}

// Call this on page load
updateRCCellUI();

// Export functions for use in other scripts
window.BlackReaper = {
    toggleTheme,
    playSound,
    applyGlitchEffect,
    initializeBattleFeatures,
    updateRCCells,
    getRCCells
};
