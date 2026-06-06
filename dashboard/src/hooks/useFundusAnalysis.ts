import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { mediApiPath } from "../config/env";
import { useFundusStore } from "../stores/fundusStore";
import type { ComprehensiveResult, EyeSide } from "../types/fundus";

export type AnalysisPhase = "idle" | "uploading" | "analyzing" | "done" | "error";

export interface FundusUploadInput {
  file: File;
  eye: EyeSide;
  patientId?: string;
}

export class FundusAnalysisError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "FundusAnalysisError";
  }
}

async function postComprehensive(
  input: FundusUploadInput,
  onProgress?: (phase: AnalysisPhase) => void,
): Promise<ComprehensiveResult> {
  onProgress?.("uploading");

  const form = new FormData();
  form.append("file", input.file);
  form.append("include_heatmap", "true");
  form.append("lang", "ko");
  if (input.patientId) {
    form.append("patient_id", input.patientId);
  }
  form.append("eye_side", input.eye);

  onProgress?.("analyzing");

  const res = await fetch(mediApiPath("/api/v1/lab/fundus/comprehensive"), {
    method: "POST",
    body: form,
  });

  if (res.status === 503) {
    throw new FundusAnalysisError(
      "모델이 아직 배포되지 않았습니다. Admin → 모델 현황을 확인하세요.",
      503,
      "MODEL_NOT_DEPLOYED",
    );
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { detail?: string | { msg?: string }[] };
      if (typeof body.detail === "string") detail = body.detail;
      else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        detail = body.detail[0].msg;
      }
    } catch {
      /* ignore parse errors */
    }
    throw new FundusAnalysisError(detail || `분석 실패 (${res.status})`, res.status);
  }

  return (await res.json()) as ComprehensiveResult;
}

export function useFundusAnalysis() {
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const setPatientId = useFundusStore((s) => s.setPatientId);
  const setOriginalImage = useFundusStore((s) => s.setOriginalImage);
  const setEyeResult = useFundusStore((s) => s.setEyeResult);
  const patientId = useFundusStore((s) => s.patientId);

  const mutation = useMutation({
    mutationFn: (input: FundusUploadInput) =>
      postComprehensive(input, setPhase),
    onMutate: () => {
      setError(null);
      setPhase("uploading");
    },
    onSuccess: (result, input) => {
      if (input.eye !== "OS" && input.eye !== "OD") return;

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setOriginalImage(input.eye as "OS" | "OD", reader.result);
        }
      };
      reader.readAsDataURL(input.file);

      if (input.patientId) setPatientId(input.patientId);
      setEyeResult(input.eye as "OS" | "OD", result);
      setPhase("done");
    },
    onError: (err: unknown) => {
      setPhase("error");
      if (err instanceof FundusAnalysisError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    },
  });

  const analyze = useCallback(
    (file: File, eye: EyeSide, overridePatientId?: string) => {
      const pid = overridePatientId ?? patientId;
      return mutation.mutateAsync({ file, eye, patientId: pid || undefined });
    },
    [mutation, patientId],
  );

  const resetPhase = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  return {
    phase,
    error,
    isPending: mutation.isPending,
    analyze,
    resetPhase,
    mutation,
  };
}

export default useFundusAnalysis;
