// src/services/apiClient.ts
import axios from 'axios';
import { useAppStore } from '@/stores/app-store';

const store = useAppStore();
const apiClient = axios.create({
  baseURL: store.apiUrl, 
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  },
});

apiClient.interceptors.request.use((config) => {
  const store = useAppStore();
  const token = store.token;
  const centro = store.centro;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (centro) {
    const url = config.url || '';
    const separator = url.includes('?') ? '&' : '?';
    config.url = `${url}${separator}source=${centro}`;
  }

  return config;
});

export default apiClient;
