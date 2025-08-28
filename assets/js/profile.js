// Profile page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  console.log('Profile page loaded, waiting for auth state...');
  
  // Make sure Firebase is initialized
  if (typeof firebase === 'undefined') {
    console.error('Firebase is not defined! Loading Firebase scripts...');
    // This should not happen if scripts are properly included in HTML
    loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
      .then(() => loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js'))
      .then(() => loadScript('https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js'))
      .then(() => loadScript('firebase/config.js'))
      .then(() => {
        console.log('Firebase scripts loaded manually.');
        checkAuthState();
      })
      .catch(err => console.error('Failed to load Firebase scripts:', err));
  } else {
    console.log('Firebase is already defined, proceeding with auth check.');
    checkAuthState();
  }
});

// Helper function to load scripts dynamically if needed
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Check authentication state
function checkAuthState() {
  // Listen for Firebase auth state changes directly
  firebase.auth().onAuthStateChanged(user => {
    console.log('Auth state changed:', user ? 'User logged in' : 'User not logged in');
    if (user) {
      // User is authenticated, initialize profile page
      initProfilePage(user);
    } else {
      console.log('No user found, redirecting to login page');
      // Add a small delay before redirecting to ensure this is not a temporary state
      setTimeout(() => {
        if (!firebase.auth().currentUser) {
          window.location.href = 'index.html';
        }
      }, 1000);
    }
  });
}

// Initialize profile page
async function initProfilePage(user) {
  console.log('Initializing profile page for user:', user.uid);
  
  // Load user profile data
  try {
    await loadUserProfile(user.uid);
    
    // Set up event listeners for profile actions
    setupProfileEventListeners(user.uid);
    
    // Listen for real-time updates to the profile
    setupProfileListener(user.uid);
  } catch (error) {
    console.error('Error initializing profile page:', error);
    showNotification('error', 'Failed to load profile data');
  }
}

// Load user profile data from Firebase
async function loadUserProfile(userId) {
  try {
    console.log('Loading user profile for:', userId);
    
    // Show loading spinner in stats areas
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
      statsContainer.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    // Get user data from Firebase
    const userData = await window.database.getUserProfile(userId);
    console.log('User data loaded:', userData ? 'Success' : 'Not found');
    
    if (!userData) {
      // If user data is not found, create a basic profile
      console.log('Creating default profile data for new user');
      await window.database.updateUserProfile(userId, {
        displayName: firebase.auth().currentUser?.displayName || 'Human',
        email: firebase.auth().currentUser?.email || '',
        isAnonymous: firebase.auth().currentUser?.isAnonymous || false,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastLogin: firebase.database.ServerValue.TIMESTAMP,
        rcCells: 100,
        mode: 'human',
        stats: {
          tasksCompleted: 0,
          pomodorosCompleted: 0,
          battlesWon: 0,
          battlesLost: 0,
          journalEntries: 0
        },
        profile: {
          bio: '',
          avatar: '',
          level: 1,
          experience: 0,
          achievements: []
        }
      });
      
      // Fetch the newly created profile
      const newUserData = await window.database.getUserProfile(userId);
      if (!newUserData) {
        throw new Error('Failed to create user profile');
      }
      
      // Display the new user data
      displayUserProfile(newUserData);
      displayUserStats(newUserData.stats || {});
      displayAchievements(newUserData.profile?.achievements || []);
      return newUserData;
    }
    
    // Display existing user data in profile sections
    displayUserProfile(userData);
    
    // Display user stats
    displayUserStats(userData.stats || {});
    
    // Load achievements
    displayAchievements(userData.profile?.achievements || []);
    
    return userData;
  } catch (error) {
    console.error('Error loading user profile:', error);
    showNotification('error', 'Failed to load profile: ' + error.message);
    throw error;
  }
}

// Display user profile information
function displayUserProfile(userData) {
  // Update profile header
  updateProfileHeader(userData);
  
  // Update profile details section
  updateProfileDetails(userData);
  
  // Update RC cells display
  updateRCCellsDisplay(userData.rcCells || 0);
  
  // Update mode display
  updateModeDisplay(userData.mode || 'human');
  
  // Populate edit profile form
  populateEditProfileForm(userData);
}

