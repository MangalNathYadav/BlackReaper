/**
 * BlackReaper v2 - Firebase Main Module
 * Initializes and exports Firebase functionality
 */

// Wait for the Firebase SDK to be loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if Firebase is available
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Make sure to include the Firebase scripts.');
    return;
  }

  // Add event for when Firebase auth is ready
  const firebaseReadyEvent = new CustomEvent('firebase-ready');
  
  // Initialize Firebase Auth listeners
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User signed in:', user.uid);
      // Store current user ID globally
      window.currentUserId = user.uid;
      
      // Initialize user data
      firebaseBridge.initUserData(user.uid)
        .then(() => {
          console.log('User data initialized');
          // Dispatch event when Firebase and user are fully initialized
          document.dispatchEvent(new CustomEvent('user-initialized', { 
            detail: { userId: user.uid } 
          }));
        })
        .catch(error => {
          console.error('Error initializing user data:', error);
        });
    } else {
      console.log('User signed out');
      window.currentUserId = null;
      
      // If on a protected page (not index.html), redirect to login
      if (!window.location.pathname.includes('index.html') && 
          window.location.pathname !== '/' && 
          !window.location.pathname.endsWith('/')) {
        window.location.href = 'index.html';
      }
    }
    
    // Always dispatch firebase-ready event
    document.dispatchEvent(firebaseReadyEvent);
  });
});

// Export a function to check if Firebase is ready
window.isFirebaseReady = () => {
  return new Promise((resolve) => {
    if (auth.getCurrentUser() !== null || document.readyState === 'complete') {
      // Firebase is already initialized
      resolve(true);
    } else {
      // Wait for the firebase-ready event
      document.addEventListener('firebase-ready', () => {
        resolve(true);
      });
    }
  });
};

// Function to ensure user is authenticated before accessing protected pages
window.requireAuth = () => {
  return new Promise((resolve, reject) => {
    isFirebaseReady().then(() => {
      const user = auth.getCurrentUser();
      if (user) {
        resolve(user);
      } else {
        // Redirect to login page if not authenticated
        window.location.href = 'index.html';
        reject(new Error('Authentication required'));
      }
    });
  });
};

// Export Firebase modules
window.Firebase = {
  auth,
  db,
  bridge: firebaseBridge
};
