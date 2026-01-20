const CACHE_NAME = 'liga-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin.html',
  '/styles.css',
  '/script.js',
  '/admin.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache:', error);
        // Продолжаем установку даже если кеширование не удалось
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кешированный ответ или делаем запрос
        return response || fetch(event.request);
      })
      .catch(() => {
        // Возвращаем fallback для критических ресурсов
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});
