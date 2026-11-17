import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // Khi chạy `npm run dev`: chuyển /api sang Portal chạy ở máy (docker compose hoặc npm run start:dev).
    // Trên server thật, Ingress/Nginx làm việc này.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
