import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import VueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
    plugins: [
      VueDevTools(),
      vue(),
    ],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
    },
  });
  