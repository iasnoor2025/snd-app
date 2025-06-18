// Service Worker Version
const SW_VERSION = '1.0.7';

// Cache Names
const STATIC_CACHE = 'static-cache-v1';
const API_CACHE = 'api-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json'
];

// API endpoints to cache
const API_ENDPOINTS = [
  { url: '/api/dashboard/stats', strategy: 'network-first' },
  { url: '/api/equipment', strategy: 'network-first' },
  { url: '/api/rentals', strategy: 'network-first' },
  { url: '/api/user/profile', strategy: 'network-first' },
  { url: '/api/notifications/unread', strategy: 'network-first' }
];

// Install event - precache static assets
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker version:', SW_VERSION);

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        console.log('[SW] Caching static assets');
        await cache.addAll(PRECACHE_ASSETS);
        await self.skipWaiting();
        console.log('[SW] Static assets cached successfully');
      } catch (error) {
        console.error('[SW] Failed to cache assets:', error);
        // Continue with service worker installation even if caching fails
        await self.skipWaiting();
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker version:', SW_VERSION);

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter(cacheName => {
        return (
          cacheName.startsWith('static-cache-') && cacheName !== STATIC_CACHE ||
          cacheName.startsWith('api-cache-') && cacheName !== API_CACHE ||
          cacheName.startsWith('dynamic-cache-') && cacheName !== DYNAMIC_CACHE
        );
      });

      await Promise.all(cachesToDelete.map(cacheName => caches.delete(cacheName)));
      await self.clients.claim();
      console.log('[SW] Service Worker activated and claimed clients');
    })()
  );
});

// Helper function to determine if a request is a navigation request
function isNavigationRequest(request) {
  return request.mode === 'navigate' && request.destination === 'document';
}

// Helper function to determine if a request is for a static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i)
  );
}

// Helper function to determine if a request is for an API endpoint
function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

// Helper function to determine if a request is for the Vite dev server
function isViteRequest(request) {
  const url = new URL(request.url);

  // Check if this is a direct Vite dev server request
  if (url.hostname === 'localhost' && (url.port === '5173' || url.port === '5174')) {
    console.log('[SW] Detected Vite dev server request:', request.url);
    return true;
  }

  // Check for Vite-specific paths regardless of origin
  if (url.pathname.includes('/@vite/') ||
      url.pathname.includes('node_modules/.vite') ||
      url.pathname.includes('/@react-refresh') ||
      url.pathname.includes('/@fs/') ||
      url.pathname === '/client' ||
      url.searchParams.has('import') ||
      url.searchParams.has('t')) {
    console.log('[SW] Detected Vite-specific path:', request.url);
    return true;
  }

  // In development mode, check for common development assets
  if (url.hostname === 'localhost' ||
      self.location.hostname === 'new_snd_app.test' ||
      self.location.hostname === 'localhost') {

    // Development asset patterns
    const isDevelopmentAsset =
      url.pathname.includes('/resources/css/app.css') ||
      url.pathname.includes('/resources/js/app.tsx') ||
      url.pathname.match(/\.(tsx?|jsx?|css|vue)$/i) ||
      url.pathname.includes('/resources/');

    if (isDevelopmentAsset) {
      console.log('[SW] Detected development asset:', request.url);
      return true;
    }
  }

  return false;
}

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip ALL localhost:5174 requests (Vite dev server)
  if (url.hostname === 'localhost' && url.port === '5174') {
    console.log('[SW] Skipping localhost:5174 request:', request.url);
    return;
  }

  // Skip ALL localhost:5173 requests (Vite dev server)
  if (url.hostname === 'localhost' && url.port === '5173') {
    console.log('[SW] Skipping localhost:5173 request:', request.url);
    return;
  }

  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin) &&
      !request.url.startsWith('http://127.0.0.1')) {
    return;
  }

  // Skip Vite dev server requests during development
  if (isViteRequest(request)) {
    console.log('[SW] Skipping Vite request:', request.url);
    return;
  }

  // Handle navigation requests (HTML pages)
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for navigation requests
          console.log('[SW] Navigation request for:', request.url);
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed for navigation, trying cache:', request.url);

          // If network fails, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If cache fails, return offline page
          console.log('[SW] Cache failed for navigation, returning offline page');
          return caches.match('/offline');
        }
      })()
    );
    return;
  }

  // Handle static assets (cache-first strategy)
  if (isStaticAsset(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try cache first for static assets
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If not in cache, try network
          try {
            const networkResponse = await fetch(request);
            // Only cache successful responses
            if (networkResponse.ok) {
              const cache = await caches.open(STATIC_CACHE);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            console.log('[SW] Failed to fetch static asset:', request.url);
            // For favicon and other critical assets, try to return a default
            if (request.url.includes('favicon.ico')) {
              return caches.match('/favicon.ico');
            }
            // No fallback for other static assets
            return new Response('Not found', { status: 404 });
          }
        } catch (error) {
          console.error('[SW] Error handling static asset:', error);
          return new Response('Error', { status: 500 });
        }
      })()
    );
    return;
  }

  // Handle API requests (network-first strategy)
  if (isApiRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for API requests
          const networkResponse = await fetch(request);

          // Cache successful GET responses
          if (request.method === 'GET' && networkResponse.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed for API request, trying cache:', request.url);

          // If network fails, try cache for GET requests
          if (request.method === 'GET') {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
          }

          // If cache fails or not a GET request, return error response
          return new Response(JSON.stringify({ error: 'Network error', offline: true }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Helper function to determine if a request is for locale files
  function isLocaleRequest(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/locales/') && url.pathname.endsWith('.json');
  }

  // Handle locale files (network-first with fallback)
  if (isLocaleRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Try network first for locale files
          const networkResponse = await fetch(request);

          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed for locale request, trying cache:', request.url);

          // If network fails, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If cache fails, return empty JSON object as fallback
          return new Response(JSON.stringify({}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Default strategy for other requests (network-first with dynamic caching)
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);

        // Cache successful GET responses
        if (request.method === 'GET' && networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.log('[SW] Network failed for request, trying cache:', request.url);

        // If network fails, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If cache fails, return error response
        return new Response('Network error', { status: 503 });
      }
    })()
  );
});

// Background sync event
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(
      (async () => {
        try {
          // Notify clients that sync is happening
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_STARTED'
            });
          });

          // The actual sync will be handled by the client
          console.log('[SW] Triggered background sync for pending actions');
        } catch (error) {
          console.error('[SW] Background sync failed:', error);
        }
      })()
    );
  }
});

// Push notification event
self.addEventListener('push', event => {
  try {
    let data = {};
    if (event.data) {
      data = event.data.json();
    }

    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/images/logo.png',
      badge: '/images/badge.png',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Notification', options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    (async () => {
      const url = event.notification.data.url;
      const windowClients = await self.clients.matchAll({ type: 'window' });

      // Check if there's already a window open with the target URL
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // If no window is open with the URL, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })()
  );
});

// Message event for client communication
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Log service worker errors
self.addEventListener('error', event => {
  console.error('[SW] Service worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] Service Worker initialized (version:', SW_VERSION, ')');
