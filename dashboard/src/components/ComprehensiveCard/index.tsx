import type { CSSProperties, ReactElement, ReactNode } from "react";

import { useFundusStore } from "../../stores/fundusStore";
import {
  DECISION_COLORS,
  URGENCY_COLORS,
  URGENCY_LABELS,
  urgencyFromAssessment,
  type AMDResult,
  type ComprehensiveResult,
  type GlaucomaResult,
  type InferenceMode,
  type MyopiaResult,
  type UrgencyBadge,
} from "../../types/fundus";
import { ScreeningCard } from "../ScreeningCard";

export interface ComprehensiveCardProps {
  result: ComprehensiveResult;
  eyeSide?: "OS" | "OD";
  onFhirExport?: () => void;
  className?: string;
}

function urgencyBadge(urgency: UrgencyBadge): ReactNode {
  const emoji = { immediate: "🔴", urgent: "🟠", routine: "🟡", none: "🟢" }[urgency];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: `${URGENCY_COLORS[urgency]}18`,
        color: URGENCY_COLORS[urgency],
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {emoji} {URGENCY_LABELS[urgency]}
    </span>
  );
}

function decisionChip(decision: string | null | undefined, label: string): ReactNode {
  const d = decision ?? "—";
  const color = DECISION_COLORS[d] ?? "#64748B";
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
      <span style={{ color: "#475569" }}>{label}</span>
      <span style={{ fontWeight: 600, color }}>{d}</span>
    </div>
  );
}

function CdrGauge({ glaucoma }: { glaucoma: GlaucomaResult | null | undefined }): ReactNode {
  const cdr = glaucoma?.cup_disc_ratio?.value;
  if (cdr == null) return null;
  const pct = Math.min(100, Math.round(cdr * 100));
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>CDR (녹내장)</div>
      <div
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          height: 8,
          borderRadius: 4,
          background: "#E2E8F0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: cdr > 0.6 ? "#DC2626" : cdr > 0.5 ? "#EA580C" : "#16A34A",
          }}
        />
      </div>
      <div style={{ fontSize: 12, marginTop: 4 }}>{cdr.toFixed(3)}</div>
    </div>
  );
}

function DrusenIcon({ amd }: { amd: AMDResult | null | undefined }): ReactNode {
  if (!amd?.drusen_detected) return null;
  const type = amd.drusen_type ?? "unknown";
  return (
    <div style={{ fontSize: 12, color: "#64748B", marginTop: 6 }}>
      드루젠: <span style={{ fontWeight: 600 }}>{type}</span>
    </div>
  );
}

function MyopiaBar({ myopia }: { myopia: MyopiaResult | null | undefined }): ReactNode {
  const grade = myopia?.myopia_grade ?? 0;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>근시 등급</div>
      <div style={{ display: "flex", gap: 4 }}>
        {[0, 1, 2, 3].map((g) => (
          <div
            key={g}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: g <= grade ? "#2563EB" : "#E2E8F0",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const cardStyle: CSSProperties = {
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  padding: 16,
  background: "#FFFFFF",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
};

function InferenceModeToggle({
  mode,
  onChange,
  compact = false,
}: {
  mode: InferenceMode;
  onChange: (mode: InferenceMode) => void;
  compact?: boolean;
}): ReactNode {
  const btn = (value: InferenceMode, icon: string, label: string) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={mode === value}
      style={{
        flex: compact ? undefined : 1,
        padding: compact ? "4px 10px" : "6px 10px",
        borderRadius: 8,
        border: mode === value ? "1px solid #2563EB" : "1px solid #CBD5E1",
        background: mode === value ? "#EFF6FF" : "#F8FAFC",
        color: mode === value ? "#1D4ED8" : "#475569",
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {icon} {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="추론 모드"
      style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
    >
      {btn("fast", "⚡", "Fast")}
      {btn("precise", "🔍", "Precise")}
    </div>
  );
}

export function ComprehensiveCard({
  result,
  eyeSide,
  onFhirExport,
  className,
}: ComprehensiveCardProps): ReactElement {
  const urgency = urgencyFromAssessment(result.overall_assessment);
  const dr = result.dr;
  const inferenceMode = useFundusStore((s) => s.inferenceMode);
  const setInferenceMode = useFundusStore((s) => s.setInferenceMode);
  const oa = result.overall_assessment;

  return (
    <article className={className} style={cardStyle} aria-label="5질환 종합 결과">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {eyeSide ? `${eyeSide === "OS" ? "좌안" : "우안"} (${eyeSide})` : "안저 종합"}
          </h3>
          {oa.primary_concern !== "none" && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748B" }}>
              주요: {oa.primary_concern}
            </p>
          )}
          {(oa.inference_mode || oa.inference_time_ms != null) && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748B" }}>
              {oa.inference_mode ?? "—"}
              {oa.inference_time_ms != null ? ` · ${oa.inference_time_ms}ms` : ""}
            </p>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {urgencyBadge(urgency)}
          <InferenceModeToggle mode={inferenceMode} onChange={setInferenceMode} compact />
        </div>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {decisionChip(dr.decision, `DR G${dr.dr_grade ?? dr.grade ?? 0}`)}
        {decisionChip(result.glaucoma?.decision, "Glaucoma")}
        {decisionChip(result.amd?.decision, "AMD")}
        {decisionChip(result.myopia?.decision, "Myopia")}
        {result.screening && (
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 14 }}>
            <span style={{ color: "#475569" }}>Screening</span>
            <span
              style={{
                fontWeight: 600,
                color: result.screening.normal ? "#16A34A" : "#DC2626",
              }}
            >
              {result.screening.normal ? "정상" : `${result.screening.total_diseases_detected ?? result.screening.findings.length}건`}
            </span>
          </div>
        )}
      </div>

      {result.screening && (
        <div style={{ marginBottom: 12 }}>
          <ScreeningCard screening={result.screening} />
        </div>
      )}

      <CdrGauge glaucoma={result.glaucoma} />
      <DrusenIcon amd={result.amd} />
      <MyopiaBar myopia={result.myopia} />

      {result.overall_assessment.findings.length > 0 && (
        <ul style={{ margin: "12px 0 0", paddingLeft: 18, fontSize: 13, color: "#334155" }}>
          {result.overall_assessment.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {result.overall_assessment.recommendation && (
        <p
          style={{
            marginTop: 12,
            padding: 10,
            borderRadius: 8,
            background: urgency === "immediate" ? "#FEF2F2" : "#F8FAFC",
            fontSize: 13,
          }}
        >
          {urgency === "immediate" && "⚠️ "}
          {result.overall_assessment.recommendation}
        </p>
      )}

      {onFhirExport && (
        <footer style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onFhirExport}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #CBD5E1",
              background: "#F8FAFC",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            FHIR R4 내보내기
          </button>
        </footer>
      )}
    </article>
  );
}

export default ComprehensiveCard;