// Update the profile header with user information
function updateProfileHeader(userData) {
  console.log('Updating profile header with user data:', userData);
  
  // Log all available DOM elements to help debug
  const profileElements = {
    'profile-name': document.getElementById('profile-name'),
    'profile-email': document.getElementById('profile-email'),
    'profile-avatar-img': document.querySelector('#profile-avatar img'),
    'profile-avatar': document.getElementById('profile-avatar'),
    'rc-level': document.getElementById('rc-level'),
    'account-type': document.getElementById('account-type'),
    'profile-status': document.getElementById('profile-status'),
    'join-date': document.getElementById('join-date'),
    'stat-mini-rc': document.getElementById('stat-mini-rc'),
    'stat-mini-rank': document.getElementById('stat-mini-rank')
  };
  
  console.log('Profile elements found in DOM:', 
    Object.keys(profileElements).filter(key => profileElements[key] !== null));
  console.log('Profile elements missing from DOM:', 
    Object.keys(profileElements).filter(key => profileElements[key] === null));
    
  // Display name and email
  const profileName = profileElements['profile-name'];
  const profileEmail = profileElements['profile-email'];
  
  if (profileName) {
    profileName.textContent = userData.displayName || 'Anonymous Ghoul';
    console.log('Updated profile name:', profileName.textContent);
  } else {
    console.warn('profile-name element not found in DOM');
  }
  
  if (profileEmail) {
    profileEmail.textContent = userData.email || 'No email';
    console.log('Updated profile email:', profileEmail.textContent);
  } else {
    console.warn('profile-email element not found in DOM');
  }
  
  // Avatar handling with fallback mechanism
  const profileAvatarImg = profileElements['profile-avatar-img'];
  const profileAvatarContainer = profileElements['profile-avatar'];
  
  if (profileAvatarImg) {
    // If we have an avatar in the user data, use it
    if (userData.profile && userData.profile.avatar) {
      profileAvatarImg.src = userData.profile.avatar;
      console.log('Updated avatar src:', profileAvatarImg.src);
    } else {
      // Use default avatar or create a placeholder
      profileAvatarImg.src = 'assets/images/placeholder-frame.png';
      console.log('No avatar in user data, using default placeholder');
    }
  } else if (profileAvatarContainer) {
    // If we have a container but no img, create the img element
    console.log('Avatar img not found, but container exists. Creating img element.');
    const imgEl = document.createElement('img');
    imgEl.src = userData.profile?.avatar || 'assets/images/placeholder-frame.png';
    imgEl.alt = 'User Avatar';
    profileAvatarContainer.appendChild(imgEl);
  } else {
    console.warn('Neither profile-avatar img nor container found in DOM');
  }
  
  // User level
  const profileLevel = profileElements['rc-level'];
  if (profileLevel) {
    profileLevel.textContent = userData.profile?.level || 1;
    console.log('Updated profile level:', profileLevel.textContent);
  } else {
    console.warn('rc-level element not found in DOM');
  }
  
  // Account type
  const accountType = profileElements['account-type'];
  if (accountType) {
    accountType.textContent = userData.isAnonymous ? 'Guest' : 'Standard';
    console.log('Updated account type:', accountType.textContent);
  } else {
    console.warn('account-type element not found in DOM');
  }
  
  // Profile status
  const profileStatus = profileElements['profile-status'];
  if (profileStatus) {
    const mode = userData.mode || 'human';
    profileStatus.innerHTML = `<i class="fas fa-${mode === 'ghoul' ? 'mask' : 'user'}"></i> ${mode === 'ghoul' ? 'Ghoul' : 'Human'}`;
    console.log('Updated profile status:', mode);
    
    // Add the correct class if ghoul mode
    if (mode === 'ghoul') {
      profileStatus.classList.add('ghoul');
    } else {
      profileStatus.classList.remove('ghoul');
    }
  } else {
    console.warn('profile-status element not found in DOM');
  }
  
  // Join date
  const joinDate = profileElements['join-date'];
  if (joinDate && userData.createdAt) {
    joinDate.textContent = formatDate(userData.createdAt);
    console.log('Updated join date:', joinDate.textContent);
  } else if (joinDate) {
    joinDate.textContent = 'Unknown date';
    console.warn('No createdAt date found in user data');
  } else {
    console.warn('join-date element not found in DOM');
  }
  
  // Mini stats
  const rcMiniStat = profileElements['stat-mini-rc'];
  if (rcMiniStat) {
    rcMiniStat.textContent = userData.rcCells || 0;
    console.log('Updated RC cells stat:', rcMiniStat.textContent);
  } else {
    console.warn('stat-mini-rc element not found in DOM');
  }
  
  if (rankMiniStat) {
    // Calculate rank based on RC cells or level
    const level = userData.profile?.level || 1;
    const rank = calculateRank(level);
    rankMiniStat.textContent = rank;
    console.log('Updated rank:', rankMiniStat.textContent);
  } else {
    console.warn('stat-mini-rank element not found in DOM');
  }
}

