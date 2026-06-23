import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  decideReview,
  fetchReviewQueue,
  MediApiError,
} from "../api/mediClient";
import { usePortalAuthStore } from "../stores/portalAuthStore";
import { useReviewsStore } from "../stores/reviewsStore";
import {
  DECISION_TO_API,
  type ReviewDecisionAction,
  type ReviewListItem,
} from "../types/clinical";

function mergeReviews(
  apiItems: ReviewListItem[],
  localItems: ReviewListItem[],
): ReviewListItem[] {
  const byApi = new Map<string, ReviewListItem>();
  for (const item of localItems) {
    if (item.apiReviewId) byApi.set(item.apiReviewId, item);
  }
  const merged: ReviewListItem[] = [];
  for (const api of apiItems) {
    const local = byApi.get(api.apiReviewId ?? api.id);
    merged.push(local ? { ...api, ...local, snapshot: local.snapshot ?? api.snapshot } : api);
  }
  const apiIds = new Set(merged.map((m) => m.apiReviewId ?? m.id));
  for (const local of localItems) {
    if (!local.apiReviewId && !apiIds.has(local.id)) merged.push(local);
    if (local.apiReviewId && !apiIds.has(local.apiReviewId)) merged.push(local);
  }
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function useClinicalReviews(status = "pending_review") {
  const token = usePortalAuthStore((s) => s.token);
  const localItems = useReviewsStore((s) => s.items);
  const upsertApiReview = useReviewsStore((s) => s.upsertApiReview);
  const updateStatus = useReviewsStore((s) => s.updateStatus);

  const query = useQuery({
    queryKey: ["clinical-reviews", status, token],
    queryFn: async () => {
      if (!token || token === "e2e-mock-token") {
        return localItems.filter((i) => i.status === status);
      }
      try {
        const res = await fetchReviewQueue(token, status);
        const apiItems: ReviewListItem[] = res.reviews.map((r) => ({
          id: r.id,
          apiReviewId: r.id,
          diagnosisId: r.diagnosis_id,
          patientId: r.diagnosis_id.slice(0, 8),
          createdAt: r.created_at,
          primaryConcern: "—",
          status: r.status,
        }));
        for (const item of apiItems) upsertApiReview(item);
        return mergeReviews(apiItems, useReviewsStore.getState().items);
      } catch (err) {
        if (err instanceof MediApiError && err.status === 401) throw err;
        return localItems.filter((i) => i.status === status);
      }
    },
    staleTime: 15_000,
  });

  const queryClient = useQueryClient();

  const decide = useMutation({
    mutationFn: async ({
      item,
      action,
      notes,
    }: {
      item: ReviewListItem;
      action: ReviewDecisionAction;
      notes: string;
    }) => {
      const apiStatus = DECISION_TO_API[action];
      const reviewId = item.apiReviewId ?? item.id;

      if (token && token !== "e2e-mock-token" && item.apiReviewId) {
        await decideReview(token, item.apiReviewId, {
          status: apiStatus,
          review_notes: notes || null,
        });
      }
      updateStatus(reviewId, apiStatus, notes);
      return { reviewId, apiStatus };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["clinical-reviews"] });
    },
  });

  return { ...query, decide };
}
