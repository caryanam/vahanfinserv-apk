// src/services/dealerService.js
import api from './api';

export const registerDealer = async (dealerData) => {
  console.log('[Dealer] Registering dealer');
  const response = await api.post('/dealer/register', dealerData);
  return response.data.data;
};

export const getAllDealers = async () => {
  // console.log('[Dealer] Fetching all dealers from backend');
  const response = await api.get('/dealer/all');
  return response.data.data;
};

export const updateDealer = async (id, dealerData) => {
  console.log('[Dealer] Updating dealer:', id);
  const response = await api.put(`/dealer/update/${id}`, dealerData);
  return response.data.data;
};

export const dealerSendOtp = async (email) => {
  console.log('[Dealer] Sending OTP to:', email);
  const response = await api.post(`/dealer/send-otp?email=${encodeURIComponent(email)}`, null, {
    skipAuth: true,
  });
  return response.data;
};

export const dealerVerifyOtp = async (dto) => {
  console.log('[Dealer] Verifying OTP');
  const response = await api.post('/dealer/verify-otp', dto, { skipAuth: true });
  return response.data;
};

export const dealerResetPassword = async (dto) => {
  console.log('[Dealer] Resetting password');
  const response = await api.post('/dealer/reset-password', dto, { skipAuth: true });
  return response.data;
};
