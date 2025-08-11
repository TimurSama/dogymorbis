// Сервис для работы с картами и геолокацией
export class MapService {
  constructor() {
    this.map = null;
    this.currentLocation = null;
    this.markers = [];
    this.watchId = null;
    this.isTracking = false;
  }

  async init() {
    console.log('Инициализация MapService...');
    
    // Проверка поддержки геолокации
    if (!navigator.geolocation) {
      console.warn('Геолокация не поддерживается браузером');
      return false;
    }

    // Получение текущего местоположения
    try {
      await this.getCurrentLocation();
      return true;
    } catch (error) {
      console.warn('Не удалось получить местоположение:', error);
      return false;
    }
  }

  // Получение текущего местоположения
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Ошибка получения местоположения:', error);
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

  // Начало отслеживания местоположения
  startLocationTracking(callback) {
    if (this.watchId) {
      this.stopLocationTracking();
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        
        if (callback) {
          callback(this.currentLocation);
        }
      },
      (error) => {
        console.error('Ошибка отслеживания местоположения:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    this.isTracking = true;
    console.log('Отслеживание местоположения запущено');
  }

  // Остановка отслеживания местоположения
  stopLocationTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('Отслеживание местоположения остановлено');
    }
  }

  // Обновление местоположения
  async updateLocation(location) {
    this.currentLocation = location;
    
    // Здесь будет логика обновления карты
    if (this.map) {
      this.updateMapCenter(location);
    }
    
    return location;
  }

  // Инициализация карты
  async initMap(containerId, options = {}) {
    const defaultOptions = {
      center: this.currentLocation || { lat: 55.7558, lng: 37.6176 }, // Москва по умолчанию
      zoom: 15,
      mapTypeId: 'roadmap'
    };

    const mapOptions = { ...defaultOptions, ...options };

    try {
      // Здесь будет инициализация Google Maps или другой карты
      console.log('Инициализация карты с опциями:', mapOptions);
      
      // Заглушка для демонстрации
      this.map = {
        container: document.getElementById(containerId),
        options: mapOptions,
        center: mapOptions.center,
        zoom: mapOptions.zoom
      };

      return this.map;
    } catch (error) {
      console.error('Ошибка инициализации карты:', error);
      throw error;
    }
  }

  // Обновление центра карты
  updateMapCenter(location) {
    if (this.map && location) {
      this.map.center = location;
      console.log('Центр карты обновлен:', location);
    }
  }

  // Добавление маркера на карту
  addMarker(position, options = {}) {
    const marker = {
      id: Date.now(),
      position: position,
      options: options,
      visible: true
    };

    this.markers.push(marker);
    console.log('Маркер добавлен:', marker);

    return marker.id;
  }

  // Удаление маркера
  removeMarker(markerId) {
    const index = this.markers.findIndex(m => m.id === markerId);
    if (index !== -1) {
      this.markers.splice(index, 1);
      console.log('Маркер удален:', markerId);
      return true;
    }
    return false;
  }

  // Обновление маркера
  updateMarker(markerId, updates) {
    const marker = this.markers.find(m => m.id === markerId);
    if (marker) {
      Object.assign(marker, updates);
      console.log('Маркер обновлен:', markerId, updates);
      return true;
    }
    return false;
  }

  // Очистка всех маркеров
  clearMarkers() {
    this.markers = [];
    console.log('Все маркеры очищены');
  }

  // Поиск ближайших пользователей
  async findNearbyUsers(radius = 5000) {
    if (!this.currentLocation) {
      throw new Error('Местоположение не определено');
    }

    try {
      // Здесь будет API запрос для поиска пользователей
      const response = await fetch(`/api/map/nearby-users?lat=${this.currentLocation.lat}&lng=${this.currentLocation.lng}&radius=${radius}`);
      
      if (!response.ok) {
        throw new Error('Ошибка поиска пользователей');
      }

      const data = await response.json();
      return data.users;
    } catch (error) {
      console.error('Ошибка поиска пользователей:', error);
      return [];
    }
  }

  // Поиск точек интереса
  async findPointsOfInterest(category = null) {
    if (!this.currentLocation) {
      throw new Error('Местоположение не определено');
    }

    try {
      let url = `/api/map/poi?lat=${this.currentLocation.lat}&lng=${this.currentLocation.lng}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Ошибка поиска точек интереса');
      }

      const data = await response.json();
      return data.points;
    } catch (error) {
      console.error('Ошибка поиска точек интереса:', error);
      return [];
    }
  }

  // Построение маршрута
  async buildRoute(origin, destination, mode = 'walking') {
    try {
      const response = await fetch('/api/map/route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: origin,
          destination: destination,
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка построения маршрута');
      }

      const data = await response.json();
      return data.route;
    } catch (error) {
      console.error('Ошибка построения маршрута:', error);
      throw error;
    }
  }

  // Расчет расстояния между точками
  calculateDistance(point1, point2) {
    const R = 6371; // Радиус Земли в километрах
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Расстояние в километрах
    
    return distance;
  }

  // Конвертация градусов в радианы
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Получение адреса по координатам
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`/api/map/reverse-geocode?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения адреса');
      }

      const data = await response.json();
      return data.address;
    } catch (error) {
      console.error('Ошибка получения адреса:', error);
      return null;
    }
  }

  // Поиск адреса
  async geocode(address) {
    try {
      const response = await fetch(`/api/map/geocode?address=${encodeURIComponent(address)}`);
      
      if (!response.ok) {
        throw new Error('Ошибка поиска адреса');
      }

      const data = await response.json();
      return data.location;
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      return null;
    }
  }

  // Получение текущего местоположения
  getCurrentLocation() {
    return this.currentLocation;
  }

  // Проверка, отслеживается ли местоположение
  isLocationTracking() {
    return this.isTracking;
  }

  // Получение всех маркеров
  getMarkers() {
    return [...this.markers];
  }

  // Получение карты
  getMap() {
    return this.map;
  }

  // Уничтожение карты
  destroyMap() {
    if (this.map) {
      this.map = null;
      this.clearMarkers();
      console.log('Карта уничтожена');
    }
  }

  // Обработка ошибок геолокации
  handleGeolocationError(error) {
    let message = 'Неизвестная ошибка геолокации';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Доступ к геолокации запрещен';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Информация о местоположении недоступна';
        break;
      case error.TIMEOUT:
        message = 'Превышено время ожидания получения местоположения';
        break;
    }
    
    console.error('Ошибка геолокации:', message);
    return message;
  }
} 