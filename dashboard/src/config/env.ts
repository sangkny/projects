/** Vite env — MEDI API base (empty = same-origin + vite proxy) */

function trimTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export const env = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL ?? ""),
  appEnv: (import.meta.env.VITE_APP_ENV ?? "development") as string,
  isDev: import.meta.env.DEV,
};

export function mediApiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return env.apiUrl ? `${env.apiUrl}${p}` : p;
}
