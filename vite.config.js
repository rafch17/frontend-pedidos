import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'https://apiproyectokruger.onrender.com',
        changeOrigin: true,
      },
    },
  },
});

