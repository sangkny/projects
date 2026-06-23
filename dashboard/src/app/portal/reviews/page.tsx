import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Loader2 } from "lucide-react";

import { BilateralView } from "../../../components/BilateralView";
import { ReviewDecisionBar } from "../../../components/portal/ReviewDecisionBar";
import { RequireDoctor } from "../../../components/shared/RequireRole";
import { useClinicalReviews } from "../../../hooks/useClinicalReviews";
import { pushRejectAlert } from "../../../stores/alertStore";
import { recordReviewDecision } from "../../../stores/auditLogStore";
import { useReviewsStore } from "../../../stores/reviewsStore";
import type { ReviewDecisionAction, ReviewListItem } from "../../../types/clinical";
import { cn } from "../../../utils/cn";

const STATUS_CLASS: Record<string, string> = {
  pending_review: "bg-warning-muted text-warning",
  approved: "bg-success-muted text-success",
  rejected: "bg-danger-muted text-danger",
  needs_revision: "bg-warning-muted text-warning-strong",
};

function ReviewListRow({
  item,
  selected,
  onSelect,
}: {
  item: ReviewListItem;
  selected: boolean;
  onSelect: () => void;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-3 py-3 text-left transition",
        selected
          ? "border-primary bg-primary-muted"
          : "border-border bg-surface hover:border-border-strong",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-ink">{item.patientId}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
            STATUS_CLASS[item.status] ?? "bg-surface-muted text-ink-muted",
          )}
        >
          {item.status.replace("_", " ")}
        </span>
      </div>
      <p className="mt-1 mb-0 text-xs text-ink-muted">
        {new Date(item.createdAt).toLocaleString("ko-KR")}
      </p>
      <p className="mt-1 mb-0 text-sm text-ink-secondary">
        주요: <strong>{item.primaryConcern}</strong>
      </p>
    </button>
  );
}

function ReviewsPageContent(): ReactElement {
  const { data: items = [], isLoading, decide, isError, error } = useClinicalReviews();
  const getById = useReviewsStore((s) => s.getById);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => (selectedId ? getById(selectedId) : items[0]),
    [selectedId, getById, items],
  );

  useEffect(() => {
    if (!selectedId && items[0]) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const handleDecide = async (action: ReviewDecisionAction, notes: string) => {
    if (!selected) return;
    await decide.mutateAsync({ item: selected, action, notes });
    recordReviewDecision(selected.patientId, action, notes);
    if (action === "REJECT") {
      pushRejectAlert("진단 리뷰 REJECT", notes || selected.patientId);
    }
    const next = items.find((i) => i.id !== selected.id && i.status === "pending_review");
    setSelectedId(next?.id ?? null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">진단 리뷰</h1>
        <p className="mt-1 text-sm text-ink-muted">
          AI 종합 결과 검토 · APPROVE / REVISE / REJECT
        </p>
      </header>

      {isError && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger-muted p-3 text-sm text-danger">
          {(error as Error)?.message ?? "리뷰 목록을 불러오지 못했습니다. 로그인 후 다시 시도하세요."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              불러오는 중…
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <p className="text-sm text-ink-muted">
              대기 중인 리뷰가 없습니다. 안저 분석 후 결과가 자동으로 큐에 추가됩니다.
            </p>
          )}
          {items.map((item) => (
            <ReviewListRow
              key={item.id}
              item={item}
              selected={selected?.id === item.id}
              onSelect={() => setSelectedId(item.id)}
            />
          ))}
        </aside>

        <section className="min-w-0 space-y-4">
          {selected?.snapshot ? (
            <>
              <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
                <BilateralView
                  data={selected.snapshot}
                  originalImages={selected.originalImages}
                  compareMode={false}
                />
              </div>
              {selected.status === "pending_review" && (
                <ReviewDecisionBar
                  busy={decide.isPending}
                  onDecide={handleDecide}
                />
              )}
              {selected.status !== "pending_review" && (
                <p className="text-sm text-ink-muted">
                  처리 완료: <strong>{selected.status}</strong>
                  {selected.reviewNotes ? ` — ${selected.reviewNotes}` : ""}
                </p>
              )}
            </>
          ) : selected ? (
            <p className="text-sm text-ink-muted">
              진단 ID {selected.diagnosisId ?? selected.id} — 종합 스냅샷 없음 (API 전용 항목)
            </p>
          ) : (
            <p className="text-sm text-ink-muted">목록에서 항목을 선택하세요.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ReviewsPage(): ReactElement {
  return (
    <RequireDoctor>
      <ReviewsPageContent />
    </RequireDoctor>
  );
}
