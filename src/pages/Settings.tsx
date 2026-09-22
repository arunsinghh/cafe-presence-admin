import { Link } from "react-router-dom";
import {
  ArrowRight,
  Database,
  Globe,
  Server,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import CafeConfigCard
  from "../components/CafeConfigCard";

const apiBase =
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

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

      <div className="premium-card p-5 flex flex-col justify-between sm:flex-row sm:items-center gap-4 border-accent-gold/30 bg-accent-gold/5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-input bg-surface flex items-center justify-center text-accent-gold shrink-0 border border-border">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-display font-semibold text-base text-text-primary">
              Benefits Management
            </h3>
            <p className="text-xs text-text-secondary">
              Configure member perks, display orders, photos, and privileges for Classic Members.
            </p>
          </div>
        </div>

        <Link
          to="/benefits"
          className="gold-button self-start sm:self-auto text-xs py-2 px-3.5 inline-flex items-center gap-1.5"
        >
          Manage Benefits
          <ArrowRight size={14} />
        </Link>
      </div>

      <div>
        <CafeConfigCard />
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
