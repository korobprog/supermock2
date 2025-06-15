import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: `${apiUrl}/api/v1`,
  timeout: 10000,
});

// Interceptor для добавления токена к каждому запросу
api.interceptors.request.use(
  (config) => {
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
