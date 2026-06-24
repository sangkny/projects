import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { BilateralComprehensiveResult } from "../types/fundus";
import type { ReviewApiStatus, ReviewListItem } from "../types/clinical";
import { urgencyFromAssessment } from "../types/fundus";
import {
  createSafeReviewStorage,
  REVIEW_STORAGE_KEY,
  stripHeavyFromReviewItem,
  trimReviewQueue,
} from "../utils/reviewsPersist";

const STORAGE_KEY = REVIEW_STORAGE_KEY;

interface ReviewsState {
  items: ReviewListItem[];
  enqueueFromFundus: (
    data: BilateralComprehensiveResult,
    originalImages: { os?: string; od?: string },
  ) => string;
  upsertApiReview: (item: ReviewListItem) => void;
  attachSnapshot: (id: string, snapshot: BilateralComprehensiveResult, images?: { os?: string; od?: string }) => void;
  updateStatus: (id: string, status: ReviewApiStatus, notes?: string) => void;
  getById: (id: string) => ReviewListItem | undefined;
  seedE2eItem: () => string;
}

function primaryConcernFrom(data: BilateralComprehensiveResult): string {
  const os = data.os?.overall_assessment.primary_concern;
  const od = data.od?.overall_assessment.primary_concern;
  return os && os !== "none" ? os : od && od !== "none" ? od : "none";
}

function newLocalId(): string {
  return `local-${crypto.randomUUID()}`;
}

function appendItem(items: ReviewListItem[], item: ReviewListItem): ReviewListItem[] {
  return trimReviewQueue([item, ...items]);
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      items: [],

      enqueueFromFundus: (data, originalImages) => {
        const id = newLocalId();
        const item: ReviewListItem = {
          id,
          patientId: data.patient_id ?? "—",
          createdAt: data.analyzed_at ?? new Date().toISOString(),
          primaryConcern: primaryConcernFrom(data),
          status: "pending_review",
          snapshot: data,
          originalImages,
        };
        set((s) => ({ items: appendItem(s.items, item) }));
        return id;
      },

      upsertApiReview: (item) => {
        set((s) => {
          const idx = s.items.findIndex(
            (x) => x.apiReviewId === item.apiReviewId || x.id === item.id,
          );
          if (idx >= 0) {
            const next = [...s.items];
            next[idx] = { ...next[idx], ...item };
            return { items: trimReviewQueue(next) };
          }
          return { items: appendItem(s.items, item) };
        });
      },

      attachSnapshot: (id, snapshot, images) => {
        set((s) => ({
          items: trimReviewQueue(
            s.items.map((it) =>
              it.id === id || it.apiReviewId === id
                ? {
                    ...it,
                    snapshot,
                    originalImages: images ?? it.originalImages,
                    primaryConcern: primaryConcernFrom(snapshot),
                  }
                : it,
            ),
          ),
        }));
      },

      updateStatus: (id, status, notes) => {
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id || it.apiReviewId === id
              ? { ...it, status, reviewNotes: notes }
              : it,
          ),
        }));
      },

      getById: (id) => get().items.find((it) => it.id === id || it.apiReviewId === id),

      seedE2eItem: () => {
        const existing = get().items.find((i) => i.patientId === "E2E-PATIENT");
        if (existing) return existing.id;

        const snapshot: BilateralComprehensiveResult = {
          patient_id: "E2E-PATIENT",
          analyzed_at: new Date().toISOString(),
          os: {
            dr: { dr_grade: 1, confidence: 0.72, decision: "REVISE" },
            overall_assessment: {
              referral_urgency: "routine",
              primary_concern: "dr",
              findings: ["DR G1"],
              recommendation: "정기 추적 권장",
              inference_mode: "fast(v10)",
              inference_time_ms: 1200,
            },
            heatmap: {
              glaucoma: {
                image_base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                lesion_annotations: [{ type: "cup_disc_asymmetry", confidence: 0.8, region: "optic_disc" }],
              },
            },
          },
        };

        const tiny =
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

        return get().enqueueFromFundus(snapshot, { os: tiny });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => createSafeReviewStorage()),
      partialize: (state) => ({
        items: trimReviewQueue(state.items.map(stripHeavyFromReviewItem)),
      }),
    },
  ),
);

/** Urgency label for list badge */
export function reviewUrgencyLabel(item: ReviewListItem): string {
  const os = item.snapshot?.os;
  if (!os) return "—";
  return urgencyFromAssessment(os.overall_assessment);
}

if (typeof window !== "undefined") {
  (window as unknown as { __seedE2eReview?: () => string }).__seedE2eReview = () =>
    useReviewsStore.getState().seedE2eItem();
}
