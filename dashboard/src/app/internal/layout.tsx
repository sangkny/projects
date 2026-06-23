import { Outlet } from "react-router-dom";

import { ShellLayout } from "../../components/shared/ShellLayout";
import { INTERNAL_NAV } from "../../components/shared/shellNavConfig";

export default function InternalLayout() {
  return (
    <ShellLayout variant="internal" navItems={INTERNAL_NAV}>
      <Outlet />
    </ShellLayout>
  );
}
