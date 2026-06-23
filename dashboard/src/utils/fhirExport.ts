import type { ComprehensiveResult } from "../types/fundus";

export function buildFhirBundle(
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
            {
              code: { text: "Myopia" },
              valueString: result.myopia?.grade_label ?? "—",
            },
            {
              code: { text: "Screening" },
              valueString: result.screening?.normal
                ? "normal"
                : (result.screening?.urgent_diseases ?? []).join(",") || "abnormal",
            },
          ],
          note: [{ text: result.overall_assessment.recommendation }],
        },
      },
    ],
  };
}

export function downloadJson(filename: string, data: object): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
