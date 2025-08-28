/**
 * BlackReaper v2 - Service Worker Registration
 */

// Check if service workers are supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Set up push notification subscription when authenticated
        if (window.firebase) {
          firebase.auth().onAuthStateChanged(user => {
            if (user) {
              setupPushNotifications(registration, user.uid);
            }
          });
        }
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

/**
 * Set up push notification subscription
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 * @param {string} userId - User ID
 */
function setupPushNotifications(registration, userId) {
  // Check if push notifications are supported
  if (!('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }
  
  // Check notification permission
  if (Notification.permission === 'denied') {
    console.log('Push notifications denied by user');
    return;
  }
  
  // Request permission if needed
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }
      
      subscribeToPush(registration, userId);
    });
  } else if (Notification.permission === 'granted') {
    subscribeToPush(registration, userId);
  }
}

/**
 * Subscribe to push notifications
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 * @param {string} userId - User ID
 */
function subscribeToPush(registration, userId) {
  // Get push subscription
  registration.pushManager.getSubscription()
    .then(subscription => {
      // If already subscribed, update the subscription in database
      if (subscription) {
        updateSubscriptionInDatabase(subscription, userId);
        return subscription;
      }
      
      // Otherwise, create a new subscription
      // Note: In a real app, you would get this from your backend
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
      
      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      // Create subscription
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    })
    .then(subscription => {
      // Update subscription in database
      if (subscription) {
        updateSubscriptionInDatabase(subscription, userId);
      }
    })
    .catch(error => {
      console.error('Failed to subscribe to push notifications:', error);
    });
}

/**
 * Update push subscription in database
 * @param {PushSubscription} subscription - Push subscription
 * @param {string} userId - User ID
 */
function updateSubscriptionInDatabase(subscription, userId) {
  if (!window.firebase) {
    console.error('Firebase not loaded');
    return;
  }
  
  // Convert subscription to JSON
  const subscriptionJson = subscription.toJSON();
  
  // Save to Firebase
  firebase.database().ref(`users/${userId}/pushSubscription`).set(subscriptionJson)
    .then(() => {
      console.log('Push subscription saved to database');
    })
    .catch(error => {
      console.error('Failed to save push subscription:', error);
    });
}

/**
 * Convert URL Base64 to Uint8Array
 * @param {string} base64String - Base64 string
 * @returns {Uint8Array} Converted array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
