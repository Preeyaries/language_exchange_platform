import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    // In development, forward /api to the backend so the browser sees one origin.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
