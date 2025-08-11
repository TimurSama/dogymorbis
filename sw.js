// Service Worker для Dogymorbis PWA
const CACHE_NAME = 'dogymorbis-v1.0.0';
const STATIC_CACHE = 'dogymorbis-static-v1';
const DYNAMIC_CACHE = 'dogymorbis-dynamic-v1';

// Файлы для кэширования
const STATIC_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/animations.css',
  '/js/config.js',
  '/js/app.js',
  '/js/components/router.js',
  '/js/services/state.js',
  '/js/services/auth.js',
  '/js/services/map.js',
  '/js/services/chat.js',
  '/js/services/notifications.js',
  '/assets/gradient_texture.png',
  '/assets/wool_texture.png',
  '/assets/gradient_swirl.png',
  '/assets/wool_swirl.png',
  '/assets/abstract_swirl.png',
  '/assets/bone.svg',
  '/assets/dog_house.svg',
  '/assets/dog_marker.svg',
  '/assets/ear_bubble.svg',
  '/assets/paw.svg',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        // Кэшируем файлы по одному, чтобы избежать ошибок
        return Promise.allSettled(
          STATIC_FILES.map(url => 
            cache.add(url).catch(error => {
              console.warn(`Service Worker: Failed to cache ${url}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Стратегия кэширования для API запросов
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кэшируем успешные API ответы
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Возвращаем кэшированный ответ при ошибке сети
          return caches.match(request);
        })
    );
    return;
  }

  // Стратегия кэширования для статических файлов
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((fetchResponse) => {
            // Кэшируем новые статические файлы
            if (fetchResponse.status === 200) {
              const responseClone = fetchResponse.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return fetchResponse;
          });
      })
  );
});

// Фоновая синхронизация для офлайн данных
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineData());
  }
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от Dogymorbis!',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text y=".9em" font-size="180">🦴</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72"><text y=".9em" font-size="60">🦴</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text y=".9em" font-size="180">🦴</text></svg>'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><text y=".9em" font-size="180">🦴</text></svg>'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Dogymorbis', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Функция синхронизации офлайн данных
async function syncOfflineData() {
  try {
    // Здесь будет логика синхронизации данных с сервером
    console.log('Синхронизация офлайн данных...');
    
    // Пример: отправка офлайн сообщений
    const offlineMessages = await getOfflineMessages();
    for (const message of offlineMessages) {
      await sendMessageToServer(message);
    }
    
    console.log('Синхронизация завершена');
  } catch (error) {
    console.error('Ошибка синхронизации:', error);
  }
}

// Вспомогательные функции (заглушки)
async function getOfflineMessages() {
  // Получение офлайн сообщений из IndexedDB
  return [];
}

async function sendMessageToServer(message) {
  // Отправка сообщения на сервер
  return fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  });
} 