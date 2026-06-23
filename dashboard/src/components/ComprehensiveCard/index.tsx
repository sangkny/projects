import type { ReactElement, ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  URGENCY_LABELS,
  inferenceModeFromResult,
  urgencyFromAssessment,
  type AMDResult,
  type ComprehensiveResult,
  type GlaucomaResult,
  type InferenceMode,
  type MyopiaResult,
  type UrgencyBadge,
} from "../../types/fundus";
import { cn } from "../../utils/cn";
import { formatFingerprintShort } from "../../utils/fundusAnalysisCache";
import { ScreeningCard } from "../ScreeningCard";

export interface ComprehensiveCardProps {
  result: ComprehensiveResult;
  eyeSide?: "OS" | "OD";
  onFhirExport?: () => void;
  onReanalyze?: (mode: InferenceMode) => Promise<void>;
  reanalyzing?: boolean;
  reanalyzingMode?: InferenceMode | null;
  imageFingerprint?: string;
  cachedModes?: InferenceMode[];
  className?: string;
}

const URGENCY_BADGE_CLASS: Record<UrgencyBadge, string> = {
  immediate: "bg-danger/10 text-danger",
  urgent: "bg-warning-strong/10 text-warning-strong",
  routine: "bg-warning/10 text-warning",
  none: "bg-success/10 text-success",
};

const DECISION_TEXT_CLASS: Record<string, string> = {
  APPROVE: "text-success",
  REVISE: "text-warning",
  REJECT: "text-danger",
};

const URGENCY_EMOJI: Record<UrgencyBadge, string> = {
  immediate: "🔴",
  urgent: "🟠",
  routine: "🟡",
  none: "🟢",
};

function urgencyBadge(urgency: UrgencyBadge): ReactNode {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold",
        URGENCY_BADGE_CLASS[urgency],
      )}
    >
      {URGENCY_EMOJI[urgency]} {URGENCY_LABELS[urgency]}
    </span>
  );
}

function decisionChip(decision: string | null | undefined, label: string): ReactNode {
  const d = decision ?? "—";
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-ink-secondary">{label}</span>
      <span className={cn("font-semibold", DECISION_TEXT_CLASS[d] ?? "text-ink-muted")}>
        {d}
      </span>
    </div>
  );
}

function CdrGauge({ glaucoma }: { glaucoma: GlaucomaResult | null | undefined }): ReactNode {
  const cdr = glaucoma?.cup_disc_ratio?.value;
  if (cdr == null) return null;
  const pct = Math.min(100, Math.round(cdr * 100));
  const barColor =
    cdr > 0.6 ? "bg-danger" : cdr > 0.5 ? "bg-warning-strong" : "bg-success";
  return (
    <div className="mt-2">
      <div className="mb-1 text-xs text-ink-muted">CDR (녹내장)</div>
      <div
        role="meter"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 overflow-hidden rounded bg-border"
      >
        <div className={cn("h-full", barColor)} style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs">{cdr.toFixed(3)}</div>
    </div>
  );
}

function DrusenIcon({ amd }: { amd: AMDResult | null | undefined }): ReactNode {
  if (!amd?.drusen_detected) return null;
  const type = amd.drusen_type ?? "unknown";
  return (
    <div className="mt-1.5 text-xs text-ink-muted">
      드루젠: <span className="font-semibold">{type}</span>
    </div>
  );
}

