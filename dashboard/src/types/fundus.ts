/** MEDI comprehensive fundus types — mirrors integrated_diagnosis.py */

export type ReferralUrgency = "none" | "routine" | "urgent" | "immediate";
export type Decision = "APPROVE" | "REVISE" | "REJECT" | null;
export type RiskLevel = "LOW" | "MODERATE" | "HIGH";
export type EyeSide = "OS" | "OD" | "unknown";

export interface CupDiscRatioDetail {
  value: number;
  category: "normal" | "suspect" | "glaucoma";
  method: string;
  confidence_interval?: number[];
  clinical_note?: string;
}

export interface LesionAnnotation {
  type: string;
  confidence: number;
  region?: string;
}

export interface HeatmapPayload {
  image_base64?: string;
  resolution?: string;
  lesion_annotations?: LesionAnnotation[];
  hotspot_regions?: string[];
  gradcam_version?: string | null;
  heatmap_error?: string | null;
}

export interface DRComprehensiveSummary {
  dr_grade: number;
  grade?: number;
  confidence: number;
  icd10_code?: string;
  severity?: string;
  decision?: Decision;
  ontology_passed?: boolean;
  decision_mode?: string;
  model_used?: string;
  audit_trail?: Record<string, unknown>;
}

export interface GlaucomaResult {
  glaucoma_grade: number;
  grade_label: string;
  label: string;
  probability: number;
  risk_level: RiskLevel;
  cup_disc_ratio?: CupDiscRatioDetail | null;
  heatmap?: HeatmapPayload | null;
  confidence: number;
  icd10_code?: string;
  severity?: string;
  referral_urgency?: ReferralUrgency;
  model_used?: string;
  decision_mode?: string;
  ontology_passed?: boolean;
  decision?: Decision;
  audit_trail?: Record<string, unknown>;
}

export interface AMDResult {
  amd_grade: number;
  grade_label: string;
  label?: string;
  probability?: number;
  risk_level?: RiskLevel;
  drusen_detected?: boolean;
  drusen_type?: "soft" | "hard" | "none" | string | null;
  confidence: number;
  icd10_code?: string;
  severity?: string;
  referral_urgency?: ReferralUrgency;
  heatmap?: HeatmapPayload | null;
  model_used?: string;
  decision?: Decision;
  ontology_passed?: boolean;
  audit_trail?: Record<string, unknown>;
}

export interface MyopiaResult {
  myopia_grade: number;
  grade_label: string;
  label?: string;
  probability?: number;
  risk_level?: RiskLevel;
  pathological?: boolean;
  confidence: number;
  icd10_code?: string;
  severity?: string;
  referral_urgency?: ReferralUrgency;
  heatmap?: HeatmapPayload | null;
  model_used?: string;
  decision?: Decision;
  ontology_passed?: boolean;
  audit_trail?: Record<string, unknown>;
}

export interface ScreeningFinding {
  disease: string;
  korean_name?: string;
  probability: number;
  risk_level: "low" | "moderate" | "high" | "urgent" | string;
  icd10?: string;
}

export interface ScreeningResult {
  findings: ScreeningFinding[];
  urgent_diseases: string[];
  total_diseases_detected?: number;
  recommendations?: string[];
  urgent_referral?: boolean;
  priority_diseases?: string[];
  referral_urgency: ReferralUrgency;
  normal: boolean;
  top_findings: ScreeningFinding[];
  model_used?: string;
}

export interface OverallAssessment {
  referral_urgency: ReferralUrgency;
  primary_concern: string;
  findings: string[];
  recommendation: string;
}

export interface ComprehensiveHeatmaps {
  dr?: HeatmapPayload;
  glaucoma?: HeatmapPayload;
  amd?: HeatmapPayload;
  myopia?: HeatmapPayload;
}

/** Single-eye comprehensive API response */
export interface ComprehensiveResult {
  dr: DRComprehensiveSummary;
  glaucoma?: GlaucomaResult | null;
  amd?: AMDResult | null;
  myopia?: MyopiaResult | null;
  screening?: ScreeningResult | null;
  heatmap?: ComprehensiveHeatmaps | Record<string, HeatmapPayload>;
  overall_assessment: OverallAssessment;
  active_tasks?: string[];
  input_format?: string | null;
}

/** Bilateral wrapper for UI */
export interface BilateralComprehensiveResult {
  os?: ComprehensiveResult | null;
  od?: ComprehensiveResult | null;
  patient_id?: string;
  analyzed_at?: string;
}

export type UrgencyBadge = "immediate" | "urgent" | "routine" | "none";

export function urgencyFromAssessment(
  assessment: OverallAssessment | undefined,
): UrgencyBadge {
  const u = assessment?.referral_urgency ?? "none";
  if (u === "immediate") return "immediate";
  if (u === "urgent") return "urgent";
  if (u === "routine") return "routine";
  return "none";
}

export const URGENCY_ORDER: Record<UrgencyBadge, number> = {
  immediate: 0,
  urgent: 1,
  routine: 2,
  none: 3,
};

export const URGENCY_LABELS: Record<UrgencyBadge, string> = {
  immediate: "즉시 의뢰",
  urgent: "48시간 내",
  routine: "정기 추적",
  none: "정상",
};

export const URGENCY_COLORS: Record<UrgencyBadge, string> = {
  immediate: "#DC2626",
  urgent: "#EA580C",
  routine: "#CA8A04",
  none: "#16A34A",
};

export const DECISION_COLORS: Record<string, string> = {
  APPROVE: "#16A34A",
  REVISE: "#CA8A04",
  REJECT: "#DC2626",
};
