// Главный файл приложения Dogymorbis
import { AppConfig } from './config.js';
import { Router } from './components/router.js';
import { StateManager } from './services/state.js';
import { AuthService } from './services/auth.js';
import { MapService } from './services/map.js';
import { ChatService } from './services/chat.js';
import { NotificationService } from './services/notifications.js';

class DogymorbisApp {
  constructor() {
    this.config = AppConfig;
    this.router = null;
    this.stateManager = null;
    this.services = {};
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('🚀 Инициализация Dogymorbis...');
      
      // Инициализация PWA
      await this.initPWA();
      
      // Инициализация сервисов
      await this.initServices();
      
      // Инициализация роутера
      this.initRouter();
      
      // Инициализация UI
      this.initUI();
      
      // Загрузка начального состояния
      await this.loadInitialState();
      
      this.isInitialized = true;
      console.log('✅ Dogymorbis успешно инициализирован');
      
      // Запуск приложения
      this.start();
      
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      this.showError('Ошибка загрузки приложения');
    }
  }

  async initPWA() {
    // Регистрация Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker зарегистрирован:', registration);
        
        // Запрос разрешений для push-уведомлений
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.warn('Service Worker не зарегистрирован:', error);
      }
    }

    // Установка PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallPrompt();
    });
  }

  async initServices() {
    // Менеджер состояния
    this.stateManager = new StateManager();
    
    // Сервисы
    this.services.auth = new AuthService(this.config.apiBaseUrl);
    this.services.map = new MapService();
    this.services.chat = new ChatService();
    this.services.notifications = new NotificationService();
    
    // Инициализация сервисов
    await Promise.all([
      this.services.auth.init(),
      this.services.map.init(),
      this.services.chat.init(),
      this.services.notifications.init()
    ]);
  }

  initRouter() {
    this.router = new Router({
      routes: {
        '/': { component: 'MapPage', title: 'Карта' },
        '/feed': { component: 'FeedPage', title: 'Лента' },
        '/shop': { component: 'ShopPage', title: 'Магазин' },
        '/dao': { component: 'DaoPage', title: 'Сообщество' },
        '/profile': { component: 'ProfilePage', title: 'Профиль' },
        '/friends': { component: 'FriendsPage', title: 'Друзья' },
        '/chat': { component: 'ChatPage', title: 'Чаты' },
        '/events': { component: 'EventsPage', title: 'События' },
        '/pets': { component: 'PetsPage', title: 'Мои питомцы' },
        '/routes': { component: 'RoutesPage', title: 'Маршруты' },
        '/quests': { component: 'QuestsPage', title: 'Квесты' },
        '/partners': { component: 'PartnersPage', title: 'Партнёры' },
        '/help': { component: 'HelpPage', title: 'Помощь' },
        '/settings': { component: 'SettingsPage', title: 'Настройки' }
      },
      onRouteChange: (route) => {
        this.updateNavigation(route.path);
        this.updateTitle(route.title);
      }
    });
  }

  initUI() {
    // Инициализация бургер-меню
    this.initBurgerMenu();
    
    // Инициализация нижней навигации
    this.initBottomNavigation();
    
    // Инициализация FAB кнопок
    this.initFloatingActions();
    
    // Инициализация чат-оверлея
    this.initChatOverlay();
    
    // Привязка событий
    this.bindEvents();
  }

  async loadInitialState() {
    // Загрузка пользователя
    const user = await this.services.auth.getCurrentUser();
    if (user) {
      this.stateManager.setUser(user);
      this.stateManager.setBoneBalance(user.boneBalance || 0);
    }
    
    // Загрузка миссий
    const missions = await this.services.auth.getActiveMissions();
    this.stateManager.setMissions(missions);
    
    // Обновление UI
    this.updateUI();
  }

  start() {
    // Запуск роутера
    this.router.start();
    
    // Запуск фоновых задач
    this.startBackgroundTasks();
    
    // Показ приветственного экрана для новых пользователей
    if (!this.stateManager.getUser()) {
      this.showWelcomeScreen();
    }
  }

  initBurgerMenu() {
    const burgerMenu = document.querySelector('.burger-menu');
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    
    if (burgerMenu && sidebar) {
      burgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        body.classList.toggle('sidebar-open');
      });
      
      // Закрытие при клике вне меню
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !burgerMenu.contains(e.target)) {
          sidebar.classList.remove('active');
          body.classList.remove('sidebar-open');
        }
      });
    }
  }

  initBottomNavigation() {
    const navItems = document.querySelectorAll('.navbar-item');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Убираем активный класс у всех элементов
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Добавляем активный класс к текущему элементу
        item.classList.add('active');
        
        // Переходим на соответствующую страницу
        const route = item.getAttribute('data-route');
        if (route) {
          this.router.navigate(route);
        }
      });
    });
  }

  initFloatingActions() {
    const fabButtons = document.querySelectorAll('.fab-button');
    
    fabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-action');
        this.handleFloatingAction(action);
      });
    });
  }

  initChatOverlay() {
    const chatToggle = document.querySelector('.chat-toggle');
    const chatOverlay = document.querySelector('.chat-overlay');
    
    if (chatToggle && chatOverlay) {
      chatToggle.addEventListener('click', () => {
        chatOverlay.classList.toggle('active');
      });
      
      // Закрытие при клике на крестик
      const closeBtn = chatOverlay.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          chatOverlay.classList.remove('active');
        });
      }
    }
  }

  bindEvents() {
    // Обработка онлайн/офлайн статуса
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));
    
    // Обработка изменения размера окна
    window.addEventListener('resize', () => this.handleResize());
    
    // Обработка изменения видимости страницы
    document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
    
    // Обработка навигации
    window.addEventListener('popstate', () => {
      this.router.handleRouteChange(window.location.pathname);
    });
  }

  handleFloatingAction(action) {
    switch (action) {
      case 'create':
        this.showCreateMenu();
        break;
      case 'ai':
        this.openAIHelper();
        break;
      case 'walk':
        this.startWalk();
        break;
      case 'event':
        this.createEvent();
        break;
      default:
        console.log('Неизвестное действие:', action);
    }
  }

  showCreateMenu() {
    // Показываем меню создания (пост, событие, прогулка)
    this.showNotification('Меню создания...', 'info');
    // Здесь будет модальное окно с опциями
  }

  openAIHelper() {
    // Открываем AI помощника
    this.showNotification('AI помощник открывается...', 'info');
    // Здесь будет AI интерфейс
  }

  async startWalk() {
    try {
      // Получаем текущую геолокацию
      const position = await this.getCurrentPosition();
      
      // Обновляем состояние
      this.stateManager.setLocation(position);
      
      // Показываем уведомление
      this.showNotification('Прогулка началась! 🐕', 'success');
      
      // Переходим на карту
      this.router.navigate('/map');
      
    } catch (error) {
      console.error('Ошибка начала прогулки:', error);
      this.showNotification('Не удалось начать прогулку. Проверьте разрешения геолокации.', 'error');
    }
  }

  createEvent() {
    this.showNotification('Создание события...', 'info');
    // Здесь будет логика создания события
  }

  findFriends() {
    this.showNotification('Поиск друзей...', 'info');
    // Здесь будет логика поиска друзей
  }

  handleOnlineStatus(isOnline) {
    if (isOnline) {
      this.showNotification('Соединение восстановлено', 'success');
      this.syncData();
    } else {
      this.showNotification('Нет соединения с интернетом', 'warning');
    }
  }

  handleResize() {
    // Обновляем layout при изменении размера окна
    this.updateLayout();
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseBackgroundTasks();
    } else {
      this.resumeBackgroundTasks();
    }
  }

  updateNavigation(route) {
    // Обновляем активную вкладку в нижней навигации
    const navItems = document.querySelectorAll('.navbar-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-route') === route) {
        item.classList.add('active');
      }
    });

    // Обновляем активный элемент в боковом меню
    const sidebarLinks = document.querySelectorAll('.nav-link');
    sidebarLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      }
    });
  }

  updateTitle(title) {
    document.title = `${title} - Dogymorbis`;
  }

  updateLayout() {
    const body = document.body;
    if (window.innerWidth <= 768) {
      body.classList.add('mobile');
    } else {
      body.classList.remove('mobile');
    }
  }

  updateUI() {
    // Обновляем баланс косточек
    const boneBalance = this.stateManager.getBoneBalance();
    const boneBalanceEl = document.querySelector('.bone-balance .balance');
    if (boneBalanceEl) {
      boneBalanceEl.textContent = boneBalance;
    }
    
    // Обновляем количество уведомлений
    const unreadCount = this.stateManager.getUnreadCount();
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) {
      if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'block';
      } else {
        notificationBadge.style.display = 'none';
      }
    }
  }

  // Уведомления
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'install-prompt';
    prompt.innerHTML = `
      <div class="install-prompt-content">
        <h3>Установить Dogymorbis?</h3>
        <p>Получите быстрый доступ к приложению с главного экрана</p>
        <div class="install-prompt-buttons">
          <button class="button" onclick="this.installApp()">Установить</button>
          <button class="button secondary" onclick="this.dismissInstall()">Позже</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(prompt);
  }

  async installApp() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log('Результат установки:', outcome);
      this.deferredPrompt = null;
    }
  }

  dismissInstall() {
    const prompt = document.querySelector('.install-prompt');
    if (prompt) {
      document.body.removeChild(prompt);
    }
  }

  showWelcomeScreen() {
    if (!this.stateManager.getUser()) {
      this.router.navigate('/welcome');
    }
  }

  // Фоновые задачи
  startBackgroundTasks() {
    // Обновление местоположения
    this.locationInterval = setInterval(() => {
      this.updateLocation();
    }, 30000); // каждые 30 секунд
    
    // Синхронизация данных
    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 60000); // каждую минуту
  }

  pauseBackgroundTasks() {
    if (this.locationInterval) {
      clearInterval(this.locationInterval);
    }
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  resumeBackgroundTasks() {
    this.startBackgroundTasks();
  }

  async updateLocation() {
    try {
      const position = await this.getCurrentPosition();
      this.stateManager.setLocation(position);
      await this.services.map.updateLocation(position);
    } catch (error) {
      console.warn('Не удалось обновить местоположение:', error);
    }
  }

  async syncData() {
    try {
      await this.services.auth.syncUserData();
      await this.services.chat.syncMessages();
    } catch (error) {
      console.warn('Ошибка синхронизации:', error);
    }
  }

  async syncOfflineData() {
    try {
      await this.services.auth.syncOfflineData();
      await this.services.chat.syncOfflineMessages();
    } catch (error) {
      console.warn('Ошибка синхронизации офлайн данных:', error);
    }
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }
}

// Глобальный экземпляр приложения
window.DogymorbisApp = new DogymorbisApp();

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  window.DogymorbisApp.init();
}); 