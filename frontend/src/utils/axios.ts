import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const apiPrefix = import.meta.env.VITE_API_PREFIX || '/api/v1';

console.log('🔍 [FRONTEND DEBUG] API Configuration:', {
  apiUrl,
  apiPrefix,
  baseURL: `${apiUrl}${apiPrefix}`,
});

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: `${apiUrl}${apiPrefix}`,
  timeout: 10000,
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
    console.log('🔍 [FRONTEND DEBUG] Making request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
    });

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor для обработки ответов
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Если получили 401, перенаправляем на страницу логина
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
