import type { ReactElement } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import type { OntologyRuleStatus } from "../../types/admin";

export interface OntologySummaryCardProps {
  sampleSize: number;
  passRate: number;
  needsReviewRate: number;
  rules: OntologyRuleStatus[];
  tier0LastRun: string;
}

export function OntologySummaryCard({
  sampleSize,
  passRate,
  needsReviewRate,
  rules,
  tier0LastRun,
}: OntologySummaryCardProps): ReactElement {
  return (
    <div className="space-y-6" data-testid="ontology-summary">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="최근 N건 통과율"
          value={`${(passRate * 100).toFixed(1)}%`}
          testId="ontology-pass-rate"
        />
        <StatTile
          label="검토 필요 비율"
          value={`${(needsReviewRate * 100).toFixed(1)}%`}
          testId="ontology-needs-review"
        />
        <StatTile label="표본 (N)" value={String(sampleSize)} testId="ontology-sample-size" />
      </div>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="m-0 text-sm font-semibold text-ink">핵심 규칙 통과 현황</h2>
        <ul className="mt-3 space-y-2">
          {rules.map((rule) => (
            <li
              key={rule.code}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2"
              data-testid={`ontology-rule-${rule.code}`}
            >
              <div className="flex items-center gap-2">
                {rule.passRate >= 0.9 ? (
                  <CheckCircle2 className="size-4 text-success" aria-hidden />
                ) : (
                  <XCircle className="size-4 text-warning" aria-hidden />
                )}
                <div>
                  <p className="m-0 text-sm font-medium text-ink">{rule.code}</p>
                  <p className="m-0 text-xs text-ink-muted">{rule.label}</p>
                </div>
              </div>
              <span className="text-sm font-semibold tabular-nums text-admin-primary">
                {(rule.passRate * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-ink-subtle" data-testid="ontology-tier0">
        Tier0 마지막 실행: <strong>{tier0LastRun}</strong> (정적 표시 · 자동 연동 추후)
      </p>
    </div>
  );
}

function StatTile({
  label,
  value,
  testId,
}: {
  label: string;
  value: string;
  testId: string;
}): ReactElement {
  return (
    <article
      data-testid={testId}
      className="rounded-xl border border-admin-primary/20 bg-admin-muted p-4"
    >
      <p className="m-0 text-xs text-ink-muted">{label}</p>
      <p className="m-0 mt-1 text-2xl font-bold text-admin-primary">{value}</p>
    </article>
  );
}
