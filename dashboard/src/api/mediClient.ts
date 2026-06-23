import { mediApiPath } from "../config/env";
import type { AuditDecision, AuditLogEntry, AuditLogResponse } from "../types/admin";
import type {
  BillingMeResponse,
  ReviewDecisionRequest,
  ReviewOut,
  ReviewQueueResponse,
} from "../types/clinical";
import type { OntologyStats } from "../types";

const JSON_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export class MediApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MediApiError";
  }
}

async function mediFetch<T>(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...rest } = init;
  const hdrs = new Headers(headers);
  if (token) hdrs.set("Authorization", `Bearer ${token}`);
  if (!hdrs.has("Accept")) hdrs.set("Accept", "application/json");

  const res = await fetch(mediApiPath(path), { ...rest, headers: hdrs });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = String(body.detail);
    } catch {
      /* ignore */
    }
    throw new MediApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

export async function loginPortal(
  username: string,
  password: string,
): Promise<{ access_token: string; token_type: string }> {
  const body = new URLSearchParams({ username, password });
  const res = await fetch(mediApiPath("/api/v1/auth/token"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new MediApiError("로그인 실패", res.status);
  }
  return (await res.json()) as { access_token: string; token_type: string };
}

export async function fetchReviewQueue(
  token: string,
  status = "pending_review",
): Promise<ReviewQueueResponse> {
  return mediFetch<ReviewQueueResponse>(
    `/api/v1/clinical/reviews?status=${encodeURIComponent(status)}`,
    { token },
  );
}

export async function fetchReview(token: string, reviewId: string): Promise<ReviewOut> {
  return mediFetch<ReviewOut>(`/api/v1/clinical/reviews/${reviewId}`, { token });
}

export async function decideReview(
  token: string,
  reviewId: string,
  body: ReviewDecisionRequest,
): Promise<ReviewOut> {
  return mediFetch<ReviewOut>(`/api/v1/clinical/reviews/${reviewId}/decide`, {
    method: "POST",
    token,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

export async function fetchBillingMe(token: string): Promise<BillingMeResponse> {
  return mediFetch<BillingMeResponse>("/api/v1/billing/me", { token });
}

export async function createStripePortalSession(
  token: string,
  returnUrl: string,
): Promise<{ session_id: string; url: string }> {
  return mediFetch("/api/v1/billing/stripe/portal", {
    method: "POST",
    token,
    headers: JSON_HEADERS,
    body: JSON.stringify({ return_url: returnUrl }),
  });
}

export async function fetchOntologyStats(): Promise<OntologyStats> {
  return mediFetch<OntologyStats>("/api/v1/ontology/stats");
}

export async function fetchAdminAuditLogs(filters?: {
  from?: string;
  to?: string;
  decision?: AuditDecision | "";
}): Promise<AuditLogResponse> {
  const params = new URLSearchParams();
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.decision) params.set("decision", filters.decision);
  const qs = params.toString();
  const raw = await mediFetch<{
    items: Array<{
      id: string;
      kind: AuditLogEntry["kind"];
      occurred_at: string;
      patient_id?: string;
      partner_id?: string;
      decision?: AuditDecision;
      reason?: string;
      threshold?: number;
      confidence?: number;
      source: string;
      detail?: string;
    }>;
    total: number;
  }>(`/api/v1/dashboard/audit-logs${qs ? `?${qs}` : ""}`);

  return {
    total: raw.total,
    items: raw.items.map((row) => ({
      id: row.id,
      kind: row.kind,
      occurredAt: row.occurred_at,
      patientId: row.patient_id,
      partnerId: row.partner_id,
      decision: row.decision,
      reason: row.reason,
      threshold: row.threshold,
      confidence: row.confidence,
      source: row.source,
      detail: row.detail,
    })),
  };
}
