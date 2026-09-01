import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  wide = false
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className={`premium-card max-h-[90vh] w-full overflow-auto ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface/95 px-5 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-semibold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-button p-2 text-text-secondary transition hover:bg-surface-hover hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
