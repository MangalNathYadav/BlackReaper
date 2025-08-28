// Service Worker for BlackReaper
// Enables offline capabilities, caching, and push notifications

const CACHE_NAME = 'blackreaper-cache-v1';
const ASSETS_CACHE = 'blackreaper-assets-v1';
const DATA_CACHE = 'blackreaper-data-v1';

// Assets to cache immediately on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/battle.html',
  '/journal.html',
  '/stats.html',
  '/profile.html',
  '/loading.html',
  '/assets/css/style.css',
  '/assets/css/dashboard-enhanced.css',
  '/assets/css/profile.css',
  '/assets/css/auth-forms.css',
  '/assets/js/main.js',
  '/assets/js/app.js',
  '/assets/js/dashboard.js',
  '/assets/js/battle.js',
  '/assets/js/journal.js',
  '/assets/js/stats-tracking.js',
  '/assets/js/profile.js',
  '/assets/js/ghoul-animation.js',
  '/assets/js/theme-sync.js',
  '/assets/js/theme-animation-loader.js',
  '/assets/js/pomodoro.js',
  '/assets/js/ui-components.js',
  '/assets/js/form-validator.js',
  '/assets/js/animator.js',
  '/assets/js/notifications.js',
  '/assets/js/achievements.js',
  '/assets/js/theme-animator.js',
  '/assets/js/data-sync.js',
  '/assets/images/placeholder-frame.png',
  '/assets/audio/kagune-activate.mp3',
  '/assets/audio/kagune-deactivate.mp3',
  '/assets/audio/tab-switch.mp3'
];

// Animation frames to cache
const ANIMATION_FRAMES = Array.from({ length: 23 }, (_, i) => 
  `/animation_sprites/frame${i + 1}.png`
);

// Install event - cache important assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache core assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Pre-caching app shell');
          return cache.addAll(PRECACHE_ASSETS);
        }),
      
      // Cache animation frames
      caches.open(ASSETS_CACHE)
        .then((cache) => {
          console.log('[Service Worker] Pre-caching animation frames');
          return cache.addAll(ANIMATION_FRAMES);
        })
    ])
    .then(() => {
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(keyList.map((key) => {
          // Delete old caches except the current ones
          if (key !== CACHE_NAME && key !== ASSETS_CACHE && key !== DATA_CACHE) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        }));
      })
      .then(() => {
        // Claim clients to take control immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for Firebase API requests or other external URLs
  if (url.hostname.includes('firebaseio.com') || 
      url.hostname.includes('googleapis.com')) {
    
    // Apply network-first strategy for API requests
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          // Store in DATA_CACHE if it's a successful response
          if (response.status === 200) {
            caches.open(DATA_CACHE)
              .then((cache) => {
                cache.put(event.request, clonedResponse);
              });
          }
          
          return response;
        })
        .catch(() => {
          // Try to get from cache if network fails
          return caches.match(event.request);
        })
    );
    
    return;
  }
  
  // For image assets, apply cache-first strategy
  if (event.request.url.match(/\.(jpeg|jpg|png|gif|svg|webp)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          // If not in cache, fetch from network and cache
          return fetch(event.request)
            .then((networkResponse) => {
              // Clone the response to store in cache
              const clonedResponse = networkResponse.clone();
              
              // Store in ASSETS_CACHE
              caches.open(ASSETS_CACHE)
                .then((cache) => {
                  cache.put(event.request, clonedResponse);
                });
              
              return networkResponse;
            });
        })
    );
    
    return;
  }
  
  // For HTML pages, apply network-first strategy to ensure fresh content
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response to store in cache
          const clonedResponse = response.clone();
          
          // Store in cache
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If not in cache, try to get the offline page
              return caches.match('/loading.html');
            });
        })
    );
    
    return;
  }
  
  // For all other requests, apply cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // If not in cache, fetch from network and cache
        return fetch(event.request)
          .then((networkResponse) => {
            // Only cache successful responses
            if (!networkResponse || networkResponse.status !== 200 || 
                networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response to store in cache
            const clonedResponse = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            
            return networkResponse;
          });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received', event);
  
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: 'BlackReaper',
        body: event.data.text(),
        icon: '/assets/images/placeholder-frame.png'
      };
    }
  }
  
  const title = data.title || 'BlackReaper';
  const options = {
    body: data.body || 'New notification',
    icon: data.icon || '/assets/images/placeholder-frame.png',
    badge: data.badge || '/assets/images/placeholder-frame.png',
    data: data.data || {},
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event - handle notification interactions
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click', event);
  
  event.notification.close();
  
  // Handle notification click based on data
  const notificationData = event.notification.data || {};
  const clickAction = event.action || 'default';
  
  // Message clients about the notification click
  self.clients.matchAll()
    .then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'notificationclick',
          action: clickAction,
          notificationData
        });
      });
    });
  
  // Open window based on notification type
  let urlToOpen = '/dashboard.html';
  
  if (notificationData.type === 'task-reminder') {
    urlToOpen = '/dashboard.html';
  } else if (notificationData.type === 'battle-reminder') {
    urlToOpen = '/battle.html';
  } else if (notificationData.type === 'journal-reminder') {
    urlToOpen = '/journal.html';
  } else if (notificationData.type === 'achievement') {
    urlToOpen = '/profile.html';
  }
  
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync', event);
  
  if (event.tag === 'blackreaper-sync') {
    event.waitUntil(
      // Message clients to trigger synchronization
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'sync-requested',
              timestamp: Date.now()
            });
          });
        })
    );
  }
});
