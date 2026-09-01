import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  Smartphone,
  MapPinCheck,
  Ticket,
  UserCog,
  TerminalSquare,
  Settings,
  Coffee,
  X
} from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", BarChart3],
  ["/customers", "Customers", Users],
  ["/devices", "Devices", Smartphone],
  ["/presence", "Presence", MapPinCheck],
  ["/vouchers", "Vouchers", Ticket],
  ["/employees", "Employees", UserCog],
  ["/audit-logs", "Audit Logs", TerminalSquare],
  ["/settings", "Settings", Settings]
] as const;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}

export default function Sidebar({
  open,
  collapsed,
  onClose
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        } ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-4">
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold">
              <Coffee size={20} />
            </div>

            {!collapsed && (
              <div>
                <p className="font-display text-lg font-semibold">
                  The Secret Brew
                </p>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-secondary">
                  Private Club
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(
            ([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                title={
                  collapsed
                    ? label
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-button px-3 py-3 text-sm transition duration-150 ${
                    isActive
                      ? "border-l-2 border-accent-gold bg-accent-gold/10 text-accent-gold"
                      : "border-l-2 border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  } ${
                    collapsed
                      ? "justify-center"
                      : ""
                  }`
                }
              >
                <Icon size={18} />

                {!collapsed && (
                  <span>{label}</span>
                )}
              </NavLink>
            )
          )}
        </nav>

        {!collapsed && (
          <div className="border-t border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
              Secure Console
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              Presence Control System v2
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
