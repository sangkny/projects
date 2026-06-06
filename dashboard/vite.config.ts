import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 포트 SSOT: projects/PORT-ALLOCATION.md · src/config/ports.ts
const MEDI_API = 'http://127.0.0.1:8001'
const API_GATEWAY = 'http://127.0.0.1:8090'

// 게이트웨이 경로(/dashboard/) 기준 에셋 — nginx에서 strip 프록시
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/dashboard/',
  server: {
    // pronunciation-master frontend(5173) 충돌 회피
    port: 5174,
    strictPort: true,
    proxy: {
      // Portal fundus comprehensive — MEDI 직접
      '/api/v1': { target: MEDI_API, changeOrigin: true },
      // Overview legacy — api-gateway (8090)
      '/api': { target: API_GATEWAY, changeOrigin: true },
      '/harness-report': { target: API_GATEWAY, changeOrigin: true },
    },
  },
})
