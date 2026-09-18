interface ErrorBannerProps {
  message: string;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
      {message}
    </div>
  );
}

