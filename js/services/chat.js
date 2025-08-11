// Сервис для работы с чатами и WebSocket соединениями
export class ChatService {
  constructor() {
    this.socket = null;
    this.rooms = new Map();
    this.messages = new Map();
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.messageQueue = [];
    this.eventHandlers = new Map();
  }

  async init() {
    // Загружаем сообщения из локального хранилища
    this.loadMessagesFromStorage();
    
    // Пока отключаем автоматическое подключение к WebSocket
    // await this.connect();
    
    console.log('ChatService инициализирован');
  }

  // Подключение к WebSocket серверу
  async connect() {
    try {
      // В реальном приложении здесь будет URL WebSocket сервера
      const wsUrl = 'wss://api.dogymorbis.example/ws';
      
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket соединение установлено');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.processMessageQueue();
        this.emit('connected');
      };
      
      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket соединение закрыто:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected', event);
        
        // Попытка переподключения
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket ошибка:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Ошибка подключения к WebSocket:', error);
      throw error;
    }
  }

  // Переподключение
  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts} через ${delay}ms`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Обработка входящих сообщений
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'chat_message':
          this.handleChatMessage(message);
          break;
        case 'user_joined':
          this.handleUserJoined(message);
          break;
        case 'user_left':
          this.handleUserLeft(message);
          break;
        case 'typing':
          this.handleTyping(message);
          break;
        case 'read_receipt':
          this.handleReadReceipt(message);
          break;
        default:
          console.warn('Неизвестный тип сообщения:', message.type);
      }
      
      this.emit('message', message);
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  }

  // Обработка сообщений чата
  handleChatMessage(message) {
    const { roomId, message: chatMessage } = message;
    
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    
    this.messages.get(roomId).push(chatMessage);
    this.saveMessagesToStorage();
    
    this.emit('newMessage', { roomId, message: chatMessage });
  }

  // Обработка присоединения пользователя
  handleUserJoined(message) {
    const { roomId, user } = message;
    this.emit('userJoined', { roomId, user });
  }

  // Обработка выхода пользователя
  handleUserLeft(message) {
    const { roomId, user } = message;
    this.emit('userLeft', { roomId, user });
  }

  // Обработка индикатора печати
  handleTyping(message) {
    const { roomId, user, isTyping } = message;
    this.emit('typing', { roomId, user, isTyping });
  }

  // Обработка подтверждения прочтения
  handleReadReceipt(message) {
    const { roomId, messageId, user } = message;
    this.emit('readReceipt', { roomId, messageId, user });
  }

  // Отправка сообщения
  sendMessage(roomId, text, attachments = []) {
    const message = {
      type: 'chat_message',
      roomId: roomId,
      message: {
        id: Date.now().toString(),
        text: text,
        attachments: attachments,
        timestamp: new Date().toISOString(),
        sender: this.getCurrentUser()
      }
    };
    
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
    
    return message.message.id;
  }

  // Отправка сообщения о печати
  sendTyping(roomId, isTyping) {
    const message = {
      type: 'typing',
      roomId: roomId,
      isTyping: isTyping
    };
    
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Отправка подтверждения прочтения
  sendReadReceipt(roomId, messageId) {
    const message = {
      type: 'read_receipt',
      roomId: roomId,
      messageId: messageId
    };
    
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Присоединение к комнате
  joinRoom(roomId) {
    const message = {
      type: 'join_room',
      roomId: roomId
    };
    
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
      this.rooms.set(roomId, { id: roomId, joined: true });
    }
  }

  // Выход из комнаты
  leaveRoom(roomId) {
    const message = {
      type: 'leave_room',
      roomId: roomId
    };
    
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
      this.rooms.delete(roomId);
    }
  }

  // Обработка очереди сообщений
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.socket.send(JSON.stringify(message));
    }
  }

  // Получение сообщений комнаты
  getMessages(roomId) {
    return this.messages.get(roomId) || [];
  }

  // Получение последних сообщений
  getRecentMessages(roomId, limit = 50) {
    const messages = this.getMessages(roomId);
    return messages.slice(-limit);
  }

  // Добавление сообщения локально
  addMessage(roomId, message) {
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }
    
    this.messages.get(roomId).push(message);
    this.saveMessagesToStorage();
  }

  // Удаление сообщения
  deleteMessage(roomId, messageId) {
    const messages = this.getMessages(roomId);
    const index = messages.findIndex(m => m.id === messageId);
    
    if (index !== -1) {
      messages.splice(index, 1);
      this.saveMessagesToStorage();
      return true;
    }
    
    return false;
  }

  // Редактирование сообщения
  editMessage(roomId, messageId, newText) {
    const messages = this.getMessages(roomId);
    const message = messages.find(m => m.id === messageId);
    
    if (message && message.sender.id === this.getCurrentUser().id) {
      message.text = newText;
      message.edited = true;
      message.editTimestamp = new Date().toISOString();
      this.saveMessagesToStorage();
      return true;
    }
    
    return false;
  }

  // Поиск сообщений
  searchMessages(roomId, query) {
    const messages = this.getMessages(roomId);
    const lowerQuery = query.toLowerCase();
    
    return messages.filter(message => 
      message.text.toLowerCase().includes(lowerQuery)
    );
  }

  // Загрузка сообщений из localStorage
  loadMessagesFromStorage() {
    try {
      const saved = localStorage.getItem('dogymorbis_chat_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.messages = new Map(parsed);
      }
    } catch (error) {
      console.warn('Ошибка загрузки сообщений из localStorage:', error);
    }
  }

  // Сохранение сообщений в localStorage
  saveMessagesToStorage() {
    try {
      const serialized = JSON.stringify(Array.from(this.messages.entries()));
      localStorage.setItem('dogymorbis_chat_messages', serialized);
    } catch (error) {
      console.warn('Ошибка сохранения сообщений в localStorage:', error);
    }
  }

  // Синхронизация сообщений с сервером
  async syncMessages() {
    try {
      const response = await fetch('/api/chat/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lastSync: this.getLastSyncTimestamp(),
          rooms: Array.from(this.rooms.keys())
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка синхронизации сообщений');
      }
      
      const data = await response.json();
      
      // Обновление сообщений
      data.messages.forEach(({ roomId, messages }) => {
        if (!this.messages.has(roomId)) {
          this.messages.set(roomId, []);
        }
        
        // Добавление новых сообщений
        messages.forEach(message => {
          const existing = this.messages.get(roomId).find(m => m.id === message.id);
          if (!existing) {
            this.messages.get(roomId).push(message);
          }
        });
      });
      
      this.saveMessagesToStorage();
      this.setLastSyncTimestamp(Date.now());
      
    } catch (error) {
      console.error('Ошибка синхронизации сообщений:', error);
    }
  }

  // Синхронизация офлайн сообщений
  async syncOfflineMessages() {
    // Здесь будет логика отправки офлайн сообщений на сервер
    console.log('Синхронизация офлайн сообщений');
  }

  // Получение списка комнат
  async getRooms() {
    try {
      const response = await fetch('/api/chat/rooms');
      
      if (!response.ok) {
        throw new Error('Ошибка получения списка комнат');
      }
      
      const data = await response.json();
      return data.rooms;
    } catch (error) {
      console.error('Ошибка получения комнат:', error);
      return [];
    }
  }

  // Создание новой комнаты
  async createRoom(roomData) {
    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData)
      });
      
      if (!response.ok) {
        throw new Error('Ошибка создания комнаты');
      }
      
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Ошибка создания комнаты:', error);
      throw error;
    }
  }

  // Получение информации о комнате
  async getRoomInfo(roomId) {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения информации о комнате');
      }
      
      const data = await response.json();
      return data.room;
    } catch (error) {
      console.error('Ошибка получения информации о комнате:', error);
      return null;
    }
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
          console.error('Ошибка в обработчике события:', error);
        }
      });
    }
  }

  // Получение текущего пользователя (заглушка)
  getCurrentUser() {
    // В реальном приложении здесь будет получение из AuthService
    return {
      id: 'current-user',
      name: 'Пользователь',
      avatar: '/assets/default-avatar.png'
    };
  }

  // Получение времени последней синхронизации
  getLastSyncTimestamp() {
    return parseInt(localStorage.getItem('dogymorbis_chat_last_sync') || '0');
  }

  // Установка времени последней синхронизации
  setLastSyncTimestamp(timestamp) {
    localStorage.setItem('dogymorbis_chat_last_sync', timestamp.toString());
  }

  // Проверка подключения
  isConnected() {
    return this.isConnected;
  }

  // Отключение
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }

  // Очистка данных
  clear() {
    this.messages.clear();
    this.rooms.clear();
    this.messageQueue = [];
    localStorage.removeItem('dogymorbis_chat_messages');
    localStorage.removeItem('dogymorbis_chat_last_sync');
  }
} 