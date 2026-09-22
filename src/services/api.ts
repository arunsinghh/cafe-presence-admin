import axios from "axios";
import type { CafeConfig, Customer, RedeemVoucherResponse, RegisterCustomerInput, VerifyQrResponse } from "../types";

export const TOKEN_KEY = "cafe_admin_token";
export const LEGACY_TOKEN_KEY = "cafe_presence_admin_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const unwrapData = <T>(response: { data?: { data?: T } | T }): T => {
  if (!response || !response.data) return [] as unknown as T;
  const resData = response.data as { data?: T };
  return resData.data !== undefined ? resData.data : (response.data as T);
};

export const apiMessage = (
  error: unknown,
  fallback = "Something went wrong."
): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export default api;

export const cafeConfigAPI = {
  async getConfig(): Promise<CafeConfig | null> {
    const response = await api.get("/cafe-config");
    return unwrapData<CafeConfig | null>(response) || null;
  },

  async upsertConfig(
    config: Omit<CafeConfig, "id" | "createdAt" | "updatedAt">
  ): Promise<CafeConfig> {
    const response = await api.put("/cafe-config", config);
    return unwrapData<CafeConfig>(response);
  }
};

export const voucherRedemptionAPI = {
  async verifyQr(token: string): Promise<VerifyQrResponse> {
    const response = await api.post("/redemption/scan", { token });
    const data = unwrapData<{
      valid?: boolean;
      scanned?: boolean;
      sessionId?: number;
      sessionToken?: string;
      qrToken?: string;
      status?: string;
      otpExpiresAt?: string;
      voucher?: VerifyQrResponse["voucher"];
      customer?: VerifyQrResponse["customer"];
      customerVoucher?: VerifyQrResponse["customerVoucher"];
    }>(response);
    return {
      valid: true,
      sessionId: data.sessionId,
      sessionToken: data.sessionToken || data.qrToken,
      voucher: data.voucher,
      customer: data.customer,
      customerVoucher: data.customerVoucher
    };
  },

  async redeem(payload: { customerVoucherId?: number; qrData?: string; otp: string }): Promise<RedeemVoucherResponse> {
    const response = await api.post("/redemption/verify-otp", {
      token: payload.qrData,
      customerVoucherId: payload.customerVoucherId,
      otp: payload.otp
    });
    const data = unwrapData<{ redeemedAt?: string }>(response);
    return {
      success: true,
      message: "Voucher redeemed successfully",
      redeemedAt: data.redeemedAt || new Date().toISOString()
    };
  }
};

export const customerAPI = {
  async register(payload: RegisterCustomerInput): Promise<Customer> {
    try {
      const response = await api.post("/customers", payload);
      return unwrapData<Customer>(response);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const fallback = await api.post("/customers/register", payload);
        return unwrapData<Customer>(fallback);
      }
      throw err;
    }
  }
};


