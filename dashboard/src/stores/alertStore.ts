import { create } from "zustand";

export type AlertSeverity = "danger" | "warning";

export interface ImmediateAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  createdAt: number;
}

interface AlertState {
  queue: ImmediateAlert[];
  push: (alert: Omit<ImmediateAlert, "id" | "createdAt">) => void;
  dismiss: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  queue: [],

  push: (alert) => {
    const item: ImmediateAlert = {
      ...alert,
      id: `alert-${crypto.randomUUID()}`,
      createdAt: Date.now(),
    };
    set((s) => ({ queue: [item, ...s.queue].slice(0, 5) }));
  },

  dismiss: (id) => set((s) => ({ queue: s.queue.filter((a) => a.id !== id) })),
}));

export function pushRejectAlert(context: string, detail?: string): void {
  useAlertStore.getState().push({
    title: "즉시 검토 필요 — REJECT",
    message: detail ? `${context}: ${detail}` : context,
    severity: "danger",
  });
}

export function pushUrgentReferralAlert(patientId: string, urgency: string): void {
  useAlertStore.getState().push({
    title: `긴급 추적 — ${urgency}`,
    message: `환자 ${patientId} · referral_urgency=${urgency}`,
    severity: urgency === "immediate" ? "danger" : "warning",
  });
}
