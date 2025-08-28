// Main JavaScript file

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

// Initialize theme from localStorage or default to human mode
function initTheme() {
  const savedMode = localStorage.getItem('theme-mode') || 'human';
  document.body.className = savedMode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
  
  // Update toggle button if it exists
  const toggleBtn = document.getElementById('mode-toggle-btn');
  if (toggleBtn) {
    // Apply specific styles based on current mode
    if (savedMode === 'ghoul') {
      document.documentElement.style.setProperty('--primary-bg-image', 'url("assets/images/ghoul-bg.jpg")');
      updateToggleUI('ghoul');
    } else {
      document.documentElement.style.setProperty('--primary-bg-image', 'url("assets/images/human-bg.jpg")');
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
  
  // Helper function to update toggle UI elements
  function updateToggleUI(mode) {
    const knob = toggleBtn.querySelector('.mode-toggle-knob');
    const iconActive = toggleBtn.querySelector('.mode-icon-active');
    const humanIcon = toggleBtn.querySelector('.human-icon');
    const ghoulIcon = toggleBtn.querySelector('.ghoul-icon');
    
    if (mode === 'ghoul') {
      knob.style.transform = 'translateX(66px)';
      iconActive.innerHTML = '<i class="fas fa-mask"></i>';
      humanIcon.style.opacity = '0.5';
      ghoulIcon.style.opacity = '1';
    } else {
      knob.style.transform = 'translateX(0)';
      iconActive.innerHTML = '<i class="fas fa-user"></i>';
      humanIcon.style.opacity = '1';
      ghoulIcon.style.opacity = '0.5';
    }
  }
}

// Toggle between Human and Ghoul mode
function toggleTheme() {
  const currentMode = document.body.classList.contains('ghoul-mode') ? 'ghoul' : 'human';
  const newMode = currentMode === 'ghoul' ? 'human' : 'ghoul';
  
  // Get the toggle button and its components
  const toggleBtn = document.getElementById('mode-toggle-btn');
  const knob = toggleBtn.querySelector('.mode-toggle-knob');
  const iconActive = toggleBtn.querySelector('.mode-icon-active');
  const humanIcon = toggleBtn.querySelector('.human-icon');
  const ghoulIcon = toggleBtn.querySelector('.ghoul-icon');
  
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
  if (window.tokyoGhoulAnimation && newMode === 'ghoul') {
    // Create and start animation only when switching to ghoul mode
    const themeAnimation = window.tokyoGhoulAnimation.createThemeAnimation({
      duration: 3000, // 3 seconds for theme switching
      showProgress: true,
      caption: 'Becoming Ghoul',
      onComplete: () => {
        // This is called when animation completes
        completeThemeChange();
      }
    });
    
    // Start the animation
    themeAnimation.start();
  } else {
    // If switching to human mode or animation not available, just change immediately
    fallbackThemeChange();
  }
  
  // Function to complete theme change after animation
  function completeThemeChange() {
    // Update body class
    document.body.className = newMode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
    
    // Update toggle UI based on new mode
    if (newMode === 'ghoul') {
      // Update knob position with animation
      if (knob) knob.style.transform = 'translateX(66px)';
      if (iconActive) iconActive.innerHTML = '<i class="fas fa-mask"></i>';
      if (humanIcon) humanIcon.style.opacity = '0.5';
      if (ghoulIcon) ghoulIcon.style.opacity = '1';
    } else {
      // Update knob position with animation
      if (knob) knob.style.transform = 'translateX(0)';
      if (iconActive) iconActive.innerHTML = '<i class="fas fa-user"></i>';
      if (humanIcon) humanIcon.style.opacity = '1';
      if (ghoulIcon) ghoulIcon.style.opacity = '0.5';
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme-mode', newMode);
    
    // If user is logged in, save preference to database
    if (auth && auth.isLoggedIn()) {
      const userId = auth.getCurrentUser().uid;
      database.updateUserMode(userId, newMode);
    }
    
    // Dispatch theme change event
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode: newMode } }));
  }
  
  // Fallback animation function if the new animation is not available
  function fallbackThemeChange() {
    // Add subtle transition indicator near the toggle button instead of full screen overlay
    let toggleRect;
    try {
      toggleRect = toggleBtn.getBoundingClientRect();
    } catch (err) {
      // Fallback if getBoundingClientRect fails
      toggleRect = { top: 20, left: 20, width: 140, height: 40 };
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'mode-transition-indicator';
    overlay.style.cssText = `
      position: fixed;
      top: ${toggleRect.top - 5}px;
      left: ${toggleRect.left - 5}px;
      width: ${toggleRect.width + 10}px;
      height: ${toggleRect.height + 10}px;
      border-radius: 25px;
      background-color: transparent;
      box-shadow: 0 0 15px ${newMode === 'ghoul' ? 'rgba(255, 0, 0, 0.6)' : 'rgba(13, 110, 253, 0.6)'};
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: all 0.4s ease-in-out;
    `;
    document.body.appendChild(overlay);
    
    // Trigger transition animation
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'scale(1.1)';
      
      // Update toggle UI based on new mode
      if (newMode === 'ghoul') {
        // Update knob position with animation
        if (knob) knob.style.transform = 'translateX(66px)';
        if (iconActive) iconActive.innerHTML = '<i class="fas fa-mask"></i>';
        if (humanIcon) humanIcon.style.opacity = '0.5';
        if (ghoulIcon) ghoulIcon.style.opacity = '1';
      } else {
        // Update knob position with animation
        if (knob) knob.style.transform = 'translateX(0)';
        if (iconActive) iconActive.innerHTML = '<i class="fas fa-user"></i>';
        if (humanIcon) humanIcon.style.opacity = '1';
        if (ghoulIcon) ghoulIcon.style.opacity = '0.5';
      }
      
      // Update body class after slight delay for smooth transition
      setTimeout(() => {
        // Update body class
        document.body.className = newMode === 'ghoul' ? 'ghoul-mode' : 'human-mode';
        
        // Save preference to localStorage
        localStorage.setItem('theme-mode', newMode);
        
        // If user is logged in, save preference to database
        if (auth && auth.isLoggedIn()) {
          const userId = auth.getCurrentUser().uid;
          database.updateUserMode(userId, newMode);
        }
        
        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode: newMode } }));
        
        // Fade out indicator and remove it
        setTimeout(() => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(overlay)) {
              document.body.removeChild(overlay);
            }
          }, 400);
        }, 300);
      }, 300);
    }, 50);
    
    // Play sound effect if audio is available
    const audioFile = newMode === 'ghoul' ? 'kagune-activate.mp3' : 'kagune-deactivate.mp3';
    try {
      const audio = new Audio(`assets/audio/${audioFile}`);
      audio.volume = 0.3;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio not available:', err);
    }
  }
}

