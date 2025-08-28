/**
 * BlackReaper v2 - Main JavaScript
 * Inspired by Tokyo Ghoul
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  initTheme();
  
  // Check if user is logged in
  checkAuthState();
  
  // Initialize UI elements based on current page
  initCurrentPage();
  
  // Set up inactivity tracker for auto-switching to Ghoul mode
  setupInactivityTracker();
});

/**
 * Initialize theme from localStorage or default to human mode
 */
function initTheme() {
  const savedMode = localStorage.getItem('theme-mode') || 'human';
  document.body.className = savedMode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
  
  // Update toggle button if it exists
  const toggleBtn = document.getElementById('mode-toggle-btn');
  if (toggleBtn) {
    // Apply specific styles based on current mode
    if (savedMode === 'ghoul') {
      updateToggleUI('ghoul');
    } else {
      updateToggleUI('human');
    }
    
    // Add event listener to toggle button
    toggleBtn.addEventListener('click', toggleTheme);
    
    // Add animation to toggle button
    setTimeout(() => {
      toggleBtn.classList.add('toggle-ready');
      
      // Add initial animation to the knob
      const knob = toggleBtn.querySelector('.mode-toggle-knob');
      if (knob) {
        knob.style.animation = 'pulse-knob 2s infinite';
      }
    }, 1000);
  }
}

/**
 * Update toggle UI elements based on current theme
 * @param {string} mode - 'human' or 'ghoul'
 */
function updateToggleUI(mode) {
  const toggleBtn = document.getElementById('mode-toggle-btn');
  if (!toggleBtn) return;
  
  const knob = toggleBtn.querySelector('.mode-toggle-knob');
  const iconActive = toggleBtn.querySelector('.mode-icon-active');
  const humanIcon = toggleBtn.querySelector('.human-icon');
  const ghoulIcon = toggleBtn.querySelector('.ghoul-icon');
  
  if (mode === 'ghoul') {
    knob.style.transform = 'translateX(78px)';
    if (iconActive) iconActive.innerHTML = '<i class="fas fa-mask"></i>';
    if (humanIcon) humanIcon.style.opacity = '0.5';
    if (ghoulIcon) ghoulIcon.style.opacity = '1';
  } else {
    knob.style.transform = 'translateX(0)';
    if (iconActive) iconActive.innerHTML = '<i class="fas fa-user"></i>';
    if (humanIcon) humanIcon.style.opacity = '1';
    if (ghoulIcon) ghoulIcon.style.opacity = '0.5';
  }
}

/**
 * Toggle between Human and Ghoul mode
 */
function toggleTheme() {
  const currentMode = document.body.classList.contains('ghoul-mode') ? 'ghoul' : 'human';
  const newMode = currentMode === 'ghoul' ? 'human' : 'ghoul';
  
  // Get the toggle button and its components
  const toggleBtn = document.getElementById('mode-toggle-btn');
  const knob = toggleBtn.querySelector('.mode-toggle-knob');
  
  // First animate the knob with rotation
  if (knob) {
    knob.style.animation = 'rotate-icon 0.5s ease-out';
    
    // When animation ends, reset it to the pulsing animation
    knob.addEventListener('animationend', function resetAnim() {
      knob.style.animation = 'pulse-knob 2s infinite';
      knob.removeEventListener('animationend', resetAnim);
    });
  }
  
  // Only show the animation when switching TO ghoul mode, not FROM it
  if (window.themeAnimator && newMode === 'ghoul') {
    // Create and start animation only when switching to ghoul mode
    window.themeAnimator.playThemeAnimation({
      duration: 3000, // 3 seconds for theme switching
      showProgress: true,
      caption: 'Becoming Ghoul',
      onComplete: () => {
        finishThemeToggle(newMode);
      }
    });
  } else {
    // If switching to human mode or animation not available, just switch immediately
    finishThemeToggle(newMode);
  }
  
  // Play audio if available
  playThemeAudio(newMode);
}

/**
 * Complete the theme toggle process
 * @param {string} newMode - 'human' or 'ghoul'
 */
function finishThemeToggle(newMode) {
  // Update body class
  document.body.className = newMode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
  
  // Save preference to localStorage
  localStorage.setItem('theme-mode', newMode);
  
  // Update the UI
  updateToggleUI(newMode);
  
  // Dispatch a custom event that other modules can listen for
  document.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode: newMode } }));
  
  // Show notification
  if (window.notificationManager) {
    window.notificationManager.showNotification({
      title: newMode === 'ghoul' ? 'Ghoul Mode Activated' : 'Human Mode Activated',
      message: newMode === 'ghoul' 
        ? 'Embrace your darkness. Feed your productivity.' 
        : 'Return to humanity. Maintain balance.',
      type: 'info',
      icon: newMode === 'ghoul' ? 'fa-mask' : 'fa-user'
    });
  }
}

/**
 * Play audio corresponding to the theme change
 * @param {string} mode - 'human' or 'ghoul'
 */
