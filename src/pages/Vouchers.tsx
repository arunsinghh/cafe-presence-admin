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
