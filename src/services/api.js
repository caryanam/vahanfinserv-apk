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

// Handle 401 Unauthorized / Token Expired - Session Expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const msg = (error?.response?.data?.message || error?.response?.data?.error || '').toLowerCase();

    // Auto-logout ONLY on 401 Unauthorized or explicit token expiration messages
    if (
      status === 401 ||
      (status === 403 &&
        (msg.includes('jwt') || msg.includes('token expired') || msg.includes('session expired')))
    ) {
      await AsyncStorage.multiRemove(['token', 'role', 'user', 'userData', 'dealerData', 'adminData']);
      console.log('[API] Session expired - Logging out');
      if (navigationCallback) {
        navigationCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
