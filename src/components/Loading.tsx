export default function Loading({
  label = "Loading"
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center gap-3 text-sm text-text-secondary">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent-gold" />
      {label}
    </div>
  );
}
