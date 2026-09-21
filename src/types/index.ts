export type Role =
  | "ADMIN"
  | "MANAGER"
  | "CASHIER"
  | "VERIFIER";

export type CustomerStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type DeviceStatus =
  | "PENDING"
  | "ACTIVE"
  | "REVOKED"
  | "LOST";

export type VoucherStatus =
  | "ACTIVE"
  | "REDEEMED"
  | "EXPIRED"
  | "REVOKED"
  | "PENDING";

export type VoucherType =
  | "PERCENTAGE"
  | "FLAT"
  | "FIXED_AMOUNT"
  | "FREE_ITEM";

export type PresenceResult =
  | "SUCCESS"
  | "FAILED"
  | "REJECTED";

export type PresenceMethod =
  | "GPS"
  | "LOCATION"
  | "QR"
  | "GPS_QR"
  | "COMBINED";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  permissions?: EmployeePermission[];
  createdAt: string;
  updatedAt?: string;
}

export interface EmployeePermission {
  id?: number;
  employeeId?: number;
  permission: string;
}

export interface Device {
  id: number;
  customerId: number;
  deviceId: string;
  status: DeviceStatus;
  deviceName?: string | null;
  platform?: string | null;
  approvedAt?: string | null;
  revokedAt?: string | null;
  lostAt?: string | null;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
  status: CustomerStatus;
  membership?: string;
  membershipType?: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  devices?: Device[];
  customerVouchers?: CustomerVoucher[];
  vouchers?: CustomerVoucher[];
  _count?: {
    devices?: number;
    vouchers?: number;
    customerVouchers?: number;
    presenceLogs?: number;
  };
}

export interface PresenceLog {
  id: number;
  customerId: number;
  deviceId: number;
  method: PresenceMethod;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  distanceMeters?: number | null;
  qrTokenId?: number | null;
  purpose?: string | null;
  result: PresenceResult;
  timestamp: string;
  customer?: Pick<
    Customer,
    "id" | "name" | "phone"
  >;
  device?: Pick<
    Device,
    "id" | "deviceId" | "status"
  >;
  qrToken?: {
    id: number;
    status: string;
    consumedAt?: string | null;
  };
}

export interface Voucher {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  type: VoucherType;
  value?: number | string | null;
  minSpend?: number | string | null;
  maxRedemptions?: number | null;
  redeemedCount?: number;
  status: VoucherStatus;
  imageUrl?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  _count?: {
    customerVouchers: number;
  };
}

export interface CustomerVoucher {
  id: number;
  customerId: number;
  voucherId: number;
  customerVoucherId?: number;
  status: VoucherStatus;
  issuedAt: string;
  redeemedAt?: string | null;
  expiresAt?: string | null;
  validity?: string | null;
  isRedeemed?: boolean;
  image?: string | null;
  imageUrl?: string | null;
  voucher?: Voucher;
  name?: string;
  code?: string;
  title?: string;
  description?: string | null;
  details?: string | null;
  type?: VoucherType;
  value?: number | string | null;
  customer?: Pick<
    Customer,
    "id" | "name" | "phone"
  >;
}

export interface AuditLog {
  id: number;
  employeeId: number;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  details?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  employee?: Pick<
    Employee,
    "id" | "name" | "email" | "role"
  >;
}

export interface QrToken {
  id: number;
  token: string;
  status: string;
  expiresAt: string;
  consumedAt?: string | null;
}

export interface CafeConfig {
  id: number;
  cafeName: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  qrValiditySeconds: number;
  qrRotationSeconds: number;
  loyaltyPointsPerUnit: number;
  isPresenceEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface VerifyQrResponse {
  valid: boolean;
  sessionId?: number;
  sessionToken?: string;
  customerVoucher?: CustomerVoucher;
  voucher?: Voucher;
  customer?: Pick<Customer, "id" | "name" | "phone">;
  message?: string;
}

export interface RedeemVoucherResponse {
  success: boolean;
  message: string;
  customerVoucher?: CustomerVoucher;
  redeemedAt?: string;
}

export interface Benefit {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RegisterCustomerInput {
  name: string;
  phone: string;
  email?: string;
  status?: CustomerStatus;
}


