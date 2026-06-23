import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEMO_PARTNER_AUDIT } from "../data/demoAuditLogs";
import type { AuditDecision, AuditLogEntry, AuditLogResponse } from "../types/admin";
import type { BilateralComprehensiveResult } from "../types/fundus";

const STORAGE_KEY = "medi-admin-audit";

interface AuditState {
  entries: AuditLogEntry[];
  append: (entry: Omit<AuditLogEntry, "id">) => void;
  list: (filters?: {
    from?: string;
    to?: string;
    decision?: AuditDecision | "";
  }) => AuditLogResponse;
}

function newId(): string {
  return `audit-${crypto.randomUUID()}`;
}

function scanEyePipeline(
  eye: "OS" | "OD",
  result: NonNullable<BilateralComprehensiveResult["os"]>,
  patientId: string,
): Omit<AuditLogEntry, "id">[] {
  const out: Omit<AuditLogEntry, "id">[] = [];
  const modules = [
    { key: "dr" as const, label: "DR" },
    { key: "glaucoma" as const, label: "GL" },
    { key: "amd" as const, label: "AMD" },
    { key: "myopia" as const, label: "MYO" },
  ];
  for (const { key, label } of modules) {
    const mod = result[key];
    if (!mod?.decision) continue;
    const audit = mod.audit_trail ?? {};
    out.push({
      kind: "pipeline",
      occurredAt: new Date().toISOString(),
      patientId,
      decision: mod.decision,
      reason: String(audit.reason ?? audit.mode ?? "—"),
      threshold: typeof audit.threshold === "number" ? audit.threshold : undefined,
      confidence: mod.confidence,
      source: `comprehensive/${label}/${eye}`,
      detail: `decision=${mod.decision}`,
    });
  }
  return out;
}

export const useAuditLogStore = create<AuditState>()(
  persist(
    (set, get) => ({
      entries: [],

      append: (entry) => {
        set((s) => ({
          entries: [{ ...entry, id: newId() }, ...s.entries].slice(0, 200),
        }));
      },

      list: (filters) => {
        const merged = [...get().entries, ...DEMO_PARTNER_AUDIT];
        let items = merged.sort(
          (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        );
        if (filters?.decision) {
          items = items.filter((i) => i.decision === filters.decision);
        }
        if (filters?.from) {
          const fromMs = new Date(filters.from).getTime();
          items = items.filter((i) => new Date(i.occurredAt).getTime() >= fromMs);
        }
        if (filters?.to) {
          const toMs = new Date(filters.to).getTime() + 86400000;
          items = items.filter((i) => new Date(i.occurredAt).getTime() < toMs);
        }
        return { items, total: items.length };
      },
    }),
    { name: STORAGE_KEY },
  ),
);

export function recordPipelineFromResults(data: BilateralComprehensiveResult): void {
  const patientId = data.patient_id ?? "—";
  const store = useAuditLogStore.getState();
  for (const [eye, result] of [
    ["OS", data.os],
    ["OD", data.od],
  ] as const) {
    if (!result) continue;
    for (const entry of scanEyePipeline(eye, result, patientId)) {
      if (entry.decision === "REJECT" || entry.decision === "REVISE") {
        store.append(entry);
      }
    }
  }
}

export function recordReviewDecision(
  patientId: string,
  decision: AuditDecision,
  notes: string,
): void {
  useAuditLogStore.getState().append({
    kind: "review",
    occurredAt: new Date().toISOString(),
    patientId,
    decision,
    source: "portal/reviews",
    detail: notes || undefined,
  });
}
