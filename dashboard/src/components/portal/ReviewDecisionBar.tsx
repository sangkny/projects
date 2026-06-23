import type { ReactElement } from "react";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { ReviewDecisionAction } from "../../types/clinical";
import { cn } from "../../utils/cn";

const ACTION_META: Record<
  ReviewDecisionAction,
  { label: string; className: string; apiHint: string }
> = {
  APPROVE: {
    label: "APPROVE",
    className: "border-success bg-success-muted text-success hover:bg-success/15",
    apiHint: "approved",
  },
  REVISE: {
    label: "REVISE",
    className: "border-warning bg-warning-muted text-warning hover:bg-warning/15",
    apiHint: "needs_revision",
  },
  REJECT: {
    label: "REJECT",
    className: "border-danger bg-danger-muted text-danger hover:bg-danger/15",
    apiHint: "rejected",
  },
};

export interface ReviewDecisionBarProps {
  disabled?: boolean;
  busy?: boolean;
  onDecide: (action: ReviewDecisionAction, notes: string) => Promise<void>;
}

export function ReviewDecisionBar({
  disabled = false,
  busy = false,
  onDecide,
}: ReviewDecisionBarProps): ReactElement {
  const [notes, setNotes] = useState("");
  const [pending, setPending] = useState<ReviewDecisionAction | null>(null);

  const handle = async (action: ReviewDecisionAction) => {
    if (action !== "APPROVE" && !notes.trim()) return;
    setPending(action);
    try {
      await onDecide(action, notes.trim());
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <p className="m-0 text-sm font-semibold text-ink">의사 최종 확인</p>
      <label className="block text-xs text-ink-muted" htmlFor="review-notes">
        검토 메모 {pending === "APPROVE" ? "(선택)" : "(REVISE/REJECT 시 필수)"}
      </label>
      <textarea
        id="review-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="임상 소견·추가 권고사항"
        className="w-full resize-y rounded-lg border border-border-strong bg-surface-muted px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none"
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label="검토 결정">
        {(Object.keys(ACTION_META) as ReviewDecisionAction[]).map((action) => {
          const meta = ACTION_META[action];
          const isBusy = busy || pending === action;
          return (
            <button
              key={action}
              type="button"
              data-testid={`review-decision-${action}`}
              disabled={disabled || isBusy || (action !== "APPROVE" && !notes.trim())}
              onClick={() => void handle(action)}
              title={`API status: ${meta.apiHint}`}
              className={cn(
                "min-w-[100px] rounded-lg border px-4 py-2 text-sm font-bold transition",
                meta.className,
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {isBusy ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  처리 중…
                </span>
              ) : (
                meta.label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ReviewDecisionBar;
