import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, UserCog, ShieldCheck } from "lucide-react";

import api, { apiMessage, unwrapData } from "../services/api";
import type { Employee, Role } from "../types";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import Loading from "../components/Loading";
import FormField from "../components/FormField";
import ErrorBanner from "../components/ErrorBanner";
import { formatDate } from "../lib/format";
import { useAuthStore } from "../store/auth.store";

type Permission =
  | "DASHBOARD_VIEW"
  | "CUSTOMER_VIEW"
  | "CUSTOMER_MANAGE"
  | "EMPLOYEE_VIEW"
  | "EMPLOYEE_MANAGE"
  | "VOUCHER_VIEW"
  | "VOUCHER_CREATE"
  | "VOUCHER_MANAGE"
  | "VOUCHER_REDEEM"
  | "PRESENCE_VIEW"
  | "PRESENCE_VERIFY"
  | "PRESENCE_MANAGE"
  | "PURCHASE_VIEW"
  | "PURCHASE_CREATE"
  | "PURCHASE_MANAGE"
  | "LOYALTY_VIEW"
  | "LOYALTY_MANAGE"
  | "CAFE_CONFIG_VIEW"
  | "CAFE_CONFIG_MANAGE"
  | "AUDIT_LOG_VIEW";

interface EmployeeForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface EmployeePermissionItem {
  id?: number;
  employeeId?: number;
  permission: Permission;
}

const PERMISSION_GROUPS: {
  title: string;
  permissions: {
    value: Permission;
    label: string;
  }[];
}[] = [
  {
    title: "Dashboard",
    permissions: [{ value: "DASHBOARD_VIEW", label: "View Dashboard" }]
  },
  {
    title: "Customers",
    permissions: [
      { value: "CUSTOMER_VIEW", label: "View Customers" },
      { value: "CUSTOMER_MANAGE", label: "Manage Customers" }
    ]
  },
  {
    title: "Employees",
    permissions: [
      { value: "EMPLOYEE_VIEW", label: "View Employees" },
      { value: "EMPLOYEE_MANAGE", label: "Manage Employees" }
    ]
  },
  {
    title: "Vouchers",
    permissions: [
      { value: "VOUCHER_VIEW", label: "View Vouchers" },
      { value: "VOUCHER_CREATE", label: "Create Vouchers" },
      { value: "VOUCHER_MANAGE", label: "Manage Vouchers" },
      { value: "VOUCHER_REDEEM", label: "Redeem Vouchers" }
    ]
  },
  {
    title: "Presence",
    permissions: [
      { value: "PRESENCE_VIEW", label: "View Presence" },
      { value: "PRESENCE_VERIFY", label: "Verify Presence" },
      { value: "PRESENCE_MANAGE", label: "Manage Presence" }
    ]
  },
  {
    title: "Purchases",
    permissions: [
      { value: "PURCHASE_VIEW", label: "View Purchases" },
      { value: "PURCHASE_CREATE", label: "Create Purchases" },
      { value: "PURCHASE_MANAGE", label: "Manage Purchases" }
    ]
  },
  {
    title: "Loyalty",
    permissions: [
      { value: "LOYALTY_VIEW", label: "View Loyalty" },
      { value: "LOYALTY_MANAGE", label: "Manage Loyalty" }
    ]
  },
  {
    title: "Cafe Configuration",
    permissions: [
      { value: "CAFE_CONFIG_VIEW", label: "View Cafe Configuration" },
      { value: "CAFE_CONFIG_MANAGE", label: "Manage Cafe Configuration" }
    ]
  },
  {
    title: "Security",
    permissions: [{ value: "AUDIT_LOG_VIEW", label: "View Audit Logs" }]
  }
];

