// Firebase and feature integration verification
// This script checks if all components are properly connected

/**
 * Verify integration of Firebase and features
 */
class IntegrationVerifier {
  constructor() {
    this.results = {
      firebase: false,
      auth: false,
      database: false,
      serviceWorker: false,
      notifications: false,
      achievements: false,
      themeAnimator: false,
      dataSync: false
    };
  }
  
  /**
   * Run all verifications
   */
  async verify() {
    console.log('🔄 Running BlackReaper integration verification...');
    
    // Verify Firebase
    await this.verifyFirebase();
    
    // Verify service worker
    await this.verifyServiceWorker();
    
    // Verify features
    await this.verifyFeatures();
    
    // Log results
    this.logResults();
  }
  
  /**
   * Verify Firebase integration
   */
  async verifyFirebase() {
    try {
      // Check if Firebase is initialized
      if (window.firebase || typeof firebase !== 'undefined') {
        console.log('✅ Firebase is initialized');
        this.results.firebase = true;
        
        // Verify Firebase Auth
        try {
          if (window.firebase?.auth || typeof firebase?.auth !== 'undefined' || window.firebaseUtils?.getAuth) {
            console.log('✅ Firebase Auth is available');
            this.results.auth = true;
          }
        } catch (error) {
          console.error('❌ Firebase Auth verification failed:', error);
        }
        
        // Verify Firebase Database
        try {
          if (window.firebase?.database || typeof firebase?.database !== 'undefined' || window.firebaseUtils?.getData) {
            console.log('✅ Firebase Database is available');
            this.results.database = true;
          }
        } catch (error) {
          console.error('❌ Firebase Database verification failed:', error);
        }
      } else {
        console.error('❌ Firebase not initialized');
      }
    } catch (error) {
      console.error('❌ Firebase verification failed:', error);
    }
  }
  
  /**
   * Verify Service Worker registration
   */
  async verifyServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        // Check if service worker is registered
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        if (registrations.length > 0) {
          this.results.serviceWorker = true;
          console.log('✅ Service Worker is registered');
        } else {
          console.log('⚠️ Service Worker not yet registered');
        }
      } else {
        console.log('⚠️ Service Workers not supported in this browser');
      }
    } catch (error) {
      console.error('❌ Service Worker verification failed:', error);
    }
  }
  
  /**
   * Verify feature integration
   */
  async verifyFeatures() {
    try {
      // Verify notifications
      if ('Notification' in window) {
        console.log('✅ Notifications API is available');
      } else {
        console.warn('⚠️ Notifications are not supported in this browser');
      }
      
      // Check for notification module
      if (window.notificationManager) {
        console.log('✅ Notifications module loaded');
        this.results.notifications = true;
      } else {
        console.warn('⚠️ Notifications module not loaded');
      }
      
      // Check for achievements module
      if (window.achievementsTracker) {
        console.log('✅ Achievements module loaded');
        this.results.achievements = true;
      } else {
        console.warn('⚠️ Achievements module not loaded');
      }
      
      // Check for theme animator module
      if (window.themeAnimator) {
        console.log('✅ Theme Animator module loaded');
        this.results.themeAnimator = true;
      } else {
        console.warn('⚠️ Theme Animator module not loaded');
      }
      
      // Check for data sync module
      if (window.dataSync) {
        console.log('✅ Data Sync module loaded');
        this.results.dataSync = true;
      } else {
        console.warn('⚠️ Data Sync module not loaded');
      }
    } catch (error) {
      console.error('❌ Feature verification failed:', error);
    }
  }
  
  /**
   * Log final results
   */
  logResults() {
    console.log('\n=== BlackReaper Integration Verification Results ===');
    
    // Count successful verifications
    const successCount = Object.values(this.results).filter(Boolean).length;
    const totalChecks = Object.keys(this.results).length;
    
    // Print results for each component
    Object.entries(this.results).forEach(([key, value]) => {
      console.log(`${value ? '✅' : '❌'} ${key}: ${value ? 'Working' : 'Not working'}`);
    });
    
    console.log(`\n${successCount} of ${totalChecks} verifications passed`);
    
    if (successCount === totalChecks) {
      console.log('🎉 All components are properly integrated!');
    } else {
      console.log('⚠️ Some components are not properly integrated. Check the logs above for details.');
    }
  }
}

// Create instance
const verifier = new IntegrationVerifier();

// Add verification button to admin panel
document.addEventListener('DOMContentLoaded', () => {
  // Check if admin panel exists
  const adminPanel = document.getElementById('admin-header');
  
  if (adminPanel) {
    const verifyButton = document.createElement('button');
    verifyButton.className = 'btn btn-primary';
    verifyButton.innerHTML = '<i class="fas fa-check-circle"></i> Run Verification';
    verifyButton.addEventListener('click', () => verifier.verify());
    
    adminPanel.appendChild(verifyButton);
  }
});

// Set global reference
window.verifier = verifier;

// Export verifier for ES modules
export default verifier;
