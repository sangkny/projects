import { useMemo, useState, type ReactElement } from "react";
import { Filter } from "lucide-react";

import { AuditLogTable } from "../../../components/admin/AuditLogTable";
import { useAdminAudit } from "../../../hooks/useAdminAudit";
import type { AuditDecision } from "../../../types/admin";

const DECISIONS: Array<AuditDecision | ""> = ["", "APPROVE", "REVISE", "REJECT"];

export default function AdminAuditPage(): ReactElement {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [decision, setDecision] = useState<AuditDecision | "">("");

  const filters = useMemo(() => ({ from, to, decision }), [from, to, decision]);
  const { data, isLoading } = useAdminAudit(filters);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">감사 로그</h1>
        <p className="mt-1 text-sm text-ink-muted">
          diagnosis_pipeline audit_trail · 파트너 REGISTER/ANALYZE 이력
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <Filter className="size-4 text-admin-primary" aria-hidden />
        <label className="text-xs text-ink-muted">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded border border-border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink-muted">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded border border-border px-2 py-1 text-sm"
          />
        </label>
        <label className="text-xs text-ink-muted">
          Decision
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as AuditDecision | "")}
            className="mt-1 block rounded border border-border px-2 py-1 text-sm"
            data-testid="audit-decision-filter"
          >
            {DECISIONS.map((d) => (
              <option key={d || "all"} value={d}>
                {d || "전체"}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-muted">불러오는 중…</p>
      ) : (
        <AuditLogTable items={data?.items ?? []} />
      )}
    </div>
  );
}
