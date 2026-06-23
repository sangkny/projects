import { useMutation } from "@tanstack/react-query";

import { createStripePortalSession, MediApiError } from "../api/mediClient";
import { usePortalAuthStore } from "../stores/portalAuthStore";

export function useStripePortal() {
  const token = usePortalAuthStore((s) => s.token);

  return useMutation({
    mutationFn: async () => {
      if (!token || token === "e2e-mock-token" || token === "dev-offline") {
        throw new MediApiError("Stripe Portal 미연동 (dev)", 503);
      }
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      return createStripePortalSession(token, returnUrl);
    },
  });
}
