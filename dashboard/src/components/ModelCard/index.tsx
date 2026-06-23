import type { ReactElement } from "react";

import {
  PRODUCTION_MODELS,
  STATUS_LABELS,
  type ModelRecord,
  type ModelStatus,
} from "../../types/model";
import { cn } from "../../utils/cn";

export interface ModelCardProps {
  model: ModelRecord;
  onDetail?: (id: string) => void;
  onSwap?: (id: string) => void;
  onRollback?: (id: string) => void;
  trainingProgress?: number;
  className?: string;
}

const STATUS_BADGE_CLASS: Record<ModelStatus, string> = {
  production: "bg-success",
  reference: "bg-ink-muted",
  training: "bg-primary",
  deprecated: "bg-ink-subtle",
};

function statusBadge(status: ModelStatus): ReactElement {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
        STATUS_BADGE_CLASS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function ModelCard({
  model,
  onDetail,
  onSwap,
  onRollback,
  trainingProgress,
  className,
}: ModelCardProps): ReactElement {
  const isProduction = model.status === "production";
  const isTraining = model.status === "training";
  const dimmed = model.status === "reference" || model.status === "deprecated";

  return (
    <article
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]",
        isProduction && "border-success",
        dimmed && "opacity-[0.72]",
        className,
      )}
      aria-label={`${model.disease} model ${model.version}`}
    >
      <header className="flex items-center justify-between gap-2">
        <h4 className="m-0 text-[15px] font-bold">
          {isProduction && "🟢 "}
          {model.disease}: {model.version}
        </h4>
        {statusBadge(model.status)}
      </header>

      <dl className="mt-3 mb-0 text-[13px] text-ink-secondary">
        <div className="mb-1 flex justify-between">
          <dt>{model.metric}</dt>
          <dd className="m-0 font-semibold">{model.metric_value.toFixed(4)}</dd>
        </div>
        {model.confidence != null && (
          <div className="mb-1 flex justify-between">
            <dt>Confidence</dt>
            <dd className="m-0">{model.confidence.toFixed(3)}</dd>
          </div>
        )}
        {model.deployed_at && (
          <div className="flex justify-between">
            <dt>배포</dt>
            <dd className="m-0">{model.deployed_at}</dd>
          </div>
        )}
      </dl>

      {isTraining && trainingProgress != null && (
        <div className="mt-3">
          <div className="mb-1 text-xs text-ink-muted">훈련 진행</div>
          <div className="h-2 rounded bg-border">
            <div
              className="h-full rounded bg-primary"
              style={{ width: `${Math.min(100, trainingProgress)}%` }}
            />
          </div>
        </div>
      )}

      {model.notes && (
        <p className="mt-2.5 mb-0 text-xs text-ink-muted">{model.notes}</p>
      )}

      {isProduction && (
        <footer className="mt-3.5 flex flex-wrap gap-2">
          {onDetail && (
            <ActionButton label="상세" onClick={() => onDetail(model.id)} />
          )}
          {onSwap && (
            <ActionButton label="교체" onClick={() => onSwap(model.id)} />
          )}
          {onRollback && (
            <ActionButton label="롤백" onClick={() => onRollback(model.id)} variant="danger" />
          )}
        </footer>
      )}

      <p className="mt-2.5 mb-0 text-[11px]">
        <a href="/book/part7/ch41-model-version-history.md" className="text-primary hover:underline">
          ch41 버전 계보 →
        </a>
      </p>
    </article>
  );
}

function ActionButton({
  label,
  onClick,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-md border px-3 py-1.5 text-xs",
        variant === "danger"
          ? "border-red-300 bg-danger-muted"
          : "border-border-strong bg-surface-muted hover:bg-border",
      )}
    >
      {label}
    </button>
  );
}

/** Grid of ch41 production + training models */
export function ModelCardGrid({
  models = PRODUCTION_MODELS,
  trainingProgress,
}: {
  models?: ModelRecord[];
  trainingProgress?: Record<string, number>;
}): ReactElement {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {models.map((m) => (
        <ModelCard key={m.id} model={m} trainingProgress={trainingProgress?.[m.id]} />
      ))}
    </div>
  );
}

export default ModelCard;
