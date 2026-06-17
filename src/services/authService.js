// src/services/authService.js
import api from './api';

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data, { skipAuth: true });
  return response.data;
};

export const loginDealer = async (data) => {
  const response = await api.post('/dealer/login', data, { skipAuth: true });
  return response.data;
};
