import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeUserData } from '../utils/helpers';
import { API_CONFIG } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Проверяем валидность токена
        const response = await authAPI.getMe();

        // 🔍 ДИАГНОСТИКА: Проверяем что возвращает Backend
        console.log('═══════════════════════════════════════════');
        console.log('🔍 BACKEND RESPONSE (checkAuthState):');
        console.log('Full response.data:', JSON.stringify(response.data, null, 2));
        console.log('─────────────────────────────────────────');
        if (response.data.user) {
          console.log('📊 TYPE CHECKS:');
          console.log('user.administrator type:', typeof response.data.user.administrator);
          console.log('user.administrator value:', response.data.user.administrator);
          console.log('user.administrator === true:', response.data.user.administrator === true);
          console.log('user.administrator === "true":', response.data.user.administrator === "true");
        }
        console.log('═══════════════════════════════════════════');

        // ✅ ИСПРАВЛЕНИЕ: Нормализуем данные перед setUser (строки → boolean)
        const normalizedUser = normalizeUserData(response.data.user);
        console.log('🔧 NORMALIZED USER:', JSON.stringify(normalizedUser, null, 2));
        setUser(normalizedUser);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 LOGIN ATTEMPT:', { email, password: '***' });
      console.log('📡 API BASE_URL:', API_CONFIG.BASE_URL);

      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;

      // 🔍 ДИАГНОСТИКА: Проверяем что возвращает Backend при логине
      console.log('═══════════════════════════════════════════');
      console.log('🔍 BACKEND RESPONSE (login):');
      console.log('Full response.data:', JSON.stringify(response.data, null, 2));
      console.log('─────────────────────────────────────────');
      if (userData) {
        console.log('📊 TYPE CHECKS (Login):');
        console.log('user.administrator type:', typeof userData.administrator);
        console.log('user.administrator value:', userData.administrator);
        console.log('user.administrator === true:', userData.administrator === true);
        console.log('user.administrator === "true":', userData.administrator === "true");
      }
      console.log('═══════════════════════════════════════════');

      // ✅ ИСПРАВЛЕНИЕ: Нормализуем данные перед setUser (строки → boolean)
      const normalizedUser = normalizeUserData(userData);
      console.log('🔧 NORMALIZED USER (login):', JSON.stringify(normalizedUser, null, 2));

      await AsyncStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(normalizedUser);

      return { success: true };
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);

      let errorMessage = 'Ошибка входа';

      if (error.response) {
        // Ошибка от сервера
        errorMessage = error.response.data?.message || `Ошибка ${error.response.status}`;
      } else if (error.request) {
        // Запрос был отправлен, но ответа нет
        errorMessage = 'Сервер недоступен. Проверьте подключение к интернету';
      } else {
        // Ошибка при настройке запроса
        errorMessage = error.message || 'Неизвестная ошибка';
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};