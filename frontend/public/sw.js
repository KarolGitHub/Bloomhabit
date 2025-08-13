const CACHE_NAME = 'bloomhabit-v1.0.0';
const STATIC_CACHE = 'bloomhabit-static-v1.0.0';
const DYNAMIC_CACHE = 'bloomhabit-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/garden',
  '/ai-gardener',
  '/offline',
  '/css/main.css',
  '/js/app.js',
  '/images/garden-bg.jpg',
  '/images/logo.png',
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker install failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for API calls)
  if (url.origin !== location.origin && !url.pathname.startsWith('/api/')) {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files with cache-first strategy
  if (isStaticFile(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(handleDefaultRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful API responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('API request failed, trying cache:', error);

    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Network error',
        message: 'You are offline. Please check your connection.',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static files with cache-first strategy
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Static file fetch failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Handle navigation requests with network-first strategy
async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful navigation responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('Navigation request failed, trying cache:', error);

    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    return caches.match('/offline');
  }
}

// Handle default requests with network-first strategy
async function handleDefaultRequest(request) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('Default request failed, trying cache:', error);

    // Try to serve from cache if network fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

// Check if a file is static
function isStaticFile(pathname) {
  return (
    STATIC_FILES.includes(pathname) ||
    pathname.startsWith('/css/') ||
    pathname.startsWith('/js/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  );
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync
async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await processPendingAction(action);
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to process pending action:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending actions from IndexedDB
async function getPendingActions() {
  // This would typically interact with IndexedDB
  // For now, return empty array
  return [];
}

// Process a pending action
async function processPendingAction(action) {
  // This would typically make API calls for pending actions
  console.log('Processing pending action:', action);
}

// Remove a processed action
async function removePendingAction(actionId) {
  // This would typically remove from IndexedDB
  console.log('Removing processed action:', actionId);
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'You have a new notification from Bloomhabit',
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      tag: 'bloomhabit-notification',
      data: data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon-32x32.png',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification('Bloomhabit', options));
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Open the app or specific page
    event.waitUntil(clients.openWindow('/'));
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow('/'));
  }
});

// Handle offline/online status
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker loaded');
