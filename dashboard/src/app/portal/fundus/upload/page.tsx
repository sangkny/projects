import { useCallback, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";

import { useFundusAnalysis } from "../../../../hooks/useFundusAnalysis";
import { useFundusStore } from "../../../../stores/fundusStore";
import type { EyeSide } from "../../../../types/fundus";

const EYE_OPTIONS: { value: EyeSide; label: string }[] = [
  { value: "OD", label: "우안 (OD)" },
  { value: "OS", label: "좌안 (OS)" },
];

export default function FundusUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const patientId = useFundusStore((s) => s.patientId);
  const activeEye = useFundusStore((s) => s.activeEye);
  const setPatientId = useFundusStore((s) => s.setPatientId);
  const setActiveEye = useFundusStore((s) => s.setActiveEye);

  const { analyze, phase, error, isPending, resetPhase } = useFundusAnalysis();

  const pickFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    resetPhase();
  }, [resetPhase]);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      pickFile(e.dataTransfer.files[0] ?? null);
    },
    [pickFile],
  );

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    pickFile(e.target.files?.[0] ?? null);
  };

  const onSubmit = async () => {
    if (!selectedFile || activeEye === "unknown") return;
    try {
      await analyze(selectedFile, activeEye, patientId);
      navigate("/portal/fundus/results");
    } catch {
      /* error surfaced via hook */
    }
  };

  const busy = isPending || phase === "uploading" || phase === "analyzing";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">안저 이미지 업로드</h1>
        <p className="mt-1 text-sm text-slate-400">
          OS/OD 선택 후 업로드하면 4질환 종합 분석(comprehensive)을 실행합니다.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div
          role="button"
          tabIndex={0}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
            dragOver
              ? "border-sky-400 bg-sky-950/40"
              : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          {preview ? (
            <img
              src={preview}
              alt="업로드 미리보기"
              className="max-h-64 max-w-full rounded-lg object-contain"
            />
          ) : (
            <>
              <ImagePlus className="mb-3 size-10 text-slate-500" aria-hidden />
              <p className="text-sm font-medium text-slate-300">
                드래그 앤 드롭 또는 클릭하여 안저 이미지 선택
              </p>
              <p className="mt-1 text-xs text-slate-500">JPEG · PNG · DICOM 변환 이미지</p>
            </>
          )}
        </div>

        <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div>
            <label htmlFor="patient-id" className="mb-1.5 block text-sm font-medium text-slate-300">
              환자 ID
            </label>
            <input
              id="patient-id"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="예: PAT-2026-001"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-300">촬영 안</legend>
            <div className="flex gap-2">
              {EYE_OPTIONS.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                    activeEye === value
                      ? "border-sky-500 bg-sky-950/60 text-sky-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="eye"
                    value={value}
                    checked={activeEye === value}
                    onChange={() => setActiveEye(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {selectedFile && (
            <p className="truncate text-xs text-slate-500">{selectedFile.name}</p>
          )}

          <button
            type="button"
            disabled={!selectedFile || busy}
            onClick={onSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {phase === "uploading" ? "업로드 중…" : "4질환 분석 중…"}
              </>
            ) : (
              "종합 분석 시작"
            )}
          </button>

          {error && (
            <div
              role="alert"
              className="flex gap-2 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
