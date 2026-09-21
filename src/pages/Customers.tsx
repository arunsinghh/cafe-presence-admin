import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Ticket,
  UserCheck,
  UserPlus,
  UserRound,
  X
} from "lucide-react";

import api, { apiMessage, customerAPI, unwrapData } from "../services/api";
import type { Customer, CustomerStatus, CustomerVoucher, Device, PresenceLog, Voucher } from "../types";
import { useAuthStore } from "../store/auth.store";
import { hasPermission } from "../lib/permissions";

import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";

import { formatDate, initials, money } from "../lib/format";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [history, setHistory] = useState<PresenceLog[]>([]);
  const [vouchers, setVouchers] = useState<CustomerVoucher[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<Device | null>(null);
  const [replaceConfirm, setReplaceConfirm] = useState<Device | null>(null);
  const [busy, setBusy] = useState(false);

  // Multi-customer selection state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [activeVouchers, setActiveVouchers] = useState<Voucher[]>([]);
  const [bulkVoucherId, setBulkVoucherId] = useState<number | "">("");

  // Single customer issue voucher state
  const [singleIssueModalOpen, setSingleIssueModalOpen] = useState(false);
  const [singleVoucherId, setSingleVoucherId] = useState<number | "">("");

  const me = useAuthStore((state) => state.employee);
  const canManageCustomers = hasPermission(me, ["CUSTOMER_MANAGE"]);

  // Registration state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerFormError, setRegisterFormError] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
  }>({});
  const [registerForm, setRegisterForm] = useState<{
    name: string;
    phone: string;
    email: string;
    status: "APPROVED" | "PENDING";
  }>({
    name: "",
    phone: "",
    email: "",
    status: "APPROVED"
  });

  const activeCustomerIdRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchReqIdRef = useRef(0);

  const normalizeStatus = (status?: string | null) => {
    if (!status) return "";
    const s = status.toUpperCase();
    return s === "ACTIVE" ? "APPROVED" : s;
  };

  const fetchCustomers = useCallback(async (searchQuery: string, statusFilter: string) => {
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
        params.set("status", normalizeStatus(statusFilter));
      }

      const response = await api.get(`/customers?${params.toString()}`, {
        signal: controller.signal
      });

      if (searchReqIdRef.current !== reqId) return;

      const resData = unwrapData<{ customers?: Customer[] } | Customer[]>(response);
      const customerList = Array.isArray(resData) ? resData : (resData?.customers ?? []);
      setCustomers(customerList);
    } catch (requestError: any) {
      if (requestError?.name === "CanceledError" || requestError?.code === "ERR_CANCELED") {
        return;
      }
      if (searchReqIdRef.current === reqId) {
        setError(apiMessage(requestError));
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
      void fetchCustomers("", "ALL");
      return;
    }

    const timer = setTimeout(() => {
      void fetchCustomers(query, filter);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, filter, fetchCustomers]);

  const load = useCallback(() => {
    return fetchCustomers(query, filter);
  }, [fetchCustomers, query, filter]);

  const loadCustomerDetails = useCallback(async (customerId: number) => {
    activeCustomerIdRef.current = customerId;
    setDetailsLoading(true);
    // Clear details immediately so no stale data from previous selections remains
    setDevices([]);
    setVouchers([]);
    setHistory([]);

    try {
      const [customerRes, vouchersRes, historyRes, devicesRes] = await Promise.allSettled([
        api.get(`/customers/${customerId}`),
        api.get(`/customers/${customerId}/vouchers`),
        api.get(`/presence/logs?customerId=${customerId}&limit=10`),
        api.get(`/devices/customer/${customerId}`)
      ]);

      // Guard against race conditions: if active customer changed, discard
      if (activeCustomerIdRef.current !== customerId) {
        return;
      }

      let customerVouchersList: CustomerVoucher[] = [];
      let customerDevices: Device[] = [];

      if (customerRes.status === "fulfilled") {
        const customerData = unwrapData<Customer & { customerVouchers?: CustomerVoucher[]; vouchers?: CustomerVoucher[] }>(customerRes.value);
        if (customerData) {
          if (Array.isArray(customerData.devices) && customerData.devices.length > 0) {
            customerDevices = customerData.devices;
          }
          if (Array.isArray(customerData.customerVouchers) && customerData.customerVouchers.length > 0) {
            customerVouchersList = customerData.customerVouchers;
          } else if (Array.isArray(customerData.vouchers) && customerData.vouchers.length > 0) {
            customerVouchersList = customerData.vouchers;
          }
        }
      }

      if (customerDevices.length === 0 && devicesRes.status === "fulfilled") {
        const devData = unwrapData<Device[]>(devicesRes.value);
        if (Array.isArray(devData)) {
          customerDevices = devData;
        }
      }

      if (customerVouchersList.length === 0 && vouchersRes.status === "fulfilled") {
        const vData = unwrapData<{ vouchers?: CustomerVoucher[]; customerVouchers?: CustomerVoucher[] } | CustomerVoucher[]>(vouchersRes.value);
        if (Array.isArray(vData)) {
          customerVouchersList = vData;
        } else if (vData && Array.isArray((vData as any).vouchers)) {
          customerVouchersList = (vData as any).vouchers;
        } else if (vData && Array.isArray((vData as any).customerVouchers)) {
          customerVouchersList = (vData as any).customerVouchers;
        }
      }

      setDevices(customerDevices);
      setVouchers(customerVouchersList);

      if (historyRes.status === "fulfilled") {
        const histData = unwrapData<{ logs?: PresenceLog[] } | PresenceLog[]>(historyRes.value);
        const customerHistory = Array.isArray(histData) ? histData : (histData?.logs ?? []);
        setHistory(customerHistory);
      }
    } catch (requestError) {
      if (activeCustomerIdRef.current === customerId) {
        setError(apiMessage(requestError));
      }
    } finally {
      if (activeCustomerIdRef.current === customerId) {
        setDetailsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setDevices([]);
      setHistory([]);
      setVouchers([]);
      return;
    }

    void loadCustomerDetails(selected.id);
  }, [selected?.id, loadCustomerDetails]);

  // Load available active vouchers for issuing
  const loadActiveVouchers = useCallback(async () => {
    try {
      const response = await api.get("/vouchers?limit=100");
      const resData = unwrapData<{ vouchers?: Voucher[] } | Voucher[]>(response);
      const allVouchers = Array.isArray(resData) ? resData : (resData?.vouchers ?? []);
      const active = allVouchers.filter((v) => v.status === "ACTIVE");
      setActiveVouchers(active);
      return active;
    } catch {
      return [];
    }
  }, []);

  const openSingleIssueModal = async () => {
    setError("");
    const vList = await loadActiveVouchers();
    if (vList.length > 0) {
      setSingleVoucherId(vList[0].id);
    } else {
      setSingleVoucherId("");
    }
    setSingleIssueModalOpen(true);
  };

  const handleSingleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !singleVoucherId) return;

    setBusy(true);
    setError("");

    try {
      try {
        await api.post(`/vouchers/${singleVoucherId}/issue`, {
          customerId: selected.id
        });
      } catch (issueErr) {
        await api.post(`/customers/${selected.id}/vouchers`, {
          voucherId: singleVoucherId
        });
      }

      setSingleIssueModalOpen(false);
      setSuccessMessage(`Voucher issued successfully to ${selected.name}!`);
      setTimeout(() => setSuccessMessage(""), 4000);

      // Refresh customer profile from the authoritative backend
      await loadCustomerDetails(selected.id);
      void load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to issue voucher"));
    } finally {
      setBusy(false);
    }
  };

  const openBulkModal = async () => {
    if (selectedCustomerIds.length === 0) return;
    setError("");
    const vList = await loadActiveVouchers();
    if (vList.length > 0) {
      setBulkVoucherId(vList[0].id);
    } else {
      setBulkVoucherId("");
    }
    setBulkModalOpen(true);
  };

  const handleBulkIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkVoucherId || selectedCustomerIds.length === 0) return;

    setBusy(true);
    setError("");

    try {
      const response = await api.post(`/vouchers/${bulkVoucherId}/issue`, {
        customerIds: selectedCustomerIds
      });

      const data = unwrapData<{ assignedCount?: number; alreadyAssignedCount?: number }>(response);
      const assigned = data?.assignedCount ?? selectedCustomerIds.length;
      const skipped = data?.alreadyAssignedCount ?? 0;

      setBulkModalOpen(false);
      setSelectedCustomerIds([]);
      setSuccessMessage(
        `Voucher issued to ${assigned} member(s)${skipped > 0 ? ` (${skipped} already had it)` : ""}.`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      // Refresh current customer if selected and reload list
      if (selected) {
        await loadCustomerDetails(selected.id);
      }
      void load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Bulk voucher issue failed"));
    } finally {
      setBusy(false);
    }
  };

  const validateRegisterForm = () => {
    const errors: { name?: string; phone?: string; email?: string } = {};

    const trimmedName = registerForm.name.trim();
    if (!trimmedName) {
      errors.name = "Customer name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Customer name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
      errors.name = "Customer name cannot exceed 100 characters.";
    }

    const trimmedPhone = registerForm.phone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, "");
    if (!trimmedPhone) {
      errors.phone = "Phone number is required.";
    } else if (phoneDigits.length < 7 || phoneDigits.length > 20) {
      errors.phone = "Please enter a valid phone number (at least 7 digits).";
    }

    const trimmedEmail = registerForm.email.trim();
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        errors.email = "Please enter a valid email address.";
      }
    }

    return errors;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterFormError("");

    const errors = validateRegisterForm();
    setRegisterFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setRegisterSubmitting(true);

    try {
      const newCustomer = await customerAPI.register({
        name: registerForm.name.trim(),
        phone: registerForm.phone.trim(),
        email: registerForm.email.trim() || undefined,
        status: registerForm.status as CustomerStatus
      });

      setRegisterModalOpen(false);
      setRegisterForm({
        name: "",
        phone: "",
        email: "",
        status: "APPROVED"
      });
      setRegisterFieldErrors({});
      setRegisterFormError("");

      setSuccessMessage(`Customer "${newCustomer.name}" registered successfully!`);
      setTimeout(() => setSuccessMessage(""), 4000);

      // Cleanly refresh customer directory without reloading the page
      await fetchCustomers(query, filter);

      if (newCustomer?.id) {
        setSelected(newCustomer);
      }
    } catch (requestError: any) {
      const msg = apiMessage(requestError, "Failed to register customer.");
      setRegisterFormError(msg);
      if (msg.toLowerCase().includes("phone") || msg.toLowerCase().includes("contact")) {
        setRegisterFieldErrors((prev) => ({
          ...prev,
          phone: msg
        }));
      } else if (msg.toLowerCase().includes("email")) {
        setRegisterFieldErrors((prev) => ({
          ...prev,
          email: msg
        }));
      }
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((customer) => {
      const statusMatches =
        filter === "ALL" ||
        normalizeStatus(customer.status) === normalizeStatus(filter);

      if (!statusMatches) return false;
      if (!q) return true;

      const phoneDigits = customer.phone ? customer.phone.replace(/\D/g, "") : "";
      const searchText = [customer.name, customer.phone, phoneDigits, customer.email]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(q);
    });
  }, [customers, filter, query]);

  // Keep selected customer synchronized with the current result set
  useEffect(() => {
    if (filtered.length === 0) {
      setSelected(null);
    } else {
      setSelected((curr) => {
        if (!curr) return filtered[0];
        const stillInList = filtered.find((c) => c.id === curr.id);
        return stillInList || filtered[0];
      });
    }
  }, [filtered]);

  const replaceDevice = async () => {
    if (!replaceConfirm || !selected) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/devices/${replaceConfirm.id}/replace`);
      setReplaceConfirm(null);
      setSuccessMessage("Device replaced successfully. Customer can now register a new device.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await loadCustomerDetails(selected.id);
      void load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to replace device"));
    } finally {
      setBusy(false);
    }
  };

  const approvedFiltered = useMemo(() => {
    return filtered.filter((c) => c.status === "APPROVED");
  }, [filtered]);

  const allApprovedSelected =
    approvedFiltered.length > 0 &&
    approvedFiltered.every((c) => selectedCustomerIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allApprovedSelected) {
      const approvedIds = new Set(approvedFiltered.map((c) => c.id));
      setSelectedCustomerIds((prev) => prev.filter((id) => !approvedIds.has(id)));
    } else {
      const combined = new Set([...selectedCustomerIds, ...approvedFiltered.map((c) => c.id)]);
      setSelectedCustomerIds(Array.from(combined));
    }
  };

  const toggleSelectCustomer = (id: number) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const approveDevice = async () => {
    if (!confirm || !selected) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/devices/${confirm.id}/approve`);
      setConfirm(null);
      await loadCustomerDetails(selected.id);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const revokeDevice = async (deviceId: number) => {
    if (!selected) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/devices/${deviceId}/revoke`);
      await loadCustomerDetails(selected.id);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const approveCustomer = async () => {
    if (!selected) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/customers/${selected.id}/approve`);
      await load();
      await loadCustomerDetails(selected.id);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const suspendCustomer = async () => {
    if (!selected) return;

    setBusy(true);
    setError("");

    try {
      await api.post(`/customers/${selected.id}/suspend`);
      await load();
      await loadCustomerDetails(selected.id);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (initialLoading) {
    return <Loading label="Loading customer directory..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Membership / Access
          </p>

          <h1 className="page-title">Customers & Members</h1>

          <p className="mt-2 muted">
            Review member identity, verified devices, and issued rewards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCustomerIds.length > 0 && (
            <button
              type="button"
              onClick={() => void openBulkModal()}
              className="gold-button"
            >
              <Ticket size={16} />
              Issue Voucher ({selectedCustomerIds.length})
            </button>
          )}

          {canManageCustomers && (
            <button
              type="button"
              onClick={() => {
                setRegisterFormError("");
                setRegisterFieldErrors({});
                setRegisterModalOpen(true);
              }}
              className="gold-button"
            >
              <UserPlus size={16} />
              Register Customer
            </button>
          )}

          <button
            type="button"
            onClick={() => void load()}
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      {successMessage && (
        <div className="flex items-center gap-2 rounded-input border border-accent-green/30 bg-accent-green/10 p-3 text-sm text-accent-green">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid min-h-[650px] gap-5 xl:grid-cols-[440px_1fr]">
        {/* Left Column: Customer Directory */}
        <section className="premium-card overflow-hidden flex flex-col">
          <div className="border-b border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound size={16} className="text-accent-gold" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary">
                  Customer Directory
                </h2>
              </div>
              <span className="font-mono text-[11px] text-text-secondary">
                {filtered.length} {filtered.length === 1 ? "member" : "members"}
              </span>
            </div>

            <SearchInput
              placeholder="Search members by name, phone, or email…"
              value={query}
              onChangeValue={setQuery}
              loading={searchLoading}
            />

            <div className="flex gap-1 overflow-x-auto pb-1">
              {["ALL", "PENDING", "APPROVED", "SUSPENDED", "REJECTED"].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
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

            {/* Multi-Selection Control Bar */}
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-text-primary">
                <input
                  type="checkbox"
                  checked={allApprovedSelected}
                  onChange={toggleSelectAll}
                  disabled={approvedFiltered.length === 0}
                  className="h-4 w-4 rounded border-border bg-surface text-accent-gold focus:ring-accent-gold/40 cursor-pointer disabled:opacity-40"
                />
                <span className="font-semibold uppercase tracking-wider text-[11px] text-text-primary">
                  SELECT ALL
                </span>
              </label>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-secondary">
                  <strong className="text-accent-gold">{selectedCustomerIds.length}</strong> selected
                </span>
                {selectedCustomerIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedCustomerIds([])}
                    className="text-text-secondary hover:text-text-primary underline text-[11px]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {selectedCustomerIds.length > 0 && (
              <div className="flex items-center justify-between rounded-input border border-accent-gold/30 bg-accent-gold/10 p-2.5 text-xs">
                <span className="font-medium text-text-primary">
                  <strong className="text-accent-gold font-mono">{selectedCustomerIds.length}</strong> {selectedCustomerIds.length === 1 ? "customer" : "customers"} selected
                </span>
                <button
                  type="button"
                  onClick={() => void openBulkModal()}
                  className="gold-button py-1 px-3 text-xs"
                >
                  <Ticket size={13} />
                  Issue Voucher
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 max-h-[600px] overflow-y-auto p-2 space-y-1">
            {filtered.length > 0 ? (
              filtered.map((customer) => {
                const isSelected = selected?.id === customer.id;
                const isChecked = selectedCustomerIds.includes(customer.id);
                const isApproved = customer.status === "APPROVED";

                return (
                  <div
                    key={customer.id}
                    className={`flex items-center gap-2.5 rounded-button p-2.5 transition ${
                      isSelected
                        ? "bg-accent-gold/10 border border-accent-gold/30"
                        : "hover:bg-surface-hover border border-transparent"
                    }`}
                  >
                    <label
                      className="cursor-pointer p-0.5 shrink-0 flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                      title={
                        isApproved
                          ? isChecked
                            ? "Deselect customer"
                            : "Select customer"
                          : "Only approved customers can receive vouchers"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={!isApproved}
                        onChange={() => toggleSelectCustomer(customer.id)}
                        className="h-4 w-4 rounded border-border bg-surface text-accent-gold focus:ring-accent-gold/40 cursor-pointer disabled:opacity-30"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setSelected(customer)}
                      className="flex flex-1 items-center gap-3 min-w-0 text-left"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background font-display font-semibold text-accent-gold text-xs">
                        {initials(customer.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold">{customer.name}</p>
                          <ChevronRight size={14} className="text-text-secondary shrink-0" />
                        </div>

                        <p className="truncate font-mono text-[10px] text-text-secondary">
                          {customer.phone}
                        </p>

                        <div className="mt-1 flex items-center gap-1.5">
                          <StatusBadge
                            value={customer.status === "APPROVED" ? "ACTIVE" : customer.status}
                          />
                          <span className="text-[10px] text-accent-gold/80 font-mono">
                            CLASSIC MEMBER
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })
            ) : (
              <EmptyState
                title="No members found"
                text={query.trim() ? `No member matching "${query}" was found.` : "No members match the selected filter."}
              />
            )}
          </div>
        </section>

        {/* Right Column: Customer Profile Details */}
        <section className="premium-card min-w-0 overflow-hidden">
          {!selected ? (
            <div className="flex h-full min-h-[600px] flex-col items-center justify-center p-8 text-center">
              <UserRound size={42} className="mb-4 text-accent-gold/50" />
              <h2 className="font-display text-xl">Select a member</h2>
              <p className="mt-2 max-w-sm text-sm text-text-secondary">
                Choose a customer from the directory to inspect devices, presence history and issued vouchers.
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[800px]">
              {/* Profile Header */}
              <div className="border-b border-border p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-gold/20 bg-accent-gold/10 font-display text-xl font-semibold text-accent-gold">
                      {initials(selected.name)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl font-semibold">{selected.name}</h2>
                        <span className="rounded-badge border border-accent-gold/30 bg-accent-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-gold">
                          Classic Member
                        </span>
                      </div>

                      <p className="mt-1 font-mono text-xs text-text-secondary">
                        ID #{selected.id} · {selected.phone}
                      </p>

                      <div className="mt-2 flex gap-2">
                        <StatusBadge
                          value={selected.status === "APPROVED" ? "ACTIVE" : selected.status}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selected.status === "PENDING" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void approveCustomer()}
                        className="gold-button"
                      >
                        <ShieldCheck size={15} />
                        {busy ? "Approving…" : "Approve Customer"}
                      </button>
                    )}

                    {selected.status === "APPROVED" && (
                      <>
                        <button
                          type="button"
                          onClick={() => void openSingleIssueModal()}
                          className="gold-button"
                        >
                          <Ticket size={15} />
                          Issue Voucher
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void suspendCustomer()}
                          className="danger-button"
                        >
                          <Ban size={15} />
                          Suspend
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Info label="Email" value={selected.email || "Not provided"} />
                  <Info label="Joined" value={formatDate(selected.createdAt)} />
                  <Info label="Approved Date" value={formatDate(selected.approvedAt)} />
                </div>
              </div>

              {/* Vouchers Section */}
              <div className="border-b border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Ticket size={18} className="text-accent-gold" />
                    <h3 className="font-display text-lg font-semibold">
                      Assigned Vouchers ({vouchers.length})
                    </h3>
                  </div>

                  {selected.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => void openSingleIssueModal()}
                      className="ghost-button text-xs py-1 px-2.5"
                    >
                      + Issue Voucher
                    </button>
                  )}
                </div>

                {detailsLoading ? (
                  <div className="py-6 text-center text-xs text-text-secondary">
                    Loading vouchers…
                  </div>
                ) : vouchers.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {vouchers.map((cv) => {
                      const v = cv.voucher;
                      const voucherTitle = cv.title || cv.name || v?.name || "Reward Voucher";
                      const voucherCode = cv.code || v?.code || `#${cv.voucherId}`;
                      const voucherType = cv.type || v?.type;
                      const voucherValue = cv.value ?? v?.value;
                      const voucherImage = cv.image || cv.imageUrl || (v as any)?.imageUrl || (v as any)?.image;
                      const isRedeemed = cv.status === "REDEEMED" || Boolean(cv.isRedeemed) || Boolean(cv.redeemedAt);
                      const validityDate = cv.validity || cv.expiresAt || v?.expiresAt;

                      return (
                        <div
                          key={cv.id || `${cv.voucherId}-${cv.issuedAt}`}
                          className="rounded-input border border-border bg-background p-3.5 space-y-2.5"
                        >
                          <div className="flex items-start gap-3 justify-between">
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              {voucherImage ? (
                                <img
                                  src={voucherImage}
                                  alt={voucherTitle}
                                  className="h-10 w-10 shrink-0 rounded-lg object-cover border border-border"
                                />
                              ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-gold/20 bg-accent-gold/10 text-accent-gold">
                                  <Ticket size={18} />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="font-mono text-xs font-semibold text-accent-gold block truncate">
                                  {voucherCode}
                                </span>
                                <p className="font-semibold text-sm text-text-primary truncate">
                                  {voucherTitle}
                                </p>
                              </div>
                            </div>
                            <StatusBadge value={cv.status} />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                            <div>
                              <p className="text-[10px] uppercase text-text-secondary">Discount</p>
                              <p className="font-mono font-medium text-accent-gold">
                                {voucherType === "PERCENTAGE"
                                  ? `${voucherValue}% OFF`
                                  : voucherValue != null
                                  ? money(voucherValue)
                                  : "Free Perk"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase text-text-secondary">Validity</p>
                              <p className="font-mono text-text-secondary text-[11px]">
                                {validityDate ? formatDate(validityDate) : "No expiry"}
                              </p>
                            </div>
                          </div>

                          <div className="border-t border-border/70 pt-2 text-[11px] flex justify-between items-center">
                            <span className="text-text-secondary">
                              Issued: {formatDate(cv.issuedAt)}
                            </span>
                            {isRedeemed ? (
                              <span className="text-accent-blue font-medium">
                                ✓ Redeemed {cv.redeemedAt ? `(${formatDate(cv.redeemedAt)})` : ""}
                              </span>
                            ) : cv.status === "EXPIRED" ? (
                              <span className="text-accent-red font-medium">
                                Expired
                              </span>
                            ) : (
                              <span className="text-accent-green font-medium">
                                Active / Unredeemed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-input bg-background p-6 text-center">
                    <p className="text-sm text-text-secondary">
                      No vouchers currently assigned to this member.
                    </p>
                    {selected.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => void openSingleIssueModal()}
                        className="gold-button mt-3 text-xs"
                      >
                        Issue First Voucher
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Devices & Presence History Sections */}
              <div className="p-5 space-y-5">
                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                    <Smartphone size={17} className="text-accent-gold" />
                    Registered Devices
                  </h3>

                  <div className="space-y-2">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex flex-col justify-between gap-3 rounded-input border border-border bg-background p-3 sm:flex-row sm:items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs font-semibold">{device.deviceId}</p>
                            <StatusBadge value={device.status} />
                          </div>
                          <p className="mt-1 text-xs text-text-secondary">
                            Platform: {device.platform || "Android"} · Registered: {formatDate(device.createdAt)}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {device.status !== "ACTIVE" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => setConfirm(device)}
                              className="gold-button text-xs py-1 px-2.5"
                            >
                              Approve
                            </button>
                          )}

                          {device.status === "ACTIVE" && (
                            <>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => setReplaceConfirm(device)}
                                className="gold-button text-xs py-1 px-2.5"
                              >
                                Replace
                              </button>

                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void revokeDevice(device.id)}
                                className="danger-button text-xs py-1 px-2.5"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {devices.length === 0 && (
                      <p className="rounded-input bg-background p-4 text-sm text-text-secondary">
                        No devices registered for this member.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-display text-lg font-semibold flex items-center gap-2">
                    <MapPin size={17} className="text-accent-gold" />
                    Recent GPS Presence Events
                  </h3>

                  <div className="space-y-2">
                    {history.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-input border border-border bg-background p-3 text-xs"
                      >
                        <div>
                          <p className="font-mono text-text-secondary">
                            {formatDate(log.timestamp)}
                          </p>
                          <p className="text-text-primary mt-0.5">
                            Method: {log.method} · Distance: {log.distanceMeters != null ? `${Math.round(log.distanceMeters)}m` : "—"}
                          </p>
                        </div>
                        <StatusBadge value={log.result} />
                      </div>
                    ))}

                    {history.length === 0 && (
                      <p className="rounded-input bg-background p-4 text-sm text-text-secondary">
                        No presence events recorded.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Single Voucher Issue Modal */}
      <Modal
        open={singleIssueModalOpen}
        onClose={() => setSingleIssueModalOpen(false)}
        title={`Issue Voucher to ${selected?.name || "Member"}`}
      >
        <form onSubmit={(e) => void handleSingleIssue(e)} className="space-y-4">
          <p className="text-sm text-text-secondary">
            Select an active voucher to issue to <span className="font-semibold text-text-primary">{selected?.name}</span>.
          </p>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Select Voucher
            </label>
            <select
              required
              className="premium-input"
              value={singleVoucherId}
              onChange={(e) => setSingleVoucherId(Number(e.target.value))}
            >
              {activeVouchers.length === 0 && (
                <option value="">No active vouchers available</option>
              )}
              {activeVouchers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} — {v.name} ({v.type === "PERCENTAGE" ? `${v.value}% OFF` : v.value != null ? money(v.value) : "Perk"})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setSingleIssueModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gold-button"
              disabled={!singleVoucherId || busy}
            >
              {busy ? "Issuing…" : "Issue Voucher"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Voucher Issue Modal */}
      <Modal
        open={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        title={`Issue Voucher to ${selectedCustomerIds.length} Selected Members`}
      >
        <form onSubmit={(e) => void handleBulkIssue(e)} className="space-y-4">
          <p className="text-sm text-text-secondary">
            This voucher will be assigned to all <span className="font-semibold text-accent-gold">{selectedCustomerIds.length}</span> selected approved customers.
          </p>

          <div>
            <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2">
              Select Voucher
            </label>
            <select
              required
              className="premium-input"
              value={bulkVoucherId}
              onChange={(e) => setBulkVoucherId(Number(e.target.value))}
            >
              {activeVouchers.length === 0 && (
                <option value="">No active vouchers available</option>
              )}
              {activeVouchers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.code} — {v.name} ({v.type === "PERCENTAGE" ? `${v.value}% OFF` : v.value != null ? money(v.value) : "Perk"})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setBulkModalOpen(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gold-button"
              disabled={!bulkVoucherId || busy}
            >
              {busy ? "Issuing Bulk…" : `Issue to ${selectedCustomerIds.length} Members`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Device Approval Modal */}
      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Approve trusted device"
      >
        <div>
          <div className="rounded-input border border-accent-gold/20 bg-accent-gold/5 p-4">
            <p className="font-semibold">This will activate the selected device.</p>
            <p className="mt-1 text-sm text-text-secondary">
              The selected device ({confirm?.deviceId}) will become the customer's trusted device. Proceed?
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setConfirm(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gold-button"
              disabled={busy}
              onClick={() => void approveDevice()}
            >
              {busy ? "Approving…" : "Proceed & Approve"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Device Replacement Modal */}
      <Modal
        open={!!replaceConfirm}
        onClose={() => setReplaceConfirm(null)}
        title="Replace customer device"
      >
        <div>
          <div className="rounded-input border border-accent-gold/20 bg-accent-gold/5 p-4">
            <p className="font-semibold">Replace active device</p>
            <p className="mt-1 text-sm text-text-secondary">
              This will revoke the current active device ({replaceConfirm?.deviceId}) for{" "}
              <span className="font-semibold text-text-primary">{selected?.name}</span> ({selected?.phone}). The customer will be able to register a new device on their next login attempt. Proceed?
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setReplaceConfirm(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gold-button"
              disabled={busy}
              onClick={() => void replaceDevice()}
            >
              {busy ? "Replacing…" : "Proceed & Replace"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Register Customer Modal */}
      <Modal
        open={registerModalOpen}
        onClose={() => {
          if (!registerSubmitting) {
            setRegisterModalOpen(false);
            setRegisterFormError("");
            setRegisterFieldErrors({});
          }
        }}
        title="Register Customer"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <ErrorBanner message={registerFormError} />

          <div className="border-b border-border/60 pb-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent-gold">
              Customer Information
            </h3>
          </div>

          <FormField
            label="Full Name"
            required
            error={registerFieldErrors.name}
          >
            <input
              type="text"
              placeholder="e.g. Alexander Vance"
              value={registerForm.name}
              onChange={(e) => {
                setRegisterForm((prev) => ({ ...prev, name: e.target.value }));
                if (registerFieldErrors.name) {
                  setRegisterFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              disabled={registerSubmitting}
              className="premium-input"
              autoFocus
            />
          </FormField>

          <FormField
            label="Phone / Contact Number"
            required
            error={registerFieldErrors.phone}
          >
            <input
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={registerForm.phone}
              onChange={(e) => {
                setRegisterForm((prev) => ({ ...prev, phone: e.target.value }));
                if (registerFieldErrors.phone) {
                  setRegisterFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              disabled={registerSubmitting}
              className="premium-input"
            />
          </FormField>

          <FormField
            label="Email Address"
            error={registerFieldErrors.email}
          >
            <input
              type="email"
              placeholder="e.g. alexander@example.com (optional)"
              value={registerForm.email}
              onChange={(e) => {
                setRegisterForm((prev) => ({ ...prev, email: e.target.value }));
                if (registerFieldErrors.email) {
                  setRegisterFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              disabled={registerSubmitting}
              className="premium-input"
            />
          </FormField>

          {/* Membership Tier - Strictly Classic Member */}
          <div className="rounded-input border border-border bg-background/50 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                  Membership Tier
                </p>
                <p className="mt-0.5 text-sm font-semibold text-text-primary">
                  Classic Member
                </p>
              </div>
              <span className="rounded-full border border-accent-gold/40 bg-accent-gold/15 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-accent-gold">
                CLASSIC MEMBER
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-text-secondary">
              All registered members are enrolled with standard club privileges.
            </p>
          </div>

          {/* Initial Account Status */}
          <FormField label="Initial Account Status">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setRegisterForm((prev) => ({ ...prev, status: "APPROVED" }))
                }
                disabled={registerSubmitting}
                className={`flex items-center gap-2.5 rounded-input border p-3 text-left transition ${
                  registerForm.status === "APPROVED"
                    ? "border-accent-gold bg-accent-gold/10 text-text-primary"
                    : "border-border bg-background/50 text-text-secondary hover:border-text-secondary/40"
                }`}
              >
                <CheckCircle2
                  size={16}
                  className={
                    registerForm.status === "APPROVED"
                      ? "text-accent-gold shrink-0"
                      : "text-text-secondary shrink-0"
                  }
                />
                <div>
                  <p className="text-xs font-semibold">Approved</p>
                  <p className="text-[10px] text-text-secondary">
                    Immediate access
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setRegisterForm((prev) => ({ ...prev, status: "PENDING" }))
                }
                disabled={registerSubmitting}
                className={`flex items-center gap-2.5 rounded-input border p-3 text-left transition ${
                  registerForm.status === "PENDING"
                    ? "border-accent-gold bg-accent-gold/10 text-text-primary"
                    : "border-border bg-background/50 text-text-secondary hover:border-text-secondary/40"
                }`}
              >
                <Clock
                  size={16}
                  className={
                    registerForm.status === "PENDING"
                      ? "text-accent-gold shrink-0"
                      : "text-text-secondary shrink-0"
                  }
                />
                <div>
                  <p className="text-xs font-semibold">Pending</p>
                  <p className="text-[10px] text-text-secondary">
                    Requires staff approval
                  </p>
                </div>
              </button>
            </div>
          </FormField>

          <p className="text-[11px] text-text-secondary/60">
            Note: Per the one-device policy, the member's trusted device will be registered automatically upon their initial application login.
          </p>

          <div className="mt-5 flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="ghost-button"
              disabled={registerSubmitting}
              onClick={() => {
                setRegisterModalOpen(false);
                setRegisterFormError("");
                setRegisterFieldErrors({});
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="gold-button"
              disabled={registerSubmitting}
            >
              {registerSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Register Customer
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input bg-background p-3">
      <p className="text-[10px] uppercase tracking-wider text-text-secondary">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
