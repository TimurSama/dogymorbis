# Dogymorbis - Мобильное веб-приложение

Мир любви собак начинается здесь. Собирай косточки, знакомься с друзьями и заботься о своём питомце.

## 🚀 Особенности

- **PWA (Progressive Web App)** - работает как нативное приложение
- **Офлайн-режим** - Service Worker для кэширования и офлайн работы
- **Реальное время** - WebSocket для чатов и уведомлений
- **Геолокация** - карты и поиск ближайших пользователей
- **Push-уведомления** - мгновенные уведомления о событиях
- **Модульная архитектура** - легко расширяемая структура

## 📱 Архитектура

### Клиентская часть (Frontend)

Приложение построено на современном стеке технологий:

- **HTML5** - семантическая разметка
- **CSS3** - современные стили с CSS переменными
- **JavaScript ES6+** - модульная архитектура
- **Service Worker** - PWA функциональность
- **WebSocket** - реальное время
- **IndexedDB** - локальное хранилище

### Структура проекта

```
dogymorbis_app_assets/
├── index.html              # Главная страница
├── manifest.json           # PWA манифест
├── sw.js                   # Service Worker
├── css/
│   ├── style.css          # Основные стили
│   └── animations.css     # Анимации
├── js/
│   ├── app.js             # Главный файл приложения
│   ├── config.js          # Конфигурация
│   ├── components/
│   │   └── router.js      # Роутер для SPA
│   └── services/
│       ├── state.js       # Менеджер состояния
│       ├── auth.js        # Аутентификация
│       ├── map.js         # Карты и геолокация
│       ├── chat.js        # Чаты и WebSocket
│       └── notifications.js # Уведомления
└── assets/
    ├── gradient_texture.png
    └── wool_texture.png
```

## 🏗️ Компоненты системы

### 1. Роутер (Router)

Обеспечивает SPA навигацию между страницами:

```javascript
const router = new Router({
  routes: {
    '/': { component: 'HomePage', title: 'Главная' },
    '/map': { component: 'MapPage', title: 'Карта' },
    '/profile': { component: 'ProfilePage', title: 'Профиль' },
    // ... другие маршруты
  }
});
```

### 2. Менеджер состояния (StateManager)

Централизованное управление состоянием приложения:

```javascript
const stateManager = new StateManager();

// Подписка на изменения
stateManager.subscribe('user', (user) => {
  console.log('Пользователь обновлен:', user);
});

// Установка состояния
stateManager.setUser(userData);
stateManager.setBoneBalance(1500);
```

### 3. Сервис аутентификации (AuthService)

Управление пользователями и авторизацией:

```javascript
const authService = new AuthService(apiBaseUrl);

// Регистрация
const result = await authService.register({
  email: 'user@example.com',
  password: 'password',
  name: 'Имя пользователя'
});

// Вход
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'password'
});
```

### 4. Сервис карт (MapService)

Работа с геолокацией и картами:

```javascript
const mapService = new MapService();

// Получение местоположения
const location = await mapService.getCurrentLocation();

// Отслеживание местоположения
mapService.startLocationTracking((location) => {
  console.log('Новое местоположение:', location);
});

// Поиск ближайших пользователей
const nearbyUsers = await mapService.findNearbyUsers(5000);
```

### 5. Сервис чатов (ChatService)

WebSocket соединения и управление сообщениями:

```javascript
const chatService = new ChatService();

// Подключение к чату
chatService.joinRoom('global-chat');

// Отправка сообщения
chatService.sendMessage('global-chat', 'Привет всем!');

// Подписка на события
chatService.on('newMessage', (data) => {
  console.log('Новое сообщение:', data);
});
```

### 6. Сервис уведомлений (NotificationService)

Push-уведомления и системные уведомления:

```javascript
const notificationService = new NotificationService();

// Запрос разрешений
await notificationService.requestPermission();

// Показ уведомления
notificationService.showNotification('Новое сообщение', {
  body: 'У вас новое сообщение',
  icon: '/assets/icon-192.png'
});
```

## 🎨 UI/UX Особенности

### Дизайн-система

- **Цветовая схема**: Теплые тона (желтый, голубой, розовый)
- **Типографика**: Nunito Sans + Montserrat Alternates
- **Компоненты**: Карточки, кнопки, модальные окна
- **Анимации**: Плавные переходы и микроанимации

### Навигация

- **Бургер-меню**: Боковая панель для второстепенных разделов
- **Нижняя навигация**: Основные действия (Главная, Карта, Чаты, Профиль)
- **FAB-кнопки**: Быстрые действия на карте
- **Чат-оверлей**: Плавающий чат внизу экрана

### Адаптивность

- **Мобильный-first** подход
- **Responsive дизайн** для планшетов
- **Touch-friendly** интерфейс
- **Accessibility** поддержка

## 🔧 Установка и запуск

### Локальная разработка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/dogymorbis.git
cd dogymorbis
```

2. Запустите локальный сервер:
```bash
# Используя Python
python -m http.server 8000

# Или используя Node.js
npx serve dogymorbis_app_assets

