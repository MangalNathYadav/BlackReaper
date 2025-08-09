// profile.js - Enhanced version with better integration

// DOM Elements
const profileNickname = document.getElementById('profile-nickname');
const userAvatar = document.getElementById('user-avatar');
const avatarUpload = document.getElementById('avatar-upload');
const daysActive = document.getElementById('days-active');
const tasksCompleted = document.getElementById('tasks-completed');
const journalCount = document.getElementById('journal-count');
const ghoulTime = document.getElementById('ghoul-time');
const editNickname = document.getElementById('edit-nickname');
const editEmail = document.getElementById('edit-email');
const updateProfileButton = document.getElementById('update-profile');
const changePasswordButton = document.getElementById('change-password');
const threatMeter = document.querySelector('.threat-meter');
const modeToggle = document.getElementById('mode-toggle');

// Initialize the profile when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Black Reaper Profile initializing...');
    checkAuthState();
    
    // Ensure theme is properly applied - we need to do this in both files
    // to handle the case where profile.js loads before main.js
    const isGhoulMode = localStorage.getItem('ghoulMode') === 'true';
    if (isGhoulMode) {
        document.body.classList.add('ghoul-mode');
    } else {
        document.body.classList.remove('ghoul-mode');
    }
    
    initializeProfile();
    
    // Listen for theme changes from main.js
    document.addEventListener('themeChanged', (event) => {
        // Update any profile-specific UI based on theme
        if (typeof updateKaguneProgress === 'function') {
            updateKaguneProgress();
        }
        if (typeof updateThreatLevel === 'function') {
            updateThreatLevel();
        }
        // Force reflow for avatar border color, etc.
        if (userAvatar) {
            userAvatar.style.borderColor = '';
        }
    });
});

// Check authentication state
function checkAuthState() {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'index.html';
        }
    });
}

// Initialize profile components
function initializeProfile() {
    loadUserProfile();
    calculateStats();
    setupProfileEventListeners();
    updateThreatLevel();
    updateKaguneProgress();
    setupAudioControls();
}

// Setup mode toggle functionality - This is now a utility function and won't be called automatically
// It's kept for reference or if we need to use it in the future
function setupModeToggle() {
    const currentMode = localStorage.getItem('ghoulMode') === 'true';
    if (modeToggle) {
        modeToggle.checked = currentMode;
    }
    
    // Apply the current mode to body
    if (currentMode) {
        document.body.classList.add('ghoul-mode');
    } else {
        document.body.classList.remove('ghoul-mode');
    }
    
    // Do not add the event listener here since main.js already handles it
    // The theme toggle functionality is now centralized in main.js
}

// Load user profile data from Firebase
function loadUserProfile() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Get user data from Firebase
    firebase.database().ref('users/' + user.uid).once('value').then(snapshot => {
        const userData = snapshot.val() || {};
        
        // Update display
        profileNickname.textContent = userData.nickname || user.displayName || 'User';
        editNickname.value = userData.nickname || user.displayName || 'User';
        editEmail.value = user.email || 'user@example.com';
        
        // Set avatar
        if (userData.avatar) {
            userAvatar.src = userData.avatar;
        } else if (user.photoURL) {
            userAvatar.src = user.photoURL;
        }
    }).catch(error => {
        console.error('Error loading profile:', error);
    });
}

// Calculate user statistics from Firebase
function calculateStats() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Days active (from account creation)
    const creationDate = new Date(user.metadata.creationTime);
    const daysDiff = Math.floor((new Date() - creationDate) / (1000 * 60 * 60 * 24));
    daysActive.textContent = daysDiff;

    // Get stats from Firebase
    firebase.database().ref('userStats/' + user.uid).once('value').then(snapshot => {
        const stats = snapshot.val() || {};
        
        // Tasks completed
        tasksCompleted.textContent = stats.tasksCompleted || 0;
        
        // Journal entries
        journalCount.textContent = stats.journalEntries || 0;
        
        // Ghoul mode time (in minutes)
        const ghoulMinutes = stats.ghoulModeTime || 0;
        const hours = Math.floor(ghoulMinutes / 60);
        const minutes = ghoulMinutes % 60;
        ghoulTime.textContent = `${hours} hrs ${minutes} mins`;
        
        // Update visual elements
        updateThreatLevel();
        updateKaguneProgress();
    });
}

