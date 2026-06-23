import type { AuditLogEntry } from "../types/admin";

/** API 미연동·오프라인 시 파트너 이력 시드 (Partner E2E 참고) */
export const DEMO_PARTNER_AUDIT: AuditLogEntry[] = [
  {
    id: "partner-reg-acme",
    kind: "partner_register",
    occurredAt: "2026-06-11T09:12:00.000Z",
    partnerId: "acme-clinic",
    source: "POST /api/v1/partner/register",
    detail: "plan=trial · API key 발급",
  },
  {
    id: "partner-analyze-001",
    kind: "partner_analyze",
    occurredAt: "2026-06-11T10:45:22.000Z",
    partnerId: "acme-clinic",
    patientId: "P-8821",
    decision: "REVISE",
    reason: "below_gate_min",
    threshold: 0.8,
    confidence: 0.394,
    source: "POST /api/v1/partner/analyze",
    detail: "DR grade=1 · icd10=H35.0 · ontology_passed=true",
  },
  {
    id: "pipeline-reject-demo",
    kind: "pipeline",
    occurredAt: "2026-06-10T14:20:00.000Z",
    patientId: "DEMO-REJECT",
    decision: "REJECT",
    reason: "below_reject_max",
    threshold: 0.8,
    confidence: 0.42,
    source: "diagnosis_pipeline",
    detail: "gate mode · dr_grade=0",
  },
];
