import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { TRACCAR_CONFIG } from '../utils/constants';

const GPS_TASK_NAME = 'BACKGROUND_LOCATION_TASK';

class GPSService {
  constructor() {
    this.isTracking = false;
    this.userId = null;
  }

  // Определяем фоновую задачу
  defineBackgroundTask() {
    TaskManager.defineTask(GPS_TASK_NAME, async ({ data, error }) => {
      if (error) {
        console.log('GPS task error:', error);
        return;
      }
      
      if (data) {
        const { locations } = data;
        const location = locations[0];
        
        if (location && this.userId) {
          await this.sendLocationToTraccar(this.userId, location);
        }
      }
    });
  }

  // Запрос разрешений
  async requestPermissions() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus.status !== 'granted') {
        console.log('Background location permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.log('Permission error:', error);
      return false;
    }
  }

  // Запуск отслеживания
  async startTracking(userId) {
    try {
      this.userId = userId;
      
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      // Настройка отслеживания в фоне
      await Location.startLocationUpdatesAsync(GPS_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 50, // Метры
        timeInterval: 30000, // 30 секунд
        deferredUpdatesInterval: 30000,
        deferredUpdatesDistance: 50,
        foregroundService: {
          notificationTitle: 'Отслеживание местоположения',
          notificationBody: 'Активно',
          notificationColor: '#007AFF',
        },
      });

      this.isTracking = true;
      console.log('GPS tracking started for user:', userId);
      
      // Также слушаем обновления в реальном времени
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 50,
          timeInterval: 15000,
        },
        (location) => {
          this.sendLocationToTraccar(userId, location);
        }
      );

    } catch (error) {
      console.log('Start tracking error:', error);
      throw error;
    }
  }

  // Отправка данных в Traccar через Nginx
  async sendLocationToTraccar(userId, location) {
    try {
      const positionData = {
        id: userId, // uniqueId устройства (ИНН)
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        speed: location.coords.speed || 0,
        bearing: location.coords.heading || 0,
        altitude: location.coords.altitude || 0,
        accuracy: location.coords.accuracy || 0,
        batt: 85,
        timestamp: new Date(location.timestamp).getTime(),
        attributes: {
          provider: 'mobile',
          batteryLevel: 85,
          activity: 'moving',
        }
      };

      console.log('Sending location to Traccar via Nginx:', positionData);

      // Отправляем через Nginx на порт 80
      await this.sendToTraccarServer(positionData);
      
    } catch (error) {
      console.log('Send to Traccar error:', error);
    }
  }

  // Отправка на Traccar сервер через Nginx
  async sendToTraccarServer(positionData) {
    try {
      // ВАЖНО: Traccar ожидает данные на корневой путь через порт 5055
      // Но у вас Nginx не проксирует корневой путь в Traccar
      
      // Вариант 1: Отправляем напрямую в Traccar (если доступен)
      const response = await fetch('http://your-traccar-server:5055', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Location sent to Traccar successfully');
    } catch (error) {
      console.log('Traccar direct connection failed, trying via Spring Boot:', error);
      
      // Вариант 2: Отправляем через ваш Spring Boot бэкенд
      await this.sendViaSpringBoot(positionData);
    }
  }

  // Отправка через Spring Boot бэкенд
  async sendViaSpringBoot(positionData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/position`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`,
        },
        body: JSON.stringify(positionData),
      });

      if (!response.ok) {
        throw new Error(`Spring Boot error! status: ${response.status}`);
      }

      console.log('Location sent via Spring Boot successfully');
    } catch (error) {
      console.log('Spring Boot send error:', error);
    }
  }

  async getAuthToken() {
    // Получение токена из AsyncStorage
    const token = await AsyncStorage.getItem('authToken');
    return token;
  }

  // Остановка отслеживания
  async stopTracking() {
    try {
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      await Location.stopLocationUpdatesAsync(GPS_TASK_NAME);
      
      this.isTracking = false;
      this.userId = null;
      
      console.log('GPS tracking stopped');
    } catch (error) {
      console.log('Stop tracking error:', error);
    }
  }
}

// Создаем экземпляр и определяем задачу
const gpsService = new GPSService();
gpsService.defineBackgroundTask();

export default gpsService;