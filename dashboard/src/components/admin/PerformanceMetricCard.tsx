import type { ReactElement } from "react";
import { Activity } from "lucide-react";

import type { PerformanceMetric } from "../../types/admin";
import { cn } from "../../utils/cn";

const METRIC_LABEL: Record<PerformanceMetric["metric"], string> = {
  QWK: "QWK",
  AUC: "AUC",
  mAUC: "mAUC",
  composite: "Composite",
};

const DISEASE_CLASS: Record<string, string> = {
  DR: "border-disease-dr/30 bg-disease-dr/5",
  GL: "border-disease-gl/30 bg-disease-gl/5",
  AMD: "border-disease-amd/30 bg-disease-amd/5",
  MYO: "border-disease-myo/30 bg-disease-myo/5",
  Multi: "border-disease-multi/30 bg-disease-multi/5",
  v10c: "border-admin-primary/30 bg-admin-muted",
};

export function PerformanceMetricCard({ metric }: { metric: PerformanceMetric }): ReactElement {
  const accent = DISEASE_CLASS[metric.disease] ?? "border-border bg-surface";

  return (
    <article
      data-testid={`perf-card-${metric.id}`}
      className={cn(
        "rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-card)]",
        accent,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-admin-primary">
            {metric.disease}
          </p>
          <h3 className="m-0 mt-1 text-lg font-bold text-ink">{metric.label}</h3>
          <p className="m-0 mt-0.5 text-xs text-ink-muted">{metric.model}</p>
        </div>
        <Activity className="size-4 text-admin-primary" aria-hidden />
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-ink">
        {metric.value.toFixed(4)}
        <span className="ml-1 text-sm font-medium text-ink-muted">
          {METRIC_LABEL[metric.metric]}
        </span>
      </p>
      {metric.notes && <p className="m-0 mt-2 text-xs text-ink-secondary">{metric.notes}</p>}
      <span className="mt-3 inline-flex rounded-full bg-success-muted px-2 py-0.5 text-[10px] font-bold uppercase text-success">
        운영
      </span>
    </article>
  );
}
