// Менеджер состояния приложения
export class StateManager {
  constructor() {
    this.state = {
      user: null,
      location: null,
      boneBalance: 0, // Начинаем с 0 косточек
      missions: [],
      activeChats: [],
      notifications: [], // Пустой список уведомлений
      settings: {
        notifications: true,
        location: true,
        theme: 'light'
      },
      offlineData: []
    };
    
    this.subscribers = new Map();
    this.persistentKeys = ['user', 'settings', 'offlineData'];
    
    // Инициализация из localStorage
    this.loadPersistentState();
  }

  // Получение состояния
  getState() {
    return { ...this.state };
  }

  getUser() {
    return this.state.user;
  }

  getLocation() {
    return this.state.location;
  }

  getBoneBalance() {
    return this.state.boneBalance;
  }

  getMissions() {
    return [...this.state.missions];
  }

  getActiveChats() {
    return [...this.state.activeChats];
  }

  getNotifications() {
    return [...this.state.notifications];
  }

  getSettings() {
    return { ...this.state.settings };
  }

  // Установка состояния
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
    this.savePersistentState();
  }

  setUser(user) {
    this.state.user = user;
    this.notifySubscribers('user');
    this.savePersistentState();
  }

  setLocation(location) {
    this.state.location = location;
    this.notifySubscribers('location');
  }

  setBoneBalance(balance) {
    this.state.boneBalance = balance;
    this.notifySubscribers('boneBalance');
    this.savePersistentState();
  }

  setMissions(missions) {
    this.state.missions = missions;
    this.notifySubscribers('missions');
    this.savePersistentState();
  }

  addMission(mission) {
    this.state.missions.push(mission);
    this.notifySubscribers('missions');
    this.savePersistentState();
  }

  updateMission(missionId, updates) {
    const index = this.state.missions.findIndex(m => m.id === missionId);
    if (index !== -1) {
      this.state.missions[index] = { ...this.state.missions[index], ...updates };
      this.notifySubscribers('missions');
      this.savePersistentState();
    }
  }

  setActiveChats(chats) {
    this.state.activeChats = chats;
    this.notifySubscribers('activeChats');
    this.savePersistentState();
  }

  addChat(chat) {
    this.state.activeChats.push(chat);
    this.notifySubscribers('activeChats');
    this.savePersistentState();
  }

  updateChat(chatId, updates) {
    const index = this.state.activeChats.findIndex(c => c.id === chatId);
    if (index !== -1) {
      this.state.activeChats[index] = { ...this.state.activeChats[index], ...updates };
      this.notifySubscribers('activeChats');
      this.savePersistentState();
    }
  }

  setNotifications(notifications) {
    this.state.notifications = notifications;
    this.notifySubscribers('notifications');
    this.savePersistentState();
  }

  addNotification(notification) {
    this.state.notifications.unshift(notification);
    // Ограничиваем количество уведомлений
    if (this.state.notifications.length > 100) {
      this.state.notifications = this.state.notifications.slice(0, 100);
    }
    this.notifySubscribers('notifications');
    this.savePersistentState();
  }

  markNotificationAsRead(notificationId) {
    const notification = this.state.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifySubscribers('notifications');
      this.savePersistentState();
    }
  }

  setSettings(settings) {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notifySubscribers('settings');
    this.savePersistentState();
  }

  // Офлайн данные
  addOfflineData(data) {
    this.state.offlineData.push({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      data: data
    });
    this.notifySubscribers('offlineData');
    this.savePersistentState();
  }

  getOfflineData() {
    return [...this.state.offlineData];
  }

  removeOfflineData(dataId) {
    this.state.offlineData = this.state.offlineData.filter(d => d.id !== dataId);
    this.notifySubscribers('offlineData');
    this.savePersistentState();
  }

  // Подписка на изменения
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);
    
    // Возвращаем функцию для отписки
    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Уведомление подписчиков
  notifySubscribers(key = null) {
    if (key) {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(this.state[key]);
          } catch (error) {
            console.error('Ошибка в callback подписчика:', error);
          }
        });
      }
    } else {
      // Уведомляем всех подписчиков
      this.subscribers.forEach((callbacks, key) => {
        callbacks.forEach(callback => {
          try {
            callback(this.state[key]);
          } catch (error) {
            console.error('Ошибка в callback подписчика:', error);
          }
        });
      });
    }
  }

  // Сохранение в localStorage
  savePersistentState() {
    try {
      const persistentData = {};
      this.persistentKeys.forEach(key => {
        if (this.state[key] !== undefined) {
          persistentData[key] = this.state[key];
        }
      });
      
      localStorage.setItem('dogymorbis_state', JSON.stringify(persistentData));
    } catch (error) {
      console.warn('Не удалось сохранить состояние:', error);
    }
  }

  // Загрузка из localStorage
  loadPersistentState() {
    try {
      const savedState = localStorage.getItem('dogymorbis_state');
      if (savedState) {
        const persistentData = JSON.parse(savedState);
        this.persistentKeys.forEach(key => {
          if (persistentData[key] !== undefined) {
            this.state[key] = persistentData[key];
          }
        });
      }
    } catch (error) {
      console.warn('Не удалось загрузить состояние:', error);
    }
  }

  // Очистка состояния
  clear() {
    this.state = {
      user: null,
      location: null,
      boneBalance: 0,
      missions: [],
      activeChats: [],
      notifications: [],
      settings: {},
      offlineData: []
    };
    
    this.subscribers.clear();
    localStorage.removeItem('dogymorbis_state');
  }

  // Экспорт состояния
  export() {
    return JSON.stringify(this.state, null, 2);
  }

  // Импорт состояния
  import(stateData) {
    try {
      const importedState = JSON.parse(stateData);
      this.state = { ...this.state, ...importedState };
      this.notifySubscribers();
      this.savePersistentState();
      return true;
    } catch (error) {
      console.error('Ошибка импорта состояния:', error);
      return false;
    }
  }

  // Утилиты для работы с данными
  isOnline() {
    return navigator.onLine;
  }

  hasUnreadNotifications() {
    return this.state.notifications.some(n => !n.read);
  }

  getUnreadCount() {
    return this.state.notifications.filter(n => !n.read).length;
  }

  getActiveMissions() {
    return this.state.missions.filter(m => m.status === 'active');
  }

  getCompletedMissions() {
    return this.state.missions.filter(m => m.status === 'completed');
  }

  // Синхронизация с сервером
  async syncWithServer() {
    if (!this.isOnline()) {
      return false;
    }

    try {
      // Отправка офлайн данных
      const offlineData = this.getOfflineData();
      for (const data of offlineData) {
        await this.sendOfflineData(data);
        this.removeOfflineData(data.id);
      }

      // Получение обновлений с сервера
      await this.fetchUpdates();

      return true;
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      return false;
    }
  }

  // Заглушки для методов синхронизации
  async sendOfflineData(data) {
    // Здесь будет отправка данных на сервер
    console.log('Отправка офлайн данных:', data);
  }

  async fetchUpdates() {
    // Здесь будет получение обновлений с сервера
    console.log('Получение обновлений с сервера');
  }
} 