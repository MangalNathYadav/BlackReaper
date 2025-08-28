// BlackReaper Application
// Main application entry point

import { 
  onAuthStateChanged,
  signOut
} from "../firebase/firebase.js";
import stateManager from "../firebase/state.js";
import ui from "../firebase/ui.js";

/**
 * Main application class for BlackReaper
 */
class BlackReaperApp {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.modules = {};
    
    // Initialize app
    this.init();
  }

  /**
   * Detect current page based on URL
   * @returns {string} Current page name
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    if (filename === '' || filename === 'index.html') {
      return 'login';
    } else if (filename.includes('.html')) {
      return filename.replace('.html', '');
    } else {
      return 'unknown';
    }
  }

  /**
   * Initialize application
   */
  async init() {
    console.log(`Initializing BlackReaper app on ${this.currentPage} page`);
    
    // Ensure Firebase is properly initialized
    this.ensureFirebaseInitialized();
    
    // Set up auth listener
    this.setupAuthListener();
    
    // Set up common UI elements
    this.setupCommonUI();
    
    // Set up page-specific initialization
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializePage());
    } else {
      this.initializePage();
    }
    
    // Initialize integrated services
    this.initializeServices();
    
    // Set up theme sync
    document.addEventListener('blackreaper.themeChanged', (event) => {
      this.handleThemeChange(event.detail.mode);
    });
  }

  /**
   * Set up authentication state listener
   */
  setupAuthListener() {
    onAuthStateChanged(user => {
      if (user) {
        console.log('User is signed in');
        
        // Public pages that don't require auth
        const publicPages = ['login'];
        
        // Admin pages that require admin privileges
        const adminPages = ['admin'];
        
        if (publicPages.includes(this.currentPage)) {
          // Redirect to dashboard if on login page
          if (this.currentPage === 'login') {
            window.location.href = 'dashboard.html';
          }
        }
        
        // Check if admin page
        if (adminPages.includes(this.currentPage)) {
          // Admin check will be handled by admin module
        }
        
        // Initialize state
        stateManager.initializeWithUser(user);
        
      } else {
        console.log('User is signed out');
        
        // Pages that require authentication
        const authRequiredPages = [
          'dashboard', 'battle', 'journal', 
          'profile', 'stats', 'admin'
        ];
        
        if (authRequiredPages.includes(this.currentPage)) {
          // Redirect to login page
          window.location.href = 'index.html';
        }
      }
    });
  }

  /**
   * Initialize page-specific content
   */
  initializePage() {
    // Load page-specific modules
    switch (this.currentPage) {
      case 'login':
        // Login page doesn't need specific module
        break;
        
      case 'dashboard':
        // Dashboard already has its own module
        break;
        
      case 'battle':
        // Battle already has its own module
        break;
        
      case 'journal':
        // Journal already has its own module
        break;
        
      case 'profile':
        // Profile already has its own module
        break;
        
      case 'stats':
        // Stats already has its own module
        break;
        
      case 'admin':
        // Admin already has its own module
        break;
        
      default:
        console.warn('Unknown page:', this.currentPage);
    }
    
    // Initialize common elements
    this.initializeUserInfo();
    this.initializeTheme();
  }

  /**
   * Set up common UI elements
   */
  setupCommonUI() {
    // Set up navbar toggle for mobile
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');
    
    if (navbarToggle && navbarLinks) {
      navbarToggle.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
      });
    }
    
    // Set up sign out button
    const signOutBtn = document.getElementById('sign-out-btn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this.handleSignOut();
      });
    }
    
    // Set up theme toggle in navbar
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', async () => {
        await stateManager.toggleMode();
      });
    }
  }

  /**
   * Initialize user information display
   */
  initializeUserInfo() {
    // Skip for login page
    if (this.currentPage === 'login') return;
    
    // Update user display name and RC count
    const userDisplayName = document.getElementById('user-display-name');
    const userRcCount = document.getElementById('user-rc-count');
    
    // Listen for profile updates
    document.addEventListener('blackreaper.profileUpdated', (event) => {
      const profile = event.detail;
      
      if (userDisplayName && profile.displayName) {
        userDisplayName.textContent = profile.displayName;
      }
      
      if (userRcCount && profile.rc !== undefined) {
        userRcCount.textContent = profile.rc;
      }
    });
    
    // Listen for RC updates
    document.addEventListener('blackreaper.rcUpdated', (event) => {
      const rc = event.detail.rc;
      
      if (userRcCount) {
        userRcCount.textContent = rc;
        
        // Add animation
        userRcCount.classList.add('rc-updated');
        setTimeout(() => {
          userRcCount.classList.remove('rc-updated');
        }, 1000);
      }
    });
  }

  /**
   * Initialize theme based on user preference
   */
  initializeTheme() {
    // Check if theme is already set in state manager
    if (stateManager.mode) {
      this.handleThemeChange(stateManager.mode);
    } else {
      // Default to 'human' mode
      this.handleThemeChange('human');
    }
  }

  /**
   * Handle theme change
   * @param {string} mode - Theme mode ('human' or 'ghoul')
   */
  handleThemeChange(mode) {
    document.body.setAttribute('data-theme', mode);
    
    // Update theme toggle button if it exists
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      const text = themeToggle.querySelector('.toggle-text');
      
      if (icon) {
        icon.className = mode === 'human' 
          ? 'fas fa-mask' 
          : 'fas fa-user';
      }
      
      if (text) {
        text.textContent = mode === 'human' 
          ? 'Switch to Ghoul Mode' 
          : 'Switch to Human Mode';
      }
    }
    
    // Play theme change sound
    if (mode === 'ghoul') {
      this.playSound('assets/audio/kagune-activate.mp3');
    } else {
      this.playSound('assets/audio/kagune-deactivate.mp3');
    }
    
    // Dispatch event for other components
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { mode }
    }));
  }

  /**
   * Play sound effect
   * @param {string} soundPath - Path to sound file
   */
  playSound(soundPath) {
    try {
      const audio = new Audio(soundPath);
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('Could not play sound:', err);
      });
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  /**
   * Handle user sign out
   */
  async handleSignOut() {
    try {
      ui.confirm({
        title: 'Sign Out',
        message: 'Are you sure you want to sign out?',
        confirmText: 'Yes, Sign Out',
        cancelText: 'Cancel',
        onConfirm: async () => {
          const loadingSpinner = ui.fullscreenSpinner('Signing out...');
          
          try {
            await signOut();
            loadingSpinner.remove();
            window.location.href = 'index.html';
          } catch (error) {
            loadingSpinner.remove();
            console.error('Error signing out:', error);
            ui.toast('Failed to sign out', 'error');
          }
        }
      });
    } catch (error) {
      console.error('Error in sign out handler:', error);
      ui.toast('An error occurred', 'error');
    }
  }

  /**
   * Register module with the application
   * @param {string} name - Module name
   * @param {Object} module - Module instance
   */
  registerModule(name, module) {
    this.modules[name] = module;
    console.log(`Registered module: ${name}`);
  }
  
  /**
   * Ensure Firebase is properly initialized
   */
  ensureFirebaseInitialized() {
    // Check if Firebase is already initialized via the compat library
    if (window.firebase) {
      console.log('Firebase already initialized via compat library');
      return;
    }
    
    // If we're using the modular SDK without the compat library,
    // make it available in the window object for legacy code
    if (!window.firebase) {
      console.log('Making Firebase modular SDK available globally');
      window.firebase = {
  getData: (path) => import('../firebase/firebase.js').then(m => m.getData(path)),
  updateData: (path, data) => import('../firebase/firebase.js').then(m => m.updateData(path, data)),
  pushData: (path, data) => import('../firebase/firebase.js').then(m => m.pushData(path, data)),
  removeData: (path) => import('../firebase/firebase.js').then(m => m.removeData(path)),
  onValueChange: (path, callback) => import('../firebase/firebase.js').then(m => m.onValueChange(path, callback)),
  runTransaction: (path, updateFn) => import('../firebase/firebase.js').then(m => m.runTransaction(path, updateFn)),
      };
    }
  }
  
  /**
   * Initialize integrated services
   */
  initializeServices() {
    // These imports will load and initialize the services
    // The services are self-initializing through their constructors
    try {
      // Import and initialize services asynchronously
      Promise.all([
        import('../js/notifications.js'),
        import('../js/achievements.js'),
        import('../js/theme-animator.js'),
        import('../js/data-sync.js')
      ]).then(modules => {
        console.log('Successfully loaded integrated services');
      }).catch(error => {
        console.error('Error loading integrated services:', error);
      });
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }
}

// Initialize application
const app = new BlackReaperApp();
export default app;
