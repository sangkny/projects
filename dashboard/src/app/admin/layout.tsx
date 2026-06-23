import { Outlet } from "react-router-dom";

import { ShellLayout } from "../../components/shared/ShellLayout";
import { ADMIN_NAV } from "../../components/shared/shellNavConfig";

export default function AdminLayout() {
  return (
    <ShellLayout variant="admin" navItems={ADMIN_NAV}>
      <Outlet />
    </ShellLayout>
  );
}
