// Сервис аутентификации и управления пользователями
export class AuthService {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.user = null;
  }

  async init() {
    // Проверка существующего токена
    if (this.token) {
      try {
        await this.validateToken();
      } catch (error) {
        console.warn('Токен недействителен:', error);
        this.logout();
      }
    }
  }

  // Регистрация пользователя
  async register(userData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка регистрации: ${response.status}`);
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      this.user = data.user;

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Вход в систему
  async login(credentials) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error(`Ошибка входа: ${response.status}`);
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      this.user = data.user;

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Выход из системы
  logout() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    
    // Перенаправление на страницу входа
    window.location.href = '/login';
  }

  // Проверка токена
  async validateToken() {
    if (!this.token) {
      throw new Error('Токен отсутствует');
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Токен недействителен');
      }

      const data = await response.json();
      this.user = data.user;
      return true;
    } catch (error) {
      // Попытка обновить токен
      if (this.refreshToken) {
        try {
          await this.refreshAccessToken();
          return true;
        } catch (refreshError) {
          throw new Error('Не удалось обновить токен');
        }
      } else {
        throw error;
      }
    }
  }

  // Обновление токена доступа
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить токен');
      }

      const data = await response.json();
      this.setTokens(data.token, data.refreshToken);
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      throw error;
    }
  }

  // Установка токенов
  setTokens(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;
    
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Получение текущего пользователя
  async getCurrentUser() {
    if (this.user) {
      return this.user;
    }

    if (this.token) {
      try {
        await this.validateToken();
        return this.user;
      } catch (error) {
        console.warn('Не удалось получить пользователя:', error);
        return null;
      }
    }

    return null;
  }

  // Обновление профиля пользователя
  async updateProfile(profileData) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления профиля: ${response.status}`);
      }

      const data = await response.json();
      this.user = data.user;

      return {
        success: true,
        user: data.user
      };
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Получение баланса косточек
  async getBoneBalance() {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/bone-balance`);
      
      if (!response.ok) {
        throw new Error(`Ошибка получения баланса: ${response.status}`);
      }

      const data = await response.json();
      return data.balance;
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      return 0;
    }
  }

  // Получение активных миссий
  async getActiveMissions() {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/missions`);
      
      if (!response.ok) {
        throw new Error(`Ошибка получения миссий: ${response.status}`);
      }

      const data = await response.json();
      return data.missions;
    } catch (error) {
      console.error('Ошибка получения миссий:', error);
      return [];
    }
  }

  // Создание новой миссии
  async createMission(missionData) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/missions`, {
        method: 'POST',
        body: JSON.stringify(missionData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка создания миссии: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        mission: data.mission
      };
    } catch (error) {
      console.error('Ошибка создания миссии:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Завершение миссии
  async completeMission(missionId) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/missions/${missionId}/complete`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Ошибка завершения миссии: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        reward: data.reward,
        newBalance: data.newBalance
      };
    } catch (error) {
      console.error('Ошибка завершения миссии:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Получение друзей пользователя
  async getFriends() {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/friends`);
      
      if (!response.ok) {
        throw new Error(`Ошибка получения друзей: ${response.status}`);
      }

      const data = await response.json();
      return data.friends;
    } catch (error) {
      console.error('Ошибка получения друзей:', error);
      return [];
    }
  }

  // Добавление друга
  async addFriend(friendId) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/friends`, {
        method: 'POST',
        body: JSON.stringify({ friendId })
      });

      if (!response.ok) {
        throw new Error(`Ошибка добавления друга: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        friend: data.friend
      };
    } catch (error) {
      console.error('Ошибка добавления друга:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Поиск пользователей
  async searchUsers(query) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/users/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка поиска пользователей: ${response.status}`);
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Ошибка поиска пользователей:', error);
      return [];
    }
  }

  // Получение статистики пользователя
  async getUserStats() {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/stats`);
      
      if (!response.ok) {
        throw new Error(`Ошибка получения статистики: ${response.status}`);
      }

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      return {
        totalDistance: 0,
        totalWalks: 0,
        totalBones: 0,
        achievements: []
      };
    }
  }

  // Синхронизация данных пользователя
  async syncUserData() {
    try {
      const [user, balance, missions, friends] = await Promise.all([
        this.getCurrentUser(),
        this.getBoneBalance(),
        this.getActiveMissions(),
        this.getFriends()
      ]);

      return {
        user,
        balance,
        missions,
        friends
      };
    } catch (error) {
      console.error('Ошибка синхронизации данных пользователя:', error);
      throw error;
    }
  }

  // Синхронизация офлайн данных
  async syncOfflineData() {
    // Здесь будет логика отправки офлайн данных на сервер
    console.log('Синхронизация офлайн данных пользователя');
  }

  // Аутентифицированный запрос
  async authenticatedRequest(url, options = {}) {
    if (!this.token) {
      throw new Error('Токен отсутствует');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Если токен истёк, пытаемся обновить
      if (response.status === 401 && this.refreshToken) {
        try {
          await this.refreshAccessToken();
          
          // Повторяем запрос с новым токеном
          headers.Authorization = `Bearer ${this.token}`;
          return await fetch(url, {
            ...options,
            headers
          });
        } catch (refreshError) {
          this.logout();
          throw new Error('Сессия истекла');
        }
      }

      return response;
    } catch (error) {
      console.error('Ошибка аутентифицированного запроса:', error);
      throw error;
    }
  }

  // Проверка авторизации
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Получение токена
  getToken() {
    return this.token;
  }

  // Получение пользователя
  getUser() {
    return this.user;
  }

  // Изменение пароля
  async changePassword(passwordData) {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/change-password`, {
        method: 'POST',
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка изменения пароля: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Ошибка изменения пароля:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Удаление аккаунта
  async deleteAccount() {
    try {
      const response = await this.authenticatedRequest(`${this.apiBaseUrl}/user/delete`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Ошибка удаления аккаунта: ${response.status}`);
      }

      this.logout();
      return { success: true };
    } catch (error) {
      console.error('Ошибка удаления аккаунта:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
} 