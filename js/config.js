// Конфигурация приложения Dogymorbis
export const AppConfig = {
  // Основные настройки
  appName: 'Dogymorbis',
  version: '1.0.1',
  
  // API настройки
  apiBaseUrl: 'https://api.dogymorbis.example',
  wsUrl: 'wss://api.dogymorbis.example/ws',
  
  // Окружение
  environment: 'production', // development, staging, production
  
  // Настройки PWA
  pwa: {
    name: 'Dogymorbis - Мир любви собак',
    shortName: 'Dogymorbis',
    description: 'Мобильное приложение для владельцев собак',
    themeColor: '#8CB3FF',
    backgroundColor: '#F2E985',
    display: 'standalone',
    orientation: 'portrait-primary'
  },
  
  // Цветовая схема
  theme: {
    primary: '#F2E985',      // Желтый
    secondary: '#8CB3FF',    // Голубой
    accent: '#FFB3D9',       // Розовый
    success: '#4CAF50',      // Зеленый
    warning: '#FF9800',      // Оранжевый
    error: '#F44336',        // Красный
    gold: '#FFD700',         // Золотой
    graphite: '#2C3E50',     // Темно-серый
    grey: '#95A5A6'          // Светло-серый
  },
  
  // Функциональность
  features: {
    enableBoneCoin: true,    // Система косточек
    enableARGames: true,     // AR игры
    enableAIHelper: true,    // AI помощник
    enableDAO: true,         // DAO голосования
    enablePushNotifications: true, // Push уведомления
    enableOfflineMode: true, // Офлайн режим
    enableGeolocation: true, // Геолокация
    enableWebSocket: true    // WebSocket соединения
  },
  
  // Настройки карты
  map: {
    defaultZoom: 15,
    maxZoom: 18,
    minZoom: 10,
    defaultCenter: {
      lat: 55.7558,
      lng: 37.6176
    },
    nearbyRadius: 5000, // метров
    updateInterval: 30000 // 30 секунд
  },
  
  // Настройки чата
  chat: {
    maxMessageLength: 1000,
    typingTimeout: 3000,
    reconnectAttempts: 5,
    reconnectDelay: 1000
  },
  
  // Настройки уведомлений
  notifications: {
    defaultDuration: 5000,
    maxNotifications: 5,
    soundEnabled: true,
    vibrationEnabled: true
  },
  
  // Настройки кэширования
  cache: {
    staticFiles: [
      '/dogymorbis/',
      '/dogymorbis/index.html',
      '/dogymorbis/css/style.css',
      '/dogymorbis/css/animations.css',
      '/dogymorbis/js/config.js',
      '/dogymorbis/js/app.js',
      '/dogymorbis/js/components/router.js',
      '/dogymorbis/js/services/state.js',
      '/dogymorbis/js/services/auth.js',
      '/dogymorbis/js/services/map.js',
      '/dogymorbis/js/services/chat.js',
      '/dogymorbis/js/services/notifications.js',
      '/dogymorbis/assets/bone.svg',
      '/dogymorbis/assets/dog_house.svg',
      '/dogymorbis/assets/dog_marker.svg',
      '/dogymorbis/assets/ear_bubble.svg',
      '/dogymorbis/assets/paw.svg',
      '/dogymorbis/assets/gradient_swirl.png',
      '/dogymorbis/assets/wool_swirl.png',
      '/dogymorbis/assets/abstract_swirl.png',
      '/dogymorbis/manifest.json'
    ],
    localFiles: [
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
      '/assets/bone.svg',
      '/assets/dog_house.svg',
      '/assets/dog_marker.svg',
      '/assets/ear_bubble.svg',
      '/assets/paw.svg',
      '/assets/gradient_swirl.png',
      '/assets/wool_swirl.png',
      '/assets/abstract_swirl.png',
      '/manifest.json'
    ]
  },
  
  // Настройки разработки
  development: {
    debugMode: false,
    logLevel: 'info', // debug, info, warn, error
    enableHotReload: false,
    mockData: false
  }
};
