import { useMemo, type ReactElement } from "react";

import { ComprehensiveCard } from "../ComprehensiveCard";
import { FundusViewer } from "../FundusViewer";
import { sameImageUploaded, useFundusStore } from "../../stores/fundusStore";
import type { BilateralComprehensiveResult, ComprehensiveResult, HeatmapPayload, InferenceMode } from "../../types/fundus";
import { resultsNearlyIdentical } from "../../utils/fundusAnalysisCache";
import { collectEyesByUrgency, formatEyeSides } from "../../types/fundus";
import { cn } from "../../utils/cn";

export interface BilateralViewProps {
  data: BilateralComprehensiveResult;
  /** Original image URLs per eye */
  originalImages?: { os?: string; od?: string };
  compareMode?: boolean;
  onFhirExport?: (eye: "OS" | "OD") => void;
  onReanalyzeEye?: (eye: "OS" | "OD", mode: InferenceMode) => Promise<void>;
  reanalyzingEye?: "OS" | "OD" | null;
  reanalyzingMode?: InferenceMode | null;
  className?: string;
}

function pickHeatmap(
  result: ComprehensiveResult | null | undefined,
  task: "dr" | "glaucoma" | "amd" | "myopia",
): HeatmapPayload | undefined {
  if (!result?.heatmap) return undefined;
  const hm = result.heatmap as Record<string, HeatmapPayload>;
  return hm[task] ?? hm.glaucoma ?? hm.dr;
}

function decisionsMismatch(os?: ComprehensiveResult | null, od?: ComprehensiveResult | null): boolean {
  if (!os || !od) return false;
  const keys = ["dr", "glaucoma", "amd", "myopia"] as const;
  for (const k of keys) {
    const a = k === "dr" ? os.dr.decision : os[k]?.decision;
    const b = k === "dr" ? od.dr.decision : od[k]?.decision;
    if (a && b && a !== b) return true;
  }
  return false;
}

function EyePanel({
  side,
  result,
  originalSrc,
  imageFingerprint,
  cachedModes,
  onFhirExport,
  onReanalyze,
  reanalyzing,
  reanalyzingMode,
  highlight,
}: {
  side: "OS" | "OD";
  result: ComprehensiveResult | null | undefined;
  originalSrc?: string;
  imageFingerprint?: string;
  cachedModes?: InferenceMode[];
  onFhirExport?: () => void;
  onReanalyze?: (mode: InferenceMode) => Promise<void>;
  reanalyzing?: boolean;
  reanalyzingMode?: InferenceMode | null;
  highlight?: boolean;
}): ReactElement {
  if (!result) {
    return (
      <div className="min-h-[200px] rounded-[var(--radius-card)] border-2 border-dashed border-border-strong p-6 text-center text-ink-subtle">
        {side === "OS" ? "좌안" : "우안"} 미촬영
      </div>
    );
  }

  const heatmap = pickHeatmap(result, "glaucoma");
  const heatSrc = heatmap?.image_base64;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)]",
        highlight && "p-1 outline outline-2 outline-warning-strong",
      )}
    >
      {originalSrc && (
        <FundusViewer
          originalSrc={originalSrc}
          heatmapSrc={heatSrc}
          lesionAnnotations={heatmap?.lesion_annotations}
          hotspotRegions={heatmap?.hotspot_regions}
          eyeSide={side}
        />
      )}
      <div className="mt-3">
        <ComprehensiveCard
          result={result}
          eyeSide={side}
          onFhirExport={onFhirExport}
          onReanalyze={onReanalyze}
          reanalyzing={reanalyzing}
          reanalyzingMode={reanalyzingMode}
          imageFingerprint={imageFingerprint}
          cachedModes={cachedModes}
        />
      </div>
    </div>
  );
}

