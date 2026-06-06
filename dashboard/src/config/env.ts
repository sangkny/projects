/** Vite env — WSL+Docker 포트 SSOT: projects/PORT-ALLOCATION.md */

import { DEV_URLS, PORTS } from "./ports";

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export const env = {
  /** 비우면 same-origin + vite proxy (로컬 dev 권장) */
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL ?? ""),
  gatewayUrl: trimTrailingSlash(
    import.meta.env.VITE_GATEWAY_URL ?? DEV_URLS.gateway,
  ),
  mediApiUrl: trimTrailingSlash(
    import.meta.env.VITE_MEDI_API_URL ?? DEV_URLS.mediApi,
  ),
  appEnv: (import.meta.env.VITE_APP_ENV ?? "development") as string,
  isDev: import.meta.env.DEV,
  ports: PORTS,
  urls: DEV_URLS,
};

/** MEDI lab/diagnosis 경로 — comprehensive 등 */
export function mediApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return env.apiUrl ? `${env.apiUrl}${p}` : p;
}