// Calculate rank based on level
function calculateRank(level) {
  if (level >= 20) return 'SSS';
  if (level >= 15) return 'SS';
  if (level >= 10) return 'S';
  if (level >= 8) return 'A+';
  if (level >= 6) return 'A';
  if (level >= 4) return 'B';
  if (level >= 2) return 'C';
  return 'D';
}

// Update profile details section
function updateProfileDetails(userData) {
  // No need to update profile-bio as it's not part of the current UI
  
  // Experience/level display is handled in the header now
}

// Populate edit profile form with user data
function populateEditProfileForm(userData) {
  console.log('Populating edit profile form with user data:', userData);
  
  const editName = document.getElementById('edit-name');
  const editBio = document.getElementById('edit-bio');
  const editStatus = document.getElementById('edit-status');
  const avatarPreview = document.querySelector('#avatar-preview img');
  
  if (editName) {
    editName.value = userData.displayName || '';
    console.log('Set edit name field:', editName.value);
  } else {
    console.warn('edit-name element not found in DOM');
  }
  
  if (editBio) {
    // Ensure we handle the case where profile might not exist
    const bio = userData.profile && userData.profile.bio ? userData.profile.bio : '';
    editBio.value = bio;
    console.log('Set edit bio field:', editBio.value);
  } else {
    console.warn('edit-bio element not found in DOM');
  }
  
  if (editStatus) {
    // Default to 'active' if status is not set
    const status = userData.profile && userData.profile.status ? userData.profile.status : 'active';
    editStatus.value = status;
    console.log('Set edit status field:', editStatus.value);
  } else {
    console.warn('edit-status element not found in DOM');
  }
  
  if (avatarPreview) {
    // Use the avatar from profile if it exists, otherwise use default
    const avatarUrl = userData.profile && userData.profile.avatar ? 
      userData.profile.avatar : 'assets/images/placeholder-frame.png';
    avatarPreview.src = avatarUrl;
    console.log('Set avatar preview:', avatarPreview.src);
  } else {
    console.warn('Avatar preview image element not found in DOM');
  }
}

// Update RC Cells display
function updateRCCellsDisplay(rcCells) {
  const rcCellsElements = document.querySelectorAll('.rc-cells-count');
  rcCellsElements.forEach(el => {
    el.textContent = rcCells;
  });
}

// Update mode display
function updateModeDisplay(mode) {
  // This is handled by the theme toggle, but we can update any mode-specific UI elements here
  const modeIndicators = document.querySelectorAll('.mode-indicator');
  modeIndicators.forEach(el => {
    el.textContent = mode === 'ghoul' ? 'Ghoul' : 'Human';
  });
}

// Display user statistics
function displayUserStats(stats) {
  // Update each stat item with its value
  const statTasks = document.getElementById('stat-tasks');
  const statPomodoros = document.getElementById('stat-pomodoros');
  const statJournals = document.getElementById('stat-journals');
  const statBattlesWon = document.getElementById('stat-battles-won');
  const statFocusTime = document.getElementById('stat-focus-time');
  const statActiveDays = document.getElementById('stat-active-days');
  
  if (statTasks) {
    statTasks.textContent = stats.tasksCompleted || 0;
  }
  
  if (statPomodoros) {
    statPomodoros.textContent = stats.pomodorosCompleted || 0;
  }
  
  if (statJournals) {
    statJournals.textContent = stats.journalEntries || 0;
  }
  
  if (statBattlesWon) {
    statBattlesWon.textContent = stats.battlesWon || 0;
  }
  
  if (statFocusTime) {
    // Calculate focus time from pomodoros (assuming 25 min per pomodoro)
    const focusMinutes = (stats.pomodorosCompleted || 0) * 25;
    const focusHours = Math.floor(focusMinutes / 60);
    statFocusTime.textContent = `${focusHours}h`;
  }
  
  if (statActiveDays) {
    // For now, just use a placeholder - in a real app you'd track login days
    statActiveDays.textContent = stats.activeDays || 1;
  }
}

