import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Download, GitCompare, Loader2 } from "lucide-react";

import { BilateralView } from "../../../../components/BilateralView";
import { useFundusAnalysis } from "../../../../hooks/useFundusAnalysis";
import { useFundusStore } from "../../../../stores/fundusStore";
import { recordPipelineFromResults } from "../../../../stores/auditLogStore";
import {
  pushRejectAlert,
  pushUrgentReferralAlert,
} from "../../../../stores/alertStore";
import { useReviewsStore } from "../../../../stores/reviewsStore";
import { buildFhirBundle, downloadJson } from "../../../../utils/fhirExport";

export default function FundusResultsPage() {
  const results = useFundusStore((s) => s.results);
  const originalImages = useFundusStore((s) => s.originalImages);
  const patientId = useFundusStore((s) => s.patientId);
  const compareMode = useFundusStore((s) => s.compareMode);
  const setCompareMode = useFundusStore((s) => s.setCompareMode);
  const enqueueFromFundus = useReviewsStore((s) => s.enqueueFromFundus);
  const { switchEyeMode, reanalyzingEye, reanalyzingMode, error: reanalyzeError, lastCacheHit } =
    useFundusAnalysis();

  const enqueuedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!results?.analyzed_at) return;
    if (enqueuedRef.current === results.analyzed_at) return;
    try {
      enqueueFromFundus(results, originalImages);
    } catch (err) {
      console.warn("[FundusResults] reviews 큐 저장 실패 (분석 결과 표시는 계속):", err);
    }
    try {
      recordPipelineFromResults(results);
    } catch (err) {
      console.warn("[FundusResults] audit 기록 실패 (ignored):", err);
    }
    for (const [eye, eyeResult] of [
      ["OS", results.os],
      ["OD", results.od],
    ] as const) {
      if (!eyeResult) continue;
      const urgency = eyeResult.overall_assessment?.referral_urgency;
      if (urgency === "immediate" || urgency === "urgent") {
        pushUrgentReferralAlert(patientId || eye, urgency);
      }
      for (const mod of [eyeResult.dr, eyeResult.glaucoma, eyeResult.amd, eyeResult.myopia]) {
        if (mod?.decision === "REJECT") {
          pushRejectAlert(`${eye} 분석`, mod.audit_trail?.reason as string | undefined);
        }
      }
    }
    enqueuedRef.current = results.analyzed_at;
  }, [results, originalImages, enqueueFromFundus, patientId]);

  if (!results?.os && !results?.od) {
    return (
      <div className="rounded-xl border border-border bg-surface p-10 text-center">
        <p className="text-ink-muted">아직 분석 결과가 없습니다.</p>
        <Link
          to="/portal/fundus/upload"
          className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
        >
          안저 업로드로 이동 →
        </Link>
      </div>
    );
  }

  const handleFhirExportBoth = () => {
    const entries: object[] = [];
    for (const eye of ["OS", "OD"] as const) {
      const result = eye === "OS" ? results.os : results.od;
      if (!result) continue;
      const bundle = buildFhirBundle(eye, result, patientId);
      if ("entry" in bundle && Array.isArray((bundle as { entry: object[] }).entry)) {
        entries.push(...(bundle as { entry: object[] }).entry);
      }
    }
    if (entries.length === 0) return;
    downloadJson(`fhir-fundus-bilateral-${patientId || "anon"}.json`, {
      resourceType: "Bundle",
      type: "collection",
      timestamp: new Date().toISOString(),
      entry: entries,
    });
  };

  const hasBothEyes = Boolean(results.os && results.od);

  const handleFhirExport = (eye: "OS" | "OD") => {
    const result = eye === "OS" ? results.os : results.od;
    if (!result) return;
    downloadJson(
      `fhir-fundus-${eye}-${patientId || "anon"}.json`,
      buildFhirBundle(eye, result, patientId),
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">안저 종합 분석 결과</h1>
          <p className="mt-1 text-sm text-ink-muted">
            DR · Glaucoma · AMD · Myopia · 28-class Screening (5질환)
            {patientId ? ` · 환자 ID: ${patientId}` : " · 환자 ID 미입력"}
            {results.analyzed_at && (
              <span className="ml-2 text-ink-subtle">
                · {new Date(results.analyzed_at).toLocaleString("ko-KR")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            data-testid="compare-mode-toggle"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
              compareMode
                ? "border-warning-strong bg-warning-muted text-warning-strong"
                : "border-border-strong text-ink-secondary hover:border-primary"
            }`}
          >
            <GitCompare className="size-4" aria-hidden />
            Compare 모드
          </button>
          <Link
            to="/portal/fundus/upload"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-2 text-sm text-ink-secondary hover:border-primary"
          >
            추가 업로드
          </Link>
          {hasBothEyes && (
            <button
              type="button"
              data-testid="fhir-export-both"
              onClick={handleFhirExportBoth}
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary-muted px-3 py-2 text-sm text-primary hover:border-primary"
            >
              <Download className="size-4" aria-hidden />
              양안 FHIR보내기
            </button>
          )}
        </div>
      </header>

      <div className="rounded-lg border border-primary/20 bg-primary-muted px-4 py-3 text-sm text-primary-hover">
        <strong>Fast vs Precise</strong> — 서로 다른 모델 파이프라인이라 결과가 다를 수 있습니다.
        Fast는 v10 단일 ONNX 스크리닝(~1s), Precise는 5개 독립 모델 + 4-agent 검증(~40s/안)입니다.
        이미 분석한 모드는 <strong>캐시</strong>에서 즉시 전환됩니다.
        {lastCacheHit && <span className="ml-2">(방금 캐시 사용)</span>}
      </div>

      {reanalyzeError && (
        <div role="alert" className="rounded-lg border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger">
          {reanalyzeError}
        </div>
      )}

      {reanalyzingEye && reanalyzingMode && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-muted px-4 py-3 text-sm text-primary-hover"
        >
          <Loader2 className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
          <span>
            <strong>{reanalyzingEye === "OS" ? "좌안(OS)" : "우안(OD)"}</strong>
            {" · "}
            {reanalyzingMode === "precise"
              ? "Precise 분석 진행 중 (5모델 · 약 30~45초) — 완료될 때까지 기다려 주세요"
              : "Fast 분석 진행 중 (v10 · 약 1~6초)…"}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-4" data-testid="bilateral-results">
        <BilateralView
          data={results}
          originalImages={originalImages}
          compareMode={compareMode}
          onFhirExport={handleFhirExport}
          onReanalyzeEye={(eye, mode) => switchEyeMode(eye, mode).then(() => undefined)}
          reanalyzingEye={reanalyzingEye}
          reanalyzingMode={reanalyzingMode}
        />
      </div>

      <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
        <Download className="size-3.5" aria-hidden />
        FHIR R4 Bundle은 Observation 컬렉션 형태로 로컬 JSON 다운로드됩니다.
      </p>
    </div>
  );
}
