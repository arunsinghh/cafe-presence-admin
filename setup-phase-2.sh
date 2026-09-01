#!/usr/bin/env bash

set -e

ROOT="cafe-presence-admin"

rm -rf "$ROOT"

mkdir -p \
  "$ROOT/src/components" \
  "$ROOT/src/layouts" \
  "$ROOT/src/pages" \
  "$ROOT/src/services" \
  "$ROOT/src/store" \
  "$ROOT/src/types" \
  "$ROOT/src/lib"

cat > "$ROOT/package.json" <<'JSON'
{
  "name": "cafe-presence-admin",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "1.7.9",
    "lucide-react": "0.468.0",
    "qrcode": "1.5.4",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "7.1.1",
    "recharts": "2.15.0",
    "zustand": "5.0.3"
  },
  "devDependencies": {
    "@types/qrcode": "1.5.5",
    "@types/react": "18.3.18",
    "@types/react-dom": "18.3.5",
    "@vitejs/plugin-react": "4.3.4",
    "autoprefixer": "10.4.20",
    "postcss": "8.4.49",
    "tailwindcss": "3.4.17",
    "typescript": "5.7.2",
    "vite": "6.0.7"
  }
}
JSON

cat > "$ROOT/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0B0B0F" />
    <meta
      name="description"
      content="The Secret Brew private club administration console"
    />
    <title>The Secret Brew — Admin</title>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
HTML

cat > "$ROOT/.env" <<'ENV'
VITE_API_BASE_URL=http://localhost:3000/api
ENV

cat > "$ROOT/.env.example" <<'ENV'
VITE_API_BASE_URL=http://localhost:3000/api
ENV

cat > "$ROOT/.gitignore" <<'EOF'
node_modules/
dist/
.env
.DS_Store
EOF

cat > "$ROOT/vite.config.ts" <<'TS'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 5173
  }
});
TS

cat > "$ROOT/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": [
      "ES2020",
      "DOM",
      "DOM.Iterable"
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
JSON

cat > "$ROOT/tsconfig.node.json" <<'JSON'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "vite.config.ts"
  ]
}
JSON

cat > "$ROOT/tailwind.config.js" <<'JS'
/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0F",
        surface: "#15151B",
        "surface-hover": "#1F1F28",
        border: "#2A2A35",
        "accent-gold": "#E0B973",
        "accent-green": "#00D26A",
        "accent-red": "#FF4D4F",
        "accent-blue": "#4A90D9",
        "text-primary": "#F5F5F7",
        "text-secondary": "#8E8E93"
      },
      fontFamily: {
        display: [
          "Playfair Display",
          "serif"
        ],
        sans: [
          "Inter",
          "sans-serif"
        ],
        mono: [
          "JetBrains Mono",
          "monospace"
        ]
      },
      boxShadow: {
        premium: "0px 4px 20px rgba(0,0,0,0.4)"
      },
      borderRadius: {
        card: "16px",
        button: "10px",
        input: "10px",
        badge: "6px"
      }
    }
  },
  plugins: []
};
JS

cat > "$ROOT/postcss.config.js" <<'JS'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
JS

cat > "$ROOT/src/index.css" <<'CSS'
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
  font-family: Inter, sans-serif;
  background: #0B0B0F;
  color: #F5F5F7;
}

* {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
  margin: 0;
}

body {
  min-width: 320px;
  background: #0B0B0F;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0B0B0F;
}

::-webkit-scrollbar-thumb {
  background: #2A2A35;
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1F1F28;
}

@layer components {
  .premium-card {
    @apply rounded-card border border-border bg-surface shadow-premium;
    background-image:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.025),
        rgba(255, 255, 255, 0) 55%
      );
  }

  .premium-input {
    @apply w-full rounded-input border border-border bg-background px-3.5 py-2.5 text-sm text-text-primary outline-none transition duration-200 placeholder:text-text-secondary/60 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold/30;
  }

  .gold-button {
    @apply inline-flex items-center justify-center gap-2 rounded-button bg-accent-gold px-4 py-2.5 text-sm font-semibold text-background transition duration-150 hover:brightness-110 active:scale-[0.98] disabled:opacity-50;
  }

  .ghost-button {
    @apply inline-flex items-center justify-center gap-2 rounded-button border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition duration-150 hover:bg-surface-hover active:scale-[0.98] disabled:opacity-50;
  }

  .danger-button {
    @apply inline-flex items-center justify-center gap-2 rounded-button border border-accent-red/30 bg-accent-red/10 px-4 py-2.5 text-sm font-medium text-accent-red transition duration-150 hover:bg-accent-red/15 active:scale-[0.98] disabled:opacity-50;
  }

  .page-title {
    @apply font-display text-2xl font-semibold tracking-tight text-text-primary md:text-3xl;
  }

  .muted {
    @apply text-sm text-text-secondary;
  }
}
CSS

cat > "$ROOT/src/types/index.ts" <<'TS'
export type Role =
  | "ADMIN"
  | "MANAGER"
  | "CASHIER"
  | "VERIFIER";

export type CustomerStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type DeviceStatus =
  | "PENDING"
  | "ACTIVE"
  | "REVOKED"
  | "LOST";

export type VoucherStatus =
  | "ACTIVE"
  | "REDEEMED"
  | "EXPIRED"
  | "REVOKED"
  | "PENDING";

export type VoucherType =
  | "PERCENTAGE"
  | "FLAT"
  | "FREE_ITEM";

export type PresenceResult =
  | "SUCCESS"
  | "FAILED"
  | "REJECTED";

export type PresenceMethod =
  | "QR"
  | "LOCATION"
  | "GPS_QR"
  | "COMBINED";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Device {
  id: number;
  customerId: number;
  deviceId: string;
  status: DeviceStatus;
  deviceName?: string | null;
  platform?: string | null;
  approvedAt?: string | null;
  revokedAt?: string | null;
  lostAt?: string | null;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  status: CustomerStatus;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  devices?: Device[];
}

export interface PresenceLog {
  id: number;
  customerId: number;
  deviceId: number;
  method: PresenceMethod;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  distanceMeters?: number | null;
  qrTokenId?: number | null;
  purpose?: string | null;
  result: PresenceResult;
  timestamp: string;
  customer?: Pick<
    Customer,
    "id" | "name" | "phone"
  >;
  device?: Pick<
    Device,
    "id" | "deviceId" | "status"
  >;
  qrToken?: {
    id: number;
    status: string;
    consumedAt?: string | null;
  };
}

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: VoucherType;
  value?: number | string | null;
  minSpend?: number | string | null;
  maxRedemptions?: number | null;
  redeemedCount?: number;
  status: VoucherStatus;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  _count?: {
    customerVouchers: number;
  };
}

export interface CustomerVoucher {
  id: number;
  customerId: number;
  voucherId: number;
  status: VoucherStatus;
  issuedAt: string;
  redeemedAt?: string | null;
  expiresAt?: string | null;
  voucher?: Voucher;
  customer?: Pick<
    Customer,
    "id" | "name" | "phone"
  >;
}

export interface AuditLog {
  id: number;
  employeeId: number;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  employee?: Pick<
    Employee,
    "id" | "name" | "email" | "role"
  >;
}

export interface QrToken {
  id: number;
  token: string;
  status: string;
  expiresAt: string;
  consumedAt?: string | null;
}
TS

cat > "$ROOT/src/services/api.ts" <<'TS'
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(
    "cafe_admin_token"
  );

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("cafe_admin_token");
      localStorage.removeItem("cafe_admin_user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const apiMessage = (
  error: unknown,
  fallback = "Something went wrong"
): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default api;
TS

cat > "$ROOT/src/store/auth.store.ts" <<'TS'
import { create } from "zustand";
import type { Employee } from "../types";