// Check if user is logged in and redirect accordingly
function checkAuthState() {
  // Add auth state change listener (this is a backup, the main listener is in auth.js)
  firebase.auth().onAuthStateChanged(user => {
    console.log('Main.js auth state changed:', user ? 'User logged in' : 'User not logged in');
    
    // Only handle redirects for index/login page and dashboard
    const path = window.location.pathname;
    const isLoginPage = path.endsWith('index.html') || path.endsWith('/');
    const isDashboardPage = path.endsWith('dashboard.html');
    
    // Don't handle redirects for other pages (profile, journal, etc.)
    // Those pages will handle auth state themselves
    const shouldHandleRedirect = isLoginPage || isDashboardPage;
    
    if (!shouldHandleRedirect) {
      console.log('Not handling auth redirects for this page:', path);
      return;
    }
    
    if (user) {
      // User is logged in
      if (isLoginPage) {
        // Redirect to dashboard if on login page
        window.location.href = 'dashboard.html';
      }
    } else {
      // User is not logged in
      if (!isLoginPage) {
        // Redirect to login page if not already there
        window.location.href = 'index.html';
      }
    }
  });
  
  // Set up logout button if it exists
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.logout().then(() => {
        window.location.href = 'index.html';
      });
    });
  }
}

// Initialize page-specific elements
function initCurrentPage() {
  const path = window.location.pathname;
  
  // Login/Signup page
  if (path.endsWith('index.html') || path.endsWith('/')) {
    initLoginPage();
  }
}

