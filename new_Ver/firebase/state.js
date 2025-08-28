// State management module for BlackReaper
import { 
  r, 
  db, 
  write, 
  updateData, 
  getData, 
  onValueChange, 
  transaction, 
  getServerTimestamp 
} from "./firebase.js";
import authManager from "./auth.js";

/**
 * Global state manager for theme, user data, and utilities
 */
class StateManager {
  constructor() {
    this.mode = "human"; // Default mode: human or ghoul
    this.user = null;
    this.profile = null;
    this.stats = null;
    this.unsubscribers = []; // Keep track of DB listeners to unsubscribe
    
    // Initialize state based on auth status
    this.initAuthListener();
  }

  /**
   * Set up auth state listener to initialize app state
   */
  initAuthListener() {
    authManager.onAuthStateChanged(({ loggedIn, user, profile }) => {
      if (loggedIn && user) {
        this.user = user;
        this.profile = profile;
        
        // Initialize listeners for user data
        this.initDataListeners(user.uid);
        
        // Load initial mode from profile
        if (profile && profile.mode) {
          this.mode = profile.mode;
          this.applyTheme(profile.mode);
        }
      } else {
        // Clean up listeners when user logs out
        this.unsubscribeAll();
        this.user = null;
        this.profile = null;
        this.stats = null;
      }
    });
  }

  /**
   * Initialize real-time database listeners for user data
   * @param {string} uid - User ID
   */
  initDataListeners(uid) {
    // Clean up existing listeners first
    this.unsubscribeAll();
    
    // Listen for profile changes
    const profileUnsubscribe = onValueChange(`users/${uid}`, ({ exists, data }) => {
      if (exists && data) {
        this.profile = data;
        
        // Update theme if mode changed
        if (data.mode && this.mode !== data.mode) {
          this.mode = data.mode;
          this.applyTheme(this.mode);
        }
        
        // Trigger profile update event
        this.dispatchEvent('profileUpdated', this.profile);
      }
    });
    
    // Listen for stats changes
    const statsUnsubscribe = onValueChange(`users/${uid}/stats`, ({ exists, data }) => {
      if (exists && data) {
        this.stats = data;
        // Trigger stats update event
        this.dispatchEvent('statsUpdated', this.stats);
      }
    });
    
    // Store unsubscriber functions
    this.unsubscribers.push(profileUnsubscribe, statsUnsubscribe);
  }

  /**
   * Unsubscribe from all database listeners
   */
  unsubscribeAll() {
    this.unsubscribers.forEach(unsubscribe => unsubscribe());
    this.unsubscribers = [];
  }

