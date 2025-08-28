// Register service worker for offline capabilities
// This file should be included in all HTML pages

/**
 * Register service worker for offline capabilities
 */
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope:', registration.scope);
      
      // Set up background sync if available
      if ('sync' in registration) {
        // Register a tag for the service worker to use when network is available
        navigator.serviceWorker.ready.then((swRegistration) => {
          // Setup periodic background sync if available (Chrome 80+)
          if ('periodicSync' in registration) {
            const periodicSyncOptions = {
              minInterval: 24 * 60 * 60 * 1000 // Once per day
            };
            
            registration.periodicSync.register('blackreaper-daily-sync', periodicSyncOptions)
              .catch((err) => {
                console.warn('Periodic Sync could not be registered:', err);
              });
          }
        });
      }
      
      // Setup push notifications if available
      if ('pushManager' in registration) {
        setupPushNotifications(registration);
      }
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  } else {
    console.log('Service workers are not supported in this browser');
  }
};

/**
 * Set up push notifications
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 */
const setupPushNotifications = async (registration) => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }
    
    // Get push subscription
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      // We already have a subscription
      console.log('Push subscription already exists');
      saveSubscription(subscription);
      return;
    }
    
    // Create new subscription
    try {
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          // Public VAPID key would go here in a real app
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });
      
      console.log('Push subscription created');
      saveSubscription(newSubscription);
    } catch (subError) {
      console.error('Failed to subscribe to push:', subError);
    }
  } catch (error) {
    console.error('Error setting up push notifications:', error);
  }
};

/**
 * Convert base64 string to Uint8Array
 * @param {string} base64String - Base64 string
 * @returns {Uint8Array} Uint8Array
 */
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
};

/**
 * Save push subscription to server
 * @param {PushSubscription} subscription - Push subscription
 */
const saveSubscription = async (subscription) => {
  try {
    if (window.firebase && window.stateManager && window.stateManager.user) {
      // Save to Firebase if authenticated
      await window.firebase.updateData(
        `users/${window.stateManager.user.uid}/pushSubscription`,
        JSON.parse(JSON.stringify(subscription))
      );
      
      console.log('Push subscription saved to Firebase');
    } else {
      // Store locally until authenticated
      localStorage.setItem(
        'blackreaper_push_subscription',
        JSON.stringify(subscription)
      );
      
      console.log('Push subscription saved locally');
    }
  } catch (error) {
    console.error('Error saving push subscription:', error);
  }
};

/**
 * Check if app is installed (PWA mode)
 * @returns {boolean} Whether app is installed
 */
const isAppInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
};

/**
 * Setup install prompt
 */
const setupInstallPrompt = () => {
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button if available
    const installButton = document.getElementById('install-app-button');
    
    if (installButton) {
      installButton.style.display = 'block';
      
      installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
          return;
        }
        
        // Show the prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        
        // Clear the saved prompt
        deferredPrompt = null;
        
        // Hide the button
        installButton.style.display = 'none';
      });
    }
  });
  
  // Listen for app installation
  window.addEventListener('appinstalled', (e) => {
    console.log('BlackReaper app was installed', e);
    
    // Hide install button if visible
    const installButton = document.getElementById('install-app-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    // Track installation event
    if (window.firebase && window.stateManager && window.stateManager.user) {
      window.firebase.updateData(
        `users/${window.stateManager.user.uid}/appInstalled`, 
        true
      );
    }
  });
};

/**
 * Monitor network status
 */
const monitorNetworkStatus = () => {
  const updateNetworkStatus = () => {
    const isOnline = navigator.onLine;
    
    document.body.classList.toggle('offline', !isOnline);
    
    // Update offline indicator
    const offlineIndicator = document.getElementById('offline-indicator');
    
    if (offlineIndicator) {
      offlineIndicator.style.display = isOnline ? 'none' : 'block';
    } else if (!isOnline) {
      // Create offline indicator if it doesn't exist
      const indicator = document.createElement('div');
      indicator.id = 'offline-indicator';
      indicator.innerHTML = 'Offline Mode';
      indicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
      `;
      
      document.body.appendChild(indicator);
    }
  };
  
  // Setup event listeners
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  
  // Initial check
  updateNetworkStatus();
};

// Run setup functions when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Register service worker
  registerServiceWorker();
  
  // Setup install prompt
  setupInstallPrompt();
  
  // Monitor network status
  monitorNetworkStatus();
});
