/** Portal E2E — Vite :5174 proxy → MEDI comprehensive */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const imagePath = resolve(
  __dir,
  "../../MEDI-IOT-EyeCare/fundus_right_sklee.jpg",
);
const BASE = process.env.DASHBOARD_BASE ?? "http://localhost:5174";

async function postComprehensive(mode) {
  const buf = readFileSync(imagePath);
  const form = new FormData();
  form.append("file", new Blob([buf], { type: "image/jpeg" }), "fundus_right_sklee.jpg");
  form.append("patient_id", "sklee");
  form.append("eye_side", "OD");
  form.append("include_heatmap", "true");
  form.append("tasks", "dr,glaucoma,amd,myopia,screening");
  form.append("lang", "ko");
  const t0 = performance.now();
  const res = await fetch(
    `${BASE}/api/v1/lab/fundus/comprehensive?mode=${mode}`,
    { method: "POST", body: form, signal: AbortSignal.timeout(300_000) },
  );
  if (!res.ok) throw new Error(`${mode} HTTP ${res.status}`);
  const data = await res.json();
  const wall = Math.round(performance.now() - t0);
  return { data, wall };
}

const dash = await fetch(`${BASE}/dashboard/`);
if (!dash.ok) throw new Error(`dashboard HTTP ${dash.status}`);
const health = await fetch(`${BASE}/api/v1/health`);
if (!health.ok) throw new Error(`proxy health HTTP ${health.status}`);

for (const mode of ["fast", "precise"]) {
  const { data, wall } = await postComprehensive(mode);
  const oa = data.overall_assessment ?? {};
  for (const k of ["dr", "glaucoma", "amd", "myopia", "screening"]) {
    if (!(k in data)) throw new Error(`${mode}: missing ${k}`);
  }
  console.log(`=== ${mode.toUpperCase()} ===`);
  console.log("inference_mode:", oa.inference_mode);
  console.log("inference_time_ms:", oa.inference_time_ms, `(wall ${wall} ms)`);
  console.log("primary_concern:", oa.primary_concern);
  console.log("GL decision:", data.glaucoma?.decision);
}

const admin = await fetch(`${BASE}/dashboard/admin/models`);
const adminHtml = await admin.text();
if (!adminHtml.includes("0.8842") && !adminHtml.includes("v10c")) {
  console.warn("WARN: admin SPA — v10c text is in JS bundle; verify in browser");
}
console.log("OK portal E2E via", BASE);