// Update profile data in Firebase
function updateProfileData() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const newNickname = editNickname.value.trim();
    const newEmail = editEmail.value.trim();
    
    // Validate inputs
    if (!newNickname) {
        showNotification('Nickname cannot be empty', 'error');
        return;
    }

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }

    // Update Firebase data
    const updates = {
        nickname: newNickname
    };

    // Update email if changed
    if (newEmail !== user.email) {
        user.updateEmail(newEmail).then(() => {
            firebase.database().ref('users/' + user.uid).update(updates);
            showNotification('Profile updated successfully!', 'success');
        }).catch(error => {
            console.error('Error updating email:', error);
            showNotification('Error updating email: ' + error.message, 'error');
        });
    } else {
        firebase.database().ref('users/' + user.uid).update(updates)
            .then(() => {
                showNotification('Profile updated successfully!', 'success');
                profileNickname.textContent = newNickname;
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                showNotification('Error updating profile: ' + error.message, 'error');
            });
    }
}

// Handle avatar upload with Firebase Storage
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    const user = firebase.auth().currentUser;
    
    if (!file || !file.type.startsWith('image/') || !user) return;

    // Show loading state
    userAvatar.classList.add('loading');
    
    // Upload to Firebase Storage
    const storageRef = firebase.storage().ref('avatars/' + user.uid);
    const uploadTask = storageRef.put(file);
    
    uploadTask.on('state_changed', 
        null, 
        (error) => {
            console.error('Upload error:', error);
            showNotification('Error uploading avatar', 'error');
            userAvatar.classList.remove('loading');
        },
        () => {
            // Get download URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // Update user avatar
                userAvatar.src = downloadURL;
                userAvatar.classList.remove('loading');
                
                // Save to database
                firebase.database().ref('users/' + user.uid).update({ avatar: downloadURL });
                
                showNotification('Avatar updated successfully!', 'success');
            });
        }
    );
}

// Enhanced threat level calculation
function updateThreatLevel() {
    const tasks = parseInt(tasksCompleted.textContent) || 0;
    const journals = parseInt(journalCount.textContent) || 0;
    const ghoulHours = parseInt(ghoulTime.textContent.split(' ')[0]) || 0;
    
    // Calculate threat level with more sophisticated algorithm
    let threatLevel;
    const engagementScore = tasks * 0.4 + journals * 0.3 + ghoulHours * 0.3;
    
    if (engagementScore < 10) threatLevel = 'C';
    else if (engagementScore < 25) threatLevel = 'B';
    else if (engagementScore < 50) threatLevel = 'A';
    else if (engagementScore < 100) threatLevel = 'S';
    else threatLevel = 'SS';
    
    // Update UI with animation
    threatMeter.setAttribute('data-level', threatLevel);
    const threatValue = threatMeter.querySelector('.threat-value');
    
    // Animate the change
    threatValue.style.transform = 'scale(1.5)';
    setTimeout(() => {
        threatValue.textContent = threatLevel;
        threatValue.style.transform = 'scale(1)';
    }, 300);
    
    // Update color based on level and theme
    const isGhoul = document.body.classList.contains('ghoul-mode');
    const colors = isGhoul
        ? {
            'C': '#4CAF50',
            'B': '#8BC34A',
            'A': '#FFC107',
            'S': '#FF5722',
            'SS': '#F44336'
        }
        : {
            'C': '#4CAF50',
            'B': '#1976D2',
            'A': '#FFC107',
            'S': '#2c7be5',
            'SS': '#0d53b5'
        };
    threatMeter.style.background = colors[threatLevel] || colors['C'];
}

