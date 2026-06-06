import type { CSSProperties, ReactElement } from "react";

import {
  PRODUCTION_MODELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type ModelRecord,
  type ModelStatus,
} from "../../types/model";

export interface ModelCardProps {
  model: ModelRecord;
  onDetail?: (id: string) => void;
  onSwap?: (id: string) => void;
  onRollback?: (id: string) => void;
  trainingProgress?: number;
  className?: string;
}

const cardBase: CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 16,
  background: "#FFFFFF",
};

function statusBadge(status: ModelStatus): ReactElement {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color: "#FFF",
        background: STATUS_COLORS[status],
      }}
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
      className={className}
      style={{
        ...cardBase,
        opacity: dimmed ? 0.72 : 1,
        borderColor: isProduction ? STATUS_COLORS.production : cardBase.borderColor as string,
      }}
      aria-label={`${model.disease} model ${model.version}`}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
          {isProduction && "🟢 "}
          {model.disease}: {model.version}
        </h4>
        {statusBadge(model.status)}
      </header>

      <dl style={{ margin: "12px 0 0", fontSize: 13, color: "#475569" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <dt>{model.metric}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{model.metric_value.toFixed(4)}</dd>
        </div>
        {model.confidence != null && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <dt>Confidence</dt>
            <dd style={{ margin: 0 }}>{model.confidence.toFixed(3)}</dd>
          </div>
        )}
        {model.deployed_at && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <dt>배포</dt>
            <dd style={{ margin: 0 }}>{model.deployed_at}</dd>
          </div>
        )}
      </dl>

      {isTraining && trainingProgress != null && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>훈련 진행</div>
          <div style={{ height: 8, borderRadius: 4, background: "#E2E8F0" }}>
            <div
              style={{
                width: `${Math.min(100, trainingProgress)}%`,
                height: "100%",
                borderRadius: 4,
                background: STATUS_COLORS.training,
              }}
            />
          </div>
        </div>
      )}

      {model.notes && (
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#64748B" }}>{model.notes}</p>
      )}

      {isProduction && (
        <footer style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
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

      <p style={{ margin: "10px 0 0", fontSize: 11 }}>
        <a href="/book/part7/ch41-model-version-history.md" style={{ color: "#2563EB" }}>
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
      style={{
        padding: "6px 12px",
        fontSize: 12,
        borderRadius: 6,
        border: "1px solid",
        borderColor: variant === "danger" ? "#FCA5A5" : "#CBD5E1",
        background: variant === "danger" ? "#FEF2F2" : "#F8FAFC",
        cursor: "pointer",
      }}
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
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}
    >
      {models.map((m) => (
        <ModelCard key={m.id} model={m} trainingProgress={trainingProgress?.[m.id]} />
      ))}
    </div>
  );
}

export default ModelCard;
