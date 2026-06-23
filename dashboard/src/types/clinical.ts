/** MEDI clinical + billing API types */

import type { BilateralComprehensiveResult } from "./fundus";

export type ReviewApiStatus = "pending_review" | "approved" | "rejected" | "needs_revision";

export type ReviewDecisionAction = "APPROVE" | "REVISE" | "REJECT";

export const DECISION_TO_API: Record<ReviewDecisionAction, ReviewApiStatus> = {
  APPROVE: "approved",
  REVISE: "needs_revision",
  REJECT: "rejected",
};

export interface ReviewOut {
  id: string;
  diagnosis_id: string;
  status: ReviewApiStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewQueueResponse {
  reviews: ReviewOut[];
  total: number;
}

export interface ReviewDecisionRequest {
  status: ReviewApiStatus;
  review_notes?: string | null;
}

/** UI row + optional comprehensive snapshot for GradCAM reuse */
export interface ReviewListItem {
  id: string;
  apiReviewId?: string;
  diagnosisId?: string;
  patientId: string;
  createdAt: string;
  primaryConcern: string;
  status: ReviewApiStatus;
  reviewNotes?: string;
  snapshot?: BilateralComprehensiveResult;
  originalImages?: { os?: string; od?: string };
}

export interface BillingSubscription {
  plan_code: string;
  plan_name: string;
  monthly_call_quota: number | null;
  allowed_models: string[];
  started_at: string;
  current_period_end: string | null;
}

export interface BillingUsageSnapshot {
  year_month: string;
  calls_used: number;
  calls_limit: number | null;
  calls_remaining: number | null;
  quota_pct: number;
  tokens_total: number;
  cost_usd: number;
}

export interface BillingMeResponse {
  user_id: string;
  role: string;
  subscription: BillingSubscription;
  usage: BillingUsageSnapshot;
}

export type PortalRole = "doctor" | "staff" | "admin";

export interface PortalSession {
  accessToken: string;
  userId: string;
  role: PortalRole;
}
