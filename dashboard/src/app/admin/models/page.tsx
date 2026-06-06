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

/** GPU ep15 / target 30 epochs — ch41 training snapshot */
const MULTIDISEASE_TRAINING_PROGRESS = 50;
const MULTIDISEASE_LIVE_MAUC = 0.9526;

export default function AdminModelsPage() {
  const trainingProgress = useMemo(
    () => ({ multidisease_v1: MULTIDISEASE_TRAINING_PROGRESS }),
    [],
  );

  const chartData = useMemo(
    () =>
      PRODUCTION_MODELS.filter((m) => m.status === "production").map((m) => ({
        name: m.disease,
        value: m.metric_value,
        metric: m.metric,
      })),
    [],
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-white">모델 현황</h1>
        <p className="mt-1 text-sm text-slate-400">
          ch41 SSOT · 운영 4질환(DR/GL/AMD/MYO) + multidisease_v1 훈련 진행
        </p>
      </header>

      <section className="rounded-xl border border-blue-900/50 bg-blue-950/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Activity className="size-5 text-blue-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-blue-200">
              multidisease_v1 훈련 중 · ep15 mAUC={MULTIDISEASE_LIVE_MAUC}
            </p>
            <p className="text-xs text-blue-300/80">
              목표 mAUC≥0.85 달성 · 배포 전 Admin 검증 필요
            </p>
          </div>
          <div className="ml-auto w-full max-w-xs sm:w-48">
            <div className="mb-1 flex justify-between text-xs text-blue-300">
              <span>진행률</span>
              <span>{MULTIDISEASE_TRAINING_PROGRESS}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-950">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${MULTIDISEASE_TRAINING_PROGRESS}%` }}
              />
            </div>
          </div>
        </div>
      </section>

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

        <ModelCardGrid models={PRODUCTION_MODELS} trainingProgress={trainingProgress} />
      </section>
    </div>
  );
}
