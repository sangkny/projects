import type { ReactElement, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { usePortalAuthStore } from "../../stores/portalAuthStore";
import type { PortalRole } from "../../types/clinical";
import { cn } from "../../utils/cn";

export interface RequireRoleProps {
  roles: PortalRole[];
  children: ReactNode;
  /** staff 등 권한 없을 때 리다이렉트 (기본: upload) */
  fallbackTo?: string;
}

export function RequireRole({
  roles,
  children,
  fallbackTo = "/portal/fundus/upload",
}: RequireRoleProps): ReactElement {
  const role = usePortalAuthStore((s) => s.role);
  const location = useLocation();

  if (!role) {
    return <Navigate to={fallbackTo} state={{ from: location }} replace />;
  }
  if (!roles.includes(role)) {
    return (
      <div
        className="rounded-xl border border-warning/30 bg-warning-muted p-8 text-center"
        role="alert"
      >
        <ShieldAlert className="mx-auto mb-3 size-10 text-warning-strong" aria-hidden />
        <h2 className="text-lg font-semibold text-ink">접근 권한 없음</h2>
        <p className="mt-2 text-sm text-ink-muted">
          이 화면은 {roles.join(" · ")} 역할만 이용할 수 있습니다. (현재: {role})
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

/** reviews 전용 — doctor/admin */
export function RequireDoctor({ children }: { children: ReactNode }): ReactElement {
  return (
    <RequireRole roles={["doctor", "admin"]} fallbackTo="/portal/fundus/upload">
      {children}
    </RequireRole>
  );
}

export function RoleBadge({ className }: { className?: string }): ReactElement | null {
  const role = usePortalAuthStore((s) => s.role);
  if (!role) return null;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        role === "doctor" ? "bg-primary-muted text-primary" : "bg-surface-muted text-ink-muted",
        className,
      )}
    >
      {role}
    </span>
  );
}
