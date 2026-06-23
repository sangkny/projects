import type { ReactElement } from "react";
import { CreditCard, Loader2 } from "lucide-react";

import { useBillingMe } from "../../../hooks/useBillingMe";
import { cn } from "../../../utils/cn";

export default function BillingPage(): ReactElement {
  const { data, isLoading, isError, error } = useBillingMe();

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
        <p className="mt-2 text-xs text-ink-subtle">
          Stripe Customer Portal 연동은 3단계 Admin/Portal 확장에서 추가 예정 · API: GET /api/v1/billing/me
        </p>
      </article>
    </div>
  );
}
