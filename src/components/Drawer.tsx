import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Drawer({
  open,
  onClose,
  title,
  children
}: DrawerProps) {
  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open
          ? "pointer-events-auto"
          : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-surface shadow-premium transition-transform duration-200 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-semibold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-button p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </aside>
    </div>
  );
}