// Initialize login page
function initLoginPage() {
  const loginForm = document.querySelector('#login-form form');
  const signupForm = document.querySelector('#signup-form form');
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const tabSlider = document.querySelector('.tab-slider');
  const guestLoginBtn = document.getElementById('guest-login');
  const loginError = document.getElementById('login-error');
  const signupError = document.getElementById('signup-error');
  const loadingScreen = document.getElementById('loading-screen');
  const passwordToggles = document.querySelectorAll('.password-toggle');
  
  // Apply animation to the logo when page loads
  animateLogoEntrance();
  
  // Tab switching functionality
  if (loginTab && signupTab) {
    loginTab.addEventListener('click', () => {
      switchTab('login');
    });
    
    signupTab.addEventListener('click', () => {
      switchTab('signup');
    });
  }
  
  // Handle tab switching with animation
  function switchTab(tabType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Reset error messages
    loginError.style.display = 'none';
    signupError.style.display = 'none';
    
    if (tabType === 'signup') {
      // Update tabs
      loginTab.classList.remove('active');
      signupTab.classList.add('active');
      
      // Move tab slider with animation
      tabSlider.style.transform = 'translateX(100%)';
      
      // Update forms with slide animation
      loginForm.classList.remove('active');
      signupForm.classList.add('active');
      
      // Apply entrance animation for signup form
      signupForm.style.animation = 'slide-in-right 0.4s ease-out forwards';
      
      // Play tab switch sound if available
      playSound('tab-switch.mp3', 0.2);
    } else {
      // Update tabs
      signupTab.classList.remove('active');
      loginTab.classList.add('active');
      
      // Move tab slider
      tabSlider.style.transform = 'translateX(0)';
      
      // Update forms
      signupForm.classList.remove('active');
      loginForm.classList.add('active');
      
      // Apply entrance animation for login form
      loginForm.style.animation = 'slide-in-left 0.4s ease-out forwards';
      
      // Play tab switch sound if available
      playSound('tab-switch.mp3', 0.2);
    }
  }
  
  // Helper function to play sounds
  function playSound(soundFile, volume = 0.3) {
    try {
      const audio = new Audio(`assets/audio/${soundFile}`);
      audio.volume = volume;
      audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
      console.log('Audio not available:', err);
    }
  }
  
  // Add animation to logo when page loads
  function animateLogoEntrance() {
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
      logoContainer.style.opacity = '0';
      logoContainer.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        logoContainer.style.transition = 'all 0.8s ease-out';
        logoContainer.style.opacity = '1';
        logoContainer.style.transform = 'translateY(0)';
      }, 300);
    }
  }
  
  // Toggle password visibility
  if (passwordToggles) {
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const passwordField = e.currentTarget.parentNode.querySelector('input');
        const eyeIcon = e.currentTarget.querySelector('i');
        
        if (passwordField.type === 'password') {
          passwordField.type = 'text';
          eyeIcon.classList.remove('fa-eye');
          eyeIcon.classList.add('fa-eye-slash');
        } else {
          passwordField.type = 'password';
          eyeIcon.classList.remove('fa-eye-slash');
          eyeIcon.classList.add('fa-eye');
        }
      });
    });
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        loadingScreen.style.display = 'flex';
        await auth.loginWithEmail(email, password);
        // Redirect will happen automatically via the auth state change listener
      } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
        loadingScreen.style.display = 'none';
      }
    });
  }
  
  // Handle signup form submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      
      try {
        loadingScreen.style.display = 'flex';
        await auth.registerWithEmail(email, password, name);
        // Redirect will happen automatically via the auth state change listener
      } catch (error) {
        signupError.textContent = error.message;
        signupError.style.display = 'block';
        loadingScreen.style.display = 'none';
      }
    });
  }
  
  // Handle guest login
  if (guestLoginBtn) {
    guestLoginBtn.addEventListener('click', async () => {
      try {
        loadingScreen.style.display = 'flex';
        await auth.loginAnonymously();
        // Redirect will happen automatically via the auth state change listener
      } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = 'block';
        loadingScreen.style.display = 'none';
      }
    });
  }
}

