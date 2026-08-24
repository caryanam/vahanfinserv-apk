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

export const dealerSendRegisterOtp = async (email) => {
  console.log('[Dealer] Sending registration OTP to:', email);
  const response = await api.post(`/dealer/register/send-otp?email=${encodeURIComponent(email)}`, null, {
    skipAuth: true,
  });
  return response.data;
};

export const dealerRegisterVerifyOtp = async (dto) => {
  console.log('[Dealer] Verifying registration OTP');
  const email = dto?.email || '';
  const otp = dto?.otp || '';
  const url = `/dealer/register/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
  const response = await api.post(url, dto, { skipAuth: true });
  return response.data;
};

export const dealerResetPassword = async (dto) => {
  console.log('[Dealer] Resetting password');
  const response = await api.post('/dealer/reset-password', dto, { skipAuth: true });
  return response.data;
};

export const dealerSendMobileOtp = async (mobile) => {
  console.log('[Dealer] Sending mobile registration OTP to:', mobile);
  const response = await api.post(
    `/dealer/register/send-mobile-otp?mobileNumber=${encodeURIComponent(mobile)}`,
    null,
    { skipAuth: true },
  );
  return response.data;
};

export const dealerRegisterVerifyMobileOtp = async (dto) => {
  console.log('[Dealer] Verifying mobile registration OTP');
  const mobile = dto?.mobileNumber || dto?.mobile || '';
  const otp = dto?.otp || '';
  const url = `/dealer/register/verify-mobile-otp?mobileNumber=${encodeURIComponent(mobile)}&mobile=${encodeURIComponent(mobile)}&otp=${encodeURIComponent(otp)}`;
  const response = await api.post(url, dto, { skipAuth: true });
  return response.data;
};
