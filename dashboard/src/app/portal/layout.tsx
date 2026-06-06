import { NavLink, Outlet } from "react-router-dom";
import { Eye, Upload } from "lucide-react";

function portalLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white"
    : "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white";
}

export default function PortalLayout() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-sky-300">
            <Eye className="size-4" aria-hidden />
            User Portal
          </span>
          <nav className="flex flex-wrap gap-2" aria-label="Portal navigation">
            <NavLink to="/portal/fundus/upload" className={portalLinkClass}>
              <span className="inline-flex items-center gap-1.5">
                <Upload className="size-3.5" aria-hidden />
                안저 업로드
              </span>
            </NavLink>
            <NavLink to="/portal/fundus/results" className={portalLinkClass}>
              분석 결과
            </NavLink>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </div>
    </div>
  );
}