// Display achievements
function displayAchievements(achievements) {
  const achievementsContainer = document.getElementById('achievements-container');
  if (!achievementsContainer) return;
  
  if (achievements.length === 0) {
    achievementsContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-medal"></i>
        <p>No achievements unlocked yet</p>
      </div>
    `;
    return;
  }
  
  const achievementsHTML = achievements.map(achievement => {
    return `
      <div class="achievement-card">
        <div class="achievement-icon">
          <i class="${achievement.icon || 'fas fa-medal'}"></i>
        </div>
        <div class="achievement-info">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
          <div class="achievement-date">Unlocked on ${formatDate(achievement.unlockedAt)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  achievementsContainer.innerHTML = achievementsHTML;
}

// Setup profile event listeners
function setupProfileEventListeners(userId) {
  // Edit profile button to open modal
  const editProfileBtn = document.getElementById('edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      const editProfileModal = document.getElementById('edit-profile-modal');
      if (editProfileModal) {
        editProfileModal.style.display = 'flex';
      }
    });
  }
  
  // Close modal buttons
  const closeModalButtons = document.querySelectorAll('.close-modal, #cancel-edit');
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Change avatar button
  const changeAvatarBtn = document.getElementById('change-avatar-btn');
  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener('click', () => {
      // Open the edit profile modal and focus on avatar upload
      const editProfileModal = document.getElementById('edit-profile-modal');
      if (editProfileModal) {
        editProfileModal.style.display = 'flex';
        // Focus on avatar section
        const uploadAvatarBtn = document.getElementById('upload-avatar');
        if (uploadAvatarBtn) {
          uploadAvatarBtn.focus();
        }
      }
    });
  }
  
  // Upload avatar button
  const uploadAvatarBtn = document.getElementById('upload-avatar');
  const editAvatarInput = document.getElementById('edit-avatar');
  if (uploadAvatarBtn && editAvatarInput) {
    uploadAvatarBtn.addEventListener('click', () => {
      editAvatarInput.click();
    });
    
    // Handle file selection
    editAvatarInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        // Preview the image
        const reader = new FileReader();
        reader.onload = (e) => {
          const avatarPreview = document.querySelector('#avatar-preview img');
          if (avatarPreview) {
            avatarPreview.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
        
        // In a real app, you would upload this to storage
        // For now, we'll just use the data URL for demonstration
      }
    });
  }
  
  // Edit profile form submission
  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const displayName = document.getElementById('edit-name').value.trim();
      const bio = document.getElementById('edit-bio').value.trim();
      const status = document.getElementById('edit-status').value;
      const avatarPreview = document.querySelector('#avatar-preview img').src;
      
      try {
        // Show loading state
        const submitButton = editProfileForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitButton.disabled = true;
        
        // Update profile data
        await window.database.updateUserProfile(userId, {
          displayName,
          profile: {
            bio,
            status,
            avatar: avatarPreview
          }
        });
        
        // Close the modal
        const editProfileModal = document.getElementById('edit-profile-modal');
        if (editProfileModal) {
          editProfileModal.style.display = 'none';
        }
        
        // Show success notification
        showNotification('success', 'Profile updated successfully!');
        
        // Reset button
        submitButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        submitButton.disabled = false;
      } catch (error) {
        console.error('Error saving profile changes:', error);
        showNotification('error', 'Failed to update profile');
        
        // Reset button
        const submitButton = editProfileForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        submitButton.disabled = false;
      }
    });
  }
}

