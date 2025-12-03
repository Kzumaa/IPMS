import { defineConfig } from 'vite' // Trigger restart
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
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
