import type { Employee } from "../types";

export type AppPermission =
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

/**
 * Checks if an employee can access a route or feature.
 * ADMIN role ALWAYS receives full-access bypass.
 */
export function hasPermission(
  employee: Employee | null,
  requiredPermissions?: AppPermission[]
): boolean {
  if (!employee) return false;
  // Explicit full-access bypass for ADMIN
  if (employee.role === "ADMIN") return true;

  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  const perms =
    employee.permissions?.map((p) =>
      typeof p === "string" ? p : p.permission
    ) ?? [];

  return requiredPermissions.some((req) => perms.includes(req));
}

