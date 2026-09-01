import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [
    collapsed,
    setCollapsed
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar
        collapsed={collapsed}
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <div
        className={`min-h-screen transition-all duration-200 ${
          collapsed
            ? "lg:pl-[76px]"
            : "lg:pl-64"
        }`}
      >
        <Topbar
          collapsed={collapsed}
          onCollapse={() =>
            setCollapsed(
              (value) => !value
            )
          }
          onMenu={() =>
            setMobileOpen(true)
          }
        />

        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
