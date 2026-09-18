import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPinCheck, RefreshCw } from "lucide-react";

import api, { apiMessage, unwrapData } from "../services/api";
import type { PresenceLog } from "../types";

import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";
import { formatDate } from "../lib/format";

export default function Presence() {
  const [logs, setLogs] = useState<PresenceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState("ALL");
  const [method, setMethod] = useState("ALL");
  const [customer, setCustomer] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/presence/logs?limit=100");
      const resData = unwrapData<{ logs?: PresenceLog[] } | PresenceLog[]>(response);
      const logList = Array.isArray(resData) ? resData : (resData?.logs ?? []);
      setLogs(logList);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const resultMatches = result === "ALL" || log.result === result;
      const methodMatches = method === "ALL" || log.method === method;
      const customerMatches =
        !customer ||
        String(log.customerId) === customer ||
        log.customer?.name?.toLowerCase().includes(customer.toLowerCase());

      return resultMatches && methodMatches && customerMatches;
    });
  }, [logs, result, method, customer]);

  if (loading) {
    return <Loading label="Loading GPS presence logs..." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Presence / Verification
          </p>

          <h1 className="page-title">Presence Logs</h1>

          <p className="mt-2 muted">
            GPS-verified member presence events within the authorized 50-meter cafe radius.
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="ghost-button">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="premium-card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <SearchInput
            placeholder="Customer name or ID"
            value={customer}
            onChangeValue={setCustomer}
          />

          <select
            className="premium-input"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          >
            <option value="ALL">All verification methods</option>
            <option value="GPS">GPS Only</option>
            <option value="LOCATION">Location</option>
          </select>

          <select
            className="premium-input"
            value={result}
            onChange={(event) => setResult(event.target.value)}
          >
            <option value="ALL">All results</option>
            <option value="SUCCESS">Success (Within 50m)</option>
            <option value="FAILED">Failed</option>
            <option value="REJECTED">Rejected (Outside 50m)</option>
          </select>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-background">
              <tr className="text-[10px] uppercase tracking-wider text-text-secondary">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Accuracy</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Result</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filtered.map((log) => (
                <tr key={log.id} className="transition hover:bg-surface-hover">
                  <td className="px-4 py-3 font-mono text-[11px] text-text-secondary">
                    {formatDate(log.timestamp)}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {log.customer?.name || `Customer #${log.customerId}`}
                    </p>
                    <p className="font-mono text-[10px] text-text-secondary">
                      #{log.customerId} {log.customer?.phone ? `· ${log.customer.phone}` : ""}
                    </p>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs">
                    {log.device?.deviceId ? (
                      <span className="text-text-secondary">
                        {log.device.deviceId.substring(0, 12)}…
                      </span>
                    ) : (
                      `#${log.deviceId}`
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-accent-gold">
                      <MapPinCheck size={13} />
                      {log.method}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs">
                    {log.distanceMeters != null ? (
                      <span
                        className={
                          log.distanceMeters <= 50
                            ? "text-accent-green font-semibold"
                            : "text-accent-red"
                        }
                      >
                        {Math.round(log.distanceMeters)} m
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {log.accuracy != null ? `±${Math.round(log.accuracy)} m` : "—"}
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {log.purpose || "CAFE_PRESENCE"}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge value={log.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No presence logs match the filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
