import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('Request timeout:', error);
      error.response = {
        data: { message: 'Request timeout. Please check if the backend server is running at ' + API_BASE_URL }
      };
    } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
      console.error('Network error:', error);
      error.response = {
        data: { message: `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running.` }
      };
    }
    
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    return Promise.reject(error);
  }
);

export default api;

