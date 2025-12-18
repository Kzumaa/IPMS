import { defineConfig } from 'vite' // Trigger restart
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Needed for Docker
    proxy: {
      '/api': {
        target: 'http://laravel-nginx',
        changeOrigin: true,
      },
    },
  },
})
