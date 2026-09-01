import { Inbox } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  text = "No records match the current filters."
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-14 text-center">
      <Inbox
        size={30}
        className="mb-3 text-text-secondary"
      />

      <p className="font-medium">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        {text}
      </p>
    </div>
  );
}
