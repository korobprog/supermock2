import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    hmr: {
      port: 5174,
      host: 'localhost',
    },
    // Убираем host: '0.0.0.0' и usePolling для локальной разработки
    // Эти настройки нужны только для Docker
  },
});
