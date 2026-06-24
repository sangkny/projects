import type { StateStorage } from "zustand/middleware";

import { createSafeReviewStorage } from "./reviewsPersist";

/** zustand createJSONStorage용 — setItem/getItem 절대 throw 하지 않음 */
export function createNeverThrowReviewStorage(): StateStorage {
  const base = createSafeReviewStorage();
  return {
    getItem: (name) => {
      try {
        return base.getItem(name);
      } catch (err) {
        console.warn("[reviewsStorage] getItem failed (ignored):", err);
        return null;
      }
    },
    setItem: (name, value) => {
      try {
        base.setItem(name, value);
      } catch (err) {
        console.warn("[reviewsStorage] setItem failed (ignored):", err);
      }
    },
    removeItem: (name) => {
      try {
        base.removeItem(name);
      } catch (err) {
        console.warn("[reviewsStorage] removeItem failed (ignored):", err);
      }
    },
  };
}
