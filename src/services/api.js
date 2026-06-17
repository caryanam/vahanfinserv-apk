// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
baseURL: 'https://v1.vahanfinserv.com/api', // Android emulator → localhost
 // baseURL: 'http://10.10.1.205:8082/api',
  timeout: 15000,
});

// Global navigation callback for 403 errors
let navigationCallback = null;
export const setNavigationCallback = (callback) => {
  navigationCallback = callback;
};

// Attach JWT token automatically
api.interceptors.request.use(async (config) => {
  if (config.skipAuth) {
    delete config.skipAuth;
    if (config.headers) delete config.headers.Authorization;
    return config;
  }

  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Handle 403 Forbidden - Session Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 403) {
      await AsyncStorage.multiRemove(['token', 'role', 'user', 'userData', 'dealerData', 'adminData']);
      console.log('[API] Session expired - 403 Forbidden');
      if (navigationCallback) {
        navigationCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