  /**
   * Toggle between human and ghoul modes
   * @returns {Promise} Promise with the result of the operation
   */
  async toggleMode() {
    if (!this.user) {
      console.error("No user is logged in");
      return { success: false, error: "No user logged in" };
    }
    
    try {
      const newMode = this.mode === "human" ? "ghoul" : "human";
      
      // Update mode in database
      await updateData(`users/${this.user.uid}`, {
        mode: newMode
      });
      
      // Add activity record for mode change
      await this.addActivityRecord({
        type: "profile",
        message: `Switched to ${newMode} mode`,
        ts: getServerTimestamp()
      });
      
      // Update local state
      this.mode = newMode;
      
      // Apply theme immediately
      this.applyTheme(newMode);
      
      // Play sound effect based on mode
      this.playThemeSound(newMode);
      
      return { success: true, mode: newMode };
    } catch (error) {
      console.error("Error toggling mode:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Apply theme to DOM based on mode
   * @param {string} mode - "human" or "ghoul"
   */
  applyTheme(mode) {
    // Remove existing theme classes
    document.body.classList.remove("theme-human", "theme-ghoul");
    
    // Add new theme class
    document.body.classList.add(`theme-${mode}`);
    
    // Store in localStorage for persistence across page loads
    localStorage.setItem("theme-mode", mode);
    
    // Update UI elements if they exist
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      if (mode === "ghoul") {
        themeToggle.querySelector(".toggle-icon").innerHTML = '<i class="fas fa-mask"></i>';
        themeToggle.querySelector(".toggle-text").textContent = "Ghoul Mode";
      } else {
        themeToggle.querySelector(".toggle-icon").innerHTML = '<i class="fas fa-user"></i>';
        themeToggle.querySelector(".toggle-text").textContent = "Human Mode";
      }
    }
    
    // Dispatch theme change event
    this.dispatchEvent("themeChanged", { mode });
    
    // Check for special page restrictions
    this.checkPageRestrictions();
  }
  
  /**
   * Check for page restrictions based on current mode
   * e.g., Journal page is only accessible in Ghoul mode
   */
  checkPageRestrictions() {
    // Check if we're on the journal page
    const isJournalPage = window.location.pathname.includes("journal.html");
    
    if (isJournalPage && this.mode === "human") {
      // Show the human mode restriction UI
      const journalContent = document.querySelector(".journal-content");
      const humanModeWarning = document.querySelector(".human-mode-warning");
      
      if (journalContent && humanModeWarning) {
        journalContent.style.display = "none";
        humanModeWarning.style.display = "block";
      }
    } else if (isJournalPage && this.mode === "ghoul") {
      // Show the journal content
      const journalContent = document.querySelector(".journal-content");
      const humanModeWarning = document.querySelector(".human-mode-warning");
      
      if (journalContent && humanModeWarning) {
        journalContent.style.display = "block";
        humanModeWarning.style.display = "none";
      }
    }
  }
  
  /**
   * Play sound effect for theme change
   * @param {string} mode - "human" or "ghoul"
   */
  playThemeSound(mode) {
    const soundFile = mode === "ghoul" 
      ? "assets/audio/kagune-activate.mp3"
      : "assets/audio/kagune-deactivate.mp3";
      
    const audio = new Audio(soundFile);
    audio.play().catch(err => {
      console.warn("Could not play theme sound:", err);
    });
  }

  /**
   * Add activity record to user's activity log
   * @param {Object} activity - Activity data
   */
  async addActivityRecord(activity) {
    if (!this.user) return;
    
    try {
      const activityPath = `users/${this.user.uid}/activity`;
      await write(`${activityPath}/${Date.now()}`, activity);
    } catch (error) {
      console.error("Error adding activity record:", error);
    }
  }

  /**
   * Update user's RC (RC Cells) with transaction to avoid race conditions
   * @param {number} delta - Amount to add (positive) or subtract (negative)
   * @returns {Promise} Promise with the updated RC value
   */
  async updateRC(delta) {
    if (!this.user) {
      return { success: false, error: "No user logged in" };
    }
    
    try {
      const result = await transaction(`users/${this.user.uid}/rc`, (currentRC) => {
        // Initialize to 100 if not set
        if (currentRC === null) currentRC = 100;
        
        // Calculate new RC value, ensuring it doesn't go below 0
        const newRC = Math.max(0, currentRC + delta);
        
        return newRC;
      });
      
      if (result.success && result.committed) {
        const newRC = result.snapshot.val();
        
        // Calculate new level based on RC
        const newLevel = Math.floor(newRC / 1000) + 1;
        
        // Update level if it changed
        if (this.profile && this.profile.level !== newLevel) {
          await updateData(`users/${this.user.uid}`, { level: newLevel });
          
          // Add activity for level up if RC increased
          if (delta > 0 && newLevel > this.profile.level) {
            await this.addActivityRecord({
              type: "profile",
              message: `Leveled up to ${newLevel}!`,
              ts: getServerTimestamp()
            });
          }
        }
        
        return { success: true, rc: newRC, level: newLevel };
      } else {
        return { success: false, error: "Transaction failed" };
      }
    } catch (error) {
      console.error("Error updating RC:", error);
      return { success: false, error };
    }
  }
  
  /**
   * Encode image file to base64 with compression
   * @param {File} file - Image file from input
   * @param {number} maxWidth - Maximum width in pixels
   * @param {number} quality - JPEG quality (0-1)
   * @returns {Promise<string>} Promise resolving to base64 string
   */
  async encodeImageFileToBase64(file, maxWidth = 256, quality = 0.7) {
    return new Promise((resolve, reject) => {
      // Validate file type
      if (!file.type.match('image.*')) {
        reject(new Error('Only image files are supported'));
        return;
      }
      
      // Create file reader to read the file
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Create an image element to get dimensions
        const img = new Image();
        
        img.onload = () => {
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          // Scale down if width exceeds maxWidth
          if (width > maxWidth) {
            height = Math.floor(height * (maxWidth / width));
            width = maxWidth;
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw and resize image on canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 string
          const base64String = canvas.toDataURL('image/jpeg', quality);
          
          // Check size
          const estimatedSize = Math.ceil((base64String.length * 3) / 4);
          const sizeInKB = Math.floor(estimatedSize / 1024);
          
          console.log(`Encoded image size: ${sizeInKB}KB`);
          
          if (sizeInKB > 500) {
            console.warn('Encoded image is larger than recommended (500KB)');
          }
          
          resolve(base64String);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Set image source to the file reader result
        img.src = e.target.result;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read file as data URL
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Decode base64 string to use as image src
   * @param {string} base64String - Base64 encoded image
   * @returns {string} String to use for img.src
   */
  decodeBase64ToImgSrc(base64String) {
    if (!base64String) return ''; // Return empty if no string provided
    
    // If the string already starts with 'data:', it's already in the right format
    if (base64String.startsWith('data:')) {
      return base64String;
    }
    
    // Otherwise, add the data URI prefix
    return `data:image/jpeg;base64,${base64String}`;
  }
  
  /**
   * Dispatch a custom event
   * @param {string} name - Event name
   * @param {*} detail - Event detail data
   */
  dispatchEvent(name, detail) {
    document.dispatchEvent(
      new CustomEvent(`blackreaper.${name}`, { detail })
    );
  }
}

// Create and export singleton instance
const stateManager = new StateManager();
export default stateManager;
