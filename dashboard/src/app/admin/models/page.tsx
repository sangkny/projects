import { useMemo } from "react";
import { Activity, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ModelCardGrid } from "../../../components/ModelCard";
import { PRODUCTION_MODELS } from "../../../types/model";

export default function AdminModelsPage() {
  const chartData = useMemo(
    () =>
      PRODUCTION_MODELS.filter((m) => m.status === "production").map((m) => ({
        name: m.disease,
        value: m.metric_value,
        metric: m.metric,
      })),
    [],
  );

  const multidisease = PRODUCTION_MODELS.find((m) => m.id === "multidisease_v1");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">모델 현황</h1>
        <p className="mt-1 text-sm text-slate-400">
          ch41 SSOT · 운영 5질환 + v10 fast mode
        </p>
      </header>

      {PRODUCTION_MODELS.find((m) => m.id === "v10_multitask") && (
        <section className="rounded-xl border border-violet-900/50 bg-violet-950/30 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Activity className="size-5 text-violet-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-violet-200">
                v10c fast mode · composite=0.8842 · GL AUC=0.835 · 웜 ~340ms
              </p>
              <p className="text-xs text-violet-300/80">
                5-head ONNX (export_v10.py) · comprehensive ?mode=fast · gl_weight=0.28 ✅ 운영
              </p>
            </div>
            <span className="ml-auto rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
              fast ⚡
            </span>
          </div>
        </section>
      )}

      {multidisease && (
        <section className="rounded-xl border border-green-900/50 bg-green-950/30 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Activity className="size-5 text-green-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-green-200">
                multidisease_v1 운영 중 · val mAUC=0.9610 · test=0.8937
              </p>
              <p className="text-xs text-green-300/80">
                28-class · 9,592장 (RFMiD+ODIR) · ONNX 68MB · screening API ✅
              </p>
            </div>
            <span className="ml-auto rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
              운영중
            </span>
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <TrendingUp className="size-5 text-violet-400" aria-hidden />
          운영 모델 메트릭
        </h2>
        <div className="mb-6 h-56 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <YAxis domain={[0, 1]} tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "#0F172A",
                  border: "1px solid #334155",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#E2E8F0" }}
              />
              <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <ModelCardGrid models={PRODUCTION_MODELS} />
      </section>
    </div>
  );
}
