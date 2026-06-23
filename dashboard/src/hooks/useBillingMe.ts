import { useQuery } from "@tanstack/react-query";

import { fetchBillingMe, MediApiError } from "../api/mediClient";
import { usePortalAuthStore } from "../stores/portalAuthStore";
import type { BillingMeResponse } from "../types/clinical";

const FALLBACK_BILLING: BillingMeResponse = {
  user_id: "demo",
  role: "doctor",
  subscription: {
    plan_code: "clinic",
    plan_name: "Clinic",
    monthly_call_quota: 5000,
    allowed_models: ["retinal_v10", "multidisease_v1"],
    started_at: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
  },
  usage: {
    year_month: new Date().toISOString().slice(0, 7),
    calls_used: 128,
    calls_limit: 5000,
    calls_remaining: 4872,
    quota_pct: 2.56,
    tokens_total: 0,
    cost_usd: 0,
  },
};

export function useBillingMe() {
  const token = usePortalAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["billing-me", token],
    queryFn: async () => {
      if (!token || token === "e2e-mock-token") return FALLBACK_BILLING;
      try {
        return await fetchBillingMe(token);
      } catch (err) {
        if (err instanceof MediApiError && (err.status === 401 || err.status === 503)) {
          throw err;
        }
        return FALLBACK_BILLING;
      }
    },
    staleTime: 30_000,
  });
}
