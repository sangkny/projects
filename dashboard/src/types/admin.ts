/** Admin console types — performance, audit, ontology */

export type AuditDecision = "APPROVE" | "REVISE" | "REJECT";

export type AuditEventKind = "pipeline" | "partner_register" | "partner_analyze" | "review";

export interface AuditLogEntry {
  id: string;
  kind: AuditEventKind;
  occurredAt: string;
  patientId?: string;
  partnerId?: string;
  decision?: AuditDecision;
  reason?: string;
  threshold?: number;
  confidence?: number;
  source: string;
  detail?: string;
}

export interface AuditLogResponse {
  items: AuditLogEntry[];
  total: number;
}

export interface PerformanceMetric {
  id: string;
  label: string;
  disease: string;
  model: string;
  metric: "QWK" | "AUC" | "mAUC" | "composite";
  value: number;
  status: "production";
  notes?: string;
}

export interface OntologyRuleStatus {
  code: string;
  label: string;
  passed: number;
  failed: number;
  passRate: number;
}

export interface OntologyAdminSnapshot {
  sampleSize: number;
  passRate: number;
  needsReviewRate: number;
  rules: OntologyRuleStatus[];
  tier0LastRun: string;
  generatedAt?: string;
}
