import type { BilateralComprehensiveResult, ComprehensiveResult, HeatmapPayload } from "../types/fundus";
import type { ReviewListItem } from "../types/clinical";

/** localStorage persist key (v2 — v1 legacy key는 자동 폐기) */
export const REVIEW_STORAGE_KEY = "medi-portal-reviews-v2";

/** @deprecated v1 — getItem/setItem 시 제거·마이그레이션 대상 */
export const REVIEW_STORAGE_KEY_LEGACY = "medi-portal-reviews";

/** localStorage에 유지할 리뷰 큐 최대 건수 */
export const MAX_REVIEW_QUEUE = 20;

/** zustand partialize 와 동일한 persist envelope */
export function buildPersistPayload(items: ReviewListItem[]): { state: { items: ReviewListItem[] } } {
  return {
    state: {
      items: trimReviewQueue(items.map(stripHeavyFromReviewItem)),
    },
  };
}

type PersistEnvelope = { state?: { items?: ReviewListItem[] }; version?: number };

const HEAVY_STRING_PREFIXES = ["data:image/", "data:application/"];
const HEAVY_KEY_NAMES = new Set([
  "image_base64",
  "originalImages",
  "originalImage",
  "imageBase64",
]);

/** 대용량 data URL (10KB 초과) */
function isHeavyDataUrl(value: string): boolean {
  if (value.length <= 10_000) return false;
  return HEAVY_STRING_PREFIXES.some((p) => value.startsWith(p));
}

/** 객체 트리 전체에서 base64·data URL·originalImages 제거 */
export function deepStripHeavy<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((v) => deepStripHeavy(v)) as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (HEAVY_KEY_NAMES.has(key)) continue;
      if (typeof val === "string" && isHeavyDataUrl(val)) continue;
      out[key] = deepStripHeavy(val);
    }
    return out as T;
  }
  return value;
}

function stripHeatmapPayload(hm: HeatmapPayload | undefined): HeatmapPayload | undefined {
  if (!hm) return hm;
  const { image_base64: _img, ...rest } = hm;
  return rest;
}

function stripEyeResult(result: ComprehensiveResult): ComprehensiveResult {
  const stripped = deepStripHeavy(result) as ComprehensiveResult;
  if (!result.heatmap) return stripped;
  const heatmap = result.heatmap as Record<string, HeatmapPayload | undefined>;
  const next: Record<string, HeatmapPayload | undefined> = {};
  for (const [key, val] of Object.entries(heatmap)) {
    next[key] = stripHeatmapPayload(val);
  }
  return { ...stripped, heatmap: next as ComprehensiveResult["heatmap"] };
}

/** GradCAM base64 등 대용량 필드 제거 — persist + 메모리 큐 공용 */
export function stripHeavyFromComprehensive(
  data: BilateralComprehensiveResult,
): BilateralComprehensiveResult {
  const base = deepStripHeavy(data) as BilateralComprehensiveResult;
  return {
    ...base,
    os: base.os ? stripEyeResult(base.os) : base.os,
    od: base.od ? stripEyeResult(base.od) : base.od,
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

function safeTrySetItem(base: Storage, key: string, value: string): boolean {
  try {
    base.setItem(key, value);
    return true;
  } catch (err) {
    if (!isQuotaError(err)) {
      console.warn("[reviewsPersist] setItem non-quota error (ignored):", err);
    }
    return false;
  }
}

/** 1→1건→0건→removeItem, 절대 throw 하지 않음 */
function shrinkAndRetrySet(base: Storage, key: string, value: string): void {
  clearLegacyReviewStorage();

  const stripped = (() => {
    try {
      const parsed = JSON.parse(value) as PersistEnvelope;
      return JSON.stringify(migratePersistEnvelope(parsed));
    } catch {
      return value;
    }
  })();

  if (safeTrySetItem(base, key, stripped)) return;

  try {
    const parsed = JSON.parse(stripped) as PersistEnvelope;
    const items = parsed?.state?.items;
    if (!Array.isArray(items)) {
      safeTrySetItem(base, key, JSON.stringify({ state: { items: [] }, version: 0 }));
      return;
    }

    for (const keep of [1, 0]) {
      parsed.state = {
        ...parsed.state,
        items: items.slice(0, keep).map(stripHeavyFromReviewItem),
      };
      parsed.version = parsed.version ?? 0;
      if (safeTrySetItem(base, key, JSON.stringify(parsed))) return;
    }
  } catch (err) {
    console.warn("[reviewsPersist] shrink parse failed (ignored):", err);
  }

  try {
    base.removeItem(key);
    clearLegacyReviewStorage();
  } catch (err) {
    console.warn("[reviewsPersist] removeItem failed (ignored):", err);
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
      try {
        base.clear();
      } catch (err) {
        console.warn("[reviewsPersist] clear failed (ignored):", err);
      }
    },
    getItem(key: string): string | null {
      try {
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

        const parsed = JSON.parse(raw) as PersistEnvelope;
        const migrated = serializeMigrated(parsed);
        if (migrated.length < raw.length) {
          safeTrySetItem(base, key, migrated);
          clearLegacyReviewStorage();
        }
        return migrated;
      } catch (err) {
        console.warn("[reviewsPersist] getItem failed, clearing key:", err);
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
      try {
        base.removeItem(key);
        if (key === REVIEW_STORAGE_KEY) clearLegacyReviewStorage();
      } catch (err) {
        console.warn("[reviewsPersist] removeItem failed (ignored):", err);
      }
    },
    setItem(key: string, value: string): void {
      shrinkAndRetrySet(base, key, value);
    },
  };
}

if (typeof window !== "undefined") {
  clearLegacyReviewStorage();
}
