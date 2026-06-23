import type { PerformanceMetric } from "../types/admin";

/** MODEL-VERSION-HISTORY.md · v10c 운영 스냅샷 (시계열 없음) */
export const V10C_SNAPSHOT = {
  composite: 0.8842,
  glAuc: 0.835,
  inferenceMode: "fast(v10)",
  onnx: "retinal_v10c.onnx",
  glWeight: 0.28,
} as const;

export const PERFORMANCE_METRICS: PerformanceMetric[] = [
  {
    id: "v10c",
    label: "Multitask fast",
    disease: "v10c",
    model: "retinal_v10c",
    metric: "composite",
    value: V10C_SNAPSHOT.composite,
    status: "production",
    notes: `GL AUC ${V10C_SNAPSHOT.glAuc} · gl_weight ${V10C_SNAPSHOT.glWeight}`,
  },
  {
    id: "dr_v4",
    label: "DR",
    disease: "DR",
    model: "retinal_v4",
    metric: "QWK",
    value: 0.8204,
    status: "production",
  },
  {
    id: "gl_v2",
    label: "Glaucoma",
    disease: "GL",
    model: "retinal_glaucoma_v2",
    metric: "AUC",
    value: 0.946,
    status: "production",
    notes: "앙상블 fast GL 0.900+",
  },
  {
    id: "amd_v1",
    label: "AMD",
    disease: "AMD",
    model: "retinal_amd_v1",
    metric: "AUC",
    value: 0.9803,
    status: "production",
  },
  {
    id: "myo_v1",
    label: "Myopia",
    disease: "MYO",
    model: "retinal_myopia_v1",
    metric: "AUC",
    value: 0.946,
    status: "production",
  },
  {
    id: "multi_v1",
    label: "Multidisease",
    disease: "Multi",
    model: "multidisease_v1",
    metric: "mAUC",
    value: 0.961,
    status: "production",
    notes: "28-class screening",
  },
];
