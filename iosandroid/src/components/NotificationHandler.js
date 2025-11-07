import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { faceCheckAPI } from '../services/api';
import { useAuth } from '../store/authContext';

const NotificationHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    requestUserPermission();
    setupNotificationListeners();
  }, []);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      getFCMToken();
    }
  };

  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      
      // Регистрируем токен на бэкенде
      if (user) {
        await faceCheckAPI.registerFCMToken(user.name, token);
      }
    } catch (error) {
      console.log('FCM token error:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Уведомление при открытом приложении
    messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'Уведомление',
        remoteMessage.notification?.body,
        [
          {
            text: 'Пройти проверку',
            onPress: () => {
              // Навигация к экрану FaceCheck
            },
          },
          { text: 'Позже', style: 'cancel' },
        ]
      );
    });

    // Уведомление при закрытом приложении
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background notification:', remoteMessage);
    });
  };

  return null;
};

export default NotificationHandler;