// Set up inactivity tracker
function setupInactivityTracker() {
  const inactivityTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  let inactivityTimer;
  let warningTimer;
  let warningCountdown;
  
  // Reset timer on any user activity
  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    clearInterval(warningTimer);
    
    // Hide warning modal if it's visible
    const modal = document.getElementById('inactivity-modal');
    if (modal && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
    
    // Set new inactivity timer
    inactivityTimer = setTimeout(showWarning, inactivityTime);
  };
  
  // Show warning before switching to Ghoul mode
  const showWarning = () => {
    // Only show warning if user is in Human mode
    if (!document.body.classList.contains('human-mode')) {
      return;
    }
    
    const modal = document.getElementById('inactivity-modal');
    const countdown = document.getElementById('inactivity-countdown');
    
    if (modal && countdown) {
      modal.style.display = 'block';
      
      let secondsLeft = 30; // 30 seconds warning
      countdown.textContent = secondsLeft;
      
      // Update countdown every second
      warningTimer = setInterval(() => {
        secondsLeft--;
        countdown.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
          clearInterval(warningTimer);
          switchToGhoulMode();
        }
      }, 1000);
    } else {
      // If modal elements don't exist, switch immediately
      switchToGhoulMode();
    }
  };
  
  // Switch to Ghoul mode
  const switchToGhoulMode = () => {
    // Only switch if not already in Ghoul mode
    if (!document.body.classList.contains('ghoul-mode')) {
      document.body.className = 'ghoul-mode';
      
      // Update toggle button if it exists
      const toggleBtn = document.getElementById('mode-toggle-btn');
      if (toggleBtn) {
        const iconActive = toggleBtn.querySelector('.mode-icon-active');
        const humanIcon = toggleBtn.querySelector('.human-icon');
        const ghoulIcon = toggleBtn.querySelector('.ghoul-icon');
        const knob = toggleBtn.querySelector('.mode-toggle-knob');
        
        if (knob) knob.style.transform = 'translateX(66px)';
        if (iconActive) iconActive.innerHTML = '<i class="fas fa-mask"></i>';
        if (humanIcon) humanIcon.style.opacity = '0.5';
        if (ghoulIcon) ghoulIcon.style.opacity = '1';
      }
      
      // Save preference to localStorage
      localStorage.setItem('theme-mode', 'ghoul');
      
      // If user is logged in, save preference to database
      if (auth && auth.isLoggedIn()) {
        const userId = auth.getCurrentUser().uid;
        database.updateUserMode(userId, 'ghoul');
      }
      
      // Hide warning modal
      const modal = document.getElementById('inactivity-modal');
      if (modal) {
        modal.style.display = 'none';
      }
      
      // Dispatch theme change event
      document.dispatchEvent(new CustomEvent('themeChanged', { detail: { mode: 'ghoul' } }));
    }
  };
  
  // Add event listeners for user activity
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  document.addEventListener('touchstart', resetTimer);
  document.addEventListener('click', resetTimer);
  
  // Set up cancel button for warning modal
  const cancelBtn = document.getElementById('cancel-mode-switch');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', resetTimer);
  }
  
  // Start the timer initially
  resetTimer();
}
