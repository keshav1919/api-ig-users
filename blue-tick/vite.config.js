import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      // Proxy API calls to the shared backend in development
      // (only used when VITE_API_BASE_URL is not set)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/payment.php': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/payment.php': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