// Save profile changes
async function saveProfileChanges(userId) {
  try {
    console.log('Saving profile changes for user:', userId);
    
    // Check for all required form elements
    const formElements = {
      'edit-bio': document.getElementById('edit-bio'),
      'edit-name': document.getElementById('edit-name'),
      'edit-status': document.getElementById('edit-status'),
      'avatar-preview': document.querySelector('#avatar-preview img'),
      'save-profile-btn': document.getElementById('save-profile-btn')
    };
    
    console.log('Form elements found:', 
      Object.keys(formElements).filter(key => formElements[key] !== null));
    console.log('Form elements missing:', 
      Object.keys(formElements).filter(key => formElements[key] === null));
    
    // Check for required elements
    if (!formElements['edit-bio']) {
      console.error('Cannot find edit-bio element');
      showNotification('error', 'Bio field not found');
      return;
    }
    
    const bio = formElements['edit-bio'].value.trim();
    console.log('Bio to save:', bio);
    
    // Get the status value
    const status = formElements['edit-status'] ? 
      formElements['edit-status'].value.trim() : 'active';
    console.log('Status to save:', status);
    
    // Get avatar URL
    const avatarUrl = formElements['avatar-preview'] ? 
      formElements['avatar-preview'].src : 'assets/images/placeholder-frame.png';
    console.log('Avatar to save:', avatarUrl);
    
    // Show loading state
    const saveProfileBtn = formElements['save-profile-btn'];
    if (saveProfileBtn) {
      saveProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
      saveProfileBtn.disabled = true;
    }
    
    // Update profile in Firebase with all profile details at once
    await window.database.updateProfileDetails(userId, { 
      bio, 
      status,
      avatar: avatarUrl 
    });
    
    // Get the display name as well (from edit-name field)
    const editName = formElements['edit-name'];
    if (editName) {
      const displayName = editName.value.trim();
      if (displayName) {
        console.log('Updating display name:', displayName);
        await window.database.updateUserProfile(userId, { displayName });
      }
    }
    
    // Close the modal
    const editProfileModal = document.getElementById('edit-profile-modal');
    if (editProfileModal) {
      editProfileModal.style.display = 'none';
    }
    
    // Show success notification
    showNotification('success', 'Profile updated successfully!');
    
    // Reset button
    if (saveProfileBtn) {
      saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
      saveProfileBtn.disabled = false;
    }
    
    // Refresh the profile data
    await loadUserProfile(userId);
  } catch (error) {
    console.error('Error saving profile changes:', error);
    showNotification('error', 'Failed to update profile: ' + error.message);
    
    // Reset button
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
      saveProfileBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
      saveProfileBtn.disabled = false;
    }
  }
}

// Change profile avatar
function changeProfileAvatar(userId) {
  // For now, let's use a simple prompt to enter an image URL
  // In a real app, you would use file upload or avatar selection
  const avatarUrl = prompt('Enter avatar image URL:');
  
  if (!avatarUrl) return;
  
  // Update avatar in Firebase
  window.database.updateProfileDetails(userId, { avatar: avatarUrl })
    .then(() => {
      // Update avatar in the UI
      const profileAvatar = document.getElementById('profile-avatar');
      if (profileAvatar) {
        profileAvatar.src = avatarUrl;
      }
      
      showNotification('success', 'Avatar updated successfully!');
    })
    .catch(error => {
      console.error('Error updating avatar:', error);
      showNotification('error', 'Failed to update avatar');
    });
}

// Set up real-time listener for profile updates
function setupProfileListener(userId) {
  return window.database.listenForUserProfile(userId, userData => {
    // Update UI with new data
    displayUserProfile(userData);
    displayUserStats(userData.stats || {});
    displayAchievements(userData.profile?.achievements || []);
  });
}

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return 'Unknown date';
  
  // Handle Firebase Server Timestamp objects 
  // or numeric timestamps (milliseconds since epoch)
  let date;
  if (typeof timestamp === 'object' && timestamp !== null) {
    // Handle case where timestamp might be a Firebase ServerValue or raw server timestamp
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Raw server timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      // Some other object, use current date as fallback
      console.warn('Unknown timestamp format:', timestamp);
      date = new Date();
    }
  } else {
    // Numeric timestamp
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Show notification
function showNotification(type, message) {
  // Check if notification container exists, create if not
  let notifContainer = document.getElementById('notification-container');
  
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.id = 'notification-container';
    document.body.appendChild(notifContainer);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add to container
  notifContainer.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}
