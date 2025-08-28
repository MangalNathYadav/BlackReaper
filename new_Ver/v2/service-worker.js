/**
 * BlackReaper v2 - Service Worker
 * Version: 2.1.0 - Enhanced with animation frame caching
 */

const CACHE_NAME = 'blackreaper-v2.1-cache';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/battle.html',
  '/journal.html',
  '/stats.html',
  '/assets/css/style.css',
  '/assets/css/auth-forms.css',
  '/assets/css/dashboard-enhanced.css',
  '/assets/css/profile.css',
  '/assets/css/form-fixes.css',
  '/assets/css/animation-frames.css',
  '/assets/css/background-patterns.css',
  '/assets/css/enhanced-buttons.css',
  '/assets/css/auth-tabs.css',
  '/assets/js/main.js',
  '/assets/js/theme-animator.js',
  '/assets/js/notifications.js',
  '/assets/js/dashboard.js',
  '/assets/js/profile.js',
  '/assets/js/form-fixes.js',
  '/assets/js/transformation-animation.js',
  '/assets/js/button-enhancements.js',
  '/assets/audio/kagune-activate.mp3',
  '/assets/audio/kagune-deactivate.mp3',
  '/assets/audio/tab-switch.mp3',
  '/assets/images/placeholder-frame.png',
  '/firebase/config.js',
  '/firebase/auth.js',
  '/firebase/database.js'
];

// Install event - caches static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests like Firebase API calls
  if (!event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com')) {
    return;
  }

  // Check if the request is for an animation frame
  const isAnimationFrame = event.request.url.includes('animation_sprites/frame');
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }
      
      // Not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Clone the response to store in cache
        const responseToCache = response.clone();
        
        // Cache the fetched resource
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            // Cache animation frames with their own strategy
            if (isAnimationFrame) {
              // Store animation frames in cache for faster subsequent loads
              cache.put(event.request, responseToCache);
            } else {
              // For other assets, only cache if they're in STATIC_ASSETS
              const urlToCache = new URL(event.request.url).pathname;
              if (STATIC_ASSETS.includes(urlToCache)) {
                cache.put(event.request, responseToCache);
              }
            }
          });
        }
        
        return response;
      }).catch((error) => {
        console.error('Service Worker fetch failed:', error);
        
        // Show offline page for HTML requests
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        
        // For animation frames, show a placeholder image
        if (isAnimationFrame) {
          return caches.match('/assets/images/placeholder-frame.png');
        }
        
        // For other resources, return a simple error
        return new Response('Network error, please check your connection.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'New notification from BlackReaper',
    icon: data.icon || '/assets/images/placeholder-frame.png',
    badge: '/assets/images/placeholder-frame.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'BlackReaper Notification',
      options
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there is already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