// Enhanced kagune progress with animations
function updateKaguneProgress() {
    const tasks = parseInt(tasksCompleted.textContent) || 0;
    const journals = parseInt(journalCount.textContent) || 0;
    const ghoulHours = parseInt(ghoulTime.textContent.split(' ')[0]) || 0;
    
    // Calculate kagune progress with different weights
    const kaguneTypes = document.querySelectorAll('.kagune-type');
    
    // Rinkaku (Task-focused)
    const rinkakuProgress = Math.min(tasks * 2, 100);
    animateProgressBar(kaguneTypes[0], rinkakuProgress);
    
    // Ukaku (Journal-focused)
    const ukakuProgress = Math.min(journals * 5, 100);
    animateProgressBar(kaguneTypes[1], ukakuProgress);
    
    // Koukaku (Ghoul time-focused)
    const koukakuProgress = Math.min(ghoulHours * 10, 100);
    animateProgressBar(kaguneTypes[2], koukakuProgress);
    
    // Bikaku (Balanced)
    const bikakuProgress = Math.min((tasks + journals + ghoulHours) * 1.5, 100);
    animateProgressBar(kaguneTypes[3], bikakuProgress);

    // Update progress-percentage color for theme
    kaguneTypes.forEach(type => {
        const percent = type.querySelector('.progress-percentage');
        if (percent) {
            if (document.body.classList.contains('ghoul-mode')) {
                percent.style.color = 'var(--text-secondary-ghoul)';
            } else {
                percent.style.color = 'var(--text-secondary-human)';
            }
        }
    });
}

// Animate progress bar changes
function animateProgressBar(element, targetWidth) {
    const progressBar = element.querySelector('.progress');
    const percentText = element.querySelector('.progress-percentage');
    const currentWidth = parseInt(progressBar.style.width) || 0;
    
    // Skip if no change
    if (Math.abs(currentWidth - targetWidth) < 1) return;
    
    // Animate the change
    progressBar.style.transition = 'width 0.5s ease-out';
    progressBar.style.width = `${targetWidth}%`;

    // Update percentage text
    if (percentText) percentText.textContent = `${Math.round(targetWidth)}%`;
    
    // Update unlocked state when animation completes
    setTimeout(() => {
        if (targetWidth >= 100) {
            element.classList.add('unlocked');
            element.classList.remove('locked');
            
            // Visual effect for unlocking
            element.style.boxShadow = '0 0 15px rgba(220, 20, 60, 0.7)';
            setTimeout(() => {
                element.style.boxShadow = 'none';
            }, 1000);
        } else if (targetWidth <= 0) {
            element.classList.add('locked');
            element.classList.remove('unlocked');
        }
    }, 500);
}

// Setup audio controls
function setupAudioControls() {
    const audioToggle = document.getElementById('toggle-audio');
    const audioOn = document.querySelector('.audio-on');
    const audioOff = document.querySelector('.audio-off');
    const audio = document.getElementById('background-audio');
    
    // Load audio preference
    const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
    audio.muted = !audioEnabled;
    audioOn.classList.toggle('hidden', !audioEnabled);
    audioOff.classList.toggle('hidden', audioEnabled);
    
    // Toggle audio
    audioToggle.addEventListener('click', () => {
        audio.muted = !audio.muted;
        localStorage.setItem('audioEnabled', !audio.muted);
        audioOn.classList.toggle('hidden');
        audioOff.classList.toggle('hidden');
    });
    
    // Try to play audio (many browsers block autoplay)
    audio.play().catch(e => console.log('Audio play prevented:', e));
}

// Show notification
function showNotification(message, type) {
    // You can integrate with your notifications.js here
    alert(`${type.toUpperCase()}: ${message}`);
}

// Setup event listeners
function setupProfileEventListeners() {
    // Update profile button
    updateProfileButton?.addEventListener('click', updateProfileData);
    
    // Avatar upload
    avatarUpload?.addEventListener('change', handleAvatarUpload);
    
    // Change password button
    changePasswordButton?.addEventListener('click', () => {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        // Send password reset email
        firebase.auth().sendPasswordResetEmail(user.email)
            .then(() => {
                showNotification('Password reset email sent!', 'success');
            })
            .catch(error => {
                showNotification('Error: ' + error.message, 'error');
            });
    });
}