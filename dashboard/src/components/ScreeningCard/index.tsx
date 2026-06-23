import { useState, type ReactElement } from "react";

import {
  type ReferralUrgency,
  type ScreeningFinding,
  type ScreeningResult,
} from "../../types/fundus";
import { cn } from "../../utils/cn";

export interface ScreeningCardProps {
  screening: ScreeningResult;
  className?: string;
}

const RISK_TEXT_CLASS: Record<string, string> = {
  low: "text-success",
  moderate: "text-warning",
  high: "text-warning-strong",
  urgent: "text-danger",
};

const URGENCY_BORDER_CLASS: Record<ReferralUrgency, string> = {
  immediate: "border-danger",
  urgent: "border-warning-strong",
  routine: "border-warning",
  none: "border-success",
};

function FindingRow({ finding }: { finding: ScreeningFinding }): ReactElement {
  return (
    <li className="flex items-center justify-between gap-2 border-b border-slate-100 py-1.5 text-[13px]">
      <div>
        <span className="font-semibold uppercase">{finding.disease}</span>
        {finding.korean_name && (
          <span className="ml-1.5 text-ink-muted">{finding.korean_name}</span>
        )}
        {finding.icd10 && (
          <span className="ml-1.5 text-[11px] text-ink-subtle">{finding.icd10}</span>
        )}
      </div>
      <div className="text-right">
        <div className="font-bold">{(finding.probability * 100).toFixed(1)}%</div>
        <div className={cn("text-[11px]", RISK_TEXT_CLASS[finding.risk_level] ?? "text-ink-muted")}>
          {finding.risk_level}
        </div>
      </div>
    </li>
  );
}

export function ScreeningCard({ screening, className }: ScreeningCardProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const top = screening.top_findings?.length
    ? screening.top_findings
    : screening.findings.slice(0, 3);

  return (
    <section
      className={cn(
        "rounded-[10px] border-2 p-3",
        URGENCY_BORDER_CLASS[screening.referral_urgency],
        screening.normal ? "bg-success-muted" : "bg-surface",
        className,
      )}
      aria-label="28-class 다질환 스크리닝"
    >
      <header className="mb-2.5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="m-0 text-sm font-bold">다질환 스크리닝</h4>
          <p className="mt-1 mb-0 text-[11px] text-ink-muted">
            {screening.model_used || "multidisease_v1"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            screening.normal ? "bg-green-100 text-green-800" : "bg-red-100 text-red-900",
          )}
        >
          {screening.normal ? "정상" : "비정상"}
        </span>
      </header>

      {screening.urgent_diseases.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {screening.urgent_diseases.map((d) => (
            <span
              key={d}
              className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold text-white"
            >
              긴급: {d.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {top.length > 0 ? (
        <>
          <p className="mb-1.5 mt-0 text-xs font-semibold text-ink-muted">상위 소견</p>
          <ul className="m-0 list-none p-0">
            {top.map((f) => (
              <FindingRow key={f.disease} finding={f} />
            ))}
          </ul>
        </>
      ) : (
        <p className="m-0 text-[13px] text-ink-muted">탐지된 소견 없음</p>
      )}

      {screening.findings.length > top.length && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="cursor-pointer rounded-md border border-border-strong bg-surface-muted px-2.5 py-1 text-xs hover:bg-border"
          >
            {expanded ? "전체 소견 접기" : `전체 소견 펼치기 (${screening.findings.length})`}
          </button>
          {expanded && (
            <ul className="mt-2 mb-0 list-none p-0">
              {screening.findings.map((f) => (
                <FindingRow key={`all-${f.disease}`} finding={f} />
              ))}
            </ul>
          )}
        </div>
      )}

      {screening.recommendations.length > 0 && (
        <p className="mt-2.5 mb-0 text-xs text-ink-secondary">
          {screening.recommendations[0]}
        </p>
      )}
    </section>
  );
}

export default ScreeningCard;
