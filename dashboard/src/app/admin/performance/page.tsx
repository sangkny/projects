import type { ReactElement } from "react";
import { Activity, TrendingUp } from "lucide-react";

import { PerformanceMetricCard } from "../../../components/admin/PerformanceMetricCard";
import { PERFORMANCE_METRICS, V10C_SNAPSHOT } from "../../../data/performanceSnapshot";

export default function AdminPerformancePage(): ReactElement {
  const independent = PERFORMANCE_METRICS.filter((m) => m.id !== "v10c");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-ink">성능 모니터</h1>
        <p className="mt-1 text-sm text-ink-muted">
          v10c 운영 스냅샷 · MODEL-VERSION-HISTORY SSOT (시계열 미제공)
        </p>
      </header>

      <section
        className="rounded-xl border border-admin-primary/30 bg-admin-muted p-5"
        data-testid="v10c-banner"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Activity className="size-6 text-admin-primary" aria-hidden />
          <div>
            <p className="m-0 text-sm font-semibold text-ink">
              v10c fast · composite={V10C_SNAPSHOT.composite} · GL AUC={V10C_SNAPSHOT.glAuc}
            </p>
            <p className="m-0 mt-1 text-xs text-ink-muted">
              {V10C_SNAPSHOT.inferenceMode} · {V10C_SNAPSHOT.onnx} · gl_weight=
              {V10C_SNAPSHOT.glWeight}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
          <TrendingUp className="size-5 text-admin-primary" aria-hidden />
          운영 모델 지표 (5 독립 + v10c)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PERFORMANCE_METRICS.map((m) => (
            <PerformanceMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="m-0 text-sm font-semibold text-ink">독립 모델 요약</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs text-ink-muted">
            <tr>
              <th className="pb-2">질환</th>
              <th className="pb-2">모델</th>
              <th className="pb-2">지표</th>
            </tr>
          </thead>
          <tbody>
            {independent.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="py-2 font-medium text-ink">{m.disease}</td>
                <td className="py-2 text-ink-secondary">{m.model}</td>
                <td className="py-2 tabular-nums text-admin-primary">
                  {m.metric} {m.value.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
