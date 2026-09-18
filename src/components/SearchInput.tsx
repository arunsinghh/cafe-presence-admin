import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChangeValue: (value: string) => void;
  loading?: boolean;
}

export default function SearchInput({
  value,
  onChangeValue,
  placeholder = "Search...",
  className = "",
  loading = false,
  ...props
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3 top-3 text-text-secondary"
        size={17}
      />
      <input
        type="text"
        className={`premium-input pl-10 ${loading ? "pr-9" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-3 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-gold/40 border-t-accent-gold" />
        </div>
      )}
    </div>
  );
}

