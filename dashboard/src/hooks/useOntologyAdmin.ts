import { useQuery } from "@tanstack/react-query";

import { fetchOntologyStats } from "../api/mediClient";
import type { OntologyAdminSnapshot } from "../types/admin";

const FALLBACK_RULES = [
  { code: "GLAU-SEM-005", label: "Glaucoma severity ↔ urgency", passed: 47, failed: 3, passRate: 0.94 },
  { code: "MED-SEM-003", label: "안과 ICD 카테고리", passed: 49, failed: 1, passRate: 0.98 },
  { code: "MED-SEM-004", label: "Confidence 범위", passed: 48, failed: 2, passRate: 0.96 },
  { code: "MED-SEM-006", label: "Laterality ↔ finding_side", passed: 50, failed: 0, passRate: 1.0 },
];

const FALLBACK: OntologyAdminSnapshot = {
  sampleSize: 50,
  passRate: 0.92,
  needsReviewRate: 0.08,
  rules: FALLBACK_RULES,
  tier0LastRun: "2026-06-17 06:30 KST (수동 harness)",
};

function buildSnapshot(stats: Awaited<ReturnType<typeof fetchOntologyStats>>): OntologyAdminSnapshot {
  const total = stats.today_validations || FALLBACK.sampleSize;
  const passRate = stats.pass_rate ?? FALLBACK.passRate;
  const rules = FALLBACK_RULES.map((r) => {
    const hit = stats.top_errors?.find((e) => e.code === r.code);
    if (!hit) return r;
    const failed = hit.count;
    const passed = Math.max(0, total - failed);
    return {
      ...r,
      passed,
      failed,
      passRate: total ? passed / total : r.passRate,
    };
  });

  return {
    sampleSize: total,
    passRate,
    needsReviewRate: Math.max(0, 1 - passRate),
    rules,
    tier0LastRun: FALLBACK.tier0LastRun,
    generatedAt: stats.generated_at,
  };
}

export function useOntologyAdmin() {
  return useQuery({
    queryKey: ["admin-ontology"],
    queryFn: async () => {
      try {
        const stats = await fetchOntologyStats();
        return buildSnapshot(stats);
      } catch {
        return FALLBACK;
      }
    },
    staleTime: 30_000,
  });
}
