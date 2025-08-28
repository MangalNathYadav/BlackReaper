// Module Bridge
// This script ensures all feature modules are loaded properly
// and makes them available globally

// Function to check if all required modules are loaded
function checkModulesLoaded() {
  const requiredModules = [
    'notificationManager',
    'achievementsTracker',
    'themeAnimator',
    'dataSync',
    'firebaseUtils',
    'stateManager',
    'ui'
  ];
  
  const missingModules = requiredModules.filter(module => !window[module]);
  
  if (missingModules.length > 0) {
    console.warn('Missing modules:', missingModules);
    return false;
  }
  
  return true;
}

// Function to load modules
async function loadModules() {
  console.log('Loading BlackReaper modules...');
  
  try {
    // Load Firebase bridge first
    await import('../../firebase/firebase-bridge.js')
      .then(() => console.log('Firebase Bridge loaded'))
      .catch(err => console.error('Failed to load Firebase Bridge:', err));
      
    // Load feature modules
    await Promise.allSettled([
      import('./notifications.js')
        .then(() => console.log('Notifications module loaded'))
        .catch(err => console.error('Failed to load Notifications module:', err)),
        
      import('./achievements.js')
        .then(() => console.log('Achievements module loaded'))
        .catch(err => console.error('Failed to load Achievements module:', err)),
        
      import('./theme-animator.js')
        .then(() => console.log('Theme Animator module loaded'))
        .catch(err => console.error('Failed to load Theme Animator module:', err)),
        
      import('./data-sync.js')
        .then(() => console.log('Data Sync module loaded'))
        .catch(err => console.error('Failed to load Data Sync module:', err))
    ]);
    
    // Load verification module last
    await import('./verify-integration.js')
      .then(() => console.log('Verification module loaded'))
      .catch(err => console.error('Failed to load Verification module:', err));
    
    // Check if all modules loaded successfully
    if (checkModulesLoaded()) {
      console.log('✅ All modules loaded successfully');
    } else {
      console.warn('⚠️ Some modules failed to load');
    }
  } catch (error) {
    console.error('Module loading failed:', error);
  }
}

// Load modules when document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadModules);
} else {
  loadModules();
}

// Export the module loader
export default { loadModules, checkModulesLoaded };
