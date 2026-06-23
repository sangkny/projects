import type { ReactElement, ReactNode } from "react";
import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

import { useAlertStore } from "../../stores/alertStore";
import { cn } from "../../utils/cn";

const AUTO_DISMISS_MS = 12_000;

export function ImmediateAlertHost(): ReactElement {
  const queue = useAlertStore((s) => s.queue);
  const dismiss = useAlertStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-md flex-col gap-2"
      aria-live="assertive"
    >
      {queue.map((alert) => (
        <AlertToast key={alert.id} alert={alert} onDismiss={() => dismiss(alert.id)} />
      ))}
    </div>
  );
}

function AlertToast({
  alert,
  onDismiss,
}: {
  alert: { id: string; title: string; message: string; severity: "danger" | "warning" };
  onDismiss: () => void;
}): ReactElement {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(t);
  }, [alert.id, onDismiss]);

  return (
    <div
      role="alert"
      data-testid="immediate-alert"
      className={cn(
        "pointer-events-auto flex gap-3 rounded-xl border px-4 py-3 shadow-lg",
        alert.severity === "danger"
          ? "border-danger/40 bg-danger-muted text-danger"
          : "border-warning/40 bg-warning-muted text-warning-strong",
      )}
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold">{alert.title}</p>
        <p className="m-0 mt-1 text-xs opacity-90">{alert.message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
        aria-label="닫기"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function AlertProvider({ children }: { children: ReactNode }): ReactElement {
  return (
    <>
      {children}
      <ImmediateAlertHost />
    </>
  );
}
