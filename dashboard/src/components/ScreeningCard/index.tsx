import { useState, type CSSProperties, type ReactElement } from "react";

import {
  URGENCY_COLORS,
  type ReferralUrgency,
  type ScreeningFinding,
  type ScreeningResult,
} from "../../types/fundus";

export interface ScreeningCardProps {
  screening: ScreeningResult;
  className?: string;
}

const RISK_COLORS: Record<string, string> = {
  low: "#16A34A",
  moderate: "#CA8A04",
  high: "#EA580C",
  urgent: "#DC2626",
};

function urgencyBorder(urgency: ReferralUrgency): string {
  if (urgency === "immediate") return URGENCY_COLORS.immediate;
  if (urgency === "urgent") return URGENCY_COLORS.urgent;
  if (urgency === "routine") return URGENCY_COLORS.routine;
  return URGENCY_COLORS.none;
}

function FindingRow({ finding }: { finding: ScreeningFinding }): ReactElement {
  return (
    <li
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid #F1F5F9",
        fontSize: 13,
      }}
    >
      <div>
        <span style={{ fontWeight: 600, textTransform: "uppercase" }}>{finding.disease}</span>
        {finding.korean_name && (
          <span style={{ marginLeft: 6, color: "#64748B" }}>{finding.korean_name}</span>
        )}
        {finding.icd10 && (
          <span style={{ marginLeft: 6, fontSize: 11, color: "#94A3B8" }}>{finding.icd10}</span>
        )}
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 700 }}>{(finding.probability * 100).toFixed(1)}%</div>
        <div style={{ fontSize: 11, color: RISK_COLORS[finding.risk_level] ?? "#64748B" }}>
          {finding.risk_level}
        </div>
      </div>
    </li>
  );
}

export function ScreeningCard({ screening, className }: ScreeningCardProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const border = urgencyBorder(screening.referral_urgency);
  const top = screening.top_findings?.length
    ? screening.top_findings
    : screening.findings.slice(0, 3);

  const cardStyle: CSSProperties = {
    border: `2px solid ${border}`,
    borderRadius: 10,
    padding: 12,
    background: screening.normal ? "#F0FDF4" : "#FFFFFF",
  };

  return (
    <section className={className} style={cardStyle} aria-label="28-class 다질환 스크리닝">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>다질환 스크리닝</h4>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748B" }}>
            {screening.model_used || "multidisease_v1"}
          </p>
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            background: screening.normal ? "#DCFCE7" : "#FEE2E2",
            color: screening.normal ? "#166534" : "#991B1B",
          }}
        >
          {screening.normal ? "정상" : "비정상"}
        </span>
      </header>

      {screening.urgent_diseases.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {screening.urgent_diseases.map((d) => (
            <span
              key={d}
              style={{
                padding: "2px 8px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                background: "#DC2626",
                color: "#FFF",
              }}
            >
              긴급: {d.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {top.length > 0 ? (
        <>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#64748B", fontWeight: 600 }}>
            상위 소견
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {top.map((f) => (
              <FindingRow key={f.disease} finding={f} />
            ))}
          </ul>
        </>
      ) : (
        <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>탐지된 소견 없음</p>
      )}

      {screening.findings.length > top.length && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              borderRadius: 6,
              border: "1px solid #CBD5E1",
              background: "#F8FAFC",
              cursor: "pointer",
            }}
          >
            {expanded ? "전체 소견 접기" : `전체 소견 펼치기 (${screening.findings.length})`}
          </button>
          {expanded && (
            <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none" }}>
              {screening.findings.map((f) => (
                <FindingRow key={`all-${f.disease}`} finding={f} />
              ))}
            </ul>
          )}
        </div>
      )}

      {screening.recommendations.length > 0 && (
        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#475569" }}>
          {screening.recommendations[0]}
        </p>
      )}
    </section>
  );
}

export default ScreeningCard;
