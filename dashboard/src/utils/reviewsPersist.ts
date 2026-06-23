import type { BilateralComprehensiveResult, ComprehensiveResult, HeatmapPayload } from "../types/fundus";
import type { ReviewListItem } from "../types/clinical";

/** localStorage에 유지할 리뷰 큐 최대 건수 */
export const MAX_REVIEW_QUEUE = 20;

function stripHeatmapPayload(hm: HeatmapPayload | undefined): HeatmapPayload | undefined {
  if (!hm) return hm;
  const { image_base64: _img, ...rest } = hm;
  return rest;
}

function stripEyeResult(result: ComprehensiveResult): ComprehensiveResult {
  if (!result.heatmap) return result;
  const heatmap = result.heatmap as Record<string, HeatmapPayload | undefined>;
  const stripped: Record<string, HeatmapPayload | undefined> = {};
  for (const [key, val] of Object.entries(heatmap)) {
    stripped[key] = stripHeatmapPayload(val);
  }
  return { ...result, heatmap: stripped as ComprehensiveResult["heatmap"] };
}

/** GradCAM base64 등 대용량 필드 제거 — persist 전용 */
export function stripHeavyFromComprehensive(
  data: BilateralComprehensiveResult,
): BilateralComprehensiveResult {
  return {
    ...data,
    os: data.os ? stripEyeResult(data.os) : data.os,
    od: data.od ? stripEyeResult(data.od) : data.od,
  };
}

/** 리뷰 큐 항목을 localStorage용으로 축소 */
export function stripHeavyFromReviewItem(item: ReviewListItem): ReviewListItem {
  const { originalImages: _orig, ...rest } = item;
  return {
    ...rest,
    snapshot: item.snapshot ? stripHeavyFromComprehensive(item.snapshot) : undefined,
  };
}

export function trimReviewQueue(items: ReviewListItem[]): ReviewListItem[] {
  return items.slice(0, MAX_REVIEW_QUEUE);
}

/** QuotaExceeded 시 오래된 항목 제거 후 재시도, 실패 시 조용히 스킵 */
export function createSafeReviewStorage(): Storage {
  const base = localStorage;

  return {
    get length() {
      return base.length;
    },
    clear(): void {
      base.clear();
    },
    getItem(key: string): string | null {
      return base.getItem(key);
    },
    key(index: number): string | null {
      return base.key(index);
    },
    removeItem(key: string): void {
      base.removeItem(key);
    },
    setItem(key: string, value: string): void {
      try {
        base.setItem(key, value);
        return;
      } catch (err) {
        if (!isQuotaError(err)) throw err;
      }

      try {
        const parsed = JSON.parse(value) as { state?: { items?: ReviewListItem[] }; version?: number };
        const items = parsed?.state?.items;
        if (!Array.isArray(items)) return;

        for (const keep of [10, 5, 2, 1, 0]) {
          parsed.state = { ...parsed.state, items: items.slice(0, keep).map(stripHeavyFromReviewItem) };
          try {
            base.setItem(key, JSON.stringify(parsed));
            return;
          } catch (retryErr) {
            if (!isQuotaError(retryErr)) throw retryErr;
          }
        }
      } catch {
        /* parse/trim 실패 — 조용히 스킵 */
      }
    },
  };
}

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)
  );
}