function playThemeAudio(mode) {
  const audioFile = mode === 'ghoul' 
    ? 'assets/audio/kagune-activate.mp3' 
    : 'assets/audio/kagune-deactivate.mp3';
    
  const audio = new Audio(audioFile);
  audio.volume = 0.5;
  audio.play().catch(err => console.log('Audio play error:', err));
}

/**
 * Check user authentication state
 */
function checkAuthState() {
  if (!window.firebase) {
    console.error('Firebase not loaded');
    return;
  }
  
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // User is signed in
      console.log('User signed in:', user.email);
      
      // Get current page
      const currentPage = window.location.pathname;
      
      // If on login page, redirect to dashboard
      if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        window.location.href = 'dashboard.html';
      }
      
      // Load user data
      loadUserData(user.uid);
    } else {
      // User is signed out
      console.log('User signed out');
      
      // Get current page
      const currentPage = window.location.pathname;
      
      // If on dashboard or other protected page, redirect to login
      if (!currentPage.includes('index.html') && !currentPage.endsWith('/')) {
        window.location.href = 'index.html';
      }
    }
  });
}

/**
 * Load user data from Firebase
 * @param {string} userId - Firebase user ID
 */
function loadUserData(userId) {
  if (!window.firebase) {
    console.error('Firebase not loaded');
    return;
  }
  
  // Reference to user data in Firebase
  const userRef = firebase.database().ref(`users/${userId}`);
  
  userRef.once('value', snapshot => {
    const userData = snapshot.val() || {};
    
    // Store user data in a global variable for other modules to access
    window.currentUser = {
      uid: userId,
      displayName: userData.displayName || 'Anonymous',
      email: userData.email || '',
      rcCells: userData.rcCells || 0,
      level: userData.level || 1,
      bio: userData.bio || '',
      createdAt: userData.createdAt || Date.now(),
      lastActive: Date.now(),
      theme: userData.theme || 'human'
    };
    
    // Update last active timestamp
    userRef.update({
      lastActive: Date.now()
    });
    
    // Update UI elements with user data
    updateUserElements();
    
    // Initialize RC cells tracking
    initRcCellsTracking(userId);
  });
}

/**
 * Update UI elements with user data
 */
function updateUserElements() {
  // Check if user data is loaded
  if (!window.currentUser) return;
  
  // Update user name elements
  const userNameElements = document.querySelectorAll('.user-name');
  userNameElements.forEach(el => {
    el.textContent = window.currentUser.displayName;
  });
  
  // Update RC cell count
  const rcCountElements = document.querySelectorAll('#rc-cell-count');
  rcCountElements.forEach(el => {
    el.textContent = window.currentUser.rcCells.toLocaleString();
  });
}

/**
 * Initialize RC cells tracking
 * @param {string} userId - Firebase user ID
 */
function initRcCellsTracking(userId) {
  if (!window.firebase) {
    console.error('Firebase not loaded');
    return;
  }
  
  // Reference to user RC cells in Firebase
  const rcCellsRef = firebase.database().ref(`users/${userId}/rcCells`);
  
  // Listen for changes to RC cells
  rcCellsRef.on('value', snapshot => {
    const rcCells = snapshot.val() || 0;
    
    // Update global user data
    if (window.currentUser) {
      window.currentUser.rcCells = rcCells;
    }
    
    // Update RC cell count elements
    const rcCountElements = document.querySelectorAll('#rc-cell-count');
    rcCountElements.forEach(el => {
      el.textContent = rcCells.toLocaleString();
    });
  });
}

/**
 * Initialize page-specific features
 */
function initCurrentPage() {
  const currentPage = window.location.pathname;
  
  // Initialize sidebar toggling for mobile
  initSidebarToggle();
  
  // Check for login/signup form
  if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
    initLoginSignupForms();
  }
}

/**
 * Initialize sidebar toggle for mobile
 */
function initSidebarToggle() {
  const sidebarToggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggleBtn && sidebar) {
    sidebarToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
}

/**
 * Initialize login/signup form tabs and functionality
 */
