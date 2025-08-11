// Сервис для работы с уведомлениями
export class NotificationService {
  constructor() {
    this.permission = 'default';
    this.subscription = null;
    this.isSupported = 'Notification' in window;
    this.eventHandlers = new Map();
  }

  async init() {
    console.log('Инициализация NotificationService...');
    
    if (!this.isSupported) {
      console.warn('Уведомления не поддерживаются браузером');
      return false;
    }

    // Проверка разрешений
    this.permission = Notification.permission;
    
    // Запрос разрешений если необходимо
    if (this.permission === 'default') {
      await this.requestPermission();
    }

    // Инициализация push-уведомлений
    if (this.permission === 'granted') {
      await this.initPushNotifications();
    }

    return true;
  }

  // Запрос разрешения на уведомления
  async requestPermission() {
    try {
      this.permission = await Notification.requestPermission();
      console.log('Разрешение на уведомления:', this.permission);
      
      if (this.permission === 'granted') {
        await this.initPushNotifications();
      }
      
      return this.permission;
    } catch (error) {
      console.error('Ошибка запроса разрешения на уведомления:', error);
      return 'denied';
    }
  }

  // Инициализация push-уведомлений
  async initPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push-уведомления не поддерживаются');
      return false;
    }

    try {
      // Регистрация Service Worker
      const registration = await navigator.serviceWorker.ready;
      
      // Получение существующей подписки
      this.subscription = await registration.pushManager.getSubscription();
      
      // Создание новой подписки если нет существующей
      if (!this.subscription) {
        await this.subscribeToPush();
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка инициализации push-уведомлений:', error);
      return false;
    }
  }

  // Подписка на push-уведомления
  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Получение VAPID ключа с сервера
      const vapidKey = await this.getVapidKey();
      
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });
      
      // Отправка подписки на сервер
      await this.sendSubscriptionToServer(this.subscription);
      
      console.log('Подписка на push-уведомления создана');
      return this.subscription;
    } catch (error) {
      console.error('Ошибка подписки на push-уведомления:', error);
      throw error;
    }
  }

  // Отписка от push-уведомлений
  async unsubscribeFromPush() {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe();
        await this.removeSubscriptionFromServer(this.subscription);
        this.subscription = null;
        console.log('Отписка от push-уведомлений выполнена');
      }
    } catch (error) {
      console.error('Ошибка отписки от push-уведомлений:', error);
    }
  }

  // Получение VAPID ключа
  async getVapidKey() {
    try {
      const response = await fetch('/api/notifications/vapid-key');
      if (!response.ok) {
        throw new Error('Ошибка получения VAPID ключа');
      }
      const data = await response.json();
      return data.vapidKey;
    } catch (error) {
      console.error('Ошибка получения VAPID ключа:', error);
      throw error;
    }
  }

  // Отправка подписки на сервер
  async sendSubscriptionToServer(subscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка отправки подписки на сервер');
      }
      
      console.log('Подписка отправлена на сервер');
    } catch (error) {
      console.error('Ошибка отправки подписки на сервер:', error);
      throw error;
    }
  }

  // Удаление подписки с сервера
  async removeSubscriptionFromServer(subscription) {
    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка удаления подписки с сервера');
      }
      
      console.log('Подписка удалена с сервера');
    } catch (error) {
      console.error('Ошибка удаления подписки с сервера:', error);
    }
  }

  // Показ локального уведомления
  showNotification(title, options = {}) {
    if (!this.isSupported || this.permission !== 'granted') {
      console.warn('Уведомления недоступны');
      return null;
    }

    const defaultOptions = {
      icon: '/assets/icon-192.png',
      badge: '/assets/badge-72.png',
      vibrate: [100, 50, 100],
      requireInteraction: false,
      silent: false,
      tag: 'default',
      data: {}
    };

    const notificationOptions = { ...defaultOptions, ...options };

    try {
      const notification = new Notification(title, notificationOptions);
      
      // Обработка событий уведомления
      notification.onclick = (event) => {
        this.handleNotificationClick(event, notification);
      };
      
      notification.onclose = (event) => {
        this.handleNotificationClose(event, notification);
      };
      
      notification.onshow = (event) => {
        this.handleNotificationShow(event, notification);
      };
      
      this.emit('notificationShown', { title, options: notificationOptions, notification });
      
      return notification;
    } catch (error) {
      console.error('Ошибка показа уведомления:', error);
      return null;
    }
  }

  // Показ уведомления о новом сообщении
  showMessageNotification(sender, message, roomId) {
    const title = `Новое сообщение от ${sender.name}`;
    const options = {
      body: message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text,
      icon: sender.avatar || '/assets/default-avatar.png',
      tag: `message-${roomId}`,
      data: {
        type: 'message',
        roomId: roomId,
        messageId: message.id,
        sender: sender
      },
      actions: [
        {
          action: 'reply',
          title: 'Ответить',
          icon: '/assets/reply-icon.png'
        },
        {
          action: 'view',
          title: 'Просмотреть',
          icon: '/assets/view-icon.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Показ уведомления о событии
  showEventNotification(event) {
    const title = `Новое событие: ${event.title}`;
    const options = {
      body: event.description,
      icon: '/assets/event-icon.png',
      tag: `event-${event.id}`,
      data: {
        type: 'event',
        eventId: event.id
      },
      actions: [
        {
          action: 'join',
          title: 'Присоединиться',
          icon: '/assets/join-icon.png'
        },
        {
          action: 'view',
          title: 'Просмотреть',
          icon: '/assets/view-icon.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Показ уведомления о миссии
  showMissionNotification(mission) {
    const title = `Новая миссия: ${mission.title}`;
    const options = {
      body: `Награда: ${mission.reward} косточек`,
      icon: '/assets/mission-icon.png',
      tag: `mission-${mission.id}`,
      data: {
        type: 'mission',
        missionId: mission.id
      },
      actions: [
        {
          action: 'start',
          title: 'Начать',
          icon: '/assets/start-icon.png'
        },
        {
          action: 'view',
          title: 'Просмотреть',
          icon: '/assets/view-icon.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Показ уведомления о достижении
  showAchievementNotification(achievement) {
    const title = `🏆 Достижение разблокировано!`;
    const options = {
      body: achievement.description,
      icon: achievement.icon || '/assets/achievement-icon.png',
      tag: `achievement-${achievement.id}`,
      data: {
        type: 'achievement',
        achievementId: achievement.id
      },
      requireInteraction: true,
      actions: [
        {
          action: 'share',
          title: 'Поделиться',
          icon: '/assets/share-icon.png'
        },
        {
          action: 'view',
          title: 'Просмотреть',
          icon: '/assets/view-icon.png'
        }
      ]
    };

    return this.showNotification(title, options);
  }

  // Обработка клика по уведомлению
  handleNotificationClick(event, notification) {
    const data = notification.data;
    
    // Закрытие уведомления
    notification.close();
    
    // Обработка действий
    if (event.action) {
      this.handleNotificationAction(event.action, data);
    } else {
      // Обработка основного клика
      this.handleNotificationData(data);
    }
    
    this.emit('notificationClicked', { action: event.action, data });
  }

  // Обработка действий уведомления
  handleNotificationAction(action, data) {
    switch (action) {
      case 'reply':
        this.handleReplyAction(data);
        break;
      case 'view':
        this.handleViewAction(data);
        break;
      case 'join':
        this.handleJoinAction(data);
        break;
      case 'start':
        this.handleStartAction(data);
        break;
      case 'share':
        this.handleShareAction(data);
        break;
      default:
        console.warn('Неизвестное действие уведомления:', action);
    }
  }

  // Обработка данных уведомления
  handleNotificationData(data) {
    switch (data.type) {
      case 'message':
        this.openChat(data.roomId);
        break;
      case 'event':
        this.openEvent(data.eventId);
        break;
      case 'mission':
        this.openMission(data.missionId);
        break;
      case 'achievement':
        this.openAchievement(data.achievementId);
        break;
      default:
        console.warn('Неизвестный тип уведомления:', data.type);
    }
  }

  // Обработчики действий
  handleReplyAction(data) {
    if (data.type === 'message') {
      this.openChat(data.roomId, { action: 'reply', messageId: data.messageId });
    }
  }

  handleViewAction(data) {
    this.handleNotificationData(data);
  }

  handleJoinAction(data) {
    if (data.type === 'event') {
      this.joinEvent(data.eventId);
    }
  }

  handleStartAction(data) {
    if (data.type === 'mission') {
      this.startMission(data.missionId);
    }
  }

  handleShareAction(data) {
    if (data.type === 'achievement') {
      this.shareAchievement(data.achievementId);
    }
  }

  // Методы навигации (заглушки)
  openChat(roomId, options = {}) {
    console.log('Открытие чата:', roomId, options);
    // Здесь будет навигация к чату
  }

  openEvent(eventId) {
    console.log('Открытие события:', eventId);
    // Здесь будет навигация к событию
  }

  openMission(missionId) {
    console.log('Открытие миссии:', missionId);
    // Здесь будет навигация к миссии
  }

  openAchievement(achievementId) {
    console.log('Открытие достижения:', achievementId);
    // Здесь будет навигация к достижению
  }

  joinEvent(eventId) {
    console.log('Присоединение к событию:', eventId);
    // Здесь будет логика присоединения к событию
  }

  startMission(missionId) {
    console.log('Начало миссии:', missionId);
    // Здесь будет логика начала миссии
  }

  shareAchievement(achievementId) {
    console.log('Поделиться достижением:', achievementId);
    // Здесь будет логика шаринга достижения
  }

  // Обработка закрытия уведомления
  handleNotificationClose(event, notification) {
    this.emit('notificationClosed', { notification });
  }

  // Обработка показа уведомления
  handleNotificationShow(event, notification) {
    this.emit('notificationShown', { notification });
  }

  // Закрытие всех уведомлений
  closeAllNotifications() {
    if (this.isSupported) {
      // Закрытие всех уведомлений с определенным тегом
      // В реальном приложении здесь будет логика закрытия
      console.log('Закрытие всех уведомлений');
    }
  }

  // Проверка поддержки уведомлений
  isNotificationSupported() {
    return this.isSupported;
  }

  // Проверка разрешения на уведомления
  getPermission() {
    return this.permission;
  }

  // Проверка, разрешены ли уведомления
  isPermissionGranted() {
    return this.permission === 'granted';
  }

  // Получение подписки на push-уведомления
  getSubscription() {
    return this.subscription;
  }

  // Подписка на события
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  // Отписка от событий
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Эмиссия событий
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Ошибка в обработчике события уведомления:', error);
        }
      });
    }
  }

  // Очистка ресурсов
  destroy() {
    this.eventHandlers.clear();
    if (this.subscription) {
      this.unsubscribeFromPush();
    }
  }
} 