export default function Employees() {
  const me = useAuthStore((state) => state.employee);
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    email: "",
    password: "",
    role: "CASHIER"
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/employees?limit=100");
      const resData = unwrapData<{ employees?: Employee[] } | Employee[]>(response);
      const empList = Array.isArray(resData) ? resData : (resData?.employees ?? []);
      setRows(empList);
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createEmployee = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await api.post("/employees", form);
      setOpen(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "CASHIER"
      });
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const toggleEmployee = async (employee: Employee) => {
    setBusy(true);
    setError("");

    try {
      await api.post(`/employees/${employee.id}/${employee.isActive ? "deactivate" : "activate"}`);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const openPermissions = (employee: Employee) => {
    if (employee.role === "ADMIN") return;

    setSelectedEmployee(employee);

    const employeePermissions =
      (
        employee as Employee & {
          permissions?: (Permission | EmployeePermissionItem)[];
        }
      ).permissions ?? [];

    const normalizedPermissions = employeePermissions
      .map((item) => (typeof item === "string" ? item : item.permission))
      .filter((permission): permission is Permission => Boolean(permission));

    setSelectedPermissions(normalizedPermissions);
    setPermissionOpen(true);
  };

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
      }
      return [...current, permission];
    });
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;

    setBusy(true);
    setError("");

    try {
      await api.patch(`/employees/${selectedEmployee.id}/permissions`, {
        permissions: selectedPermissions
      });

      setPermissionOpen(false);
      setSelectedEmployee(null);
      setSelectedPermissions([]);
      await load();
    } catch (requestError) {
      setError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="premium-card p-8 text-center">
        <UserCog className="mx-auto mb-3 text-accent-red" />
        <h1 className="font-display text-2xl">Admin access required</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Employee administration is restricted to ADMIN users.
        </p>
      </div>
    );
  }

  if (loading) {
    return <Loading label="Loading employees" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-gold">
            People / Security
          </p>

          <h1 className="page-title">Employee Management</h1>

          <p className="mt-2 muted">
            Manage employees and control feature-level system access.
          </p>
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={() => void load()} className="ghost-button">
            <RefreshCw size={16} />
            Refresh
          </button>

          <button type="button" onClick={() => setOpen(true)} className="gold-button">
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-border bg-background text-[10px] uppercase tracking-wider text-text-secondary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {rows.map((employee) => (
                <tr key={employee.id} className="transition hover:bg-surface-hover">
                  <td className="px-4 py-3 font-medium">{employee.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{employee.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={employee.role} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={employee.isActive ? "ACTIVE" : "REVOKED"} />
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-text-secondary">
                    {formatDate(employee.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || employee.id === me.id}
                        onClick={() => void toggleEmployee(employee)}
                        className="ghost-button px-3 py-2 text-xs"
                      >
                        {employee.isActive ? "Deactivate" : "Activate"}
                      </button>

                      {employee.role !== "ADMIN" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => openPermissions(employee)}
                          className="ghost-button px-3 py-2 text-xs"
                        >
                          <ShieldCheck size={14} />
                          Permissions
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-text-secondary">
              No employees found.
            </div>
          )}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add employee">
        <form onSubmit={createEmployee} className="space-y-4">
          <FormField label="Name">
            <input
              className="premium-input"
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </FormField>

          <FormField label="Email">
            <input
              className="premium-input"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </FormField>

          <FormField label="Temporary password">
            <input
              className="premium-input"
              type="password"
              minLength={8}
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </FormField>

          <FormField label="Role">
            <select
              className="premium-input"
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
            >
              {["ADMIN", "MANAGER", "CASHIER", "VERIFIER"].map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </FormField>

          <button type="submit" disabled={busy} className="gold-button w-full">
            {busy ? "Creating…" : "Create Employee"}
          </button>
        </form>
      </Modal>

      <Modal
        open={permissionOpen}
        onClose={() => {
          if (!busy) {
            setPermissionOpen(false);
            setSelectedEmployee(null);
            setSelectedPermissions([]);
          }
        }}
        title={
          selectedEmployee
            ? `Manage Access — ${selectedEmployee.name}`
            : "Manage Permissions"
        }
      >
        <div className="space-y-5">
          <div className="rounded-input border border-border bg-background p-3">
            <p className="text-sm font-medium">{selectedEmployee?.name}</p>
            <p className="mt-1 text-xs text-text-secondary">
              Select which features this employee can access. Changes take effect after saving.
            </p>
          </div>

          <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-gold">
                  {group.title}
                </h3>

                <div className="space-y-2">
                  {group.permissions.map((item) => (
                    <label
                      key={item.value}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-input border border-border p-3 transition hover:bg-surface-hover"
                    >
                      <span className="text-sm">{item.label}</span>

                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(item.value)}
                        onChange={() => togglePermission(item.value)}
                        disabled={busy}
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={busy || !selectedEmployee}
            onClick={() => void savePermissions()}
            className="gold-button w-full"
          >
            {busy ? "Saving…" : "Save Permissions"}
          </button>
        </div>
      </Modal>
    </div>
  );
}