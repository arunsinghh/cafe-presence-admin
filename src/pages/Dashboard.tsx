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
                        label={audit.action.replace(
                          /_/g,
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
