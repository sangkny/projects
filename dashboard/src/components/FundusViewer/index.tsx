import { useCallback, useState, type CSSProperties, type ReactElement, type WheelEvent } from "react";

import type { LesionAnnotation } from "../../types/fundus";

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

const viewerStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  aspectRatio: "4/3",
  borderRadius: 12,
  overflow: "hidden",
  background: "#0F172A",
  touchAction: "none",
};

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

  return (
    <div className={className}>
      {eyeSide && (
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#334155" }}>
          {eyeSide === "OS" ? "좌안 (OS)" : "우안 (OD)"}
        </div>
      )}

      <div
        style={viewerStyle}
        onWheel={handleWheel}
        role="img"
        aria-label="안저 GradCAM 비교 뷰어"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={originalSrc}
            alt="원본 안저"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
            draggable={false}
          />
          {hasHeatmap && heatmapSrc && (
            <img
              src={heatmapSrc.startsWith("data:") ? heatmapSrc : `data:image/jpeg;base64,${heatmapSrc}`}
              alt="GradCAM heatmap"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                clipPath: `inset(0 ${100 - slider}% 0 0)`,
                opacity: 0.85,
              }}
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
            style={{
              position: "absolute",
              bottom: 12,
              left: "10%",
              width: "80%",
              zIndex: 2,
            }}
          />
        )}
      </div>

      {(lesionAnnotations.length > 0 || hotspotRegions.length > 0) && (
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {lesionAnnotations.map((lesion) => (
            <button
              key={`${lesion.type}-${lesion.region}`}
              type="button"
              onClick={() =>
                setActiveLesion(activeLesion === lesion.type ? null : lesion.type)
              }
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid #CBD5E1",
                background: highlighted.includes(lesion.type) ? "#DBEAFE" : "#FFF",
                fontSize: 12,
                cursor: "pointer",
              }}
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
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid #CBD5E1",
                  background: highlighted.includes(r) ? "#DBEAFE" : "#FFF",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {r}
              </button>
            ))}
        </div>
      )}

      {onDownload && (
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["original", "heatmap", "overlay"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onDownload(kind)}
              disabled={kind !== "original" && !hasHeatmap}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid #CBD5E1",
                background: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              {kind === "original" ? "원본" : kind === "heatmap" ? "히트맵" : "오버레이"} 다운로드
            </button>
          ))}
        </div>
      )}

      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 8 }}>
        OpenSeadragon 연동 예정 · 휠 줌 {zoom.toFixed(1)}×
      </p>
    </div>
  );
}

export default FundusViewer;
