/**
 * MEDI-IOT dev ports — mirror of projects/PORT-ALLOCATION.md (SSOT).
 * docker-compose / vite 포트 변경 시 PORT-ALLOCATION.md 와 함께 갱신.
 */
export const PORTS = {
  MEDI_API: 8001,
  AUTONOGADA_API: 8002,
  COOPS_API: 8003,
  SHARED_LIBS: 8004,
  API_GATEWAY: 8090,
  DASHBOARD_DOCKER: 3000,
  /** Vite `npm run dev` — pronunciation-master(5173) 충돌 회피 */
  DASHBOARD_VITE: 5174,
  GRAFANA: 3001,
  OPENCLAW: 3010,
} as const;

export const DEV_URLS = {
  mediApi: `http://localhost:${PORTS.MEDI_API}`,
  gateway: `http://localhost:${PORTS.API_GATEWAY}`,
  dashboardDocker: `http://localhost:${PORTS.DASHBOARD_DOCKER}`,
  dashboardViaGateway: `http://localhost:${PORTS.API_GATEWAY}/dashboard/`,
  dashboardVite: `http://localhost:${PORTS.DASHBOARD_VITE}/dashboard/`,
  fundusLab: `http://localhost:${PORTS.MEDI_API}/api/v1/lab/fundus`,
} as const;