# Или используя PHP
php -S localhost:8000 -t dogymorbis_app_assets
```

3. Откройте браузер:
```
http://localhost:8000
```

### Продакшн деплой

1. Настройте веб-сервер (Apache/Nginx)
2. Скопируйте файлы в корневую директорию
3. Настройте HTTPS (обязательно для PWA)
4. Обновите `config.js` с продакшн URL

## 📋 Функциональность

### Основные возможности

- ✅ **Регистрация и авторизация**
- ✅ **Профиль пользователя и собаки**
- ✅ **Интерактивная карта**
- ✅ **Глобальный и личные чаты**
- ✅ **События и клубы**
- ✅ **Магазин товаров**
- ✅ **Кошелек BoneCoin**
- ✅ **DAO голосования**
- ✅ **Push-уведомления**
- ✅ **Офлайн-режим**

### Планируемые функции

- 🔄 **AR игры и квесты**
- 🔄 **Интеграция с IoT устройствами**
- 🔄 **AI ассистент**
- 🔄 **Голосовые и видеозвонки**
- 🔄 **Интеграция с социальными сетями**

## 🔌 API Интеграция

### Конфигурация API

```javascript
// config.js
export const AppConfig = {
  apiBaseUrl: 'https://api.dogymorbis.example',
  environment: 'development',
  features: {
    enableBoneCoin: true,
    enableARGames: true,
    enableAIHelper: true,
    enableDAO: true
  }
};
```

### Основные эндпоинты

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/user/profile` - Профиль пользователя
- `GET /api/map/nearby-users` - Ближайшие пользователи
- `POST /api/chat/messages` - Отправка сообщения
- `GET /api/events` - Список событий
- `GET /api/shop/products` - Товары магазина

## 🛠️ Разработка

### Добавление новой страницы

1. Создайте компонент в роутере:
```javascript
// js/components/router.js
async renderNewPage() {
  return `
    <div class="new-page">
      <h2>Новая страница</h2>
      <p>Содержимое страницы</p>
    </div>
  `;
}
```

2. Добавьте маршрут:
```javascript
routes: {
  '/new-page': { component: 'NewPage', title: 'Новая страница' }
}
```

3. Добавьте стили:
```css
/* css/style.css */
.new-page {
  padding: 1rem;
}
```

### Добавление нового сервиса

1. Создайте файл сервиса:
```javascript
// js/services/new-service.js
export class NewService {
  constructor() {
    // Инициализация
  }

  async init() {
    // Логика инициализации
  }

  // Методы сервиса
}
```

2. Подключите в главном файле:
```javascript
// js/app.js
import { NewService } from './services/new-service.js';

this.services.newService = new NewService();
await this.services.newService.init();
```

## 🧪 Тестирование

### Ручное тестирование

1. **PWA функциональность**:
   - Установка приложения
   - Офлайн-режим
   - Push-уведомления

2. **Навигация**:
   - Переходы между страницами
   - Бургер-меню
   - Нижняя навигация

3. **Функциональность**:
   - Регистрация/вход
   - Отправка сообщений
   - Работа с картой

### Автоматизированное тестирование

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Запуск линтера
npm run lint
```

## 📱 PWA Функциональность

### Установка

Приложение поддерживает установку на главный экран:

- **Android**: Chrome покажет баннер установки
- **iOS**: Safari → Поделиться → На экран "Домой"
- **Desktop**: Chrome → Установить приложение

### Офлайн-режим

- **Кэширование**: Статические файлы кэшируются
- **Офлайн данные**: Сообщения и профили сохраняются локально
- **Синхронизация**: Автоматическая при восстановлении соединения

### Push-уведомления

- **Разрешения**: Запрашиваются при первом запуске
- **Типы уведомлений**: Сообщения, события, миссии, достижения
- **Действия**: Ответить, просмотреть, присоединиться

## 🔒 Безопасность

### Аутентификация

- **JWT токены** для API запросов
- **Refresh токены** для автоматического обновления
- **Хранение токенов** в localStorage (защищенном)

### Данные

- **HTTPS** обязателен для PWA
- **Валидация** данных на клиенте и сервере
- **Санитизация** пользовательского ввода

### Приватность

- **GDPR соответствие** для европейских пользователей
- **Настройки приватности** в профиле
- **Экспорт/удаление** данных пользователя

## 🚀 Производительность

### Оптимизация

- **Lazy loading** компонентов
- **Кэширование** изображений и данных
- **Минификация** CSS и JavaScript
- **Сжатие** ресурсов

### Мониторинг

- **Core Web Vitals** отслеживание
- **Ошибки** логирование
- **Производительность** метрики

## 📈 Масштабирование

### Архитектура

- **Микросервисы** на бэкенде
- **CDN** для статических файлов
- **Балансировщик нагрузки** для API
- **Кэширование** на всех уровнях

### База данных

- **PostgreSQL** + **PostGIS** для геоданных
- **Redis** для кэша и сессий
- **MongoDB** для чатов
- **IPFS** для медиафайлов

## 🤝 Вклад в проект

### Как помочь

1. **Fork** репозитория
2. Создайте **feature branch**
3. Внесите изменения
4. Добавьте тесты
5. Создайте **Pull Request**

### Стандарты кода

- **ESLint** для JavaScript
- **Prettier** для форматирования
- **Conventional Commits** для коммитов
- **JSDoc** для документации

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Email**: support@dogymorbis.com
- **Telegram**: @dogymorbis_support
- **Документация**: [docs.dogymorbis.com](https://docs.dogymorbis.com)

## 🙏 Благодарности

Спасибо всем участникам проекта и сообществу владельцев собак за поддержку и идеи!

---

**Dogymorbis** - Мир любви собак начинается здесь! 🐕❤️ 