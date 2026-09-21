import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  ScanLine,
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
import { useNavigate } from "react-router-dom";

import api, { apiMessage, unwrapData } from "../services/api";
import type { AuditLog, Customer, Device, PresenceLog } from "../types";
import { formatDate } from "../lib/format";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import ErrorBanner from "../components/ErrorBanner";

interface DashboardCache {
  customers: Customer[];
  totalCustomers: number;
  devices: Device[];
  logs: PresenceLog[];
  audits: AuditLog[];
  cachedAt: number;
}

let dashboardCache: DashboardCache | null = null;

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>(() => dashboardCache?.customers ?? []);
  const [totalCustomers, setTotalCustomers] = useState<number>(() => dashboardCache?.totalCustomers ?? 0);
  const [devices, setDevices] = useState<Device[]>(() => dashboardCache?.devices ?? []);
  const [logs, setLogs] = useState<PresenceLog[]>(() => dashboardCache?.logs ?? []);
  const [audits, setAudits] = useState<AuditLog[]>(() => dashboardCache?.audits ?? []);
  const [loading, setLoading] = useState(() => !dashboardCache || Date.now() - dashboardCache.cachedAt > 30000);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const load = useCallback(async (force = false) => {
    if (!force && dashboardCache && Date.now() - dashboardCache.cachedAt < 30000) {
      return;
    }
    if (!dashboardCache) {
      setLoading(true);
    }
    setError("");

    try {
      const [customerRes, presenceRes, auditRes, pendingDeviceRes] = await Promise.allSettled([
        api.get("/customers?limit=100"),
        api.get("/presence/logs?limit=100"),
        api.get("/employees/audit-logs?limit=10"),
        api.get("/devices/pending")
      ]);

      let customerData: Customer[] = [];
      let totalCount = 0;
      if (customerRes.status === "fulfilled") {
        const rawCust = customerRes.value?.data;
        const custRes = unwrapData<{ customers?: Customer[]; pagination?: { total?: number } } | Customer[]>(customerRes.value);
        customerData = Array.isArray(custRes) ? custRes : (custRes?.customers ?? []);
        totalCount = (rawCust?.pagination?.total ?? (custRes as any)?.pagination?.total) ?? customerData.length;
      }

      let presenceData: PresenceLog[] = [];
      if (presenceRes.status === "fulfilled") {
        const presRes = unwrapData<{ logs?: PresenceLog[] } | PresenceLog[]>(presenceRes.value);
        presenceData = Array.isArray(presRes) ? presRes : (presRes?.logs ?? []);
      }

      let auditData: AuditLog[] = [];
      if (auditRes.status === "fulfilled") {
        const audRes = unwrapData<{ logs?: AuditLog[] } | AuditLog[]>(auditRes.value);
        auditData = Array.isArray(audRes) ? audRes : (audRes?.logs ?? []);
      }

      let pendingDeviceData: Device[] = [];
      if (pendingDeviceRes.status === "fulfilled") {
        const devRes = unwrapData<Device[]>(pendingDeviceRes.value);
        pendingDeviceData = Array.isArray(devRes) ? devRes : [];
      }

      setCustomers(customerData);
      setTotalCustomers(totalCount);
      setLogs(presenceData);
      setAudits(auditData);
      setDevices(pendingDeviceData);

      dashboardCache = {
        customers: customerData,
        totalCustomers: totalCount,
        devices: pendingDeviceData,
        logs: presenceData,
        audits: auditData,
        cachedAt: Date.now()
      };
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const todayLogs = useMemo(() => {
    return logs.filter((log) => new Date(log.timestamp) >= todayStart);
  }, [logs, todayStart]);

  const pendingApprovals = useMemo(() => {
    return (
      customers.filter((c) => c.status === "PENDING").length +
      devices.length
    );
  }, [customers, devices]);

  const activeDevicesCount = useMemo(() => {
    const totalDevices = customers.reduce(
      (sum, c) => sum + (c._count?.devices ?? c.devices?.length ?? 0),
      0
    );
    return Math.max(0, totalDevices - devices.length);
  }, [customers, devices]);

  const chart = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));

      const count = logs.filter(
        (log) => new Date(log.timestamp).toDateString() === date.toDateString()
      ).length;

      return {
        day: date.toLocaleDateString("en-IN", { weekday: "short" }),
        count
      };
    });
  }, [logs]);

  const stats = useMemo(() => [
    {
      label: "Total Customers",
      value: totalCustomers || customers.length,
      icon: Users,
      note: "Registered members"
    },
    {
      label: "Active Devices",
      value: activeDevicesCount,
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
  ], [totalCustomers, customers.length, activeDevicesCount, pendingApprovals, todayLogs.length]);

  if (loading) {
    return <Loading label="Loading command center" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Operations / Overview
          </p>

          <h1 className="page-title">Command Center</h1>

          <p className="mt-2 muted">
            A live view of the club's access and presence layer.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load(true)}
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/redeem")}
            className="gold-button"
          >
            <ScanLine size={16} />
            Redeem Voucher
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, note }) => (
          <div key={label} className="premium-card p-5">
            <div className="flex items-start justify-between">
              <div className="rounded-xl border border-border bg-background p-2.5 text-accent-gold">
                <Icon size={20} />
              </div>

              <ArrowUpRight size={16} className="text-text-secondary" />
            </div>

            <p className="mt-7 font-display text-3xl font-semibold">
              {value.toLocaleString()}
            </p>

            <p className="mt-1 text-sm font-medium">{label}</p>

            <p className="mt-1 text-xs text-text-secondary">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="premium-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Presence Verifications
              </h2>

              <p className="muted">Last 7 days</p>
            </div>

            <Activity className="text-accent-gold" size={20} />
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E0B973" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#E0B973" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#2A2A35" strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="day" stroke="#8E8E93" fontSize={11} />

                <YAxis allowDecimals={false} stroke="#8E8E93" fontSize={11} />

                <Tooltip
                  contentStyle={{
                    background: "#15151B",
                    border: "1px solid #2A2A35",
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
              <h2 className="font-display text-xl font-semibold">Recent Activity</h2>

              <p className="muted">Latest audit events</p>
            </div>

            <div className="rounded-xl border border-border bg-background p-2 text-accent-gold">
              <span className="font-mono text-sm">&gt;_</span>
            </div>
          </div>

          <div className="space-y-3">
            {audits.length > 0 ? (
              audits.slice(0, 10).map((audit) => (
                <div
                  key={audit.id}
                  className="rounded-input border border-border/60 bg-background/60 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatusBadge
                      value={
                        audit.action.includes("REVOKE")
                          ? "REVOKED"
                          : audit.action.includes("APPROVE")
                          ? "PENDING"
                          : "ACTIVE"
                      }
                      label={audit.action.replace(/_/g, " ")}
                    />

                    <span className="font-mono text-[10px] text-text-secondary">
                      {formatDate(audit.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-text-secondary">
                    {audit.entityType || "Entity"}{" "}
                    <span className="font-mono text-text-primary">
                      #{audit.entityId || audit.id}
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-input bg-background p-4 text-sm text-text-secondary">
                No audit events are available from the configured API.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
