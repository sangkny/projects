import type { ReactElement, ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Eye, Cpu, LayoutDashboard } from "lucide-react";

import { cn } from "../../utils/cn";
import { ShellNav } from "./ShellNav";
import {
  SHELL_META,
  type ShellNavItem,
  type ShellVariant,
} from "./shellNavConfig";

export interface ShellLayoutProps {
  variant: ShellVariant;
  navItems: ShellNavItem[];
  children: ReactNode;
  sidebarFooter?: ReactNode;
}

const CROSS_LINKS = [
  { to: "/portal/fundus/upload", label: "Portal", icon: Eye },
  { to: "/admin/models", label: "Admin", icon: Cpu },
  { to: "/internal", label: "관제", icon: LayoutDashboard },
] as const;

export function ShellLayout({ variant, navItems, children, sidebarFooter }: ShellLayoutProps): ReactElement {
  const meta = SHELL_META[variant];
  const isInternal = variant === "internal";

  return (
    <div className={cn("min-h-screen font-sans", meta.shellClass)}>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "flex w-60 shrink-0 flex-col border-r px-4 py-5",
            isInternal ? "border-slate-800 bg-[#0f172aec]" : "border-border bg-surface",
          )}
        >
          <div className="mb-6">
            <p
              className={cn(
                "inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide",
                meta.accentClass,
              )}
            >
              {meta.title}
            </p>
            <p
              className={cn(
                "mt-2 text-xs",
                isInternal ? "text-slate-400" : "text-ink-muted",
              )}
            >
              {meta.subtitle}
            </p>
          </div>

          <ShellNav variant={variant} items={navItems} />

          {sidebarFooter && (
            <div className={cn("mt-6 border-t pt-4", isInternal ? "border-slate-800" : "border-border")}>
              {sidebarFooter}
            </div>
          )}

          <div
            className={cn(
              "mt-auto border-t pt-4",
              isInternal ? "border-slate-800" : "border-border",
            )}
          >
            <p
              className={cn(
                "mb-2 text-[10px] font-semibold uppercase tracking-wider",
                isInternal ? "text-slate-500" : "text-ink-subtle",
              )}
            >
              전환
            </p>
            <div className="flex flex-col gap-1">
              {CROSS_LINKS.map((link) => {
                const Icon = link.icon;
                const isCurrent =
                  (variant === "portal" && link.to.startsWith("/portal")) ||
                  (variant === "admin" && link.to.startsWith("/admin")) ||
                  (variant === "internal" && link.to.startsWith("/internal"));
                if (isCurrent) return null;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium",
                      isInternal
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-ink-muted hover:bg-surface-muted hover:text-ink",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {link.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className={cn(
              "border-b px-6 py-4",
              isInternal
                ? "border-slate-800 bg-[#0f172a]/80"
                : "border-border bg-surface",
            )}
          >
            <h1 className="text-lg font-semibold tracking-tight">{meta.title}</h1>
          </header>
          <main
            className={cn(
              "mx-auto w-full max-w-6xl flex-1 px-6 py-6",
              isInternal && "app-main-internal",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
