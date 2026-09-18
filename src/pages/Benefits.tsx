import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Edit2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2
} from "lucide-react";

import api, { apiMessage, unwrapData } from "../services/api";
import type { Benefit } from "../types";

import Drawer from "../components/Drawer";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import FormField from "../components/FormField";
import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import ImageUploadField from "../components/ImageUploadField";
import { resolveImageUrl } from "../lib/format";

interface BenefitForm {
  title: string;
  description: string;
  displayOrder: number | "";
  active: boolean;
}

const initialForm: BenefitForm = {
  title: "",
  description: "",
  displayOrder: 0,
  active: true
};

export default function Benefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [createDrawer, setCreateDrawer] = useState(false);
  const [createForm, setCreateForm] = useState<BenefitForm>(initialForm);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);

  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [editForm, setEditForm] = useState<BenefitForm>(initialForm);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editExistingImageUrl, setEditExistingImageUrl] = useState<string | null>(null);
  const [removeImageOnEdit, setRemoveImageOnEdit] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<Benefit | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch all benefits using admin endpoint
      const response = await api.get("/benefits/admin");
      const resData = unwrapData<{ benefits?: Benefit[] } | Benefit[]>(response);
      const list = Array.isArray(resData) ? resData : (resData?.benefits ?? []);
      setBenefits(list);
    } catch (requestError) {
      // Fallback to public endpoint if running legacy route
      try {
        const fallbackRes = await api.get("/benefits?all=true");
        const data = unwrapData<{ benefits?: Benefit[] } | Benefit[]>(fallbackRes);
        const list = Array.isArray(data) ? data : (data?.benefits ?? []);
        setBenefits(list);
      } catch {
        setError(apiMessage(requestError, "Failed to load benefits"));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", createForm.title.trim());
      formData.append("description", createForm.description.trim());
      formData.append("displayOrder", String(createForm.displayOrder || 0));
      formData.append("active", String(createForm.active));

      if (createImageFile) {
        formData.append("image", createImageFile);
      }

      await api.post("/benefits", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setCreateDrawer(false);
      setCreateForm(initialForm);
      setCreateImageFile(null);
      setSuccessMessage("Benefit created successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to create benefit"));
    } finally {
      setBusy(false);
    }
  };

  const openEditDrawer = (b: Benefit) => {
    setEditingBenefit(b);
    setEditForm({
      title: b.title,
      description: b.description,
      displayOrder: b.displayOrder,
      active: b.active
    });
    setEditExistingImageUrl(b.imageUrl || null);
    setEditImageFile(null);
    setRemoveImageOnEdit(false);
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingBenefit) return;

    setBusy(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", editForm.title.trim());
      formData.append("description", editForm.description.trim());
      formData.append("displayOrder", String(editForm.displayOrder || 0));
      formData.append("active", String(editForm.active));

      if (editImageFile) {
        formData.append("image", editImageFile);
      } else if (removeImageOnEdit) {
        formData.append("imageUrl", "");
      }

      await api.patch(`/benefits/${editingBenefit.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setEditingBenefit(null);
      setSuccessMessage("Benefit updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to update benefit"));
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (b: Benefit) => {
    setBusy(true);
    setError("");

    try {
      await api.patch(`/benefits/${b.id}`, { active: !b.active });
      setSuccessMessage(`Benefit "${b.title}" set to ${!b.active ? "Active" : "Inactive"}.`);
      setTimeout(() => setSuccessMessage(""), 3000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleMoveOrder = async (b: Benefit, direction: "up" | "down") => {
    const newOrder = direction === "up" ? Math.max(0, b.displayOrder - 1) : b.displayOrder + 1;
    if (newOrder === b.displayOrder) return;

    setBusy(true);
    try {
      await api.patch(`/benefits/${b.id}`, { displayOrder: newOrder });
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setBusy(true);
    setError("");

    try {
      await api.delete(`/benefits/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      setSuccessMessage("Benefit deleted successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError, "Failed to delete benefit"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Loading label="Loading member benefits..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            Privileges / Classic Rewards
          </p>

          <h1 className="page-title">Benefits Management</h1>

          <p className="mt-2 muted">
            Configure privileges and perks displayed to all Classic Members.
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
              setCreateForm({
                title: "",
                description: "",
                displayOrder: benefits.length + 1,
                active: true
              });
              setCreateImageFile(null);
              setCreateDrawer(true);
            }}
            className="gold-button"
          >
            <Plus size={16} />
            Create Benefit
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

      {/* Benefits Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.id}
            className={`premium-card p-5 space-y-4 flex flex-col justify-between transition ${
              !benefit.active ? "opacity-60 border-dashed" : ""
            }`}
          >
            <div className="space-y-3">
              {benefit.imageUrl ? (
                <div className="relative h-32 w-full overflow-hidden rounded-input border border-border bg-surface">
                  <img
                    src={resolveImageUrl(benefit.imageUrl)}
                    alt={benefit.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-full items-center justify-center rounded-input border border-border bg-surface/50 text-accent-gold/40">
                  <Sparkles size={24} />
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-accent-gold">
                    Order #{benefit.displayOrder}
                  </span>
                  <h3 className="font-display text-lg font-semibold mt-0.5 text-text-primary">
                    {benefit.title}
                  </h3>
                </div>

                <StatusBadge value={benefit.active ? "ACTIVE" : "INACTIVE"} />
              </div>

              <p className="text-xs text-text-secondary min-h-8">
                {benefit.description}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Move Order Up"
                  disabled={busy || benefit.displayOrder <= 0}
                  onClick={() => void handleMoveOrder(benefit, "up")}
                  className="ghost-button p-1 text-xs"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  title="Move Order Down"
                  disabled={busy}
                  onClick={() => void handleMoveOrder(benefit, "down")}
                  className="ghost-button p-1 text-xs"
                >
                  <ArrowDown size={13} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleToggleActive(benefit)}
                  className={`text-[11px] font-semibold uppercase px-2.5 py-1 rounded-badge transition ${
                    benefit.active
                      ? "bg-accent-gold/10 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/20"
                      : "bg-surface text-text-secondary border border-border hover:text-text-primary"
                  }`}
                >
                  {benefit.active ? "Active" : "Inactive"}
                </button>

                <button
                  type="button"
                  onClick={() => openEditDrawer(benefit)}
                  className="ghost-button text-xs py-1 px-2.5"
                >
                  <Edit2 size={13} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirm(benefit)}
                  className="danger-button text-xs py-1 px-2"
                  title="Delete benefit"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {benefits.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              title="No benefits configured"
              text="Click 'Create Benefit' above to add privileges for Classic Members."
            />
          </div>
        )}
      </div>

      {/* Summary Table */}
      {benefits.length > 0 && (
        <div className="premium-card p-5">
          <h2 className="font-display text-lg font-semibold mb-3">All Configured Perks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Perk</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {benefits.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-hover transition text-xs">
                    <td className="px-3 py-3 font-mono font-medium text-accent-gold">
                      #{b.displayOrder}
                    </td>
                    <td className="px-3 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        {b.imageUrl ? (
                          <img
                            src={resolveImageUrl(b.imageUrl)}
                            alt=""
                            className="h-7 w-7 rounded object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded bg-surface border border-border flex items-center justify-center text-text-secondary shrink-0">
                            <Sparkles size={13} className="text-accent-gold/60" />
                          </div>
                        )}
                        <span>{b.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-text-secondary truncate max-w-xs">
                      {b.description}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge value={b.active ? "ACTIVE" : "INACTIVE"} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditDrawer(b)}
                          className="ghost-button py-1 px-2 text-xs"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleToggleActive(b)}
                          className="ghost-button py-1 px-2 text-xs"
                        >
                          {b.active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(b)}
                          className="danger-button py-1 px-2 text-xs"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Benefit Drawer */}
      <Drawer
        open={createDrawer}
        onClose={() => setCreateDrawer(false)}
        title="Create Member Benefit"
      >
        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
          <FormField label="Benefit Title" required>
            <input
              type="text"
              required
              disabled={busy}
              maxLength={150}
              placeholder="e.g. Dining Discounts"
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="premium-input"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              rows={3}
              required
              disabled={busy}
              maxLength={500}
              placeholder="e.g. Valid in Lounge across all beverages"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="premium-input min-h-20"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Display Order">
              <input
                type="number"
                disabled={busy}
                min="0"
                value={createForm.displayOrder}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    displayOrder: e.target.value === "" ? "" : Number(e.target.value)
                  }))
                }
                className="premium-input font-mono"
              />
            </FormField>

            <FormField label="Initial Status">
              <select
                className="premium-input"
                disabled={busy}
                value={createForm.active ? "true" : "false"}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    active: e.target.value === "true"
                  }))
                }
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </FormField>
          </div>

          <ImageUploadField
            label="Benefit Photo"
            file={createImageFile}
            onChangeFile={setCreateImageFile}
            disabled={busy}
          />

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setCreateDrawer(false)}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={busy}
              className="gold-button"
            >
              {busy ? "Creating…" : "Create Benefit"}
            </button>
          </div>
        </form>
      </Drawer>

      {/* Edit Benefit Drawer */}
      <Drawer
        open={!!editingBenefit}
        onClose={() => setEditingBenefit(null)}
        title={`Edit Benefit: ${editingBenefit?.title || ""}`}
      >
        <form onSubmit={(e) => void handleUpdate(e)} className="space-y-4">
          <FormField label="Benefit Title" required>
            <input
              type="text"
              required
              disabled={busy}
              maxLength={150}
              placeholder="e.g. Dining Discounts"
              value={editForm.title}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="premium-input"
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              rows={3}
              required
              disabled={busy}
              maxLength={500}
              placeholder="e.g. Valid in Lounge"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="premium-input min-h-20"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Display Order">
              <input
                type="number"
                disabled={busy}
                min="0"
                value={editForm.displayOrder}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    displayOrder: e.target.value === "" ? "" : Number(e.target.value)
                  }))
                }
                className="premium-input font-mono"
              />
            </FormField>

            <FormField label="Status">
              <select
                className="premium-input"
                disabled={busy}
                value={editForm.active ? "true" : "false"}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    active: e.target.value === "true"
                  }))
                }
              >
                <option value="true">Active (Visible)</option>
                <option value="false">Inactive (Hidden)</option>
              </select>
            </FormField>
          </div>

          <ImageUploadField
            label="Benefit Photo"
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
              onClick={() => setEditingBenefit(null)}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Benefit"
      >
        <div>
          <div className="rounded-input border border-accent-red/20 bg-accent-red/5 p-4">
            <p className="font-semibold text-accent-red">Remove this perk?</p>
            <p className="mt-1 text-sm text-text-secondary">
              Are you sure you want to delete{" "}
              <strong className="text-text-primary">{deleteConfirm?.title}</strong>?
              This will remove the perk from member views.
            </p>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              className="ghost-button"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="danger-button"
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {busy ? "Deleting…" : "Yes, Delete Benefit"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

