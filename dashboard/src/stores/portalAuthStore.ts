import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PortalRole, PortalSession } from "../types/clinical";

const STORAGE_KEY = "medi-portal-session";

interface PortalAuthState {
  session: PortalSession | null;
  setSession: (session: PortalSession | null) => void;
  role: PortalRole | null;
  token: string | null;
  clear: () => void;
}

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      session: null,
      role: null,
      token: null,
      setSession: (session) =>
        set({
          session,
          role: session?.role ?? null,
          token: session?.accessToken ?? null,
        }),
      clear: () => set({ session: null, role: null, token: null }),
    }),
    { name: STORAGE_KEY },
  ),
);

export function canAccessReviews(role: PortalRole | null): boolean {
  return role === "doctor" || role === "admin";
}

/** E2E / dev — window hook */
export function seedPortalSession(role: PortalRole, userId = "doctor"): void {
  usePortalAuthStore.getState().setSession({
    accessToken: "e2e-mock-token",
    userId,
    role,
  });
}

if (typeof window !== "undefined") {
  (window as unknown as { __seedPortalSession?: typeof seedPortalSession }).__seedPortalSession =
    seedPortalSession;
}
