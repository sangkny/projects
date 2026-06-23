import { useCallback, useState, type ReactElement, type WheelEvent } from "react";

import type { LesionAnnotation } from "../../types/fundus";
import { cn } from "../../utils/cn";

export interface FundusViewerProps {
  /** Original fundus image (data URL or https) */
  originalSrc: string;
  /** GradCAM heatmap overlay (base64 or data URL) */
  heatmapSrc?: string | null;
  /** Lesion annotations from API */
  lesionAnnotations?: LesionAnnotation[];
  hotspotRegions?: string[];
  eyeSide?: "OS" | "OD";
  onDownload?: (kind: "original" | "heatmap" | "overlay") => void;
  className?: string;
}

export function FundusViewer({
  originalSrc,
  heatmapSrc,
  lesionAnnotations = [],
  hotspotRegions = [],
  eyeSide,
  onDownload,
  className,
}: FundusViewerProps): ReactElement {
  const [slider, setSlider] = useState(50);
  const [activeLesion, setActiveLesion] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const hasHeatmap = Boolean(heatmapSrc);

  const highlighted = activeLesion ? [activeLesion] : hotspotRegions;

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((z) => Math.min(4, Math.max(1, z + (e.deltaY > 0 ? -0.1 : 0.1))));
  }, []);

  const lesionChipClass = (active: boolean) =>
    cn(
      "cursor-pointer rounded-full border border-border-strong px-2.5 py-1 text-xs",
      active ? "bg-primary-muted" : "bg-surface",
    );

  return (
    <div className={className}>
      {eyeSide && (
        <div className="mb-2 text-[13px] font-semibold text-ink-secondary">
          {eyeSide === "OS" ? "좌안 (OS)" : "우안 (OD)"}
        </div>
      )}

      <div
        className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-[var(--radius-card)] bg-admin-surface-elevated"
        onWheel={handleWheel}
        role="img"
        aria-label="안저 GradCAM 비교 뷰어"
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={originalSrc}
            alt="원본 안저"
            className="absolute inset-0 h-full w-full object-contain"
            draggable={false}
          />
          {hasHeatmap && heatmapSrc && (
            <img
              src={heatmapSrc.startsWith("data:") ? heatmapSrc : `data:image/jpeg;base64,${heatmapSrc}`}
              alt="GradCAM heatmap"
              className="absolute inset-0 h-full w-full object-contain opacity-85"
              style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}
              draggable={false}
            />
          )}
        </div>

        {hasHeatmap && (
          <input
            type="range"
            min={0}
            max={100}
            value={slider}
            onChange={(e) => setSlider(Number(e.target.value))}
            aria-label="원본과 히트맵 비교 슬라이더"
            className="absolute bottom-3 left-[10%] z-[2] w-[80%]"
          />
        )}
      </div>

      {(lesionAnnotations.length > 0 || hotspotRegions.length > 0) && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {lesionAnnotations.map((lesion) => (
            <button
              key={`${lesion.type}-${lesion.region}`}
              type="button"
              onClick={() =>
                setActiveLesion(activeLesion === lesion.type ? null : lesion.type)
              }
              className={lesionChipClass(highlighted.includes(lesion.type))}
            >
              {lesion.type}
              {lesion.region ? ` · ${lesion.region}` : ""}
            </button>
          ))}
          {hotspotRegions
            .filter((r) => !lesionAnnotations.some((l) => l.type === r))
            .map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveLesion(activeLesion === r ? null : r)}
                className={lesionChipClass(highlighted.includes(r))}
              >
                {r}
              </button>
            ))}
        </div>
      )}

      {onDownload && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {(["original", "heatmap", "overlay"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onDownload(kind)}
              disabled={kind !== "original" && !hasHeatmap}
              className="cursor-pointer rounded-md border border-border-strong bg-surface-muted px-3 py-1.5 text-xs hover:bg-border disabled:cursor-not-allowed disabled:opacity-50"
            >
              {kind === "original" ? "원본" : kind === "heatmap" ? "히트맵" : "오버레이"} 다운로드
            </button>
          ))}
        </div>
      )}

      <p className="mt-2 text-[11px] text-ink-subtle">
        OpenSeadragon 연동 예정 · 휠 줌 {zoom.toFixed(1)}×
      </p>
    </div>
  );
}

export default FundusViewer;
