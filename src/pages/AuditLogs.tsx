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