interface AuthState {
  token: string | null;
  employee: Employee | null;
  setAuth: (
    token: string,
    employee: Employee
  ) => void;
  logout: () => void;
}

const storedToken =
  localStorage.getItem("cafe_admin_token");

const storedUser =
  localStorage.getItem("cafe_admin_user");

let parsedUser: Employee | null = null;

try {
  parsedUser = storedUser
    ? (JSON.parse(storedUser) as Employee)
    : null;
} catch {
  parsedUser = null;
}

export const useAuthStore = create<AuthState>(
  (set) => ({
    token: storedToken,
    employee: parsedUser,

    setAuth: (token, employee) => {
      localStorage.setItem(
        "cafe_admin_token",
        token
      );

      localStorage.setItem(
        "cafe_admin_user",
        JSON.stringify(employee)
      );

      set({
        token,
        employee
      });
    },

    logout: () => {
      localStorage.removeItem(
        "cafe_admin_token"
      );

      localStorage.removeItem(
        "cafe_admin_user"
      );

      set({
        token: null,
        employee: null
      });

      window.location.href = "/login";
    }
  })
);
TS

cat > "$ROOT/src/lib/format.ts" <<'TS'
export const formatDate = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export const formatDateOnly = (
  value?: string | null
): string => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(value));
};

export const initials = (
  name = ""
): string => {
  const result = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return result || "?";
};

