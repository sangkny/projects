import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  Cpu,
  Eye,
  FileBarChart,
  FlaskConical,
  LayoutDashboard,
  Network,
  Upload,
} from "lucide-react";

export type ShellVariant = "portal" | "admin" | "internal";

export interface ShellNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
}

export const PORTAL_NAV: ShellNavItem[] = [
  { to: "/portal/fundus/upload", label: "안저 업로드", icon: Upload },
  { to: "/portal/fundus/results", label: "분석 결과", icon: FileBarChart },
  // Phase 2 — routes TBD
  { to: "/portal/reviews", label: "진단 리뷰", icon: Eye, disabled: true },
];

export const ADMIN_NAV: ShellNavItem[] = [
  { to: "/admin/models", label: "모델 현황", icon: Cpu },
  { to: "/admin/performance", label: "성능 모니터", icon: Activity, disabled: true },
  { to: "/admin/audit", label: "감사 로그", icon: FileBarChart, disabled: true },
  { to: "/admin/ontology", label: "Ontology", icon: Network, disabled: true },
];

export const INTERNAL_NAV: ShellNavItem[] = [
  { to: "/internal", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/internal/ontology", label: "OntologyMonitor", icon: Network },
  { to: "/internal/harness", label: "Harness", icon: FlaskConical },
  { to: "/internal/medi", label: "MEDI-IOT", icon: Activity },
  { to: "/internal/autonogada", label: "AutoNoGaDa", icon: Bot },
  { to: "/internal/coops", label: "CoOps", icon: LayoutDashboard },
];

export const SHELL_META: Record<
  ShellVariant,
  { title: string; subtitle: string; accentClass: string; shellClass: string }
> = {
  portal: {
    title: "User Portal",
    subtitle: "임상 · 안저 분석",
    accentClass: "text-primary bg-primary-muted",
    shellClass: "bg-surface-muted text-ink",
  },
  admin: {
    title: "Admin Console",
    subtitle: "운영 · 모델 관리",
    accentClass: "text-admin-primary bg-admin-muted",
    shellClass: "bg-surface-muted text-ink",
  },
  internal: {
    title: "통합 관제",
    subtitle: "개발 · Harness",
    accentClass: "text-sky-300 bg-slate-800",
    shellClass: "bg-[#070b17] text-slate-100",
  },
};
