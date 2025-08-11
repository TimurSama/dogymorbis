// Роутер для SPA навигации
export class Router {
  constructor(config) {
    this.routes = config.routes || {};
    this.onRouteChange = config.onRouteChange || (() => {});
    this.currentRoute = null;
    this.history = [];
    this.maxHistoryLength = 50;
  }

  start() {
    // Обработка навигации браузера
    window.addEventListener('popstate', (event) => {
      this.handleRouteChange(window.location.pathname, event.state);
    });

    // Обработка кликов по ссылкам
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-route]');
      if (link) {
        event.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      }
    });

    // Инициализация с текущим маршрутом
    this.handleRouteChange(window.location.pathname);
  }

  navigate(path, params = {}) {
    const url = new URL(path, window.location.origin);
    
    // Добавление параметров в URL
    Object.keys(params).forEach(key => {
      url.searchParams.set(key, params[key]);
    });

    // Обновление истории браузера
    window.history.pushState(params, '', url.pathname + url.search);
    
    // Обработка изменения маршрута
    this.handleRouteChange(url.pathname, params);
  }

  goBack() {
    if (this.history.length > 1) {
      this.history.pop(); // Удаляем текущий маршрут
      const previousRoute = this.history[this.history.length - 1];
      this.navigate(previousRoute.path, previousRoute.params);
    } else {
      window.history.back();
    }
  }

  goForward() {
    window.history.forward();
  }

  handleRouteChange(pathname, params = {}) {
    const route = this.routes[pathname];
    
    if (!route) {
      // Маршрут не найден - показываем 404
      this.show404();
      return;
    }

    // Обновление текущего маршрута
    this.currentRoute = {
      path: pathname,
      component: route.component,
      title: route.title,
      params: params
    };

    // Добавление в историю
    this.addToHistory(this.currentRoute);

    // Загрузка компонента
    this.loadComponent(route.component, params);

    // Обновление навигации
    this.updateNavigation(pathname);

    // Вызов callback
    this.onRouteChange(this.currentRoute);
  }

  updateNavigation(pathname) {
    // Обновляем активный элемент в нижней навигации
    const navItems = document.querySelectorAll('.navbar-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-route') === pathname) {
        item.classList.add('active');
      }
    });

    // Обновляем активный элемент в боковом меню
    const sidebarLinks = document.querySelectorAll('.nav-link');
    sidebarLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-route') === pathname) {
        link.classList.add('active');
      }
    });
  }

  async loadComponent(componentName, params) {
    try {
      // Показ индикатора загрузки
      this.showLoading();

      // Динамическая загрузка компонента
      const component = await this.getComponent(componentName);
      
      // Рендеринг компонента
      await this.renderComponent(component, params);
      
      // Скрытие индикатора загрузки
      this.hideLoading();

    } catch (error) {
      console.error('Ошибка загрузки компонента:', error);
      this.showError('Ошибка загрузки страницы');
    }
  }

  async getComponent(componentName) {
    switch (componentName) {
      case 'MapPage':
        return this.renderMapPage();
      case 'FeedPage':
        return this.renderFeedPage();
      case 'ShopPage':
        return this.renderShopPage();
      case 'DaoPage':
        return this.renderDaoPage();
      case 'ProfilePage':
        return this.renderProfilePage();
      case 'FriendsPage':
        return this.renderFriendsPage();
      case 'ChatPage':
        return this.renderChatPage();
      case 'EventsPage':
        return this.renderEventsPage();
      case 'PetsPage':
        return this.renderPetsPage();
      case 'RoutesPage':
        return this.renderRoutesPage();
      case 'QuestsPage':
        return this.renderQuestsPage();
      case 'PartnersPage':
        return this.renderPartnersPage();
      case 'HelpPage':
        return this.renderHelpPage();
      case 'SettingsPage':
        return this.renderSettingsPage();
      default:
        return this.show404();
    }
  }

  async renderComponent(component, params) {
    const mainContainer = document.getElementById('main-content');
    if (!mainContainer) {
      console.error('Контейнер main-content не найден');
      return;
    }

    // Очистка контейнера
    mainContainer.innerHTML = '';

    // Рендеринг компонента
    const content = await component.render(params);
    mainContainer.innerHTML = content;

    // Инициализация компонента
    this.initComponent(component, params);
  }

  initComponent(component, params) {
    // Инициализация специфичных для компонента обработчиков
    const initEvent = new CustomEvent('componentInit', {
      detail: { component, params }
    });
    document.dispatchEvent(initEvent);
  }

  addToHistory(route) {
    this.history.push(route);
    
    // Ограничение размера истории
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  showLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
      loading.style.display = 'block';
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  show404() {
    const mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="error-page">
          <div class="error-content">
            <h1>404</h1>
            <p>Страница не найдена</p>
            <a href="/" class="button">На главную</a>
          </div>
        </div>
      `;
    }
  }

  showError(message) {
    const mainContainer = document.getElementById('main-content');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="error-page">
          <div class="error-content">
            <h1>Ошибка</h1>
            <p>${message}</p>
            <a href="/" class="button">На главную</a>
          </div>
        </div>
      `;
    }
  }

  // Рендереры страниц (заглушки)
  async renderHomePage() {
    return `
      <div class="home-page">
        <div class="map-container">
          <div class="map-placeholder">
            <div class="map-overlay">
              <h2>🐕 Добро пожаловать в Dogymorbis!</h2>
              <p>Нажмите кнопку "Начать прогулку" чтобы открыть карту</p>
            </div>
          </div>
        </div>
        
        <div class="welcome-content">
          <div class="welcome-card">
            <h3>🎯 Ваши миссии</h3>
            <div class="missions-list">
              <div class="mission-item">
                <img src="assets/paw.svg" alt="Прогулка" class="mission-icon">
                <div class="mission-info">
                  <h4>Первая прогулка</h4>
                  <p>Прогуляйтесь 1 км с собакой</p>
                </div>
                <span class="mission-reward">+10 <img src="assets/bone.svg" alt="Косточка" class="bone-icon-small"></span>
              </div>
              <div class="mission-item">
                <span class="mission-icon">👥</span>
                <div class="mission-info">
                  <h4>Найти друзей</h4>
                  <p>Познакомьтесь с 3 владельцами собак</p>
                </div>
                <span class="mission-reward">+25 <img src="assets/bone.svg" alt="Косточка" class="bone-icon-small"></span>
              </div>
            </div>
          </div>
          
          <div class="stats-card">
            <h3>📊 Ваша статистика</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">Прогулок</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">Км пройдено</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">Друзей</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">0</span>
                <span class="stat-label">Косточек</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderMapPage() {
    return `
      <div class="map-page">
        <div class="map-header">
          <h2>🗺️ Карта прогулок</h2>
          <div class="map-controls">
            <button class="map-filter-btn" title="Фильтры">
              <span>🔍</span>
            </button>
            <button class="map-layers-btn" title="Слои">
              <span>📊</span>
            </button>
          </div>
        </div>
        
        <div class="map-filters">
          <div class="filter-chips">
            <span class="filter-chip active">Все</span>
            <span class="filter-chip">🐕 Собаки</span>
            <span class="filter-chip">🌳 Парки</span>
            <span class="filter-chip">🏪 Магазины</span>
            <span class="filter-chip">📅 События</span>
          </div>
        </div>
        
        <div class="map-container">
          <div class="map-placeholder">
            <div class="map-overlay">
              <h3>Интерактивная карта</h3>
              <p>Здесь будут отображаться:</p>
              <ul class="map-features">
                <li>📍 Ваше местоположение</li>
                <li>🐕 Другие пользователи с собаками</li>
                <li>🌳 Парки и зоны для выгула</li>
                <li>🏪 Зоомагазины и ветеринары</li>
                <li>📅 Ближайшие события</li>
              </ul>
              <button class="map-start-btn">Начать прогулку</button>
            </div>
          </div>
        </div>
        
        <div class="map-sidebar">
          <div class="nearby-users">
            <h4>👥 Рядом с вами</h4>
            <div class="user-item">
              <div class="user-avatar">🐕</div>
              <div class="user-info">
                <h5>Анна и Рекс</h5>
                <p>150м • Немецкая овчарка</p>
              </div>
              <button class="wave-btn">👋</button>
            </div>
            <div class="user-item">
              <div class="user-avatar">🐕</div>
              <div class="user-info">
                <h5>Михаил и Бобик</h5>
                <p>300м • Золотистый ретривер</p>
              </div>
              <button class="wave-btn">👋</button>
            </div>
          </div>
          
          <div class="nearby-places">
            <h4>🏪 Ближайшие места</h4>
            <div class="place-item">
              <div class="place-icon">🌳</div>
              <div class="place-info">
                <h5>Парк Горького</h5>
                <p>500м • Отличная зона для выгула</p>
              </div>
            </div>
            <div class="place-item">
              <div class="place-icon">🏪</div>
              <div class="place-info">
                <h5>Зоомагазин "Лапки"</h5>
                <p>800м • Корм и игрушки</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderProfilePage() {
    return `
      <div class="profile-page">
        <div class="profile-header">
          <div class="profile-avatar">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--color-secondary); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">👤</div>
          </div>
          <div class="profile-info">
            <h2>Пользователь</h2>
            <p>@user123</p>
            <div class="profile-stats">
              <span>0 🦴</span>
              <span>0 км</span>
              <span>Уровень 1</span>
            </div>
          </div>
          <button class="edit-profile-btn">✏️</button>
        </div>
        
        <div class="profile-sections">
          <div class="profile-section">
            <h3>🐕 Мои питомцы</h3>
            <div class="dogs-list">
              <div class="dog-card">
                <div class="dog-avatar">🐕</div>
                <div class="dog-info">
                  <h4>Добавить собаку</h4>
                  <p>Нажмите, чтобы добавить вашего питомца</p>
                </div>
                <button class="add-dog-btn">+</button>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <h3>📊 Статистика</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">🚶</div>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Прогулок</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📏</div>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Км пройдено</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Друзей</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Квестов</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <h3>🏆 Достижения</h3>
            <div class="achievements-grid">
              <div class="achievement locked">
                <div class="achievement-icon">🚶</div>
                <h4>Первая прогулка</h4>
                <p>Прогуляйтесь 1 км</p>
              </div>
              <div class="achievement locked">
                <div class="achievement-icon">👥</div>
                <h4>Социальная бабочка</h4>
                <p>Познакомьтесь с 3 друзьями</p>
              </div>
              <div class="achievement locked">
                <div class="achievement-icon">🎯</div>
                <h4>Целеустремлённый</h4>
                <p>Выполните 5 квестов</p>
              </div>
            </div>
          </div>
          
          <div class="profile-section">
            <h3>💰 Кошелёк</h3>
            <div class="wallet-card">
              <div class="wallet-balance">
                <span class="balance-amount">0</span>
                <span class="balance-currency">🦴</span>
              </div>
              <div class="wallet-actions">
                <button class="earn-btn">Заработать</button>
                <button class="spend-btn">Потратить</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderChatPage() {
    return `
      <div class="chat-page">
        <div class="chat-list">
          <div class="chat-item active">
            <div class="chat-avatar">🌍</div>
            <div class="chat-info">
              <h4>Глобальный чат</h4>
              <p>Последнее сообщение...</p>
            </div>
            <div class="chat-meta">
              <span class="time">12:30</span>
              <span class="unread">3</span>
            </div>
          </div>
          
          <div class="chat-item">
            <div class="chat-avatar">👥</div>
            <div class="chat-info">
              <h4>Прогулка в парке</h4>
              <p>Кто идёт сегодня?</p>
            </div>
            <div class="chat-meta">
              <span class="time">11:45</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderEventsPage() {
    return `
      <div class="events-page">
        <div class="events-header">
          <h2>События и клубы</h2>
          <button class="create-event-btn">Создать</button>
        </div>
        
        <div class="events-list">
          <div class="event-card">
            <div class="event-date">
              <span class="day">15</span>
              <span class="month">Мар</span>
            </div>
            <div class="event-info">
              <h3>Прогулка в парке Горького</h3>
              <p>Собираемся на прогулку с собаками</p>
              <div class="event-meta">
                <span>📍 Парк Горького</span>
                <span>👥 12 участников</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderShopPage() {
    return `
      <div class="shop-page">
        <div class="shop-header">
          <h2>🛍️ Магазин</h2>
          <div class="shop-search">
            <input type="text" placeholder="🔍 Поиск товаров...">
          </div>
        </div>
        
        <div class="shop-categories">
          <div class="category-item active">Все</div>
          <div class="category-item">🏠 Умные гаджеты</div>
          <div class="category-item">🍖 Корм</div>
          <div class="category-item">🧸 Игрушки</div>
          <div class="category-item">👕 Одежда</div>
          <div class="category-item">🎮 Виртуальные</div>
        </div>
        
        <div class="products-grid">
          <div class="product-card">
            <div class="product-badge">🔥 Популярное</div>
            <div class="product-image">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23e0e0e0'/><text x='100' y='100' text-anchor='middle' font-size='16'>Умный ошейник</text></svg>" alt="Умный ошейник">
            </div>
            <div class="product-info">
              <h3>Умный ошейник GPS</h3>
              <p>Отслеживание местоположения и активности</p>
              <div class="product-price">
                <span class="price-amount">1500</span>
                <span class="price-currency">🦴</span>
                <span class="price-original">₽ 5000</span>
              </div>
            </div>
            <button class="buy-btn">Купить</button>
          </div>
          
          <div class="product-card">
            <div class="product-badge">🎁 Новинка</div>
            <div class="product-image">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23e0e0e0'/><text x='100' y='100' text-anchor='middle' font-size='16'>Корм премиум</text></svg>" alt="Корм премиум">
            </div>
            <div class="product-info">
              <h3>Корм премиум класса</h3>
              <p>Сбалансированное питание для активных собак</p>
              <div class="product-price">
                <span class="price-amount">300</span>
                <span class="price-currency">🦴</span>
                <span class="price-original">₽ 1200</span>
              </div>
            </div>
            <button class="buy-btn">Купить</button>
          </div>
          
          <div class="product-card virtual">
            <div class="product-badge">🎮 NFT</div>
            <div class="product-image">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23ffd700'/><text x='100' y='100' text-anchor='middle' font-size='16'>Золотой ошейник</text></svg>" alt="Золотой ошейник NFT">
            </div>
            <div class="product-info">
              <h3>Золотой ошейник NFT</h3>
              <p>Эксклюзивный виртуальный аксессуар</p>
              <div class="product-price">
                <span class="price-amount">500</span>
                <span class="price-currency">🦴</span>
                <span class="price-note">Только косточками</span>
              </div>
            </div>
            <button class="buy-btn">Купить</button>
          </div>
          
          <div class="product-card">
            <div class="product-image">
              <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='%23e0e0e0'/><text x='100' y='100' text-anchor='middle' font-size='16'>Игрушка мячик</text></svg>" alt="Игрушка мячик">
            </div>
            <div class="product-info">
              <h3>Интерактивный мячик</h3>
              <p>Светящийся мячик с пищалкой</p>
              <div class="product-price">
                <span class="price-amount">50</span>
                <span class="price-currency">🦴</span>
                <span class="price-original">₽ 200</span>
              </div>
            </div>
            <button class="buy-btn">Купить</button>
          </div>
        </div>
        
        <div class="shop-footer">
          <div class="balance-info">
            <span>Ваш баланс: <strong>0 🦴</strong></span>
            <button class="earn-bones-btn">Заработать косточки</button>
          </div>
        </div>
      </div>
    `;
  }

  async renderWalletPage() {
    return `
      <div class="wallet-page">
        <div class="wallet-header">
          <h2>Кошелёк</h2>
          <div class="balance-display">
            <span class="balance-amount">1500</span>
            <span class="balance-currency">косточек</span>
          </div>
        </div>
        
        <div class="wallet-tabs">
          <div class="tab active">Заработать</div>
          <div class="tab">Потратить</div>
          <div class="tab">Стейкинг</div>
        </div>
        
        <div class="wallet-content">
          <div class="earning-options">
            <div class="earning-option">
              <h3>Пройти 5 км</h3>
              <p>+50 косточек</p>
              <button class="start-btn">Начать</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderDaoPage() {
    return `
      <div class="dao-page">
        <div class="dao-header">
          <h2>🗳️ Сообщество DAO</h2>
          <div class="dao-stats">
            <div class="stat-item">
              <span class="stat-value">75%</span>
              <span class="stat-label">Кворум</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">3</span>
              <span class="stat-label">Активных</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">0</span>
              <span class="stat-label">Ваши токены</span>
            </div>
          </div>
        </div>
        
        <div class="dao-tabs">
          <span class="dao-tab active">Голосования</span>
          <span class="dao-tab">Челленджи</span>
          <span class="dao-tab">Достижения</span>
        </div>
        
        <div class="dao-content">
          <div class="proposal-card active">
            <div class="proposal-header">
              <h3>🌳 Добавить новый парк</h3>
              <span class="proposal-status active">Активно</span>
            </div>
            <p>Предложение добавить парк "Солнечный" в список точек интереса для прогулок с собаками</p>
            <div class="proposal-details">
              <div class="proposal-meta">
                <span>📍 Парк "Солнечный"</span>
                <span>⏰ Осталось: 2 дня</span>
                <span>👥 Участников: 156</span>
              </div>
              <div class="proposal-votes">
                <div class="vote-bar">
                  <div class="vote-fill yes" style="width: 65%"></div>
                  <div class="vote-fill no" style="width: 35%"></div>
                </div>
                <div class="vote-stats">
                  <span class="vote-yes">✅ За: 65%</span>
                  <span class="vote-no">❌ Против: 35%</span>
                </div>
              </div>
            </div>
            <div class="proposal-actions">
              <button class="vote-btn vote-yes-btn">✅ За</button>
              <button class="vote-btn vote-no-btn">❌ Против</button>
              <button class="proposal-details-btn">Подробнее</button>
            </div>
          </div>
          
          <div class="proposal-card">
            <div class="proposal-header">
              <h3>🎯 Новый челлендж</h3>
              <span class="proposal-status upcoming">Скоро</span>
            </div>
            <p>Челлендж "10000 шагов с собакой" - пройдите 10 км за неделю</p>
            <div class="proposal-details">
              <div class="proposal-meta">
                <span>🏆 Награда: 100 🦴</span>
                <span>⏰ Начинается: завтра</span>
                <span>👥 Участников: 89</span>
              </div>
            </div>
            <div class="proposal-actions">
              <button class="challenge-join-btn">🎯 Присоединиться</button>
            </div>
          </div>
          
          <div class="proposal-card completed">
            <div class="proposal-header">
              <h3>🏥 Ветклиника в приложении</h3>
              <span class="proposal-status completed">Завершено</span>
            </div>
            <p>Интеграция с сетью ветеринарных клиник для записи на приём</p>
            <div class="proposal-details">
              <div class="proposal-meta">
                <span>✅ Результат: Принято</span>
                <span>📊 За: 78%</span>
                <span>👥 Участников: 234</span>
              </div>
            </div>
            <div class="proposal-actions">
              <button class="proposal-result-btn">📊 Результаты</button>
            </div>
          </div>
        </div>
        
        <div class="dao-achievements">
          <h3>🏆 Доска достижений</h3>
          <div class="achievements-list">
            <div class="achievement-item">
              <div class="achievement-icon">🥇</div>
              <div class="achievement-info">
                <h4>Анна и Рекс</h4>
                <p>Победитель челленджа "Самая активная собака"</p>
              </div>
              <span class="achievement-reward">+50 🦴</span>
            </div>
            <div class="achievement-item">
              <div class="achievement-icon">🥈</div>
              <div class="achievement-info">
                <h4>Михаил и Бобик</h4>
                <p>Второе место в прогулке на 5 км</p>
              </div>
              <span class="achievement-reward">+30 🦴</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderSettingsPage() {
    return `
      <div class="settings-page">
        <div class="settings-header">
          <h2>Настройки</h2>
        </div>
        
        <div class="settings-sections">
          <div class="settings-section">
            <h3>Аккаунт</h3>
            <div class="setting-item">
              <span>Имя</span>
              <input type="text" value="Пользователь">
            </div>
            <div class="setting-item">
              <span>Email</span>
              <input type="email" value="user@example.com">
            </div>
          </div>
          
          <div class="settings-section">
            <h3>Уведомления</h3>
            <div class="setting-item">
              <span>Push-уведомления</span>
              <input type="checkbox" checked>
            </div>
            <div class="setting-item">
              <span>Звуки</span>
              <input type="checkbox" checked>
            </div>
          </div>
          
          <div class="settings-section">
            <h3>Приватность</h3>
            <div class="setting-item">
              <span>Показывать местоположение</span>
              <input type="checkbox" checked>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderFeedPage() {
    return `
      <div class="feed-page">
        <div class="feed-header">
          <h2>📱 Лента</h2>
          <div class="feed-tabs">
            <span class="feed-tab active">Для вас</span>
            <span class="feed-tab">Подписки</span>
            <span class="feed-tab">Популярное</span>
          </div>
        </div>
        
        <div class="feed-content">
          <div class="post-card">
            <div class="post-header">
              <div class="post-avatar">🐕</div>
              <div class="post-info">
                <h4>Анна и Рекс</h4>
                <span>2 часа назад • Парк Горького</span>
              </div>
              <button class="post-menu">⋯</button>
            </div>
            <div class="post-content">
              <p>Отличная прогулка в парке! Рекс познакомился с новыми друзьями 🦴</p>
              <div class="post-image">
                <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23f0f0f0'/><text x='150' y='100' text-anchor='middle' font-size='20'>Фото прогулки</text></svg>" alt="Прогулка">
              </div>
            </div>
            <div class="post-actions">
              <button class="action-btn like-btn">
                <span>❤️</span>
                <span class="action-count">24</span>
              </button>
              <button class="action-btn comment-btn">
                <span>💬</span>
                <span class="action-count">8</span>
              </button>
              <button class="action-btn bone-btn">
                <span>🦴</span>
                <span class="action-count">+5</span>
              </button>
              <button class="action-btn share-btn">
                <span>📤</span>
              </button>
            </div>
          </div>
          
          <div class="post-card">
            <div class="post-header">
              <div class="post-avatar">🐕</div>
              <div class="post-info">
                <h4>Михаил и Бобик</h4>
                <span>4 часа назад • Двор дома</span>
              </div>
              <button class="post-menu">⋯</button>
            </div>
            <div class="post-content">
              <p>Бобик освоил новую команду "Лежать"! 🎉</p>
              <div class="post-video">
                <div class="video-placeholder">
                  <span>▶️</span>
                  <p>Видео тренировки</p>
                </div>
              </div>
            </div>
            <div class="post-actions">
              <button class="action-btn like-btn">
                <span>❤️</span>
                <span class="action-count">18</span>
              </button>
              <button class="action-btn comment-btn">
                <span>💬</span>
                <span class="action-count">5</span>
              </button>
              <button class="action-btn bone-btn">
                <span>🦴</span>
                <span class="action-count">+3</span>
              </button>
              <button class="action-btn share-btn">
                <span>📤</span>
              </button>
            </div>
          </div>
          
          <div class="post-card event-post">
            <div class="post-header">
              <div class="post-avatar">📅</div>
              <div class="post-info">
                <h4>Событие: Прогулка в парке</h4>
                <span>Завтра в 18:00 • Парк Горького</span>
              </div>
            </div>
            <div class="post-content">
              <p>Приглашаем всех на совместную прогулку! 🐕👥</p>
              <div class="event-details">
                <p><strong>📍 Место:</strong> Парк Горького, главный вход</p>
                <p><strong>⏰ Время:</strong> 18:00 - 20:00</p>
                <p><strong>👥 Участники:</strong> 12 человек</p>
              </div>
            </div>
            <div class="post-actions">
              <button class="action-btn join-btn">
                <span>✅</span>
                <span>Присоединиться</span>
              </button>
              <button class="action-btn share-btn">
                <span>📤</span>
                <span>Поделиться</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderFriendsPage() {
    return `
      <div class="friends-page">
        <div class="friends-header">
          <h2>👥 Друзья</h2>
          <p>Найдите новых друзей и их питомцев</p>
        </div>
        <div class="friends-content">
          <div class="friend-card">
            <div class="friend-avatar">🐕</div>
            <div class="friend-info">
              <h4>Анна и Рекс</h4>
              <p>Немецкая овчарка • 2 км от вас</p>
            </div>
            <button class="add-friend-btn">+</button>
          </div>
        </div>
      </div>
    `;
  }

  async renderPetsPage() {
    return `
      <div class="pets-page">
        <div class="pets-header">
          <h2>🐕 Мои питомцы</h2>
          <p>Управляйте профилями ваших собак</p>
        </div>
        <div class="pets-content">
          <div class="pet-card">
            <div class="pet-avatar">🐕</div>
            <div class="pet-info">
              <h3>Бобик</h3>
              <p>Золотистый ретривер • 3 года</p>
              <div class="pet-stats">
                <span>🏃 15 км</span>
                <span>❤️ 85%</span>
                <span>🎯 5 квестов</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async renderRoutesPage() {
    return `
      <div class="routes-page">
        <div class="routes-header">
          <h2>🛤️ Маршруты</h2>
          <p>Сохранённые и рекомендованные маршруты</p>
        </div>
        <div class="routes-content">
          <div class="route-card">
            <div class="route-info">
              <h4>Парк Горького</h4>
              <p>2.5 км • 30 мин • 🦴 +15</p>
            </div>
            <button class="start-route-btn">Начать</button>
          </div>
        </div>
      </div>
    `;
  }

  async renderQuestsPage() {
    return `
      <div class="quests-page">
        <div class="quests-header">
          <h2>🎯 Задачи и квесты</h2>
          <p>Выполняйте задания и получайте награды</p>
        </div>
        <div class="quests-content">
          <div class="quest-card">
            <div class="quest-icon">🚶</div>
            <div class="quest-info">
              <h4>Первая прогулка</h4>
              <p>Прогуляйтесь 1 км с собакой</p>
              <div class="quest-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 60%"></div>
                </div>
                <span>0.6/1 км</span>
              </div>
            </div>
            <span class="quest-reward">+10 🦴</span>
          </div>
        </div>
      </div>
    `;
  }

  async renderPartnersPage() {
    return `
      <div class="partners-page">
        <div class="partners-header">
          <h2>🤝 Партнёры</h2>
          <p>Компании и услуги с бонусами</p>
        </div>
        <div class="partners-content">
          <div class="partner-card">
            <div class="partner-logo">🏥</div>
            <div class="partner-info">
              <h4>ВетКлиника "ЗооДоктор"</h4>
              <p>Скидка 10% на приём</p>
            </div>
            <button class="partner-btn">Использовать</button>
          </div>
        </div>
      </div>
    `;
  }

  async renderHelpPage() {
    return `
      <div class="help-page">
        <div class="help-header">
          <h2>🆘 Помощь / SOS</h2>
          <p>Экстренная помощь и поддержка</p>
        </div>
        <div class="help-content">
          <button class="sos-btn">🚨 SOS - Потерялась собака</button>
          <div class="help-sections">
            <div class="help-section">
              <h4>📞 Экстренные контакты</h4>
              <p>Ветеринар: +7 (999) 123-45-67</p>
              <p>Поиск: +7 (999) 765-43-21</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
} 