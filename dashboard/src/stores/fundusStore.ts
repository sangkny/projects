import { create } from "zustand";

import type { BilateralComprehensiveResult, ComprehensiveResult, EyeSide } from "../types/fundus";

export interface FundusAnalysisState {
  patientId: string;
  activeEye: EyeSide;
  originalImages: { os?: string; od?: string };
  results: BilateralComprehensiveResult | null;
  compareMode: boolean;

  setPatientId: (id: string) => void;
  setActiveEye: (eye: EyeSide) => void;
  setCompareMode: (on: boolean) => void;
  setOriginalImage: (eye: "OS" | "OD", dataUrl: string) => void;
  setEyeResult: (eye: "OS" | "OD", result: ComprehensiveResult) => void;
  setResults: (results: BilateralComprehensiveResult) => void;
  reset: () => void;
}

const initialResults = (): BilateralComprehensiveResult => ({
  os: null,
  od: null,
  patient_id: undefined,
  analyzed_at: undefined,
});

export const useFundusStore = create<FundusAnalysisState>()((set) => ({
  patientId: "",
  activeEye: "OD",
  originalImages: {},
  results: null,
  compareMode: false,

  setPatientId: (patientId) => set({ patientId }),
  setActiveEye: (activeEye) => set({ activeEye }),
  setCompareMode: (compareMode) => set({ compareMode }),
  setOriginalImage: (eye, dataUrl) =>
    set((s) => ({
      originalImages: {
        ...s.originalImages,
        [eye === "OS" ? "os" : "od"]: dataUrl,
      },
    })),
  setEyeResult: (eye, result) =>
    set((s) => {
      const base = s.results ?? initialResults();
      return {
        results: {
          ...base,
          [eye === "OS" ? "os" : "od"]: result,
          patient_id: s.patientId || base.patient_id,
          analyzed_at: new Date().toISOString(),
        },
      };
    }),
  setResults: (results) => set({ results }),
  reset: () =>
    set({
      patientId: "",
      activeEye: "OD",
      originalImages: {},
      results: null,
      compareMode: false,
    }),
}));
