import { Outlet } from "react-router-dom";

import { PortalLoginBar } from "../../components/shared/PortalLoginBar";
import { RequireAdmin } from "../../components/shared/RequireRole";
import { ShellLayout } from "../../components/shared/ShellLayout";
import { ADMIN_NAV } from "../../components/shared/shellNavConfig";

export default function AdminLayout() {
  return (
    <ShellLayout variant="admin" navItems={ADMIN_NAV} sidebarFooter={<PortalLoginBar />}>
      <RequireAdmin>
        <Outlet />
      </RequireAdmin>
    </ShellLayout>
  );
}
