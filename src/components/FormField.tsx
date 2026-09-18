import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  className?: string;
  required?: boolean;
}

export default function FormField({
  label,
  children,
  error,
  className = "",
  required = false
}: FormFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
        {required && <span className="ml-1 text-accent-red">*</span>}
      </span>
      {children}
      {error && <p className="mt-1 text-xs text-accent-red">{error}</p>}
    </label>
  );
}

