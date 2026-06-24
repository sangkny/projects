import type { BilateralComprehensiveResult, ComprehensiveResult, HeatmapPayload } from "../types/fundus";
import type { ReviewListItem } from "../types/clinical";

/** localStorage persist key (v2 — v1 legacy key는 자동 폐기) */
export const REVIEW_STORAGE_KEY = "medi-portal-reviews-v2";

/** @deprecated v1 — getItem/setItem 시 제거·마이그레이션 대상 */
export const REVIEW_STORAGE_KEY_LEGACY = "medi-portal-reviews";

/** localStorage에 유지할 리뷰 큐 최대 건수 */
export const MAX_REVIEW_QUEUE = 20;

type PersistEnvelope = { state?: { items?: ReviewListItem[] }; version?: number };

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

function migratePersistEnvelope(parsed: PersistEnvelope): PersistEnvelope {
  const items = parsed.state?.items;
  if (!Array.isArray(items)) return parsed;
  return {
    ...parsed,
    state: {
      ...parsed.state,
      items: trimReviewQueue(items.map(stripHeavyFromReviewItem)),
    },
  };
}

function serializeMigrated(parsed: PersistEnvelope): string {
  return JSON.stringify(migratePersistEnvelope(parsed));
}

/** legacy v1 키 제거 — quota 확보 */
export function clearLegacyReviewStorage(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(REVIEW_STORAGE_KEY_LEGACY);
  } catch {
    /* ignore */
  }
}

function isQuotaError(err: unknown): boolean {
  return (
    err instanceof DOMException &&
    (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)
  );
}

function trySetItem(base: Storage, key: string, value: string): boolean {
  try {
    base.setItem(key, value);
    return true;
  } catch (err) {
    if (!isQuotaError(err)) throw err;
    return false;
  }
}

function shrinkAndRetrySet(base: Storage, key: string, value: string): void {
  clearLegacyReviewStorage();

  if (trySetItem(base, key, value)) return;

  try {
    const parsed = JSON.parse(value) as PersistEnvelope;
    const items = parsed?.state?.items;
    if (!Array.isArray(items)) return;

    for (const keep of [10, 5, 2, 1, 0]) {
      parsed.state = {
        ...parsed.state,
        items: items.slice(0, keep).map(stripHeavyFromReviewItem),
      };
      if (trySetItem(base, key, JSON.stringify(parsed))) return;
    }
  } catch {
    /* parse/trim 실패 — 조용히 스킵 */
  }

  try {
    base.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** QuotaExceeded 시 legacy 제거 + trim 재시도; getItem 시 strip 마이그레이션 */
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
      clearLegacyReviewStorage();

      let raw = base.getItem(key);
      if (!raw && key === REVIEW_STORAGE_KEY) {
        raw = base.getItem(REVIEW_STORAGE_KEY_LEGACY);
        if (raw) {
          try {
            base.removeItem(REVIEW_STORAGE_KEY_LEGACY);
          } catch {
            /* ignore */
          }
        }
      }

      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw) as PersistEnvelope;
        const migrated = serializeMigrated(parsed);
        if (migrated.length < raw.length) {
          trySetItem(base, key, migrated);
          clearLegacyReviewStorage();
        }
        return migrated;
      } catch {
        try {
          base.removeItem(key);
          base.removeItem(REVIEW_STORAGE_KEY_LEGACY);
        } catch {
          /* ignore */
        }
        return null;
      }
    },
    key(index: number): string | null {
      return base.key(index);
    },
    removeItem(key: string): void {
      base.removeItem(key);
      if (key === REVIEW_STORAGE_KEY) clearLegacyReviewStorage();
    },
    setItem(key: string, value: string): void {
      shrinkAndRetrySet(base, key, value);
    },
  };
}

if (typeof window !== "undefined") {
  clearLegacyReviewStorage();
}
