// src/services/documentService.js
import api from './api';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const uploadDocument = (formData) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getUserDocuments = (userId) =>
  api.get(`/documents/user/${userId}`);

export const getDocumentById = (documentId) =>
  api.get(`/documents/${documentId}`);

export const deleteDocument = (documentId) =>
  api.delete(`/documents/${documentId}`);

export const updateDocumentStatus = (documentId, status) =>
  api.put(`/documents/status/${documentId}?status=${status}`);

export const addRemarks = (documentId, remarks) =>
  api.put(`/documents/${documentId}/remarks`, { remarks });

export const getPendingDocuments = () =>
  api.get('/documents/pending');

export const getVerifiedDocuments = () =>
  api.get('/documents/verified');

export const getDocumentCounts = (userId) =>
  api.get(`/documents/count/${userId}`);

export const getDocumentPreviewUrl = (documentId) =>
  `${api.defaults.baseURL}/documents/preview/${documentId}`;

export const getDocumentDownloadUrl = (documentId) =>
  `${api.defaults.baseURL}/documents/download/${documentId}`;

/**
 * Download a document to the device cache directory (for preview).
 * Uses JWT auth header — solves the auth issue with Image/Linking.
 * Returns the local file:// path on success.
 */
export const downloadDocumentToCache = async (documentId, fileName) => {
  const token = await AsyncStorage.getItem('token');
  const url = `${api.defaults.baseURL}/documents/preview/${documentId}`;
  const safeName = (fileName || `doc_${documentId}`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const destPath = `${RNFS.CachesDirectoryPath}/${documentId}_${safeName}`;

  // If already cached, return immediately
  const exists = await RNFS.exists(destPath);
  if (exists) {
    return destPath;
  }

  const result = await RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).promise;

  if (result.statusCode === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (result.statusCode === 404) {
    throw new Error('NOT_FOUND');
  }
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`DOWNLOAD_FAILED_${result.statusCode}`);
  }

  return destPath;
};

/**
 * Download a document to the device Downloads folder (permanent save).
 * Uses JWT auth header.
 * Returns the local file path on success.
 */
export const downloadDocumentToStorage = async (documentId, fileName) => {
  const token = await AsyncStorage.getItem('token');
  const url = `${api.defaults.baseURL}/documents/download/${documentId}`;
  const safeName = (fileName || `doc_${documentId}`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const destPath = `${RNFS.DownloadDirectoryPath}/${safeName}`;

  const result = await RNFS.downloadFile({
    fromUrl: url,
    toFile: destPath,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).promise;

  if (result.statusCode === 403) {
    throw new Error('UNAUTHORIZED');
  }
  if (result.statusCode === 404) {
    throw new Error('NOT_FOUND');
  }
  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`DOWNLOAD_FAILED_${result.statusCode}`);
  }

  // Make file visible to Android media scanner
  try {
    await RNFS.scanFile(destPath);
  } catch (_) {
    // scanFile may not be available on all platforms
  }

  return destPath;
};
