// Theme animation system for BlackReaper
// Handles animations when switching between human and ghoul themes

// Import Firebase functions - with fallbacks for both ESM and global access
let stateManager, ui;

// Try to import Firebase utilities as ES modules
try {
  const stateModule = await import('../firebase/state.js');
  stateManager = stateModule.default;

  const uiModule = await import('../firebase/ui.js');
  ui = uiModule.default;
} catch (e) {
  console.warn('Failed to import modules as ES modules, falling back to global objects');
  
  // Fallback to global objects
  stateManager = window.stateManager;
  ui = window.ui;
}

/**
 * Theme animation manager for BlackReaper
 */
class ThemeAnimator {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'human';
    this.isAnimating = false;
    this.animations = {
      human: {
        overlay: null,
        sequence: null
      },
      ghoul: {
        overlay: null,
        sequence: null
      }
    };
    this.soundEffects = {
      activate: new Audio('assets/audio/kagune-activate.mp3'),
      deactivate: new Audio('assets/audio/kagune-deactivate.mp3')
    };
    
    // Initialize
    this.init();
  }

  /**
   * Initialize the theme animator
   */
  init() {
    // Preload sound effects
    this.soundEffects.activate.load();
    this.soundEffects.deactivate.load();
    
    // Create overlay elements if needed
    this.createOverlays();
    
    // Listen for theme change events
    document.addEventListener('blackreaper.themeChanged', this.handleThemeChange.bind(this));
    
    // Setup animation preferences listener
    document.addEventListener('blackreaper.userLoaded', this.loadUserPreferences.bind(this));
  }

  /**
   * Create overlay elements
   */
  createOverlays() {
    // Create human overlay if it doesn't exist
    if (!this.animations.human.overlay) {
      const humanOverlay = document.createElement('div');
      humanOverlay.className = 'theme-overlay human-theme-overlay';
      humanOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0);
        z-index: 9999;
        pointer-events: none;
        transition: background-color 0.5s ease;
        opacity: 0;
      `;
      document.body.appendChild(humanOverlay);
      this.animations.human.overlay = humanOverlay;
    }
    
    // Create ghoul overlay if it doesn't exist
    if (!this.animations.ghoul.overlay) {
      const ghoulOverlay = document.createElement('div');
      ghoulOverlay.className = 'theme-overlay ghoul-theme-overlay';
      ghoulOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0);
        z-index: 9999;
        pointer-events: none;
        transition: background-color 0.5s ease;
        opacity: 0;
      `;
      document.body.appendChild(ghoulOverlay);
      this.animations.ghoul.overlay = ghoulOverlay;
    }
    
    // Create sequence container if it doesn't exist
    if (!this.animations.ghoul.sequence) {
      const sequenceContainer = document.createElement('div');
      sequenceContainer.className = 'theme-sequence ghoul-sequence';
      sequenceContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        display: none;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      `;
      document.body.appendChild(sequenceContainer);
      this.animations.ghoul.sequence = sequenceContainer;
    }
    
    // Create sequence container if it doesn't exist
    if (!this.animations.human.sequence) {
      const sequenceContainer = document.createElement('div');
      sequenceContainer.className = 'theme-sequence human-sequence';
      sequenceContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        z-index: 10000;
        pointer-events: none;
        opacity: 0;
        display: none;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      `;
      document.body.appendChild(sequenceContainer);
      this.animations.human.sequence = sequenceContainer;
    }
  }

  /**
   * Load user animation preferences
   */
  async loadUserPreferences() {
    if (!stateManager.user) return;
    
    try {
      const result = await firebase.getData(`users/${stateManager.user.uid}/preferences/animations`);
      
      if (result.exists) {
        const preferences = result.data;
        
        // Apply animation settings
        if (preferences.enabled !== undefined) {
          this.animationsEnabled = preferences.enabled;
        }
        
        if (preferences.soundEffects !== undefined) {
          this.soundEffectsEnabled = preferences.soundEffects;
        }
      }
    } catch (error) {
      console.error('Error loading animation preferences:', error);
    }
  }

  /**
   * Handle theme change event
   * @param {CustomEvent} event - Theme change event
   */
  handleThemeChange(event) {
    const { theme } = event.detail;
    
    // Skip animation if already animating
    if (this.isAnimating) return;
    
    // Skip animation if theme is the same
    if (theme === this.currentTheme) return;
    
    // Animate theme change
    if (theme === 'ghoul') {
      this.animateToGhoul();
    } else {
      this.animateToHuman();
    }
    
    this.currentTheme = theme;
  }

  /**
   * Animate to ghoul theme
   */
  animateToGhoul() {
    // Skip if already animating
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    // Check if animations are enabled
    if (this.animationsEnabled === false) {
      // Just apply the theme without animation
      document.documentElement.setAttribute('data-theme', 'ghoul');
      this.isAnimating = false;
      return;
    }
    
    // Play sound effect if enabled
    if (this.soundEffectsEnabled !== false) {
      this.soundEffects.activate.play().catch(e => console.log('Sound play error:', e));
    }
    
    // Get the overlay and sequence elements
    const overlay = this.animations.ghoul.overlay;
    const sequence = this.animations.ghoul.sequence;
    
    // Show the overlay with initial state
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    overlay.style.opacity = '1';
    
    // Set up the animation sequence
    sequence.style.display = 'block';
    sequence.style.opacity = '0';
    
    // Start animation
    setTimeout(() => {
      // Fade in overlay
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      
      // Animate sequence
      sequence.style.opacity = '1';
      this.playSequence(sequence, 'ghoul', 23, () => {
        // Apply theme
        document.documentElement.setAttribute('data-theme', 'ghoul');
        
        // Fade out overlay and sequence
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        sequence.style.opacity = '0';
        
        // Clean up
        setTimeout(() => {
          overlay.style.opacity = '0';
          sequence.style.display = 'none';
          this.isAnimating = false;
        }, 500);
      });
    }, 100);
  }

  /**
   * Animate to human theme
   */
  animateToHuman() {
    // Skip if already animating
    if (this.isAnimating) return;
    this.isAnimating = true;
    
    // Check if animations are enabled
    if (this.animationsEnabled === false) {
      // Just apply the theme without animation
      document.documentElement.setAttribute('data-theme', 'human');
      this.isAnimating = false;
      return;
    }
    
    // Play sound effect if enabled
    if (this.soundEffectsEnabled !== false) {
      this.soundEffects.deactivate.play().catch(e => console.log('Sound play error:', e));
    }
    
    // Get the overlay and sequence elements
    const overlay = this.animations.human.overlay;
    const sequence = this.animations.human.sequence;
    
    // Show the overlay with initial state
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    overlay.style.opacity = '1';
    
    // Set up the animation sequence
    sequence.style.display = 'block';
    sequence.style.opacity = '0';
    
    // Start animation
    setTimeout(() => {
      // Fade in overlay
      overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
      
      // Animate sequence
      sequence.style.opacity = '1';
      this.playSequence(sequence, 'human', 23, () => {
        // Apply theme
        document.documentElement.setAttribute('data-theme', 'human');
        
        // Fade out overlay and sequence
        overlay.style.backgroundColor = 'rgba(255, 255, 255, 0)';
        sequence.style.opacity = '0';
        
        // Clean up
        setTimeout(() => {
          overlay.style.opacity = '0';
          sequence.style.display = 'none';
          this.isAnimating = false;
        }, 500);
      });
    }, 100);
  }

  /**
   * Play animation sequence
   * @param {HTMLElement} element - Element to animate
   * @param {string} type - Animation type ('ghoul' or 'human')
   * @param {number} frameCount - Number of frames
   * @param {Function} callback - Callback to run when animation completes
   */
  playSequence(element, type, frameCount, callback) {
    let currentFrame = 1;
    const fps = 24;
    const interval = 1000 / fps;
    
    const updateFrame = () => {
      element.style.backgroundImage = `url('animation_sprites/frame${currentFrame}.png')`;
      
      currentFrame++;
      if (currentFrame <= frameCount) {
        setTimeout(updateFrame, interval);
      } else {
        if (typeof callback === 'function') {
          callback();
        }
      }
    };
    
    // Start animation
    updateFrame();
  }
  
  /**
   * Set animation preferences
   * @param {Object} preferences - Animation preferences
   */
  async setAnimationPreferences(preferences) {
    if (!stateManager.user) return;
    
    try {
      // Update local preferences
      if (preferences.enabled !== undefined) {
        this.animationsEnabled = preferences.enabled;
      }
      
      if (preferences.soundEffects !== undefined) {
        this.soundEffectsEnabled = preferences.soundEffects;
      }
      
      // Save preferences to database
      await firebase.updateData(`users/${stateManager.user.uid}/preferences/animations`, preferences);
      
      ui.toast('Animation preferences updated', 'success');
      
      return true;
    } catch (error) {
      console.error('Error updating animation preferences:', error);
      ui.toast('Failed to update animation preferences', 'error');
      
      return false;
    }
  }
}

// Create singleton instance
const themeAnimator = new ThemeAnimator();

// Export for ES modules
export default themeAnimator;

// Make available globally
window.themeAnimator = themeAnimator;
