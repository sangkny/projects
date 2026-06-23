import { useQuery } from "@tanstack/react-query";

import { fetchAdminAuditLogs } from "../api/mediClient";
import { useAuditLogStore } from "../stores/auditLogStore";
import type { AuditDecision, AuditLogResponse } from "../types/admin";

export function useAdminAudit(filters: {
  from?: string;
  to?: string;
  decision?: AuditDecision | "";
}) {
  const localList = useAuditLogStore((s) => s.list);

  return useQuery({
    queryKey: ["admin-audit", filters],
    queryFn: async (): Promise<AuditLogResponse> => {
      try {
        const remote = await fetchAdminAuditLogs(filters);
        const local = localList(filters);
        const ids = new Set(remote.items.map((i) => i.id));
        const merged = [
          ...remote.items,
          ...local.items.filter((i) => !ids.has(i.id)),
        ].sort(
          (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
        );
        return { items: merged, total: merged.length };
      } catch {
        return localList(filters);
      }
    },
    staleTime: 10_000,
  });
}
