import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
});

// Interceptor de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Use console.warn instead of console.error to avoid React Native red screen
      // for expected API validation errors (4xx)
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
