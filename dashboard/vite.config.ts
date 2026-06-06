import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 게이트웨이 경로(/dashboard/) 기준 에셋 — nginx에서 strip 프록시
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/dashboard/',
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8001', changeOrigin: true },
      '/harness-report': { target: 'http://127.0.0.1:80', changeOrigin: true },
    },
  },
})
