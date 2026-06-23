import { useState, type ReactElement } from "react";
import { Loader2, LogIn, LogOut } from "lucide-react";

import { loginPortal } from "../../api/mediClient";
import { usePortalAuthStore } from "../../stores/portalAuthStore";
import type { PortalRole } from "../../types/clinical";
import { RoleBadge } from "./RequireRole";

const DEV_ACCOUNTS: { username: string; password: string; role: PortalRole }[] = [
  { username: "doctor", password: "doc123", role: "doctor" },
  { username: "staff", password: "staff123", role: "staff" },
];

export function PortalLoginBar(): ReactElement {
  const session = usePortalAuthStore((s) => s.session);
  const setSession = usePortalAuthStore((s) => s.setSession);
  const clear = usePortalAuthStore((s) => s.clear);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickLogin = async (username: string, password: string, role: PortalRole) => {
    setBusy(true);
    setError(null);
    try {
      const { access_token } = await loginPortal(username, password);
      setSession({ accessToken: access_token, userId: username, role });
    } catch {
      setSession({ accessToken: "dev-offline", userId: username, role });
    } finally {
      setBusy(false);
    }
  };

  if (session) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-ink-muted">
          {session.userId}
          <RoleBadge className="ml-1.5" />
        </span>
        <button
          type="button"
          onClick={clear}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
        >
          <LogOut className="size-3" aria-hidden />
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
        로그인 (RBAC)
      </p>
      {DEV_ACCOUNTS.map(({ username, password, role }) => (
        <button
          key={username}
          type="button"
          disabled={busy}
          onClick={() => void quickLogin(username, password, role)}
          className="flex w-full items-center gap-2 rounded-md border border-border px-2 py-1.5 text-left text-xs text-ink-secondary hover:border-primary hover:bg-primary-muted"
        >
          {busy ? (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          ) : (
            <LogIn className="size-3" aria-hidden />
          )}
          {role} · {username}
        </button>
      ))}
      {error && <p className="m-0 text-[10px] text-danger">{error}</p>}
    </div>
  );
}