export function BilateralView({
  data,
  originalImages,
  compareMode = false,
  onFhirExport,
  onReanalyzeEye,
  reanalyzingEye = null,
  reanalyzingMode = null,
  className,
}: BilateralViewProps): ReactElement {
  const mismatch = compareMode && decisionsMismatch(data.os, data.od);
  const eyeSlots = useFundusStore((s) => s.eyeSlots);

  const immediateEyes = useMemo(() => collectEyesByUrgency(data, "immediate"), [data]);
  const urgentEyes = useMemo(
    () => collectEyesByUrgency(data, "urgent").filter((s) => !immediateEyes.includes(s)),
    [data, immediateEyes],
  );

  const modeLabels = useMemo(() => {
    const labels = new Set<string>();
    if (data.os?.overall_assessment.inference_mode) labels.add(data.os.overall_assessment.inference_mode);
    if (data.od?.overall_assessment.inference_mode) labels.add(data.od.overall_assessment.inference_mode);
    return [...labels];
  }, [data.os, data.od]);

  const duplicateImage = useMemo(() => sameImageUploaded(useFundusStore.getState()), [eyeSlots]);

  const duplicateResults = useMemo(
    () => Boolean(data.os && data.od && resultsNearlyIdentical(data.os, data.od)),
    [data.os, data.od],
  );

  const cachedModesFor = (side: "OS" | "OD"): InferenceMode[] => {
    const slot = eyeSlots[side === "OS" ? "os" : "od"];
    if (!slot?.byMode) return [];
    return (["fast", "precise"] as const).filter((m) => Boolean(slot.byMode[m]));
  };

  return (
    <section className={className} aria-label="좌우안 쌍 뷰">
      {(duplicateImage || duplicateResults) && (
        <div
          role="alert"
          className="mb-3 rounded-lg bg-amber-100 p-2.5 text-[13px] text-amber-900"
        >
          {duplicateImage && (
            <p className="m-0">
              ⚠️ 좌·우안에 <strong>동일 이미지</strong>가 업로드되었습니다. 서로 다른 안저 파일인지 확인하세요.
            </p>
          )}
          {duplicateResults && !duplicateImage && (
            <p className={cn("text-amber-900", duplicateImage ? "mt-2 mb-0" : "m-0")}>
              ⚠️ 좌·우 분석 수치가 거의 동일합니다. 이미지가 바뀌었는지·캐시가 맞는지 확인하세요.
            </p>
          )}
        </div>
      )}
      {mismatch && (
        <div
          role="alert"
          className="mb-3 rounded-lg bg-warning-muted p-2.5 text-[13px] text-amber-900"
        >
          좌/우안 decision 불일치 — compare 모드에서 확인하세요.
        </div>
      )}

      {immediateEyes.length > 0 && (
        <div
          role="alert"
          className="mb-3 rounded-lg bg-danger-muted p-2.5 text-sm font-semibold text-red-900"
        >
          ⚠️ {formatEyeSides(immediateEyes)} 즉시 의뢰 필요
        </div>
      )}

      {urgentEyes.length > 0 && (
        <div
          role="alert"
          className="mb-3 rounded-lg bg-warning-muted p-2.5 text-[13px] font-semibold text-amber-900"
        >
          🟠 {formatEyeSides(urgentEyes)} 48시간 내 내원 권장
        </div>
      )}

      {modeLabels.length > 1 && (
        <div className="mb-3 rounded-lg bg-info-muted p-2.5 text-xs text-primary-hover">
          좌·우안 분석 모드가 다릅니다: {modeLabels.join(" · ")}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        <EyePanel
          side="OS"
          result={data.os}
          originalSrc={originalImages?.os}
          imageFingerprint={eyeSlots.os?.fingerprint}
          cachedModes={cachedModesFor("OS")}
          onFhirExport={onFhirExport ? () => onFhirExport("OS") : undefined}
          onReanalyze={onReanalyzeEye ? (mode) => onReanalyzeEye("OS", mode) : undefined}
          reanalyzing={reanalyzingEye === "OS"}
          reanalyzingMode={reanalyzingEye === "OS" ? reanalyzingMode : null}
          highlight={mismatch && !!data.os}
        />
        <EyePanel
          side="OD"
          result={data.od}
          originalSrc={originalImages?.od}
          imageFingerprint={eyeSlots.od?.fingerprint}
          cachedModes={cachedModesFor("OD")}
          onFhirExport={onFhirExport ? () => onFhirExport("OD") : undefined}
          onReanalyze={onReanalyzeEye ? (mode) => onReanalyzeEye("OD", mode) : undefined}
          reanalyzing={reanalyzingEye === "OD"}
          reanalyzingMode={reanalyzingEye === "OD" ? reanalyzingMode : null}
          highlight={mismatch && !!data.od}
        />
      </div>
    </section>
  );
}

export default BilateralView;
