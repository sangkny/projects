import { NavLink, Outlet } from "react-router-dom";
import { Cpu } from "lucide-react";

function adminLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive
    ? "rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white"
    : "rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white";
}

export default function AdminLayout() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-violet-300">
            <Cpu className="size-4" aria-hidden />
            Admin Console
          </span>
          <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
            <NavLink to="/admin/models" className={adminLinkClass}>
              모델 현황
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