export const money = (
  value?: number | string | null
): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN"
  )}`;
};

export const prettyAction = (
  action: string
): string => {
  return action.replaceAll("_", " ");
};
TS

cat > "$ROOT/src/components/StatusBadge.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/components/Modal.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/components/Drawer.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/components/Loading.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/components/EmptyState.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/components/Sidebar.tsx" <<'TSX'
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  Smartphone,
  MapPinCheck,
  Ticket,
  UserCog,
  TerminalSquare,
  Settings,
  Coffee,
  X
} from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", BarChart3],
  ["/customers", "Customers", Users],
  ["/devices", "Devices", Smartphone],
  ["/presence", "Presence", MapPinCheck],
  ["/vouchers", "Vouchers", Ticket],
  ["/employees", "Employees", UserCog],
  ["/audit-logs", "Audit Logs", TerminalSquare],
  ["/settings", "Settings", Settings]
] as const;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
}

export default function Sidebar({
  open,
  collapsed,
  onClose
}: SidebarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${
          open ? "block" : "hidden"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-background transition-all duration-200 ${
          collapsed ? "w-[76px]" : "w-64"
        } ${
          open
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-4">
          <div
            className={`flex items-center gap-3 ${
              collapsed ? "mx-auto" : ""
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold">
              <Coffee size={20} />
            </div>

            {!collapsed && (
              <div>
                <p className="font-display text-lg font-semibold">
                  The Secret Brew
                </p>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-text-secondary">
                  Private Club
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map(
            ([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                title={
                  collapsed
                    ? label
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-button px-3 py-3 text-sm transition duration-150 ${
                    isActive
                      ? "border-l-2 border-accent-gold bg-accent-gold/10 text-accent-gold"
                      : "border-l-2 border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                  } ${
                    collapsed
                      ? "justify-center"
                      : ""
                  }`
                }
              >
                <Icon size={18} />

                {!collapsed && (
                  <span>{label}</span>
                )}
              </NavLink>
            )
          )}
        </nav>

        {!collapsed && (
          <div className="border-t border-border p-4">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary">
              Secure Console
            </p>

            <p className="mt-1 text-xs text-text-secondary">
              Presence Control System v2
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
TSX

cat > "$ROOT/src/components/Topbar.tsx" <<'TSX'
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ShieldCheck
} from "lucide-react";

import { useAuthStore } from "../store/auth.store";
import StatusBadge from "./StatusBadge";

interface TopbarProps {
  collapsed: boolean;
  onCollapse: () => void;
  onMenu: () => void;
}

export default function Topbar({
  collapsed,
  onCollapse,
  onMenu
}: TopbarProps) {
  const employee = useAuthStore(
    (state) => state.employee
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-button p-2 text-text-secondary hover:bg-surface-hover lg:hidden"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          onClick={onCollapse}
          className="hidden rounded-button p-2 text-text-secondary hover:bg-surface-hover lg:block"
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 text-xs text-text-secondary sm:flex">
          <ShieldCheck
            size={15}
            className="text-accent-green"
          />
          SECURE SESSION
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="text-right">
          <p className="text-sm font-semibold">
            {employee?.name ||
              "Administrator"}
          </p>

          <div className="mt-1 flex justify-end">
            <StatusBadge
              value={
                employee?.role || "ADMIN"
              }
            />
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          title="Logout"
          className="rounded-button border border-border p-2.5 text-text-secondary transition hover:border-accent-red/30 hover:bg-accent-red/10 hover:text-accent-red"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
TSX

cat > "$ROOT/src/layouts/AppLayout.tsx" <<'TSX'
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AppLayout() {
  const [
    collapsed,
    setCollapsed
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar
        collapsed={collapsed}
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
      />

      <div
        className={`min-h-screen transition-all duration-200 ${
          collapsed
            ? "lg:pl-[76px]"
            : "lg:pl-64"
        }`}
      >
        <Topbar
          collapsed={collapsed}
          onCollapse={() =>
            setCollapsed(
              (value) => !value
            )
          }
          onMenu={() =>
            setMobileOpen(true)
          }
        />

        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Login.tsx" <<'TSX'
import {
  type FormEvent,
  useState
} from "react";

import {
  Coffee,
  LockKeyhole,
  Mail,
  ShieldCheck
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api, {
  apiMessage
} from "../services/api";

import { useAuthStore } from "../store/auth.store";

import type { Employee } from "../types";

export default function Login() {
  const [
    email,
    setEmail
  ] = useState("admin@cafe.com");

  const [
    password,
    setPassword
  ] = useState("Admin@123");

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const navigate = useNavigate();

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const submit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      const response =
        await api.post(
          "/auth/employee/login",
          {
            email,
            password
          }
        );

      const payload =
        response.data.data ||
        response.data;

      const employee =
        payload.employee as Employee;

      setAuth(
        payload.token,
        employee
      );

      navigate("/dashboard", {
        replace: true
      });
    } catch (requestError) {
      setError(
        apiMessage(
          requestError,
          "Unable to sign in. Check your credentials."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/5 blur-[120px]" />

      <div className="premium-card relative w-full max-w-md p-7 md:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold/10 text-accent-gold shadow-[0_0_35px_rgba(224,185,115,0.08)]">
            <Coffee size={27} />
          </div>

          <h1 className="font-display text-3xl font-semibold">
            The Secret Brew
          </h1>

          <p className="mt-2 text-sm text-text-secondary">
            Private club operations console
          </p>
        </div>

        <form
          onSubmit={submit}
          className="space-y-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Email
            </span>

            <div className="relative">
              <Mail
                className="absolute left-3 top-3 text-text-secondary"
                size={17}
              />

              <input
                className="premium-input pl-10"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                autoComplete="username"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Password
            </span>

            <div className="relative">
              <LockKeyhole
                className="absolute left-3 top-3 text-text-secondary"
                size={17}
              />

              <input
                className="premium-input pl-10"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-input border border-accent-red/30 bg-accent-red/10 px-3 py-2.5 text-sm text-accent-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="gold-button mt-2 w-full"
          >
            {busy ? (
              "Authenticating…"
            ) : (
              <>
                <ShieldCheck size={17} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-border pt-5">
          <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
            Demo Access
          </p>

          <div className="space-y-2 font-mono text-[11px] text-text-secondary">
            <div className="rounded-input bg-background p-2.5">
              <span className="text-accent-gold">
                Admin:
              </span>{" "}
              admin@cafe.com / Admin@123
            </div>

            <div className="rounded-input bg-background p-2.5">
              <span className="text-accent-gold">
                Staff:
              </span>{" "}
              staff@cafe.com / Staff@123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Dashboard.tsx" <<'TSX'
import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  QrCode,
  RefreshCw,
  Users
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import {
  useNavigate
} from "react-router-dom";

import api, {
  apiMessage
} from "../services/api";

import type {
  AuditLog,
  Customer,
  Device,
  PresenceLog
} from "../types";

import {
  formatDate
} from "../lib/format";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

export default function Dashboard() {
  const [
    customers,
    setCustomers
  ] = useState<Customer[]>([]);

  const [
    devices,
    setDevices
  ] = useState<Device[]>([]);

  const [
    logs,
    setLogs
  ] = useState<PresenceLog[]>([]);

  const [
    audits,
    setAudits
  ] = useState<AuditLog[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        customerResponse,
        presenceResponse,
        auditResponse
      ] = await Promise.all([
        api.get(
          "/customers?limit=100"
        ),

        api.get(
          "/presence/logs?limit=100"
        ),

        api
          .get(
            "/employees/audit-logs?limit=10"
          )
          .catch(() => null)
      ]);

      const customerData =
        customerResponse.data.data
          ?.customers ??
        customerResponse.data.data ??
        [];

      const presenceData =
        presenceResponse.data.data
          ?.logs ??
        presenceResponse.data.data ??
        [];

      const auditData =
        auditResponse?.data?.data?.logs ??
        auditResponse?.data?.data ??
        [];

      setCustomers(customerData);
      setLogs(presenceData);
      setAudits(auditData);

      const deviceResponses =
        await Promise.all(
          customerData.map(
            (customer: Customer) =>
              api
                .get(
                  `/devices/customer/${customer.id}`
                )
                .then(
                  (response) =>
                    response.data.data ??
                    response.data ??
                    []
                )
                .catch(() => [])
          )
        );

      setDevices(
        deviceResponses.flat()
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayLogs =
    logs.filter(
      (log) =>
        new Date(log.timestamp) >=
        todayStart
    );

  const pendingApprovals =
    customers.filter(
      (customer) =>
        customer.status === "PENDING"
    ).length +
    devices.filter(
      (device) =>
        device.status === "PENDING"
    ).length;

  const chart = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            (6 - index)
        );

        const count =
          logs.filter(
            (log) =>
              new Date(
                log.timestamp
              ).toDateString() ===
              date.toDateString()
          ).length;

        return {
          day: date.toLocaleDateString(
            "en-IN",
            {
              weekday: "short"
            }
          ),
          count
        };
      }
    );
  }, [logs]);

  if (loading) {
    return (
      <Loading label="Loading command center" />
    );
  }

  const stats = [
    {
      label: "Total Customers",
      value: customers.length,
      icon: Users,
      note: "Registered members"
    },
    {
      label: "Active Devices",
      value: devices.filter(
        (device) =>
          device.status === "ACTIVE"
      ).length,
      icon: Cpu,
      note: "Trusted devices"
    },
    {
      label: "Pending Approvals",
      value: pendingApprovals,
      icon: Clock3,
      note: "Need attention"
    },
    {
      label: "Today's Verifications",
      value: todayLogs.length,
      icon: CheckCircle2,
      note: "Presence events"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Operations / Overview
          </p>

          <h1 className="page-title">
            Command Center
          </h1>

          <p className="mt-2 muted">
            A live view of the club's
            access and presence layer.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/presence")
            }
            className="gold-button"
          >
            <QrCode size={16} />
            Generate QR Token
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          ({
            label,
            value,
            icon: Icon,
            note
          }) => (
            <div
              key={label}
              className="premium-card p-5"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-xl border border-border bg-background p-2.5 text-accent-gold">
                  <Icon size={20} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="text-text-secondary"
                />
              </div>

              <p className="mt-7 font-display text-3xl font-semibold">
                {value.toLocaleString()}
              </p>

              <p className="mt-1 text-sm font-medium">
                {label}
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                {note}
              </p>
            </div>
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="premium-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Presence Verifications
              </h2>

              <p className="muted">
                Last 7 days
              </p>
            </div>

            <Activity
              className="text-accent-gold"
              size={20}
            />
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <AreaChart data={chart}>
                <defs>
                  <linearGradient
                    id="goldFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#E0B973"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="100%"
                      stopColor="#E0B973"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#2A2A35"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  stroke="#8E8E93"
                  fontSize={11}
                />

                <YAxis
                  allowDecimals={false}
                  stroke="#8E8E93"
                  fontSize={11}
                />

                <Tooltip
                  contentStyle={{
                    background:
                      "#15151B",
                    border:
                      "1px solid #2A2A35",
                    borderRadius: 10,
                    color: "#F5F5F7"
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#E0B973"
                  strokeWidth={2}
                  fill="url(#goldFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Recent Activity
              </h2>

              <p className="muted">
                Latest audit events
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background p-2 text-accent-gold">
              <span className="font-mono text-sm">
                &gt;_
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {audits.length > 0 ? (
              audits
                .slice(0, 10)
                .map((audit) => (
                  <div
                    key={audit.id}
                    className="rounded-input border border-border/60 bg-background/60 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge
                        value={
                          audit.action.includes(
                            "REVOKE"
                          )
                            ? "REVOKED"
                            : audit.action.includes(
                                "APPROVE"
                              )
                            ? "PENDING"
                            : "ACTIVE"
                        }
                        label={audit.action.replaceAll(
                          "_",
                          " "
                        )}
                      />

                      <span className="font-mono text-[10px] text-text-secondary">
                        {formatDate(
                          audit.createdAt
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-text-secondary">
                      {audit.entityType ||
                        "Entity"}{" "}
                      <span className="font-mono text-text-primary">
                        #
                        {audit.entityId ||
                          audit.id}
                      </span>
                    </p>
                  </div>
                ))
            ) : (
              <div className="rounded-input bg-background p-4 text-sm text-text-secondary">
                No audit events are
                available from the
                configured API.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Customers.tsx" <<'TSX'
import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Ban,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Smartphone,
  UserRound
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  Customer,
  CustomerVoucher,
  Device,
  PresenceLog,
  Voucher
} from "../types";

import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

import {
  formatDate,
  initials
} from "../lib/format";

export default function Customers() {
  const [
    customers,
    setCustomers
  ] = useState<Customer[]>([]);

  const [
    selected,
    setSelected
  ] = useState<Customer | null>(null);

  const [
    devices,
    setDevices
  ] = useState<Device[]>([]);

  const [
    history,
    setHistory
  ] = useState<PresenceLog[]>([]);

  const [
    vouchers,
    setVouchers
  ] = useState<
    CustomerVoucher[]
  >([]);

  const [
    query,
    setQuery
  ] = useState("");

  const [
    filter,
    setFilter
  ] = useState("ALL");

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    confirm,
    setConfirm
  ] = useState<Device | null>(
    null
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          "/customers?limit=100"
        );

      setCustomers(
        response.data.data
          ?.customers ??
          response.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!selected) {
      setDevices([]);
      setHistory([]);
      setVouchers([]);
      return;
    }

    const loadDetails =
      async () => {
        try {
          const [
            deviceResponse,
            historyResponse,
            voucherResponse
          ] = await Promise.all([
            api.get(
              `/devices/customer/${selected.id}`
            ),

            api.get(
              `/presence/logs?customerId=${selected.id}&limit=5`
            ),

            api.get(
              "/vouchers?limit=100"
            )
          ]);

          const customerDevices =
            deviceResponse.data.data ??
            deviceResponse.data ??
            [];

          const customerHistory =
            historyResponse.data.data
              ?.logs ??
            historyResponse.data.data ??
            [];

          const allVouchers =
            voucherResponse.data.data
              ?.vouchers ??
            voucherResponse.data.data ??
            [];

          setDevices(
            customerDevices
          );

          setHistory(
            customerHistory
          );

          const voucherDetails =
            await Promise.all(
              (
                allVouchers as Voucher[]
              ).map(async (voucher) => {
                try {
                  const response =
                    await api.get(
                      `/vouchers/${voucher.id}`
                    );

                  const detail =
                    response.data.data ??
                    response.data;

                  const issued =
                    detail.customerVouchers?.find(
                      (
                        item: CustomerVoucher
                      ) =>
                        item.customerId ===
                        selected.id
                    );

                  return issued
                    ? {
                        ...issued,
                        voucher
                      }
                    : null;
                } catch {
                  return null;
                }
              })
            );

          setVouchers(
            voucherDetails.filter(
              (
                item
              ): item is CustomerVoucher =>
                item !== null
            )
          );
        } catch (requestError) {
          setError(
            apiMessage(
              requestError
            )
          );
        }
      };

    void loadDetails();
  }, [selected]);

  const filtered =
    useMemo(
      () =>
        customers.filter(
          (customer) => {
            const statusMatches =
              filter === "ALL" ||
              customer.status ===
                filter;

            const searchText =
              [
                customer.name,
                customer.phone,
                customer.email
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return (
              statusMatches &&
              searchText.includes(
                query.toLowerCase()
              )
            );
          }
        ),
      [
        customers,
        filter,
        query
      ]
    );

  const approveDevice =
    async () => {
      if (!confirm) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        await api.post(
          `/devices/${confirm.id}/approve`
        );

        setConfirm(null);

        if (selected) {
          const response =
            await api.get(
              `/devices/customer/${selected.id}`
            );

          setDevices(
            response.data.data ??
              response.data ??
              []
          );
        }
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      } finally {
        setBusy(false);
      }
    };

  const revokeDevice =
    async (id: number) => {
      setBusy(true);
      setError("");

      try {
        await api.post(
          `/devices/${id}/revoke`
        );

        if (selected) {
          const response =
            await api.get(
              `/devices/customer/${selected.id}`
            );

          setDevices(
            response.data.data ??
              response.data ??
              []
          );
        }
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      } finally {
        setBusy(false);
      }
    };

  const suspendCustomer =
    async () => {
      if (!selected) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        await api.post(
          `/customers/${selected.id}/suspend`
        );

        await load();

        setSelected({
          ...selected,
          status: "SUSPENDED"
        });
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      } finally {
        setBusy(false);
      }
    };

  if (loading) {
    return (
      <Loading label="Loading members" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Membership / Access
          </p>

          <h1 className="page-title">
            Customers & Devices
          </h1>

          <p className="mt-2 muted">
            Review member identity
            and trusted-device access.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          className="ghost-button self-start"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="grid min-h-[650px] gap-5 xl:grid-cols-[420px_1fr]">
        <section className="premium-card overflow-hidden">
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-text-secondary"
                size={17}
              />

              <input
                className="premium-input pl-10"
                placeholder="Search members…"
                value={query}
                onChange={(event) =>
                  setQuery(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
              {[
                "ALL",
                "PENDING",
                "APPROVED",
                "SUSPENDED",
                "REJECTED"
              ].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() =>
                    setFilter(value)
                  }
                  className={`whitespace-nowrap rounded-badge px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition ${
                    filter === value
                      ? "bg-accent-gold text-background"
                      : "bg-background text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[580px] overflow-y-auto p-2">
            {filtered.length > 0 ? (
              filtered.map(
                (customer) => (
                  <button
                    type="button"
                    key={customer.id}
                    onClick={() =>
                      setSelected(
                        customer
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-button p-3 text-left transition ${
                      selected?.id ===
                      customer.id
                        ? "bg-accent-gold/10"
                        : "hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background font-display font-semibold text-accent-gold">
                      {initials(
                        customer.name
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">
                          {customer.name}
                        </p>

                        <ChevronRight
                          size={15}
                          className="text-text-secondary"
                        />
                      </div>

                      <p className="mt-0.5 truncate font-mono text-[10px] text-text-secondary">
                        {customer.phone}
                      </p>

                      <div className="mt-1">
                        <StatusBadge
                          value={
                            customer.status ===
                            "APPROVED"
                              ? "ACTIVE"
                              : customer.status
                          }
                        />
                      </div>
                    </div>
                  </button>
                )
              )
            ) : (
              <EmptyState
                title="No members found"
              />
            )}
          </div>
        </section>

        <section className="premium-card min-w-0 overflow-hidden">
          {!selected ? (
            <div className="flex h-full min-h-[600px] flex-col items-center justify-center p-8 text-center">
              <UserRound
                size={42}
                className="mb-4 text-accent-gold/50"
              />

              <h2 className="font-display text-xl">
                Select a member
              </h2>

              <p className="mt-2 max-w-sm text-sm text-text-secondary">
                Choose a customer
                from the left to
                inspect devices,
                presence history
                and vouchers.
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              <div className="border-b border-border p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-gold/20 bg-accent-gold/10 font-display text-xl font-semibold text-accent-gold">
                      {initials(
                        selected.name
                      )}
                    </div>

                    <div>
                      <h2 className="font-display text-2xl font-semibold">
                        {selected.name}
                      </h2>

                      <p className="mt-1 font-mono text-xs text-text-secondary">
                        #{selected.id} ·{" "}
                        {selected.phone}
                      </p>

                      <div className="mt-2 flex gap-2">
                        <StatusBadge
                          value={
                            selected.status ===
                            "APPROVED"
                              ? "ACTIVE"
                              : selected.status
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={
                      busy ||
                      selected.status ===
                        "SUSPENDED"
                    }
                    onClick={() =>
                      void suspendCustomer()
                    }
                    className="danger-button"
                  >
                    <Ban size={15} />
                    Suspend Customer
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Info
                    label="Email"
                    value={
                      selected.email ||
                      "Not provided"
                    }
                  />

                  <Info
                    label="Joined"
                    value={formatDate(
                      selected.createdAt
                    )}
                  />

                  <Info
                    label="Approved"
                    value={formatDate(
                      selected.approvedAt
                    )}
                  />
                </div>
              </div>

              <div className="grid gap-5 p-5 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg">
                      Trusted Devices
                    </h3>

                    <Smartphone
                      size={18}
                      className="text-accent-gold"
                    />
                  </div>

                  <div className="space-y-2">
                    {devices.length > 0 ? (
                      devices.map(
                        (device) => (
                          <div
                            key={
                              device.id
                            }
                            className="rounded-input border border-border bg-background p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold">
                                  {device.deviceName ||
                                    device.platform ||
                                    "Registered Device"}
                                </p>

                                <p className="mt-1 font-mono text-[10px] text-text-secondary">
                                  {
                                    device.deviceId
                                  }
                                </p>
                              </div>

                              <StatusBadge
                                value={
                                  device.status
                                }
                              />
                            </div>

                            <div className="mt-3 flex gap-2">
                              {device.status ===
                                "PENDING" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirm(
                                      device
                                    )
                                  }
                                  className="gold-button px-3 py-2 text-xs"
                                >
                                  <ShieldCheck
                                    size={
                                      14
                                    }
                                  />
                                  Approve
                                </button>
                              )}

                              {device.status ===
                                "ACTIVE" && (
                                <button
                                  type="button"
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    void revokeDevice(
                                      device.id
                                    )
                                  }
                                  className="danger-button px-3 py-2 text-xs"
                                >
                                  <ShieldOff
                                    size={
                                      14
                                    }
                                  />
                                  Revoke
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="rounded-input bg-background p-4 text-sm text-text-secondary">
                        No devices
                        registered.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-lg">
                    Presence History
                  </h3>

                  <div className="space-y-2">
                    {history.length > 0 ? (
                      history.map(
                        (log) => (
                          <div
                            key={log.id}
                            className="rounded-input border border-border bg-background p-3"
                          >
                            <div className="flex items-center justify-between">
                              <StatusBadge
                                value={
                                  log.result
                                }
                              />

                              <span className="font-mono text-[10px] text-text-secondary">
                                {formatDate(
                                  log.timestamp
                                )}
                              </span>
                            </div>

                            <div className="mt-2 flex gap-4 text-xs text-text-secondary">
                              <span>
                                {
                                  log.method
                                }
                              </span>

                              <span>
                                {log.distanceMeters !=
                                null
                                  ? `${Math.round(
                                      log.distanceMeters
                                    )}m`
                                  : "—"}{" "}
                                away
                              </span>

                              <span>
                                {log.accuracy !=
                                null
                                  ? `±${Math.round(
                                      log.accuracy
                                    )}m`
                                  : "—"}
                              </span>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="rounded-input bg-background p-4 text-sm text-text-secondary">
                        No recent
                        verification
                        history.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border p-5">
                <h3 className="mb-3 font-display text-lg">
                  Vouchers
                </h3>

                {vouchers.length > 0 ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    {vouchers.map(
                      (customerVoucher) => (
                        <div
                          key={
                            customerVoucher.id
                          }
                          className="rounded-input border border-border bg-background p-3"
                        >
                          <div className="flex justify-between">
                            <span className="font-mono text-xs text-accent-gold">
                              {customerVoucher.voucher
                                ?.code ||
                                `#${customerVoucher.voucherId}`}
                            </span>

                            <StatusBadge
                              value={
                                customerVoucher.status
                              }
                            />
                          </div>

                          <p className="mt-2 text-sm font-semibold">
                            {customerVoucher.voucher
                              ?.name ||
                              "Voucher"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="rounded-input bg-background p-4 text-sm text-text-secondary">
                    No vouchers
                    available for
                    this member.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <Modal
        open={!!confirm}
        onClose={() =>
          setConfirm(null)
        }
        title="Approve trusted device"
      >
        <div>
          <div className="rounded-input border border-accent-gold/20 bg-accent-gold/5 p-4">
            <p className="font-semibold">
              This will revoke the current
              active device.
            </p>

            <p className="mt-1 text-sm text-text-secondary">
              The selected device will
              become the customer's active
              trusted device. Proceed?
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() =>
                setConfirm(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="gold-button"
              disabled={busy}
              onClick={() =>
                void approveDevice()
              }
            >
              {busy
                ? "Approving…"
                : "Proceed & Approve"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Info({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-input bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-secondary">
        {label}
      </p>

      <p className="mt-1 truncate text-sm">
        {value}
      </p>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Presence.tsx" <<'TSX'
import {
  useEffect,
  useState
} from "react";

import {
  Check,
  Copy,
  Download,
  QrCode,
  RefreshCw,
  Search
} from "lucide-react";

import QRCode from "qrcode";

import api, {
  apiMessage
} from "../services/api";

import type {
  PresenceLog,
  QrToken
} from "../types";

import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

import {
  formatDate
} from "../lib/format";

export default function Presence() {
  const [
    logs,
    setLogs
  ] = useState<PresenceLog[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    result,
    setResult
  ] = useState("ALL");

  const [
    method,
    setMethod
  ] = useState("ALL");

  const [
    customer,
    setCustomer
  ] = useState("");

  const [
    qr,
    setQr
  ] = useState<QrToken | null>(
    null
  );

  const [
    qrImage,
    setQrImage
  ] = useState("");

  const [
    seconds,
    setSeconds
  ] = useState(0);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    copied,
    setCopied
  ] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          "/presence/logs?limit=100"
        );

      setLogs(
        response.data.data
          ?.logs ??
          response.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!qr) {
      return;
    }

    const tick = () => {
      const remaining =
        Math.ceil(
          (new Date(
            qr.expiresAt
          ).getTime() -
            Date.now()) /
            1000
        );

      setSeconds(
        Math.max(
          0,
          remaining
        )
      );
    };

    tick();

    const interval =
      window.setInterval(
        tick,
        500
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [qr]);

  const generateQr =
    async () => {
      setBusy(true);
      setError("");

      try {
        const response =
          await api.post(
            "/presence/qr/generate",
            {}
          );

        const token =
          response.data.data ??
          response.data;

        setQr(token);

        const image =
          await QRCode.toDataURL(
            token.token,
            {
              width: 320,
              margin: 2,
              color: {
                dark: "#0B0B0F",
                light: "#F5F5F7"
              }
            }
          );

        setQrImage(image);
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      } finally {
        setBusy(false);
      }
    };

  const filtered =
    logs.filter((log) => {
      const resultMatches =
        result === "ALL" ||
        log.result === result;

      const methodMatches =
        method === "ALL" ||
        log.method === method;

      const customerMatches =
        !customer ||
        String(
          log.customerId
        ) === customer ||
        log.customer?.name
          ?.toLowerCase()
          .includes(
            customer.toLowerCase()
          );

      return (
        resultMatches &&
        methodMatches &&
        customerMatches
      );
    });

  const copyToken =
    async () => {
      if (!qr) {
        return;
      }

      await navigator.clipboard.writeText(
        qr.token
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        1200
      );
    };

  if (loading) {
    return (
      <Loading label="Loading presence logs" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Presence / Verification
          </p>

          <h1 className="page-title">
            Presence & QR Logs
          </h1>

          <p className="mt-2 muted">
            Monitor GPS + single-use
            QR verification events.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              void generateQr()
            }
            disabled={busy}
            className="gold-button"
          >
            <QrCode size={16} />

            {busy
              ? "Generating…"
              : "Generate New QR"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-3 text-text-secondary"
              size={16}
            />

            <input
              className="premium-input pl-9"
              placeholder="Customer name or ID"
              value={customer}
              onChange={(event) =>
                setCustomer(
                  event.target.value
                )
              }
            />
          </div>

          <select
            className="premium-input"
            value={method}
            onChange={(event) =>
              setMethod(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All methods
            </option>
            <option value="GPS_QR">
              GPS + QR
            </option>
            <option value="COMBINED">
              Combined
            </option>
            <option value="QR">
              QR
            </option>
            <option value="LOCATION">
              Location
            </option>
          </select>

          <select
            className="premium-input"
            value={result}
            onChange={(event) =>
              setResult(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All results
            </option>
            <option value="SUCCESS">
              Success
            </option>
            <option value="FAILED">
              Failed
            </option>
            <option value="REJECTED">
              Rejected
            </option>
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr className="text-[10px] uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3">
                  Timestamp
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Method
                </th>

                <th className="px-4 py-3">
                  Distance
                </th>

                <th className="px-4 py-3">
                  Accuracy
                </th>

                <th className="px-4 py-3">
                  Result
                </th>

                <th className="px-4 py-3">
                  QR Token
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map(
                (log) => (
                  <tr
                    key={log.id}
                    className="transition hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">
                      {formatDate(
                        log.timestamp
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium">
                        {log.customer?.name ||
                          `Customer #${log.customerId}`}
                      </p>

                      <p className="font-mono text-[10px] text-text-secondary">
                        #{log.customerId}
                      </p>
                    </td>

                    <td className="px-4 py-3 font-mono text-[11px]">
                      {log.method}
                    </td>

                    <td className="px-4 py-3">
                      {log.distanceMeters !=
                      null
                        ? `${Math.round(
                            log.distanceMeters
                          )} m`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {log.accuracy !=
                      null
                        ? `±${Math.round(
                            log.accuracy
                          )} m`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          log.result
                        }
                      />
                    </td>

                    <td className="max-w-[220px] truncate px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {log.qrTokenId
                        ? `QR #${log.qrTokenId}`
                        : "—"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No presence logs
              match the filters.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!qr}
        onClose={() =>
          setQr(null)
        }
        title="Single-use QR token"
        wide
      >
        {qr && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center rounded-card border border-border bg-background p-6">
              <img
                src={qrImage}
                alt="Dynamic cafe verification QR"
                className="h-64 w-64 rounded-xl bg-white p-3"
              />

              <p className="mt-4 text-xs text-text-secondary">
                Scan inside the cafe to
                verify presence.
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-wider text-text-secondary">
                Expires in
              </p>

              <p
                className={`mt-1 font-mono text-4xl font-semibold ${
                  seconds <= 5
                    ? "text-accent-red"
                    : "text-accent-gold"
                }`}
              >
                {seconds}s
              </p>

              <div className="mt-2">
                <StatusBadge
                  value={
                    seconds > 0
                      ? "PENDING"
                      : "EXPIRED"
                  }
                  pulse
                />
              </div>

              <div className="mt-5 rounded-input border border-border bg-background p-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-text-secondary">
                  Token
                </p>

                <p className="break-all font-mono text-xs leading-5 text-text-primary">
                  {qr.token}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="ghost-button flex-1"
                  onClick={() =>
                    void copyToken()
                  }
                >
                  {copied ? (
                    <Check size={15} />
                  ) : (
                    <Copy size={15} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy token"}
                </button>

                <a
                  className="ghost-button"
                  href={qrImage}
                  download="secret-brew-qr.png"
                >
                  <Download size={15} />
                  PNG
                </a>
              </div>

              <p className="mt-4 font-mono text-[10px] text-text-secondary">
                TOKEN ID: {qr.id} ·
                STATUS: {qr.status}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Vouchers.tsx" <<'TSX'
import {
  type FormEvent,
  useEffect,
  useState
} from "react";

import {
  Plus,
  RefreshCw,
  Send,
  Ticket
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  Customer,
  Voucher
} from "../types";

import Drawer from "../components/Drawer";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

import {
  money
} from "../lib/format";

interface VoucherForm {
  code: string;
  name: string;
  description: string;
  type: string;
  value: string;
  maxRedemptions: string;
  expiresAt: string;
}

const initialForm: VoucherForm = {
  code: "",
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  maxRedemptions: "",
  expiresAt: ""
};

export default function Vouchers() {
  const [
    vouchers,
    setVouchers
  ] = useState<Voucher[]>([]);

  const [
    customers,
    setCustomers
  ] = useState<Customer[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    drawer,
    setDrawer
  ] = useState(false);

  const [
    issue,
    setIssue
  ] = useState<Voucher | null>(
    null
  );

  const [
    customerId,
    setCustomerId
  ] = useState("");

  const [
    form,
    setForm
  ] = useState<VoucherForm>(
    initialForm
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        voucherResponse,
        customerResponse
      ] = await Promise.all([
        api.get(
          "/vouchers?limit=100"
        ),
        api.get(
          "/customers?limit=100"
        )
      ]);

      setVouchers(
        voucherResponse.data.data
          ?.vouchers ??
          voucherResponse.data.data ??
          []
      );

      setCustomers(
        customerResponse.data.data
          ?.customers ??
          customerResponse.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createVoucher =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      setBusy(true);
      setError("");

      try {
        await api.post(
          "/vouchers/create",
          {
            code: form.code,
            name: form.name,
            description:
              form.description ||
              undefined,
            type: form.type,
            value: form.value
              ? Number(form.value)
              : undefined,
            maxRedemptions:
              form.maxRedemptions
                ? Number(
                    form.maxRedemptions
                  )
                : undefined,
            expiresAt:
              form.expiresAt ||
              undefined
          }
        );

        setDrawer(false);
        setForm(initialForm);

        await load();
      } catch (requestError) {
        setError(
          apiMessage(
            requestError
          )
        );
      } finally {
        setBusy(false);
      }
    };

  const issueVoucher =
    async () => {
      if (
        !issue ||
        !customerId
      ) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        await api.post(
          `/vouchers/${issue.id}/issue`,
          {
            customerId:
              Number(customerId)
          }
        );

        setIssue(null);
        setCustomerId("");

        await load();
      } catch (requestError) {
        setError(
          apiMessage(
            requestError
          )
        );
      } finally {
        setBusy(false);
      }
    };

  if (loading) {
    return (
      <Loading label="Loading voucher library" />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Rewards / Offers
          </p>

          <h1 className="page-title">
            Voucher Management
          </h1>

          <p className="mt-2 muted">
            Create controlled offers
            and issue them to members.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setDrawer(true)
            }
            className="gold-button"
          >
            <Plus size={16} />
            Create Voucher
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vouchers.map(
          (voucher) => (
            <div
              key={voucher.id}
              className="premium-card p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl border border-accent-gold/20 bg-accent-gold/10 p-2.5 text-accent-gold">
                  <Ticket size={19} />
                </div>

                <StatusBadge
                  value={
                    voucher.status
                  }
                />
              </div>

              <p className="mt-5 font-mono text-xs tracking-widest text-accent-gold">
                {voucher.code}
              </p>

              <h2 className="mt-2 font-display text-xl font-semibold">
                {voucher.name}
              </h2>

              <p className="mt-1 min-h-10 text-sm text-text-secondary">
                {voucher.description ||
                  "Member reward voucher"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Metric
                  label="Type"
                  value={
                    voucher.type
                  }
                />

                <Metric
                  label="Value"
                  value={
                    voucher.type ===
                    "PERCENTAGE"
                      ? `${voucher.value ?? 0}%`
                      : money(
                          voucher.value
                        )
                  }
                />
              </div>

              <button
                type="button"
                disabled={
                  voucher.status !==
                  "ACTIVE"
                }
                onClick={() =>
                  setIssue(
                    voucher
                  )
                }
                className="gold-button mt-4 w-full"
              >
                <Send size={15} />
                Issue to Customer
              </button>
            </div>
          )
        )}
      </div>

      <div className="premium-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <Ticket
            size={19}
            className="text-accent-gold"
          />

          <div>
            <h2 className="font-display text-xl font-semibold">
              Redemption Activity
            </h2>

            <p className="muted">
              Voucher inventory and
              usage counters
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-border text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-3 py-3">
                  Code
                </th>

                <th className="px-3 py-3">
                  Title
                </th>

                <th className="px-3 py-3">
                  Status
                </th>

                <th className="px-3 py-3">
                  Redeemed
                </th>

                <th className="px-3 py-3">
                  Limit
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {vouchers.map(
                (voucher) => (
                  <tr
                    key={voucher.id}
                    className="hover:bg-surface-hover"
                  >
                    <td className="px-3 py-3 font-mono text-xs text-accent-gold">
                      {voucher.code}
                    </td>

                    <td className="px-3 py-3">
                      {voucher.name}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge
                        value={
                          voucher.status
                        }
                      />
                    </td>

                    <td className="px-3 py-3">
                      {voucher.redeemedCount ??
                        0}
                    </td>

                    <td className="px-3 py-3">
                      {voucher.maxRedemptions ??
                        "∞"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Drawer
        open={drawer}
        onClose={() =>
          setDrawer(false)
        }
        title="Create voucher"
      >
        <form
          onSubmit={createVoucher}
          className="space-y-4"
        >
          <Field label="Code">
            <input
              className="premium-input font-mono"
              required
              value={form.code}
              onChange={(event) =>
                setForm({
                  ...form,
                  code: event.target.value.toUpperCase()
                })
              }
            />
          </Field>

          <Field label="Title">
            <input
              className="premium-input"
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value
                })
              }
            />
          </Field>

          <Field label="Description">
            <textarea
              className="premium-input min-h-24"
              value={
                form.description
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value
                })
              }
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type">
              <select
                className="premium-input"
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type:
                      event.target.value
                  })
                }
              >
                <option value="PERCENTAGE">
                  PERCENTAGE
                </option>

                <option value="FLAT">
                  FLAT
                </option>

                <option value="FREE_ITEM">
                  FREE ITEM
                </option>
              </select>
            </Field>

            <Field label="Value">
              <input
                className="premium-input"
                type="number"
                min="0"
                value={form.value}
                onChange={(event) =>
                  setForm({
                    ...form,
                    value:
                      event.target.value
                  })
                }
              />
            </Field>
          </div>

          <Field label="Max redemptions">
            <input
              className="premium-input"
              type="number"
              min="1"
              value={
                form.maxRedemptions
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  maxRedemptions:
                    event.target.value
                })
              }
            />
          </Field>

          <Field label="Expires at">
            <input
              className="premium-input"
              type="datetime-local"
              value={
                form.expiresAt
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  expiresAt:
                    event.target.value
                })
              }
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="gold-button w-full"
          >
            {busy
              ? "Creating…"
              : "Create Voucher"}
          </button>
        </form>
      </Drawer>

      <Modal
        open={!!issue}
        onClose={() => {
          setIssue(null);
          setCustomerId("");
        }}
        title="Issue voucher"
      >
        <p className="text-sm text-text-secondary">
          Choose an approved customer
          for{" "}
          <span className="font-mono text-accent-gold">
            {issue?.code}
          </span>
          .
        </p>

        <select
          className="premium-input mt-4"
          value={customerId}
          onChange={(event) =>
            setCustomerId(
              event.target.value
            )
          }
        >
          <option value="">
            Select customer
          </option>

          {customers
            .filter(
              (customer) =>
                customer.status ===
                "APPROVED"
            )
            .map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
                {customer.name} ·{" "}
                {customer.phone}
              </option>
            ))}
        </select>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="ghost-button"
            onClick={() =>
              setIssue(null)
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="gold-button"
            disabled={
              !customerId ||
              busy
            }
            onClick={() =>
              void issueVoucher()
            }
          >
            {busy
              ? "Issuing…"
              : "Issue Voucher"}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>

      {children}
    </label>
  );
}

function Metric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-input bg-background p-2.5">
      <p className="text-[10px] uppercase text-text-secondary">
        {label}
      </p>

      <p className="mt-1 font-mono text-xs">
        {value}
      </p>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Employees.tsx" <<'TSX'
import {
  type FormEvent,
  useEffect,
  useState
} from "react";

import {
  Plus,
  RefreshCw,
  UserCog
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  Employee,
  Role
} from "../types";

import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

import {
  formatDate
} from "../lib/format";

import {
  useAuthStore
} from "../store/auth.store";

interface EmployeeForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export default function Employees() {
  const me = useAuthStore(
    (state) => state.employee
  );

  const [
    rows,
    setRows
  ] = useState<Employee[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    open,
    setOpen
  ] = useState(false);

  const [
    busy,
    setBusy
  ] = useState(false);

  const [
    form,
    setForm
  ] = useState<EmployeeForm>({
    name: "",
    email: "",
    password: "",
    role: "CASHIER"
  });

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          "/employees?limit=100"
        );

      setRows(
        response.data.data
          ?.employees ??
          response.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const createEmployee =
    async (
      event: FormEvent
    ) => {
      event.preventDefault();

      setBusy(true);
      setError("");

      try {
        await api.post(
          "/employees",
          form
        );

        setOpen(false);

        setForm({
          name: "",
          email: "",
          password: "",
          role: "CASHIER"
        });

        await load();
      } catch (requestError) {
        setError(
          apiMessage(
            requestError
          )
        );
      } finally {
        setBusy(false);
      }
    };

  const toggleEmployee =
    async (
      employee: Employee
    ) => {
      setBusy(true);
      setError("");

      try {
        await api.post(
          `/employees/${employee.id}/${
            employee.isActive
              ? "deactivate"
              : "activate"
          }`
        );

        await load();
      } catch (requestError) {
        setError(
          apiMessage(
            requestError
          )
        );
      } finally {
        setBusy(false);
      }
    };

  if (
    !me ||
    me.role !== "ADMIN"
  ) {
    return (
      <div className="premium-card p-8 text-center">
        <UserCog
          className="mx-auto mb-3 text-accent-red"
        />

        <h1 className="font-display text-2xl">
          Admin access required
        </h1>

        <p className="mt-2 text-sm text-text-secondary">
          Employee administration is
          restricted to ADMIN users.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <Loading label="Loading employees" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            People / Security
          </p>

          <h1 className="page-title">
            Employee Management
          </h1>

          <p className="mt-2 muted">
            Manage roles and operational
            access.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              void load()
            }
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              setOpen(true)
            }
            className="gold-button"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">
                  Name
                </th>

                <th className="px-4 py-3">
                  Email
                </th>

                <th className="px-4 py-3">
                  Role
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Created
                </th>

                <th className="px-4 py-3">
                  Access
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map(
                (employee) => (
                  <tr
                    key={employee.id}
                    className="transition hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3 font-medium">
                      {employee.name}
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      {employee.email}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          employee.role
                        }
                      />
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          employee.isActive
                            ? "ACTIVE"
                            : "REVOKED"
                        }
                      />
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {formatDate(
                        employee.createdAt
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={
                          busy ||
                          employee.id ===
                            me.id
                        }
                        onClick={() =>
                          void toggleEmployee(
                            employee
                          )
                        }
                        className="ghost-button px-3 py-2 text-xs"
                      >
                        {employee.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No employees found.
            </div>
          )}
        </div>
      </div>

      <Modal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        title="Add employee"
      >
        <form
          onSubmit={createEmployee}
          className="space-y-4"
        >
          <Field label="Name">
            <input
              className="premium-input"
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name: event.target.value
                })
              }
            />
          </Field>

          <Field label="Email">
            <input
              className="premium-input"
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email:
                    event.target.value
                })
              }
            />
          </Field>

          <Field label="Temporary password">
            <input
              className="premium-input"
              type="password"
              minLength={8}
              required
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password:
                    event.target.value
                })
              }
            />
          </Field>

          <Field label="Role">
            <select
              className="premium-input"
              value={form.role}
              onChange={(event) =>
                setForm({
                  ...form,
                  role:
                    event.target
                      .value as Role
                })
              }
            >
              {[
                "ADMIN",
                "MANAGER",
                "CASHIER",
                "VERIFIER"
              ].map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="gold-button w-full"
          >
            {busy
              ? "Creating…"
              : "Create Employee"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </span>

      {children}
    </label>
  );
}
TSX

cat > "$ROOT/src/pages/AuditLogs.tsx" <<'TSX'
import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Terminal
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  AuditLog
} from "../types";

import Loading from "../components/Loading";

import {
  formatDate,
  prettyAction
} from "../lib/format";

export default function AuditLogs() {
  const [
    logs,
    setLogs
  ] = useState<AuditLog[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    action,
    setAction
  ] = useState("ALL");

  const [
    employee,
    setEmployee
  ] = useState("");

  const [
    expanded,
    setExpanded
  ] = useState<number | null>(
    null
  );

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await api.get(
          "/employees/audit-logs?limit=100"
        );

      setLogs(
        response.data.data?.logs ??
          response.data.data ??
          []
      );
    } catch (requestError) {
      setError(
        apiMessage(
          requestError,
          "Unable to load audit logs."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const actions =
    useMemo(
      () =>
        Array.from(
          new Set(
            logs.map(
              (log) =>
                log.action
            )
          )
        ).sort(),
      [logs]
    );

  const filtered =
    logs.filter(
      (log) => {
        const actionMatches =
          action === "ALL" ||
          log.action === action;

        const employeeMatches =
          !employee ||
          String(
            log.employeeId
          ) === employee ||
          log.employee?.name
            ?.toLowerCase()
            .includes(
              employee.toLowerCase()
            );

        return (
          actionMatches &&
          employeeMatches
        );
      }
    );

  const actionClass =
    (value: string) => {
      if (
        value.includes(
          "REVOKE"
        ) ||
        value.includes(
          "DELETE"
        )
      ) {
        return "text-accent-red";
      }

      if (
        value.includes(
          "APPROVE"
        ) ||
        value.includes(
          "CREATE"
        )
      ) {
        return "text-accent-green";
      }

      if (
        value.includes(
          "UPDATE"
        )
      ) {
        return "text-accent-blue";
      }

      return "text-text-secondary";
    };

  if (loading) {
    return (
      <Loading label="Loading audit trail" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Security / Forensics
          </p>

          <h1 className="page-title">
            Audit Logs
          </h1>

          <p className="mt-2 muted">
            Terminal-style trail of
            sensitive employee actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          className="ghost-button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="premium-input font-mono"
            placeholder="Employee name or ID"
            value={employee}
            onChange={(event) =>
              setEmployee(
                event.target.value
              )
            }
          />

          <select
            className="premium-input font-mono"
            value={action}
            onChange={(event) =>
              setAction(
                event.target.value
              )
            }
          >
            <option value="ALL">
              ALL ACTIONS
            </option>

            {actions.map(
              (value) => (
                <option
                  key={value}
                  value={value}
                >
                  {value}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left font-mono text-xs">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="w-10 px-3 py-3" />

                <th className="px-3 py-3">
                  Timestamp
                </th>

                <th className="px-3 py-3">
                  Employee
                </th>

                <th className="px-3 py-3">
                  Action
                </th>

                <th className="px-3 py-3">
                  Entity
                </th>

                <th className="px-3 py-3">
                  Entity ID
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map(
                (log) => (
                  <>
                    <tr
                      key={log.id}
                      onClick={() =>
                        setExpanded(
                          expanded ===
                            log.id
                            ? null
                            : log.id
                        )
                      }
                      className="cursor-pointer transition hover:bg-surface-hover"
                    >
                      <td className="px-3 py-3 text-text-secondary">
                        {expanded ===
                        log.id ? (
                          <ChevronDown
                            size={15}
                          />
                        ) : (
                          <ChevronRight
                            size={15}
                          />
                        )}
                      </td>

                      <td className="px-3 py-3 text-text-secondary">
                        {formatDate(
                          log.createdAt
                        )}
                      </td>

                      <td className="px-3 py-3">
                        {log.employee
                          ?.name ||
                          `EMP#${log.employeeId}`}
                      </td>

                      <td
                        className={`px-3 py-3 font-semibold ${actionClass(
                          log.action
                        )}`}
                      >
                        {prettyAction(
                          log.action
                        )}
                      </td>

                      <td className="px-3 py-3 text-text-secondary">
                        {log.entityType ||
                          "—"}
                      </td>

                      <td className="px-3 py-3 text-accent-gold">
                        {log.entityId ||
                          "—"}
                      </td>
                    </tr>

                    {expanded ===
                      log.id && (
                      <tr
                        key={`${log.id}-detail`}
                        className="bg-background"
                      >
                        <td
                          colSpan={6}
                          className="p-4"
                        >
                          <div className="rounded-input border border-border bg-[#09090c] p-4">
                            <div className="mb-2 flex items-center gap-2 text-accent-green">
                              <Terminal
                                size={14}
                              />

                              <span>
                                METADATA
                              </span>
                            </div>

                            <pre className="overflow-auto whitespace-pre-wrap text-[11px] leading-5 text-text-secondary">
                              {JSON.stringify(
                                log.details ??
                                  {},
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              )}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No audit records are
              available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Devices.tsx" <<'TSX'
import {
  useEffect,
  useState
} from "react";

import {
  RefreshCw,
  Smartphone
} from "lucide-react";

import api, {
  apiMessage
} from "../services/api";

import type {
  Customer,
  Device
} from "../types";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";

export default function Devices() {
  const [
    rows,
    setRows
  ] = useState<
    Array<
      Device & {
        customer?: Customer;
      }
    >
  >([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const customerResponse =
        await api.get(
          "/customers?limit=100"
        );

      const customers =
        customerResponse.data.data
          ?.customers ??
        customerResponse.data.data ??
        [];

      const responses =
        await Promise.all(
          customers.map(
            (customer: Customer) =>
              api
                .get(
                  `/devices/customer/${customer.id}`
                )
                .then(
                  (response) => {
                    const devices =
                      response.data.data ??
                      response.data ??
                      [];

                    return devices.map(
                      (
                        device: Device
                      ) => ({
                        ...device,
                        customer
                      })
                    );
                  }
                )
                .catch(() => [])
          )
        );

      setRows(
        responses.flat()
      );
    } catch (requestError) {
      setError(
        apiMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const action =
    async (
      device: Device
    ) => {
      setError("");

      try {
        await api.post(
          `/devices/${device.id}/${
            device.status ===
            "PENDING"
              ? "approve"
              : "revoke"
          }`
        );

        await load();
      } catch (requestError) {
        setError(
          apiMessage(requestError)
        );
      }
    };

  if (loading) {
    return (
      <Loading label="Loading device registry" />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Access / Hardware
          </p>

          <h1 className="page-title">
            Device Registry
          </h1>

          <p className="mt-2 muted">
            Every trusted endpoint
            attached to a member account.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void load()
          }
          className="ghost-button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-input border border-accent-red/30 bg-accent-red/10 p-3 text-sm text-accent-red">
          {error}
        </div>
      )}

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">
                  Device
                </th>

                <th className="px-4 py-3">
                  Customer
                </th>

                <th className="px-4 py-3">
                  Device ID
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Registered
                </th>

                <th className="px-4 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map(
                (device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-surface-hover"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Smartphone
                          size={17}
                          className="text-accent-gold"
                        />

                        <span>
                          {device.deviceName ||
                            device.platform ||
                            "Device"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {device.customer
                        ?.name ||
                        `Customer #${device.customerId}`}
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {device.deviceId}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        value={
                          device.status
                        }
                      />
                    </td>

                    <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                      {new Date(
                        device.createdAt
                      ).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {device.status ===
                        "PENDING" && (
                        <button
                          type="button"
                          onClick={() =>
                            void action(
                              device
                            )
                          }
                          className="gold-button px-3 py-2 text-xs"
                        >
                          Approve
                        </button>
                      )}

                      {device.status ===
                        "ACTIVE" && (
                        <button
                          type="button"
                          onClick={() =>
                            void action(
                              device
                            )
                          }
                          className="danger-button px-3 py-2 text-xs"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No devices found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
TSX

cat > "$ROOT/src/pages/Settings.tsx" <<'TSX'
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
TSX

cat > "$ROOT/src/App.tsx" <<'TSX'
import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import {
  useAuthStore
} from "./store/auth.store";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Devices from "./pages/Devices";
import Presence from "./pages/Presence";
import Vouchers from "./pages/Vouchers";
import Employees from "./pages/Employees";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";

function ProtectedRoute({
  children
}: {
  children: React.ReactNode;
}) {
  const token = useAuthStore(
    (state) => state.token
  );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/customers"
          element={<Customers />}
        />

        <Route
          path="/devices"
          element={<Devices />}
        />

        <Route
          path="/presence"
          element={<Presence />}
        />

        <Route
          path="/vouchers"
          element={<Vouchers />}
        />

        <Route
          path="/employees"
          element={<Employees />}
        />

        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}
TSX

cat > "$ROOT/src/main.tsx" <<'TSX'
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter
} from "react-router-dom";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
TSX

cd "$ROOT"

npm install

npm run build

cd ..

printf '\nAdmin panel ready. Run: cd cafe-presence-admin && npm run dev\n'