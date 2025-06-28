const CACHE_NAME = 'lislip-cache-v1';
const URLS_TO_CACHE = [
  '/',
  'index.html',
  'styles.css',
  'script.js',
  'hotlines.html',
  'first-aid.html',
  'family-plan.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});