import { useMemo, type ReactElement } from "react";

import { ComprehensiveCard } from "../ComprehensiveCard";
import { FundusViewer } from "../FundusViewer";
import type { BilateralComprehensiveResult, ComprehensiveResult, HeatmapPayload } from "../../types/fundus";
import { URGENCY_ORDER, urgencyFromAssessment } from "../../types/fundus";

export interface BilateralViewProps {
  data: BilateralComprehensiveResult;
  /** Original image URLs per eye */
  originalImages?: { os?: string; od?: string };
  compareMode?: boolean;
  onFhirExport?: (eye: "OS" | "OD") => void;
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
    const a =
      k === "dr"
        ? os.dr.decision
        : os[k]?.decision;
    const b =
      k === "dr"
        ? od.dr.decision
        : od[k]?.decision;
    if (a && b && a !== b) return true;
  }
  return false;
}

function EyePanel({
  side,
  result,
  originalSrc,
  onFhirExport,
  highlight,
}: {
  side: "OS" | "OD";
  result: ComprehensiveResult | null | undefined;
  originalSrc?: string;
  onFhirExport?: () => void;
  highlight?: boolean;
}): ReactElement {
  if (!result) {
    return (
      <div
        style={{
          border: "2px dashed #CBD5E1",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          color: "#94A3B8",
          minHeight: 200,
        }}
      >
        {side === "OS" ? "좌안" : "우안"} 미촬영
      </div>
    );
  }

  const heatmap = pickHeatmap(result, "glaucoma");
  const heatSrc = heatmap?.image_base64;

  return (
    <div
      style={{
        outline: highlight ? "2px solid #EA580C" : undefined,
        borderRadius: 12,
        padding: highlight ? 4 : 0,
      }}
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
      <div style={{ marginTop: 12 }}>
        <ComprehensiveCard result={result} eyeSide={side} onFhirExport={onFhirExport} />
      </div>
    </div>
  );
}

export function BilateralView({
  data,
  originalImages,
  compareMode = false,
  onFhirExport,
  className,
}: BilateralViewProps): ReactElement {
  const mismatch = compareMode && decisionsMismatch(data.os, data.od);

  const sortedUrgency = useMemo(() => {
    const items: { side: "OS" | "OD"; u: number }[] = [];
    if (data.os) items.push({ side: "OS", u: URGENCY_ORDER[urgencyFromAssessment(data.os.overall_assessment)] });
    if (data.od) items.push({ side: "OD", u: URGENCY_ORDER[urgencyFromAssessment(data.od.overall_assessment)] });
    return items.sort((a, b) => a.u - b.u);
  }, [data.os, data.od]);

  return (
    <section className={className} aria-label="좌우안 쌍 뷰">
      {mismatch && (
        <div
          role="alert"
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            background: "#FFF7ED",
            color: "#9A3412",
            fontSize: 13,
          }}
        >
          좌/우안 decision 불일치 — compare 모드에서 확인하세요.
        </div>
      )}

      {sortedUrgency.length > 0 && sortedUrgency[0].u === 0 && (
        <div
          role="alert"
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            background: "#FEF2F2",
            color: "#991B1B",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          ⚠️ {sortedUrgency[0].side === "OS" ? "좌안" : "우안"} 즉시 의뢰 필요
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        <EyePanel
          side="OS"
          result={data.os}
          originalSrc={originalImages?.os}
          onFhirExport={onFhirExport ? () => onFhirExport("OS") : undefined}
          highlight={mismatch && !!data.os}
        />
        <EyePanel
          side="OD"
          result={data.od}
          originalSrc={originalImages?.od}
          onFhirExport={onFhirExport ? () => onFhirExport("OD") : undefined}
          highlight={mismatch && !!data.od}
        />
      </div>
    </section>
  );
}

export default BilateralView;
