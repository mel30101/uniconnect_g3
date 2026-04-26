import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 600000,
  withCredentials: true,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
  },
});

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
