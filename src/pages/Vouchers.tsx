import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit2,
  Plus,
  RefreshCw,
  Send,
  Ticket,
  Users
} from "lucide-react";

import api, { apiMessage, unwrapData } from "../services/api";
import type { Customer, Voucher, VoucherStatus, VoucherType } from "../types";

import Drawer from "../components/Drawer";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import FormField from "../components/FormField";
import SearchInput from "../components/SearchInput";
import ErrorBanner from "../components/ErrorBanner";
import ImageUploadField from "../components/ImageUploadField";
import { formatDate, money, resolveImageUrl } from "../lib/format";

interface VoucherForm {
  code: string;
  name: string;
  description: string;
  type: VoucherType;
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

interface EditVoucherForm {
  name: string;
  description: string;
  type: VoucherType;
  value: string;
  maxRedemptions: string;
  expiresAt: string;
  status: VoucherStatus;
}

const initialEditForm: EditVoucherForm = {
  name: "",
  description: "",
  type: "PERCENTAGE",
  value: "",
  maxRedemptions: "",
  expiresAt: "",
  status: "ACTIVE"
};

export default function Vouchers() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [drawer, setDrawer] = useState(false);
  const [issue, setIssue] = useState<Voucher | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Multi-customer selection state
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<number[]>([]);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customersLoading, setCustomersLoading] = useState(false);

  // Create form state
  const [form, setForm] = useState<VoucherForm>(initialForm);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState<EditVoucherForm>(initialEditForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editExistingImageUrl, setEditExistingImageUrl] = useState<string | null>(null);
  const [removeImageOnEdit, setRemoveImageOnEdit] = useState(false);

  const fetchCustomersIfNeeded = useCallback(async () => {
    if (customers.length > 0) return;
    setCustomersLoading(true);
    try {
      const customerResponse = await api.get("/customers?limit=100");
      const custRes = unwrapData<{ customers?: Customer[] } | Customer[]>(customerResponse);
      const customerList = Array.isArray(custRes) ? custRes : (custRes?.customers ?? []);
      setCustomers(customerList);
    } catch {
      // ignore
    } finally {
      setCustomersLoading(false);
    }
  }, [customers.length]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const voucherResponse = await api.get("/vouchers?limit=100");
      const vouchRes = unwrapData<{ vouchers?: Voucher[] } | Voucher[]>(voucherResponse);
      const voucherList = Array.isArray(vouchRes) ? vouchRes : (vouchRes?.vouchers ?? []);
      setVouchers(voucherList);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createVoucher = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      let imageUrl: string | undefined;

      if (createImageFile) {
        const fd = new FormData();
        fd.append("image", createImageFile);
        const uploadRes = await api.post("/vouchers/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const upData = unwrapData<{ imageUrl?: string }>(uploadRes);
        imageUrl = upData?.imageUrl;
      }

      await api.post("/vouchers/create", {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        type: form.type,
        value: form.value ? Number(form.value) : undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        expiresAt: form.expiresAt || undefined,
        imageUrl
      });

      setDrawer(false);
      setForm(initialForm);
      setCreateImageFile(null);
      setSuccessMessage("Voucher created successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const openEditDrawer = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setEditForm({
      name: voucher.name,
      description: voucher.description || "",
      type: voucher.type,
      value: voucher.value != null ? String(voucher.value) : "",
      maxRedemptions: voucher.maxRedemptions != null ? String(voucher.maxRedemptions) : "",
      expiresAt: voucher.expiresAt ? voucher.expiresAt.slice(0, 16) : "",
      status: voucher.status
    });
    setEditExistingImageUrl(voucher.imageUrl || null);
    setEditImageFile(null);
    setRemoveImageOnEdit(false);
  };

  const updateVoucher = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingVoucher) return;

    setBusy(true);
    setError("");

    try {
      let imageUrl: string | null | undefined = editExistingImageUrl;

      if (editImageFile) {
        const fd = new FormData();
        fd.append("image", editImageFile);
        const uploadRes = await api.post("/vouchers/upload-image", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const upData = unwrapData<{ imageUrl?: string }>(uploadRes);
        imageUrl = upData?.imageUrl;
      } else if (removeImageOnEdit) {
        imageUrl = null;
      }

      await api.put(`/vouchers/${editingVoucher.id}`, {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || undefined,
        type: editForm.type,
        value: editForm.value ? Number(editForm.value) : (editForm.type === "FREE_ITEM" ? null : undefined),
        maxRedemptions: editForm.maxRedemptions ? Number(editForm.maxRedemptions) : null,
        expiresAt: editForm.expiresAt || null,
        status: editForm.status,
        imageUrl
      });

      setEditingVoucher(null);
      setSuccessMessage("Voucher updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const approvedCustomers = useMemo(() => {
    return customers.filter((c) => c.status === "APPROVED");
  }, [customers]);

  const filteredApprovedCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return approvedCustomers;
    return approvedCustomers.filter((c) => {
      const phoneDigits = c.phone ? c.phone.replace(/\D/g, "") : "";
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        phoneDigits.includes(q)
      );
    });
  }, [approvedCustomers, customerQuery]);

  const openIssueModal = (voucher: Voucher) => {
    setIssue(voucher);
    setSelectedCustomerIds([]);
    setCustomerQuery("");
    void fetchCustomersIfNeeded();
  };

  const toggleCustomer = (customerId: number) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const allApprovedSelected =
    filteredApprovedCustomers.length > 0 &&
    filteredApprovedCustomers.every((c) => selectedCustomerIds.includes(c.id));

  const toggleSelectAll = () => {
    if (allApprovedSelected) {
      const visibleIds = filteredApprovedCustomers.map((c) => c.id);
      setSelectedCustomerIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      const visibleIds = filteredApprovedCustomers.map((c) => c.id);
      setSelectedCustomerIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const issueVoucher = async () => {
    if (!issue || selectedCustomerIds.length === 0) return;

    setBusy(true);
    setError("");

    try {
      const isSelectAllActive =
        allApprovedSelected &&
        selectedCustomerIds.length === approvedCustomers.length;

      const payload: Record<string, unknown> = {
        voucherId: issue.id
      };

      if (isSelectAllActive) {
        payload.selectAll = true;
      } else {
        payload.customerIds = selectedCustomerIds;
      }

      const response = await api.post("/vouchers/issue", payload);
      const data = unwrapData<{ assignedCount?: number; alreadyAssignedCount?: number }>(response);
      const assigned = data?.assignedCount ?? selectedCustomerIds.length;
      const skipped = data?.alreadyAssignedCount ?? 0;

      setSuccessMessage(
        `Voucher "${issue.code}" issued to ${assigned} member(s)${
          skipped > 0 ? ` (${skipped} already had this voucher)` : ""
        }.`
      );
      setTimeout(() => setSuccessMessage(""), 5000);

      setIssue(null);
      setSelectedCustomerIds([]);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to issue voucher"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Loading label="Loading voucher library..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Rewards / Offers
          </p>

          <h1 className="page-title">Voucher Management</h1>

          <p className="mt-2 muted">
            Create controlled offers, attach photos, and issue them to approved Classic Members.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            className="ghost-button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setCreateImageFile(null);
              setDrawer(true);
            }}
            className="gold-button"
          >
            <Plus size={16} />
            Create Voucher
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

      {/* Vouchers Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vouchers.map((voucher) => (
          <div key={voucher.id} className="premium-card p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {voucher.imageUrl && (
                <div className="relative h-32 w-full overflow-hidden rounded-input border border-border bg-surface">
                  <img
                    src={resolveImageUrl(voucher.imageUrl)}
                    alt={voucher.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-semibold text-accent-gold">
                    {voucher.code}
                  </span>

                  <h3 className="font-display text-lg font-semibold mt-0.5">
                    {voucher.name}
                  </h3>
                </div>

                <StatusBadge value={voucher.status} />
              </div>

              <p className="text-xs text-text-secondary min-h-8">
                {voucher.description || "No description provided."}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <Metric
                  label="Type"
                  value={
                    voucher.type === "PERCENTAGE"
                      ? "Percent"
                      : voucher.type === "FIXED_AMOUNT"
                      ? "Flat"
                      : "Free"
                  }
                />
                <Metric
                  label="Value"
                  value={
                    voucher.type === "PERCENTAGE"
                      ? `${voucher.value ?? 0}%`
                      : voucher.value != null
                      ? money(voucher.value)
                      : "Perk"
                  }
                />
                <Metric
                  label="Redeemed"
                  value={`${voucher.redeemedCount ?? 0}${
                    voucher.maxRedemptions ? `/${voucher.maxRedemptions}` : ""
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <span className="text-text-secondary font-mono text-[11px]">
                {voucher.expiresAt ? `Exp: ${formatDate(voucher.expiresAt)}` : "No expiry"}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditDrawer(voucher)}
                  className="ghost-button text-xs py-1 px-2.5"
                >
                  <Edit2 size={13} />
                  Edit
                </button>

                {voucher.status === "ACTIVE" && (
                  <button
                    type="button"
                    onClick={() => openIssueModal(voucher)}
                    className="gold-button text-xs py-1 px-3"
                  >
                    <Send size={13} />
                    Issue
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {vouchers.length === 0 && (
          <div className="col-span-full premium-card p-12 text-center text-sm text-text-secondary">
            No vouchers created yet. Click "Create Voucher" above to add one.
          </div>
        )}
      </div>

      {/* Activity Table */}
      <div className="premium-card p-5">
        <h2 className="font-display text-lg font-semibold mb-3">Voucher Activity Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3">Discount</th>
                <th className="px-3 py-3">Redeemed</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-surface-hover transition text-xs">
                  <td className="px-3 py-3 font-mono font-medium text-accent-gold">{v.code}</td>
                  <td className="px-3 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {v.imageUrl ? (
                        <img
                          src={resolveImageUrl(v.imageUrl)}
                          alt=""
                          className="h-7 w-7 rounded object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded bg-surface border border-border flex items-center justify-center text-text-secondary shrink-0">
                          <Ticket size={13} className="text-accent-gold/60" />
                        </div>
                      )}
                      <span>{v.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{v.type}</td>
                  <td className="px-3 py-3 font-mono">
                    {v.type === "PERCENTAGE"
                      ? `${v.value ?? 0}%`
                      : v.value != null
                      ? money(v.value)
                      : "Free Item"}
                  </td>
                  <td className="px-3 py-3 font-mono">{v.redeemedCount ?? 0}</td>
                  <td className="px-3 py-3">
                    <StatusBadge value={v.status} />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => openEditDrawer(v)}
                      className="ghost-button py-1 px-2 text-xs"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Voucher Drawer */}
      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Create New Voucher"
      >
        <form onSubmit={(e) => void createVoucher(e)} className="space-y-4">
          <FormField label="Voucher Code" required>
            <input
              type="text"
              required
              disabled={busy}
              placeholder="e.g. SECRET50"
              value={form.code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
              }
              className="premium-input font-mono uppercase"
            />
          </FormField>

          <FormField label="Voucher Name" required>
            <input
              type="text"
              required
              disabled={busy}
              placeholder="e.g. 50% Off First Brew"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="premium-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={3}
              disabled={busy}
              placeholder="Enter brief terms or details"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="premium-input min-h-20"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Voucher Type" required>
              <select
                className="premium-input"
                disabled={busy}
                value={form.type}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    type: e.target.value as VoucherType
                  }))
                }
              >
                <option value="PERCENTAGE">Percentage Discount</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                <option value="FREE_ITEM">Free Item</option>
              </select>
            </FormField>

            <FormField label="Value / Amount">
              <input
                type="number"
                disabled={busy || form.type === "FREE_ITEM"}
                step="0.1"
                min="0"
                placeholder={form.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 100"}
                value={form.value}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, value: e.target.value }))
                }
                className="premium-input font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Max Redemptions">
              <input
                type="number"
                disabled={busy}
                min="1"
                placeholder="Leave blank for unlimited"
                value={form.maxRedemptions}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    maxRedemptions: e.target.value
                  }))
                }
                className="premium-input font-mono"
              />
            </FormField>

            <FormField label="Expiry Date">
              <input
                type="datetime-local"
                disabled={busy}
                value={form.expiresAt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
                className="premium-input"
              />
            </FormField>
          </div>

          <ImageUploadField
            label="Voucher Photo"
            file={createImageFile}
            onChangeFile={setCreateImageFile}
            disabled={busy}
          />

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setDrawer(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gold-button"
            >
              {busy ? "Creating…" : "Create Voucher"}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Edit Voucher Drawer */}
      <Drawer
        open={!!editingVoucher}
        onClose={() => setEditingVoucher(null)}
        title={`Edit Voucher: ${editingVoucher?.code || ""}`}
      >
        <form onSubmit={(e) => void updateVoucher(e)} className="space-y-4">
          <FormField label="Voucher Code">
            <input
              type="text"
              disabled
              value={editingVoucher?.code || ""}
              className="premium-input font-mono uppercase opacity-70 cursor-not-allowed"
            />
          </FormField>

          <FormField label="Voucher Name" required>
            <input
              type="text"
              required
              disabled={busy}
              placeholder="e.g. 50% Off First Brew"
              value={editForm.name}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, name: e.target.value }))
              }
              className="premium-input"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              rows={3}
              disabled={busy}
              placeholder="Enter brief terms or details"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="premium-input min-h-20"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Voucher Type" required>
              <select
                className="premium-input"
                disabled={busy}
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    type: e.target.value as VoucherType
                  }))
                }
              >
                <option value="PERCENTAGE">Percentage Discount</option>
                <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                <option value="FREE_ITEM">Free Item</option>
              </select>
            </FormField>

            <FormField label="Value / Amount">
              <input
                type="number"
                disabled={busy || editForm.type === "FREE_ITEM"}
                step="0.1"
                min="0"
                placeholder={editForm.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 100"}
                value={editForm.value}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, value: e.target.value }))
                }
                className="premium-input font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Max Redemptions">
              <input
                type="number"
                disabled={busy}
                min="1"
                placeholder="Leave blank for unlimited"
                value={editForm.maxRedemptions}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    maxRedemptions: e.target.value
                  }))
                }
                className="premium-input font-mono"
              />
            </FormField>

            <FormField label="Expiry Date">
              <input
                type="datetime-local"
                disabled={busy}
                value={editForm.expiresAt}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                }
                className="premium-input"
              />
            </FormField>
          </div>

          <FormField label="Status" required>
            <select
              className="premium-input"
              disabled={busy}
              value={editForm.status}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  status: e.target.value as VoucherStatus
                }))
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="REVOKED">REVOKED</option>
            </select>
          </FormField>

          <ImageUploadField
            label="Voucher Photo"
            value={editExistingImageUrl}
            file={editImageFile}
            onChangeFile={(file) => {
              setEditImageFile(file);
              if (file) setRemoveImageOnEdit(false);
            }}
            onRemoveExisting={() => {
              setEditExistingImageUrl(null);
              setRemoveImageOnEdit(true);
            }}
            disabled={busy}
          />

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setEditingVoucher(null)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gold-button"
            >
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Multi-Customer Issue Modal */}
      <Modal
        open={!!issue}
        onClose={() => {
          setIssue(null);
          setSelectedCustomerIds([]);
        }}
        title={`Issue Voucher: ${issue?.code || ""}`}
        wide
      >
        <div className="space-y-4">
          <div className="rounded-input border border-border bg-background p-3 flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-sm text-text-primary">{issue?.name}</p>
              <p className="text-text-secondary mt-0.5">
                {issue?.type === "PERCENTAGE"
                  ? `${issue.value}% OFF discount`
                  : issue?.value != null
                  ? money(issue.value)
                  : "Complimentary Perk"}
              </p>
            </div>
            <span className="font-mono text-accent-gold">{issue?.code}</span>
          </div>

          <SearchInput
            placeholder="Search approved members by name or phone…"
            value={customerQuery}
            onChangeValue={setCustomerQuery}
          />

          {/* Selection control bar */}
          <div className="flex items-center justify-between border-y border-border py-2.5 px-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-text-primary">
              <input
                type="checkbox"
                checked={allApprovedSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-border bg-surface text-accent-gold focus:ring-accent-gold/40 cursor-pointer"
              />
              <span className="font-semibold uppercase tracking-wider text-[11px] text-text-primary">
                SELECT ALL
              </span>
            </label>

            <div className="flex items-center gap-2">
              <span className="font-mono text-accent-gold font-semibold">
                {selectedCustomerIds.length} {selectedCustomerIds.length === 1 ? "customer" : "customers"} selected
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

          {/* Member Selection List */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 p-1">
            {customersLoading ? (
              <div className="p-6 text-center text-xs text-text-secondary font-mono">
                Loading member directory…
              </div>
            ) : filteredApprovedCustomers.length > 0 ? (
              filteredApprovedCustomers.map((customer) => {
                const isSelected = selectedCustomerIds.includes(customer.id);
                return (
                  <label
                    key={customer.id}
                    className={`flex items-center gap-3 p-2.5 rounded-button cursor-pointer border transition text-left ${
                      isSelected
                        ? "border-accent-gold/40 bg-accent-gold/10 text-text-primary"
                        : "border-border bg-background hover:bg-surface-hover text-text-secondary"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCustomer(customer.id)}
                      className="h-4 w-4 rounded border-border shrink-0 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-text-primary">
                        {customer.name}
                      </p>
                      <p className="text-[11px] font-mono text-text-secondary">
                        {customer.phone} · Classic Member
                      </p>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-text-secondary">
                No approved members match the search.
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                setIssue(null);
                setSelectedCustomerIds([]);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gold-button"
              disabled={selectedCustomerIds.length === 0 || busy}
              onClick={() => void issueVoucher()}
            >
              {busy
                ? "Issuing…"
                : selectedCustomerIds.length === 1
                ? "Issue Voucher (1 Member)"
                : `Issue Voucher to ${selectedCustomerIds.length} Members`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-input bg-background p-2.5">
      <p className="text-[10px] uppercase text-text-secondary">{label}</p>
      <p className="mt-1 font-mono text-xs">{value}</p>
    </div>
  );
}
