import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldCheck
} from "lucide-react";

import { useAuthStore } from "../store/auth.store";
import StatusBadge from "./StatusBadge";

interface TopbarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onMenu: () => void;
}

export default function Topbar({
  collapsed,
  onCollapse,
  onMenu
}: TopbarProps) {
  const employee = useAuthStore(
    (state) => state.employee
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-button p-2 text-text-secondary hover:bg-surface-hover lg:hidden"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={onCollapse}
          className="hidden rounded-button p-2 text-text-secondary hover:bg-surface-hover lg:block"
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-xs text-text-secondary sm:flex">
          <ShieldCheck
            size={15}
            className="text-accent-green"
          />
          SECURE SESSION
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="text-right">
          <p className="text-sm font-semibold">
            {employee?.name ||
              "Administrator"}
          </p>

          <div className="mt-1 flex justify-end">
            <StatusBadge
              value={
                employee?.role || "ADMIN"
              }
            />
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="rounded-button border border-border p-2.5 text-text-secondary transition hover:border-accent-red/30 hover:bg-accent-red/10 hover:text-accent-red"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
