import type { ReactElement } from "react";
import { Loader2 } from "lucide-react";

import { OntologySummaryCard } from "../../../components/admin/OntologySummaryCard";
import { useOntologyAdmin } from "../../../hooks/useOntologyAdmin";

export default function AdminOntologyPage(): ReactElement {
  const { data, isLoading, isError } = useOntologyAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-ink-muted">
        <Loader2 className="size-5 animate-spin" aria-hidden />
        Ontology 통계 불러오는 중…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-lg border border-danger/30 bg-danger-muted p-4 text-sm text-danger">
        Ontology 통계를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">Ontology 모니터</h1>
        <p className="mt-1 text-sm text-ink-muted">
          ontology_passed 비율 · GLAU-SEM-005 등 핵심 규칙 · ONTOLOGY-REGRESSION-GUIDE 연계
        </p>
      </header>
      <OntologySummaryCard {...data} />
    </div>
  );
}
