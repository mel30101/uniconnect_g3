import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  async (config: any) => {
    try {
      let storageStr = null;
      if (Platform.OS === 'web') {
        storageStr = localStorage.getItem('auth-storage');
      } else {
        storageStr = await SecureStore.getItemAsync('auth-storage');
      }

      if (storageStr) {
        const parsed = JSON.parse(storageStr);
        const token = parsed?.state?.token;
        if (token) {
          if (!config.headers) {
            config.headers = {};
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('[ApiClient] Error recuperando token de SecureStore:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.warn(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.warn('API Error: No response received', error.request);
    } else {
      console.warn('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
