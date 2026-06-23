import { useMemo } from "react";
import { Outlet } from "react-router-dom";

import { PortalLoginBar } from "../../components/shared/PortalLoginBar";
import { ShellLayout } from "../../components/shared/ShellLayout";
import { PORTAL_NAV } from "../../components/shared/shellNavConfig";
import { canAccessReviews, usePortalAuthStore } from "../../stores/portalAuthStore";

export default function PortalLayout() {
  const role = usePortalAuthStore((s) => s.role);

  const navItems = useMemo(
    () =>
      PORTAL_NAV.filter((item) => {
        if (item.to === "/portal/reviews") return canAccessReviews(role);
        return true;
      }),
    [role],
  );

  return (
    <ShellLayout variant="portal" navItems={navItems} sidebarFooter={<PortalLoginBar />}>
      <Outlet />
    </ShellLayout>
  );
}
