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


    const approveCustomer = async () => {
  if (!selected) {
    return;
  }

  setBusy(true);
  setError("");

  try {
    const response = await api.post(
      `/customers/${selected.id}/approve`
    );

    const updatedCustomer =
      response.data.data ?? response.data;

    await load();

    setSelected({
      ...selected,
      ...updatedCustomer,
      status: "APPROVED"
    });
  } catch (requestError) {
    setError(apiMessage(requestError));
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

                  <div className="flex flex-wrap gap-2">
  {selected.status === "PENDING" && (
    <button
      type="button"
      disabled={busy}
      onClick={() =>
        void approveCustomer()
      }
      className="gold-button"
    >
      <ShieldCheck size={15} />
      {busy ? "Approving…" : "Approve Customer"}
    </button>
  )}

  {selected.status === "APPROVED" && (
    <button
      type="button"
      disabled={busy}
      onClick={() =>
        void suspendCustomer()
      }
      className="danger-button"
    >
      <Ban size={15} />
      Suspend Customer
    </button>
  )}
</div>

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
