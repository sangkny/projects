import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 게이트웨이 경로(/dashboard/) 기준 에셋 — nginx에서 strip 프록시
export default defineConfig({
  plugins: [react()],
  base: '/dashboard/',
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://127.0.0.1:80', changeOrigin: true },
      '/harness-report': { target: 'http://127.0.0.1:80', changeOrigin: true },
    },
  },
})
