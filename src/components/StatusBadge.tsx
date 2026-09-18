import type { ReactNode } from "react";

const tones: Record<string, string> = {
  ACTIVE:
    "text-accent-green bg-accent-green/10 border-accent-green/20",

  APPROVED:
    "text-accent-green bg-accent-green/10 border-accent-green/20",

  SUCCESS:
    "text-accent-green bg-accent-green/10 border-accent-green/20",

  PENDING:
    "text-accent-gold bg-accent-gold/10 border-accent-gold/20",

  REVOKED:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  FAILED:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  REJECTED:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  LOST:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  SUSPENDED:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  REDEEMED:
    "text-accent-blue bg-accent-blue/10 border-accent-blue/20",

  EXPIRED:
    "text-accent-red bg-accent-red/10 border-accent-red/20",

  ADMIN:
    "text-accent-gold bg-accent-gold/10 border-accent-gold/20",

  MANAGER:
    "text-accent-blue bg-accent-blue/10 border-accent-blue/20",

  CASHIER:
    "text-accent-green bg-accent-green/10 border-accent-green/20",

  VERIFIER:
    "text-text-secondary bg-text-secondary/10 border-border"
};

export default function StatusBadge({
  value,
  label,
  pulse = false
}: {
  value: string;
  label?: ReactNode;
  pulse?: boolean;
}) {
  const active =
    value === "ACTIVE" ||
    value === "APPROVED" ||
    value === "SUCCESS";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-badge border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        tones[value] ||
        "border-border bg-surface-hover text-text-secondary"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full bg-current ${
          active && pulse ? "animate-pulse" : ""
        }`}
      />
      {label ?? value}
    </span>
  );
}
