import type { ReactElement } from "react";

import type { AuditDecision, AuditLogEntry } from "../../types/admin";
import { cn } from "../../utils/cn";

const DECISION_CLASS: Record<AuditDecision, string> = {
  APPROVE: "bg-success-muted text-success",
  REVISE: "bg-warning-muted text-warning",
  REJECT: "bg-danger-muted text-danger",
};

const KIND_LABEL: Record<AuditLogEntry["kind"], string> = {
  pipeline: "Pipeline",
  partner_register: "REGISTER",
  partner_analyze: "ANALYZE",
  review: "Review",
};

export interface AuditLogTableProps {
  items: AuditLogEntry[];
}

export function AuditLogTable({ items }: AuditLogTableProps): ReactElement {
  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted" data-testid="audit-empty">
        조건에 맞는 감사 로그가 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border" data-testid="audit-log-table">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-border bg-surface-muted text-xs uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">시각</th>
            <th className="px-4 py-3">유형</th>
            <th className="px-4 py-3">환자/파트너</th>
            <th className="px-4 py-3">Decision</th>
            <th className="px-4 py-3">Reason / Threshold</th>
            <th className="px-4 py-3">출처</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 text-ink-secondary">
                {new Date(row.occurredAt).toLocaleString("ko-KR")}
              </td>
              <td className="px-4 py-3 font-medium text-ink">{KIND_LABEL[row.kind]}</td>
              <td className="px-4 py-3 text-ink-secondary">
                {row.patientId ?? row.partnerId ?? "—"}
              </td>
              <td className="px-4 py-3">
                {row.decision ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      DECISION_CLASS[row.decision],
                    )}
                  >
                    {row.decision}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-xs text-ink-muted">
                {row.reason ?? "—"}
                {row.threshold != null && (
                  <span className="ml-1 text-ink-subtle">· θ={row.threshold}</span>
                )}
                {row.confidence != null && (
                  <span className="ml-1 text-ink-subtle">· conf={row.confidence.toFixed(3)}</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-ink-subtle">{row.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