function initLoginSignupForms() {
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const tabSlider = document.querySelector('.tab-slider');
  
  if (loginTab && signupTab && loginForm && signupForm) {
    // Tab switching
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.classList.add('active');
      signupForm.classList.remove('active');
      
      if (tabSlider) {
        tabSlider.style.transform = 'translateX(0)';
      }
      
      // Play tab switch sound
      playTabSwitchSound();
    });
    
    signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.classList.add('active');
      loginForm.classList.remove('active');
      
      if (tabSlider) {
        tabSlider.style.transform = 'translateX(100%)';
      }
      
      // Play tab switch sound
      playTabSwitchSound();
    });
    
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const input = toggle.parentElement.querySelector('input');
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
    
    // Form submission for login
    const loginFormEl = loginForm.querySelector('form');
    if (loginFormEl) {
      loginFormEl.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        if (!email || !password) {
          errorEl.textContent = 'Please enter both email and password';
          return;
        }
        
        // Clear error message
        errorEl.textContent = '';
        
        // Show loading state
        const loginBtn = loginFormEl.querySelector('button[type="submit"]');
        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;
        
        // Attempt to login
        if (window.firebase) {
          firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
              // Redirect to dashboard
              window.location.href = 'dashboard.html';
            })
            .catch(error => {
              errorEl.textContent = error.message;
              
              // Reset button
              loginBtn.innerHTML = originalBtnText;
              loginBtn.disabled = false;
            });
        } else {
          errorEl.textContent = 'Firebase not loaded';
          loginBtn.innerHTML = originalBtnText;
          loginBtn.disabled = false;
        }
      });
    }
    
    // Form submission for signup
    const signupFormEl = signupForm.querySelector('form');
    if (signupFormEl) {
      signupFormEl.addEventListener('submit', e => {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorEl = document.getElementById('signup-error');
        
        if (!username || !email || !password || !confirmPassword) {
          errorEl.textContent = 'Please fill in all fields';
          return;
        }
        
        if (password !== confirmPassword) {
          errorEl.textContent = 'Passwords do not match';
          return;
        }
        
        // Clear error message
        errorEl.textContent = '';
        
        // Show loading state
        const signupBtn = signupFormEl.querySelector('button[type="submit"]');
        const originalBtnText = signupBtn.innerHTML;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        signupBtn.disabled = true;
        
        // Attempt to create account
        if (window.firebase) {
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
              // Create user profile
              return firebase.database().ref(`users/${userCredential.user.uid}`).set({
                displayName: username,
                email: email,
                rcCells: 100, // Starting RC cells
                level: 1,
                createdAt: Date.now(),
                lastActive: Date.now(),
                theme: 'human'
              });
            })
            .then(() => {
              // Redirect to dashboard
              window.location.href = 'dashboard.html';
            })
            .catch(error => {
              errorEl.textContent = error.message;
              
              // Reset button
              signupBtn.innerHTML = originalBtnText;
              signupBtn.disabled = false;
            });
        } else {
          errorEl.textContent = 'Firebase not loaded';
          signupBtn.innerHTML = originalBtnText;
          signupBtn.disabled = false;
        }
      });
    }
    
    // Guest login button
    const guestLoginBtn = document.getElementById('guest-login');
    if (guestLoginBtn) {
      guestLoginBtn.addEventListener('click', () => {
        // Show loading state
        const originalBtnText = guestLoginBtn.innerHTML;
        guestLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        guestLoginBtn.disabled = true;
        
        // Attempt to login as guest
        if (window.firebase) {
          firebase.auth().signInAnonymously()
            .then(() => {
              // Create guest user profile
              const userId = firebase.auth().currentUser.uid;
              return firebase.database().ref(`users/${userId}`).set({
                displayName: 'Guest User',
                email: 'guest@example.com',
                rcCells: 50, // Starting RC cells for guest
                level: 1,
                isGuest: true,
                createdAt: Date.now(),
                lastActive: Date.now(),
                theme: 'human'
              });
            })
            .then(() => {
              // Redirect to dashboard
              window.location.href = 'dashboard.html';
            })
            .catch(error => {
              const errorEl = document.getElementById('login-error');
              errorEl.textContent = error.message;
              
              // Reset button
              guestLoginBtn.innerHTML = originalBtnText;
              guestLoginBtn.disabled = false;
            });
        } else {
          const errorEl = document.getElementById('login-error');
          errorEl.textContent = 'Firebase not loaded';
          guestLoginBtn.innerHTML = originalBtnText;
          guestLoginBtn.disabled = false;
        }
      });
    }
  }
  
  // Apply initial form animations
  setTimeout(() => {
    const authForm = document.querySelector('.auth-form');
    if (authForm) {
      authForm.classList.add('fade-in');
    }
  }, 100);
}

/**
 * Play tab switch sound
 */
function playTabSwitchSound() {
  const audio = new Audio('assets/audio/tab-switch.mp3');
  audio.volume = 0.3;
  audio.play().catch(err => console.log('Audio play error:', err));
}

/**
 * Set up inactivity tracker to auto-switch to Ghoul mode
 */
function setupInactivityTracker() {
  const inactivityTimeout = 30 * 60 * 1000; // 30 minutes
  let inactivityTimer;
  
  // Reset the timer on user activity
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(switchToGhoulMode, inactivityTimeout);
  }
  
  // Switch to Ghoul mode after inactivity
  function switchToGhoulMode() {
    const currentMode = document.body.classList.contains('ghoul-mode') ? 'ghoul' : 'human';
    
    if (currentMode === 'human') {
      // Show notification
      if (window.notificationManager) {
        window.notificationManager.showNotification({
          title: 'Inactivity Detected',
          message: 'Switching to Ghoul Mode due to inactivity.',
          type: 'info',
          icon: 'fa-clock'
        });
      }
      
      // Switch to Ghoul mode
      document.body.className = 'ghoul-mode';
      localStorage.setItem('theme-mode', 'ghoul');
      updateToggleUI('ghoul');
    }
  }
  
  // Events to track user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  
  // Add event listeners
  activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  
  // Start the initial timer
  resetInactivityTimer();
}
