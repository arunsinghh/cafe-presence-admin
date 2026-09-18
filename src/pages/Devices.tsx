import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, RefreshCw, Smartphone } from "lucide-react";

import api, { apiMessage, unwrapData } from "../services/api";
import type { Customer, Device } from "../types";

import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";

export default function Devices() {
  const [rows, setRows] = useState<Array<Device & { customer?: Customer }>>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmReplace, setConfirmReplace] = useState<Device & { customer?: Customer } | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const isInitialMount = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchReqIdRef = useRef(0);

  const fetchDevices = useCallback(async (searchQuery: string, statusFilter: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const reqId = ++searchReqIdRef.current;

    setSearchLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }
      if (statusFilter && statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const response = await api.get(`/devices?${params.toString()}`, {
        signal: controller.signal
      });

      if (searchReqIdRef.current !== reqId) return;

      const resData = unwrapData<{ devices?: Array<Device & { customer?: Customer }> } | Array<Device & { customer?: Customer }>>(response);
      const deviceList = Array.isArray(resData) ? resData : (resData?.devices ?? []);
      setRows(deviceList);
    } catch (requestError: any) {
      if (requestError?.name === "CanceledError" || requestError?.code === "ERR_CANCELED") {
        return;
      }

      // Fallback: query customer devices if running on legacy backend
      try {
        const customerResponse = await api.get("/customers?limit=100");
        const custRes = unwrapData<{ customers?: Customer[] } | Customer[]>(customerResponse);
        const customers: Customer[] = Array.isArray(custRes) ? custRes : (custRes?.customers ?? []);

        const responses = await Promise.all(
          customers.map((customer: Customer) =>
            api
              .get(`/devices/customer/${customer.id}`)
              .then((res) => {
                const devs = unwrapData<Device[]>(res);
                return (devs || []).map((device: Device) => ({
                  ...device,
                  customer
                }));
              })
              .catch(() => [])
          )
        );
        let deviceList = responses.flat();

        if (statusFilter && statusFilter !== "ALL") {
          deviceList = deviceList.filter((d) => d.status === statusFilter);
        }
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          deviceList = deviceList.filter((d) => {
            const phoneDigits = d.customer?.phone ? d.customer.phone.replace(/\D/g, "") : "";
            const text = [d.deviceName, d.platform, d.deviceId, d.customer?.name, d.customer?.phone, phoneDigits]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return text.includes(q);
          });
        }

        if (searchReqIdRef.current === reqId) {
          setRows(deviceList);
        }
      } catch {
        if (searchReqIdRef.current === reqId) {
          setError(apiMessage(requestError));
        }
      }
    } finally {
      if (searchReqIdRef.current === reqId) {
        setSearchLoading(false);
        setInitialLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      void fetchDevices("", "ALL");
      return;
    }

    const timer = setTimeout(() => {
      void fetchDevices(query, filter);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filter, fetchDevices]);

  const action = async (device: Device) => {
    setBusy(true);
    setError("");

    try {
      await api.post(
        `/devices/${device.id}/${device.status === "PENDING" ? "approve" : "revoke"}`
      );
      setSuccessMessage(
        device.status === "PENDING"
          ? "Device approved successfully."
          : "Device revoked successfully."
      );
      setTimeout(() => setSuccessMessage(""), 4000);
      await fetchDevices(query, filter);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleReplace = async () => {
    if (!confirmReplace) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/devices/${confirmReplace.id}/replace`);
      setConfirmReplace(null);
      setSuccessMessage("Active device revoked for replacement. Member may register a new device on next login.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await fetchDevices(query, filter);
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to replace device"));
    } finally {
      setBusy(false);
    }
  };

  if (initialLoading) {
    return <Loading label="Loading device registry" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Access / Hardware
          </p>

          <h1 className="page-title">Device Registry</h1>

          <p className="mt-2 muted">
            Every trusted endpoint attached to a member account.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchDevices(query, filter)}
          className="ghost-button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <ErrorBanner message={error} />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-input border border-accent-green/30 bg-accent-green/10 p-3 text-sm text-accent-green">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Control Area: Search & Status Filters */}
      <div className="premium-card p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <SearchInput
              placeholder="Search by customer name, phone, or device ID…"
              value={query}
              onChangeValue={setQuery}
              loading={searchLoading}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {["ALL", "PENDING", "ACTIVE", "REVOKED", "LOST"].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setFilter(value)}
                className={`whitespace-nowrap rounded-badge px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
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
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Device ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((device) => (
                <tr key={device.id} className="hover:bg-surface-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Smartphone size={17} className="text-accent-gold shrink-0" />
                      <div>
                        <p className="font-medium text-text-primary">
                          {device.deviceName || device.platform || "Device"}
                        </p>
                        {device.platform && device.deviceName && (
                          <p className="font-mono text-[10px] text-text-secondary">
                            {device.platform}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-text-primary">
                        {device.customer?.name || `Customer #${device.customerId}`}
                      </p>
                      {device.customer?.phone && (
                        <p className="font-mono text-xs text-text-secondary">
                          {device.customer.phone}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {device.deviceId}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge value={device.status} />
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">
                    {device.createdAt ? new Date(device.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>

                  <td className="px-4 py-3">
                    {device.status === "PENDING" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void action(device)}
                        className="gold-button px-3 py-1.5 text-xs"
                      >
                        Approve
                      </button>
                    )}

                    {device.status === "ACTIVE" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setConfirmReplace(device)}
                          className="gold-button px-3 py-1.5 text-xs"
                        >
                          Replace
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void action(device)}
                          className="danger-button px-3 py-1.5 text-xs"
                        >
                          Revoke
                        </button>
                      </div>
                    )}

                    {device.status !== "PENDING" && device.status !== "ACTIVE" && (
                      <span className="text-xs text-text-secondary">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-8">
              <EmptyState
                title="No devices found"
                text={
                  query.trim() || filter !== "ALL"
                    ? "No devices match your current search query or status filter."
                    : "No devices are currently registered in the registry."
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Device Replacement Confirmation Modal */}
      <Modal
        open={!!confirmReplace}
        onClose={() => setConfirmReplace(null)}
        title="Replace trusted device"
      >
        <div>
          <div className="rounded-input border border-accent-gold/20 bg-accent-gold/5 p-4">
            <p className="font-semibold">Replace active device</p>
            <p className="mt-1 text-sm text-text-secondary">
              This will revoke device ({confirmReplace?.deviceId}) for member{" "}
              <span className="font-semibold text-text-primary">
                {confirmReplace?.customer?.name || `Customer #${confirmReplace?.customerId}`}
              </span>
              {confirmReplace?.customer?.phone ? ` (${confirmReplace.customer.phone})` : ""}. The customer will be able to register a new device on their next login. Proceed?
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setConfirmReplace(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gold-button"
              disabled={busy}
              onClick={() => void handleReplace()}
            >
              {busy ? "Replacing…" : "Proceed & Replace"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
