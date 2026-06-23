import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ImagePlus, Loader2 } from "lucide-react";

import { useFundusAnalysis } from "../../../../hooks/useFundusAnalysis";
import { useFundusStore } from "../../../../stores/fundusStore";
import type { EyeSide } from "../../../../types/fundus";
import { fingerprintBlob } from "../../../../utils/fundusAnalysisCache";

type UploadMode = "single" | "bilateral";

const EYE_OPTIONS: { value: EyeSide; label: string }[] = [
  { value: "OD", label: "우안 (OD)" },
  { value: "OS", label: "좌안 (OS)" },
];

function EyeDropZone({
  label,
  preview,
  dragOver,
  onPick,
  onDragOver,
  onDragLeave,
  onDrop,
  inputRef,
  onChange,
}: {
  label: string;
  preview: string | null;
  dragOver: boolean;
  onPick: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <div
        role="button"
        tabIndex={0}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onPick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onPick();
        }}
        className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
          dragOver
            ? "border-sky-400 bg-sky-950/40"
            : "border-slate-700 bg-slate-900/50 hover:border-slate-500"
        }`}
      >
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
        {preview ? (
          <img src={preview} alt={`${label} 미리보기`} className="max-h-48 max-w-full rounded-lg object-contain" />
        ) : (
          <>
            <ImagePlus className="mb-2 size-8 text-slate-500" aria-hidden />
            <p className="text-xs text-slate-400">드래그 또는 클릭</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function FundusUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const odInputRef = useRef<HTMLInputElement>(null);
  const osInputRef = useRef<HTMLInputElement>(null);

  const [uploadMode, setUploadMode] = useState<UploadMode>("bilateral");
  const [dragOver, setDragOver] = useState(false);
  const [odDragOver, setOdDragOver] = useState(false);
  const [osDragOver, setOsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [odPreview, setOdPreview] = useState<string | null>(null);
  const [osPreview, setOsPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [odFile, setOdFile] = useState<File | null>(null);
  const [osFile, setOsFile] = useState<File | null>(null);
  const [sameImageWarning, setSameImageWarning] = useState(false);

  const patientId = useFundusStore((s) => s.patientId);
  const activeEye = useFundusStore((s) => s.activeEye);
  const setPatientId = useFundusStore((s) => s.setPatientId);
  const setActiveEye = useFundusStore((s) => s.setActiveEye);
  const inferenceMode = useFundusStore((s) => s.inferenceMode);
  const setInferenceMode = useFundusStore((s) => s.setInferenceMode);
  const resetStore = useFundusStore((s) => s.reset);

  const { analyze, analyzeBilateral, phase, error, isPending, resetPhase } = useFundusAnalysis();

  useEffect(() => {
    if (!odFile || !osFile) {
      setSameImageWarning(false);
      return;
    }
    let cancelled = false;
    Promise.all([fingerprintBlob(odFile), fingerprintBlob(osFile)]).then(([a, b]) => {
      if (!cancelled) setSameImageWarning(a === b);
    });
    return () => {
      cancelled = true;
    };
  }, [odFile, osFile]);

  const loadPreview = useCallback((file: File, setter: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setter(reader.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const pickFile = useCallback(
    (file: File | null, setter: (f: File | null) => void, previewSetter: (url: string | null) => void) => {
      if (!file || !file.type.startsWith("image/")) return;
      setter(file);
      loadPreview(file, previewSetter);
      resetPhase();
    },
    [loadPreview, resetPhase],
  );

  const onSingleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      pickFile(e.dataTransfer.files[0] ?? null, setSelectedFile, setPreview);
    },
    [pickFile],
  );

  const onSubmitSingle = async () => {
    if (!selectedFile || activeEye === "unknown") return;
    try {
      await analyze(selectedFile, activeEye, patientId);
      navigate("/portal/fundus/results");
    } catch {
      /* error surfaced via hook */
    }
  };

  const onSubmitBilateral = async () => {
    if (!odFile || !osFile) return;
    resetStore();
    if (patientId) setPatientId(patientId);
    try {
      await analyzeBilateral(odFile, osFile, patientId);
      navigate("/portal/fundus/results");
    } catch {
      /* error surfaced via hook */
    }
  };

  const busy = isPending || phase === "uploading" || phase === "analyzing" || phase === "analyzing_od" || phase === "analyzing_os";

  const busyLabel =
    phase === "analyzing_od"
      ? "우안(OD) 분석 중…"
      : phase === "analyzing_os"
        ? "좌안(OS) 분석 중…"
        : phase === "uploading"
          ? "업로드 중…"
          : "5질환 분석 중…";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink">안저 이미지 업로드</h1>
        <p className="mt-1 text-sm text-ink-muted">
          양안 동시 업로드로 좌·우 결과를 한 번에 확인할 수 있습니다.
        </p>
      </header>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-300">업로드 방식</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "bilateral" as const, label: "👁️ 양안 동시", hint: "OD + OS 한 번에" },
              { value: "single" as const, label: "한쪽만", hint: "OD 또는 OS" },
            ] as const
          ).map(({ value, label, hint }) => (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors ${
                uploadMode === value
                  ? "border-sky-500 bg-sky-950/60 text-sky-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              <input
                type="radio"
                name="upload-mode"
                value={value}
                checked={uploadMode === value}
                onChange={() => {
                  setUploadMode(value);
                  resetPhase();
                }}
                className="sr-only"
              />
              <span className="block font-medium">{label}</span>
              <span className="mt-0.5 block text-xs opacity-80">{hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {uploadMode === "bilateral" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <EyeDropZone
              label="우안 (OD)"
              preview={odPreview}
              dragOver={odDragOver}
              onPick={() => odInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setOdDragOver(true);
              }}
              onDragLeave={() => setOdDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOdDragOver(false);
                pickFile(e.dataTransfer.files[0] ?? null, setOdFile, setOdPreview);
              }}
              inputRef={odInputRef}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null, setOdFile, setOdPreview)}
            />
            <EyeDropZone
              label="좌안 (OS)"
              preview={osPreview}
              dragOver={osDragOver}
              onPick={() => osInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setOsDragOver(true);
              }}
              onDragLeave={() => setOsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setOsDragOver(false);
                pickFile(e.dataTransfer.files[0] ?? null, setOsFile, setOsPreview);
              }}
              inputRef={osInputRef}
              onChange={(e) => pickFile(e.target.files?.[0] ?? null, setOsFile, setOsPreview)}
            />
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onSingleDrop}
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
              onChange={(e) => pickFile(e.target.files?.[0] ?? null, setSelectedFile, setPreview)}
            />
            {preview ? (
              <img src={preview} alt="업로드 미리보기" className="max-h-64 max-w-full rounded-lg object-contain" />
            ) : (
              <>
                <ImagePlus className="mb-3 size-10 text-slate-500" aria-hidden />
                <p className="text-sm font-medium text-slate-300">드래그 앤 드롭 또는 클릭하여 안저 이미지 선택</p>
                <p className="mt-1 text-xs text-slate-500">JPEG · PNG · DICOM 변환 이미지</p>
              </>
            )}
          </div>
        )}

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

          {uploadMode === "single" && (
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
          )}

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-300">추론 모드</legend>
            <div className="flex gap-2">
              {(
                [
                  { value: "fast" as const, label: "⚡ Fast", hint: "v10 · ~1s" },
                  { value: "precise" as const, label: "🔍 Precise", hint: "5모델 · ~40s" },
                ] as const
              ).map(({ value, label, hint }) => (
                <label
                  key={value}
                  className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm transition-colors ${
                    inferenceMode === value
                      ? "border-violet-500 bg-violet-950/60 text-violet-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="inference-mode"
                    value={value}
                    checked={inferenceMode === value}
                    onChange={() => setInferenceMode(value)}
                    className="sr-only"
                  />
                  <span className="block font-medium">{label}</span>
                  <span className="mt-0.5 block text-xs opacity-80">{hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {uploadMode === "bilateral" ? (
            <div className="space-y-1 text-xs text-slate-500">
              {odFile && <p className="truncate">OD: {odFile.name}</p>}
              {osFile && <p className="truncate">OS: {osFile.name}</p>}
            </div>
          ) : (
            selectedFile && <p className="truncate text-xs text-slate-500">{selectedFile.name}</p>
          )}

          <button
            type="button"
            disabled={
              busy ||
              sameImageWarning ||
              (uploadMode === "bilateral" ? !odFile || !osFile : !selectedFile || activeEye === "unknown")
            }
            onClick={uploadMode === "bilateral" ? onSubmitBilateral : onSubmitSingle}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {busyLabel}
              </>
            ) : uploadMode === "bilateral" ? (
              "양안 종합 분석 시작"
            ) : (
              "종합 분석 시작"
            )}
          </button>

          {sameImageWarning && uploadMode === "bilateral" && (
            <div
              role="alert"
              className="rounded-lg border border-amber-900/60 bg-amber-950/40 p-3 text-sm text-amber-200"
            >
              좌·우안 파일이 동일합니다. 서로 다른 안저 이미지(OD/OS)를 선택하세요.
            </div>
          )}

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
