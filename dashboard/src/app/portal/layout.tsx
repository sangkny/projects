import { Outlet } from "react-router-dom";

import { ShellLayout } from "../../components/shared/ShellLayout";
import { PORTAL_NAV } from "../../components/shared/shellNavConfig";

export default function PortalLayout() {
  return (
    <ShellLayout variant="portal" navItems={PORTAL_NAV}>
      <Outlet />
    </ShellLayout>
  );
}
