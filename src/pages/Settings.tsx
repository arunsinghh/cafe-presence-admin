import {
  Database,
  Globe,
  Server,
  ShieldCheck
} from "lucide-react";

const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000/api";

export default function Settings() {
  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
          System / Configuration
        </p>

        <h1 className="page-title">
          Settings
        </h1>

        <p className="mt-2 muted">
          Runtime connection and security
          information.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card
          icon={Server}
          title="Backend API"
          value={apiBase}
        />

        <Card
          icon={ShieldCheck}
          title="Session"
          value="JWT Bearer authentication"
        />

        <Card
          icon={Database}
          title="Data layer"
          value="Prisma + PostgreSQL"
        />

        <Card
          icon={Globe}
          title="Console"
          value="Local development · Vite"
        />
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  value
}: {
  icon: typeof Server;
  title: string;
  value: string;
}) {
  return (
    <div className="premium-card p-5">
      <Icon
        size={20}
        className="text-accent-gold"
      />

      <p className="mt-5 text-xs uppercase tracking-wider text-text-secondary">
        {title}
      </p>

      <p className="mt-2 break-all font-mono text-sm">
        {value}
      </p>
    </div>
  );
}
