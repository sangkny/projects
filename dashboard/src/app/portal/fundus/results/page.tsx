import { Link } from "react-router-dom";
import { Download, GitCompare } from "lucide-react";

import { BilateralView } from "../../../../components/BilateralView";
import { useFundusStore } from "../../../../stores/fundusStore";
import type { ComprehensiveResult } from "../../../../types/fundus";

function buildFhirBundle(
  eye: "OS" | "OD",
  result: ComprehensiveResult,
  patientId: string,
): object {
  const dr = result.dr;
  return {
    resourceType: "Bundle",
    type: "collection",
    timestamp: new Date().toISOString(),
    entry: [
      {
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { text: "Fundus comprehensive screening" },
          subject: { reference: `Patient/${patientId || "unknown"}` },
          bodySite: { text: eye },
          component: [
            { code: { text: "DR" }, valueString: `G${dr.dr_grade ?? dr.grade ?? 0}` },
            {
              code: { text: "Glaucoma" },
              valueString: result.glaucoma?.grade_label ?? "—",
            },
            { code: { text: "AMD" }, valueString: result.amd?.grade_label ?? "—" },
            { code: { text: "Myopia" }, valueString: result.myopia?.grade_label ?? "—" },
          ],
          note: [{ text: result.overall_assessment.recommendation }],
        },
      },
    ],
  };
}

function downloadJson(filename: string, data: object) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FundusResultsPage() {
  const results = useFundusStore((s) => s.results);
  const originalImages = useFundusStore((s) => s.originalImages);
  const patientId = useFundusStore((s) => s.patientId);
  const compareMode = useFundusStore((s) => s.compareMode);
  const setCompareMode = useFundusStore((s) => s.setCompareMode);

  if (!results?.os && !results?.od) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-10 text-center">
        <p className="text-slate-400">아직 분석 결과가 없습니다.</p>
        <Link
          to="/portal/fundus/upload"
          className="mt-4 inline-block text-sm font-medium text-sky-400 hover:text-sky-300"
        >
          안저 업로드로 이동 →
        </Link>
      </div>
    );
  }

  const handleFhirExport = (eye: "OS" | "OD") => {
    const result = eye === "OS" ? results.os : results.od;
    if (!result) return;
    const bundle = buildFhirBundle(eye, result, patientId);
    downloadJson(`fhir-fundus-${eye}-${patientId || "anon"}.json`, bundle);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">안저 종합 분석 결과</h1>
          <p className="mt-1 text-sm text-slate-400">
            {patientId ? `환자 ID: ${patientId}` : "환자 ID 미입력"}
            {results.analyzed_at && (
              <span className="ml-2 text-slate-500">
                · {new Date(results.analyzed_at).toLocaleString("ko-KR")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompareMode(!compareMode)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm ${
              compareMode
                ? "border-orange-500 bg-orange-950/40 text-orange-200"
                : "border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <GitCompare className="size-4" aria-hidden />
            Compare 모드
          </button>
          <Link
            to="/portal/fundus/upload"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
          >
            추가 업로드
          </Link>
        </div>
      </header>

      <div className="rounded-xl border border-slate-800 bg-white p-4 text-slate-900">
        <BilateralView
          data={results}
          originalImages={originalImages}
          compareMode={compareMode}
          onFhirExport={handleFhirExport}
        />
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <Download className="size-3.5" aria-hidden />
        FHIR R4 Bundle은 Observation 컬렉션 형태로 로컬 JSON 다운로드됩니다.
      </p>
    </div>
  );
}