function MyopiaBar({ myopia }: { myopia: MyopiaResult | null | undefined }): ReactNode {
  const grade = myopia?.myopia_grade ?? 0;
  return (
    <div className="mt-2">
      <div className="mb-1 text-xs text-ink-muted">근시 등급</div>
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((g) => (
          <div
            key={g}
            className={cn(
              "h-1.5 flex-1 rounded-sm",
              g <= grade ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function modeProgressLabel(mode: InferenceMode): string {
  return mode === "precise"
    ? "Precise 분석 중 (5모델 순차 · 약 30~45초)…"
    : "Fast 분석 중 (v10 · 약 1~6초)…";
}

function InferenceModeSwitch({
  currentMode,
  cachedModes = [],
  onReanalyze,
  reanalyzing = false,
  reanalyzingMode = null,
}: {
  currentMode: InferenceMode | null;
  cachedModes?: InferenceMode[];
  onReanalyze?: (mode: InferenceMode) => Promise<void>;
  reanalyzing?: boolean;
  reanalyzingMode?: InferenceMode | null;
}): ReactNode {
  const btn = (value: InferenceMode, icon: string, label: string) => {
    const active = currentMode === value;
    const loading = reanalyzing && reanalyzingMode === value;
    const hasCache = cachedModes.includes(value);
    const canSwitch = Boolean(onReanalyze) && !reanalyzing && !active;
    return (
      <button
        type="button"
        disabled={reanalyzing || (!active && !onReanalyze)}
        onClick={() => {
          if (canSwitch && onReanalyze) void onReanalyze(value);
        }}
        title={
          loading
            ? modeProgressLabel(value)
            : active
              ? "현재 표시 중"
              : hasCache
                ? "캐시된 결과로 즉시 전환"
                : "클릭 시 1회 분석 후 캐시 (Fast ~1s / Precise ~40s)"
        }
        aria-pressed={active}
        aria-busy={loading}
        data-testid={`inference-mode-${value}`}
        className={cn(
          "inline-flex min-w-[72px] flex-1 items-center justify-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold",
          loading || active
            ? "cursor-default border-primary bg-primary-muted text-primary-hover"
            : canSwitch
              ? "cursor-pointer border-border-strong bg-surface text-ink-secondary hover:border-primary"
              : "cursor-not-allowed border-border-strong bg-surface-muted text-ink-subtle",
          loading && "bg-primary-muted",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
            분석 중…
          </>
        ) : (
          <>
            {icon} {label}
            {hasCache && !active ? " · 캐시" : ""}
          </>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div role="group" aria-label="추론 모드 재분석" className="flex gap-1.5">
        {btn("fast", "⚡", "Fast")}
        {btn("precise", "🔍", "Precise")}
      </div>
      <p
        className={cn(
          "m-0 max-w-60 text-right text-[10px]",
          reanalyzing ? "text-primary" : "text-ink-subtle",
        )}
      >
        {reanalyzing && reanalyzingMode
          ? modeProgressLabel(reanalyzingMode)
          : "Fast=v10 스크리닝 · Precise=5모델+4-agent"}
      </p>
    </div>
  );
}

export function ComprehensiveCard({
  result,
  eyeSide,
  onFhirExport,
  onReanalyze,
  reanalyzing = false,
  reanalyzingMode = null,
  imageFingerprint,
  cachedModes,
  className,
}: ComprehensiveCardProps): ReactElement {
  const urgency = urgencyFromAssessment(result.overall_assessment);
  const dr = result.dr;
  const currentMode = inferenceModeFromResult(result);
  const oa = result.overall_assessment;
  const eyeLabel = eyeSide ? (eyeSide === "OS" ? "좌안" : "우안") : "안저";

  return (
    <article
      className={cn(
        "relative rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)]",
        className,
      )}
      aria-label="5질환 종합 결과"
      aria-busy={reanalyzing}
    >
      {reanalyzing && reanalyzingMode && (
        <div
          role="status"
          aria-live="polite"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] bg-white/92 p-6 text-center backdrop-blur-[2px]"
        >
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <p className="m-0 text-[15px] font-bold text-primary-hover">
            {eyeLabel} · {modeProgressLabel(reanalyzingMode)}
          </p>
          <p className="m-0 max-w-[280px] text-xs text-ink-muted">
            API가 5질환 모델을 순차 실행합니다. 창을 닫지 마세요.
          </p>
        </div>
      )}
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="m-0 text-base font-bold">
            {eyeSide ? `${eyeSide === "OS" ? "좌안" : "우안"} (${eyeSide})` : "안저 종합"}
          </h3>
          {oa.primary_concern !== "none" && (
            <p className="mt-1 mb-0 text-[13px] text-ink-muted">주요: {oa.primary_concern}</p>
          )}
          {(oa.inference_mode || oa.inference_time_ms != null) && (
            <p className="mt-1 mb-0 text-xs text-ink-muted">
              {oa.inference_mode ?? "—"}
              {oa.inference_time_ms != null ? ` · ${oa.inference_time_ms}ms` : ""}
              {imageFingerprint ? ` · img#${formatFingerprintShort(imageFingerprint)}` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          {urgencyBadge(urgency)}
          <InferenceModeSwitch
            currentMode={currentMode}
            cachedModes={cachedModes}
            onReanalyze={onReanalyze}
            reanalyzing={reanalyzing}
            reanalyzingMode={reanalyzingMode}
          />
        </div>
      </header>

      <div className="mb-3 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
        {decisionChip(dr.decision, `DR G${dr.dr_grade ?? dr.grade ?? 0}`)}
        {decisionChip(result.glaucoma?.decision, "Glaucoma")}
        {decisionChip(result.amd?.decision, "AMD")}
        {decisionChip(result.myopia?.decision, "Myopia")}
        {result.screening && (
          <div className="flex justify-between gap-2 text-sm">
            <span className="text-ink-secondary">Screening</span>
            <span
              className={cn(
                "font-semibold",
                result.screening.normal ? "text-success" : "text-danger",
              )}
            >
              {result.screening.normal
                ? "정상"
                : `${result.screening.total_diseases_detected ?? result.screening.findings.length}건`}
            </span>
          </div>
        )}
      </div>

      {result.screening && (
        <div className="mb-3">
          <ScreeningCard screening={result.screening} />
        </div>
      )}

      <CdrGauge glaucoma={result.glaucoma} />
      <DrusenIcon amd={result.amd} />
      <MyopiaBar myopia={result.myopia} />

      {result.overall_assessment.findings.length > 0 && (
        <ul className="mt-3 mb-0 list-disc pl-[18px] text-[13px] text-ink-secondary">
          {result.overall_assessment.findings.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      )}

      {result.overall_assessment.recommendation && (
        <p
          className={cn(
            "mt-3 rounded-lg p-2.5 text-[13px]",
            urgency === "immediate" ? "bg-danger-muted" : "bg-surface-muted",
          )}
        >
          {urgency === "immediate" && "⚠️ "}
          {result.overall_assessment.recommendation}
        </p>
      )}

      {onFhirExport && (
        <footer className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onFhirExport}
            data-testid="fhir-export-card"
            className="cursor-pointer rounded-lg border border-border-strong bg-surface-muted px-3.5 py-2 text-[13px] hover:bg-border"
          >
            FHIR R4보내기
          </button>
        </footer>
      )}
    </article>
  );
}

export default ComprehensiveCard;
