// service-worker.js
const CACHE_NAME = 'attendance-planner-v1';
const urlsToCache = [
  './',                    // main page
  'index.html',
  'manifest.json',
  // Add your icon files here if you have them
  'icon-192.png',
  'icon-512.png'
];

const OFFLINE_PAGE = './index.html';   // fallback to your main page

// Install event - Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - Serve from cache first (Cache-First strategy)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if found
        if (response) {
          return response;
        }

        // If not in cache, try network
        return fetch(event.request)
          .then((networkResponse) => {
            // Optional: Cache successful responses for future use
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // If offline and request failed, return cached index.html
            return caches.match(OFFLINE_PAGE);
          });
      })
  );
});

console.log('Attendance Planner Service Worker registered');
