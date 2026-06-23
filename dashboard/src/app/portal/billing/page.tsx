import type { ReactElement } from "react";
import { useState } from "react";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

import { useBillingMe } from "../../../hooks/useBillingMe";
import { useStripePortal } from "../../../hooks/useStripePortal";
import { cn } from "../../../utils/cn";

export default function BillingPage(): ReactElement {
  const { data, isLoading, isError, error } = useBillingMe();
  const portal = useStripePortal();
  const [portalHint, setPortalHint] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-ink-muted">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        청구 정보 불러오는 중…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-lg border border-danger/30 bg-danger-muted p-4 text-sm text-danger">
        {(error as Error)?.message ?? "청구 정보를 불러올 수 없습니다. Portal 로그인 후 다시 시도하세요."}
      </div>
    );
  }

  const { subscription: sub, usage } = data;
  const pct = Math.min(100, usage.quota_pct ?? 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">청구 · 사용량</h1>
        <p className="mt-1 text-sm text-ink-muted">Clinic 플랜 및 이번 달 분석 호출 현황</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center gap-2 text-admin-primary">
            <CreditCard className="size-5" aria-hidden />
            <h2 className="m-0 text-lg font-semibold">현재 플랜</h2>
          </div>
          <p className="m-0 text-2xl font-bold text-ink">{sub.plan_name}</p>
          <p className="mt-1 text-sm text-ink-muted">코드: {sub.plan_code}</p>
          <p className="mt-3 text-sm text-ink-secondary">
            월 호출 한도:{" "}
            <strong>{sub.monthly_call_quota?.toLocaleString() ?? "무제한"}</strong>
          </p>
        </article>

        <article className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <h2 className="m-0 text-lg font-semibold text-ink">이번 달 분석</h2>
          <p className="mt-2 text-3xl font-bold text-primary">
            {usage.calls_used.toLocaleString()}
            <span className="text-base font-normal text-ink-muted"> 건</span>
          </p>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-ink-muted">
              <span>{usage.year_month}</span>
              <span>{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            {usage.calls_remaining != null && (
              <p className="mt-2 text-xs text-ink-muted">
                잔여 {usage.calls_remaining.toLocaleString()}건
              </p>
            )}
          </div>
        </article>
      </div>

      <article
        className={cn(
          "rounded-[var(--radius-card)] border border-border bg-surface-muted p-5",
        )}
      >
        <h2 className="m-0 text-sm font-semibold text-ink">다음 결제일</h2>
        <p className="mt-2 text-lg font-medium text-ink">
          {sub.current_period_end
            ? new Date(sub.current_period_end).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "— (Free 플랜 또는 미설정)"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            data-testid="stripe-portal-button"
            disabled={portal.isPending}
            onClick={() => {
              setPortalHint(null);
              portal.mutate(undefined, {
                onSuccess: (res) => {
                  if (res?.url) window.location.href = res.url;
                },
                onError: () => {
                  setPortalHint("결제 관리 Portal 준비 중 — Stripe 고객 연동 후 이용 가능합니다.");
                },
              });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-admin-primary/40 bg-admin-muted px-4 py-2 text-sm font-medium text-admin-primary hover:border-admin-primary"
          >
            {portal.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ExternalLink className="size-4" aria-hidden />
            )}
            결제 관리
          </button>
          {portalHint && (
            <span className="text-xs text-ink-muted" data-testid="stripe-portal-hint">
              {portalHint}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-ink-subtle">
          API: POST /api/v1/billing/stripe/portal · GET /api/v1/billing/me
        </p>
      </article>
    </div>
  );
}
