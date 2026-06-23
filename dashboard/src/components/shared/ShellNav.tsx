import { NavLink } from "react-router-dom";

import { cn } from "../../utils/cn";
import type { ShellNavItem, ShellVariant } from "./shellNavConfig";

function linkClass(variant: ShellVariant, isActive: boolean, disabled?: boolean): string {
  if (disabled) {
    return "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-subtle opacity-50 cursor-not-allowed";
  }
  const base = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  if (variant === "internal") {
    return cn(
      base,
      isActive
        ? "bg-primary text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white",
    );
  }
  if (variant === "admin") {
    return cn(
      base,
      isActive
        ? "bg-admin-primary text-white"
        : "text-ink-secondary hover:bg-white hover:text-ink",
    );
  }
  return cn(
    base,
    isActive
      ? "bg-primary text-white"
      : "text-ink-secondary hover:bg-white hover:text-ink",
  );
}

export interface ShellNavProps {
  variant: ShellVariant;
  items: ShellNavItem[];
  orientation?: "vertical" | "horizontal";
}

export function ShellNav({ variant, items, orientation = "vertical" }: ShellNavProps) {
  const navClass =
    orientation === "vertical"
      ? "flex flex-col gap-1"
      : "flex flex-wrap gap-2";

  return (
    <nav className={navClass} aria-label={`${variant} navigation`}>
      {items.map((item) => {
        const Icon = item.icon;
        if (item.disabled) {
          return (
            <span
              key={item.to}
              className={linkClass(variant, false, true)}
              title="2·3단계에서 추가 예정"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </span>
          );
        }
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => linkClass(variant, isActive)}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
