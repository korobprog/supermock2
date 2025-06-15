import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Конфигурация Vite для Docker режима
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    hmr: {
      port: 5174,
      host: 'localhost',
    },
    watch: {
      usePolling: true,
    },
  },
});
