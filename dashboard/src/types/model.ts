/** ch41 model registry types for ModelCard */

export type ModelStatus = "production" | "reference" | "training" | "deprecated";

export interface ModelRecord {
  id: string;
  disease: string;
  version: string;
  metric: "QWK" | "AUC" | "mAUC";
  metric_value: number;
  status: ModelStatus;
  deployed_at?: string;
  confidence?: number;
  notes?: string;
  onnx_path?: string;
}

/** ch41 SSOT — 운영 4질환 + training */
export const PRODUCTION_MODELS: ModelRecord[] = [
  {
    id: "dr_v4",
    disease: "DR",
    version: "retinal_v4",
    metric: "QWK",
    metric_value: 0.8204,
    status: "production",
    deployed_at: "2026-05",
    confidence: 0.766,
    onnx_path: "models/retinal_v4.onnx",
  },
  {
    id: "glaucoma_v2",
    disease: "Glaucoma",
    version: "retinal_glaucoma_v2",
    metric: "AUC",
    metric_value: 0.946,
    status: "production",
    deployed_at: "2026-06",
    onnx_path: "models/retinal_glaucoma_v2.onnx",
  },
  {
    id: "amd_v1",
    disease: "AMD",
    version: "retinal_amd_v1",
    metric: "AUC",
    metric_value: 0.9803,
    status: "production",
    deployed_at: "2026-06",
    onnx_path: "models/retinal_amd_v1.onnx",
  },
  {
    id: "myopia_v1",
    disease: "Myopia",
    version: "retinal_myopia_v1",
    metric: "AUC",
    metric_value: 0.946,
    status: "production",
    deployed_at: "2026-06",
    onnx_path: "models/retinal_myopia_v1.onnx",
  },
  {
    id: "multidisease_v1",
    disease: "Multidisease",
    version: "retinal_multidisease_v1",
    metric: "mAUC",
    metric_value: 0.961,
    status: "production",
    deployed_at: "2026-06",
    notes: "28-class · 9,592장 · test mAUC=0.8937",
    onnx_path: "models/retinal_multidisease_v1.onnx",
  },
];

export const STATUS_LABELS: Record<ModelStatus, string> = {
  production: "운영",
  reference: "참조",
  training: "훈련 중",
  deprecated: "폐기",
};

export const STATUS_COLORS: Record<ModelStatus, string> = {
  production: "#16A34A",
  reference: "#64748B",
  training: "#2563EB",
  deprecated: "#94A3B8",
};
