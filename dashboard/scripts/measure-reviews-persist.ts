/**
 * reviews persist payload size measurement (STEP 2)
 * Run: npx tsx scripts/measure-reviews-persist.ts
 */
import type { ReviewListItem } from "../src/types/clinical";
import type { BilateralComprehensiveResult, HeatmapPayload } from "../src/types/fundus";
import {
  stripHeavyFromReviewItem,
  buildPersistPayload,
} from "../src/utils/reviewsPersist";

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fakeB64(kbSize: number): string {
  return `data:image/png;base64,${"A".repeat(kbSize * 1024)}`;
}

function heatmapPayload(kb: number): HeatmapPayload {
  return {
    image_base64: fakeB64(kb),
    lesion_annotations: [{ type: "cup_disc_asymmetry", confidence: 0.85, region: "optic_disc" }],
    hotspot_regions: ["cup_disc_asymmetry"],
  };
}

/** MEDI API realistic: top-level heatmap + nested glaucoma/amd/myopia.heatmap (duplicate) */
function buildRealisticEye(heatmapKb: number) {
  const hm = heatmapPayload(heatmapKb);
  return {
    dr: { dr_grade: 1, confidence: 0.82, decision: "REVISE" as const },
    glaucoma: {
      glaucoma_grade: 0,
      grade_label: "normal",
      label: "normal",
      probability: 0.12,
      risk_level: "LOW" as const,
      confidence: 0.88,
      heatmap: hm,
    },
    amd: { amd_grade: 0, grade_label: "normal", confidence: 0.91, heatmap: hm },
    myopia: { myopia_grade: 1, grade_label: "mild", confidence: 0.75, heatmap: hm },
    heatmap: {
      dr: hm,
      glaucoma: hm,
      amd: hm,
      myopia: hm,
    },
    overall_assessment: {
      referral_urgency: "routine" as const,
      primary_concern: "dr",
      findings: ["DR G1"],
      recommendation: "6개월 후 재검",
      inference_mode: "fast(v10)",
      inference_time_ms: 890,
    },
  };
}

function buildReviewItem(fundusKb: number, heatmapKb: number): ReviewListItem {
  const snapshot: BilateralComprehensiveResult = {
    patient_id: "PAT-001",
    analyzed_at: new Date().toISOString(),
    os: buildRealisticEye(heatmapKb),
    od: buildRealisticEye(heatmapKb),
  };
  return {
    id: "local-test",
    patientId: "PAT-001",
    createdAt: snapshot.analyzed_at!,
    primaryConcern: "dr",
    status: "pending_review",
    snapshot,
    originalImages: {
      os: fakeB64(fundusKb),
      od: fakeB64(fundusKb),
    },
  };
}

function measure(label: string, item: ReviewListItem) {
  const rawItem = JSON.stringify(item).length;
  const stripped = stripHeavyFromReviewItem(item);
  const strippedItem = JSON.stringify(stripped).length;
  const persist = JSON.stringify(buildPersistPayload([item])).length;
  console.log(
    `${label}\n  원본 item: ${kb(rawItem)}\n  strip 후 item: ${kb(strippedItem)}\n  persist envelope (partialize): ${kb(persist)}`,
  );
}

console.log("=== reviews localStorage payload measurement ===\n");
measure("양안 + heatmap 400KB×4×2위치 + fundus 1500KB (현실적)", buildReviewItem(1500, 400));
measure("양안 + heatmap 200KB (중간)", buildReviewItem(800, 200));
measure("E2E fixture scale (1x1 PNG)", buildReviewItem(0.001, 0.001));
